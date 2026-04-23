// football-data.org API — smart fetching for FIFA World Cup 2026
//
// Rules:
//  • Before Jun 11 → no API call, tournament not started
//  • During tournament → fetch on demand, auto-refresh
//  • After Jul 19     → fetch once, then use permanent localStorage cache
//  • Rate limit: free tier = 10 req/min → minimum 6s between calls
//  • Exponential backoff on errors (10s, 20s, 40s … max 5min)

const API_BASE  = 'https://api.football-data.org/v4';
const COMP_CODE = 'WC';
const TOKEN_KEY = 'wc2026_token';
const CACHE_KEY = 'wc2026_cache';

const TOURNAMENT_START = new Date('2026-06-11T00:00:00');
const TOURNAMENT_END   = new Date('2026-07-20T00:00:00'); // day after final
const MIN_INTERVAL_MS  = 8000;   // 8s min between requests (~7/min, safe margin)
const LIVE_REFRESH_MS  = 45000;  // 45s when match in play
const IDLE_REFRESH_MS  = 300000; // 5min when no live match
const POST_REFRESH_MS  = Infinity; // after tournament: no refresh needed

// ---- Token ----
function getToken()    { return localStorage.getItem(TOKEN_KEY) || ''; }
function saveToken(t)  { localStorage.setItem(TOKEN_KEY, t.trim()); }

// ---- Tournament window ----
function tournamentPhase() {
  const now = new Date();
  if (now < TOURNAMENT_START) return 'before';
  if (now >= TOURNAMENT_END)  return 'after';
  return 'during';
}

// ---- Persistent cache (localStorage for post-tournament, sessionStorage during) ----
function readCache() {
  try {
    const phase = tournamentPhase();
    const store = phase === 'after' ? localStorage : sessionStorage;
    const raw   = store.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data, phase: savedPhase } = JSON.parse(raw);
    // After tournament: cache is permanent (no TTL)
    if (savedPhase === 'after') return data;
    // During: TTL depends on live activity
    const ttl = hasLiveMatch(data) ? LIVE_REFRESH_MS : IDLE_REFRESH_MS;
    if (Date.now() - ts > ttl) return null;
    return data;
  } catch { return null; }
}

function writeCache(data) {
  const phase = tournamentPhase();
  const store = phase === 'after' ? localStorage : sessionStorage;
  store.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data, phase }));
}

function hasLiveMatch(matches) {
  return Array.isArray(matches) &&
    matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
}

// ---- Rate-limit guard ----
let lastCallTs = 0;
async function rateLimitedFetch(url, token) {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastCallTs);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTs = Date.now();
  const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
  if (res.status === 429) throw Object.assign(new Error('Rate limited'), { code: 429 });
  if (!res.ok)            throw Object.assign(new Error(`HTTP ${res.status}`), { code: res.status });
  return res.json();
}

// ---- Fetch with exponential backoff ----
async function fetchWithRetry(token, attempt = 0) {
  try {
    const json = await rateLimitedFetch(`${API_BASE}/competitions/${COMP_CODE}/matches`, token);
    return json.matches || [];
  } catch (e) {
    const maxAttempts = 4;
    if (attempt >= maxAttempts) throw e;
    const delay = Math.min(10000 * Math.pow(2, attempt), 300000); // 10s, 20s, 40s, 80s → max 5min
    console.warn(`WC API: ${e.message}, retry in ${delay/1000}s (attempt ${attempt+1}/${maxAttempts})`);
    await new Promise(r => setTimeout(r, delay));
    return fetchWithRetry(token, attempt + 1);
  }
}

// ---- Normalize API team names → French ----
const NAME_MAP = {
  'United States': 'États-Unis', 'USA': 'États-Unis',
  'Mexico': 'Mexique', 'South Korea': 'Corée du Sud',
  'Saudi Arabia': 'Arabie saoudite', 'Ivory Coast': "Côte d'Ivoire",
  'Netherlands': 'Pays-Bas', 'Australia': 'Australie',
  'Japan': 'Japon', 'Germany': 'Allemagne', 'Spain': 'Espagne',
  'England': 'Angleterre', 'Italy': 'Italie', 'Brazil': 'Brésil',
  'Argentina': 'Argentine', 'Portugal': 'Portugal', 'Morocco': 'Maroc',
  'Belgium': 'Belgique', 'Croatia': 'Croatie', 'Poland': 'Pologne',
  'Serbia': 'Serbie', 'Switzerland': 'Suisse', 'Denmark': 'Danemark',
  'Austria': 'Autriche', 'Hungary': 'Hongrie', 'Turkey': 'Turquie',
  'Ukraine': 'Ukraine', 'Ecuador': 'Équateur', 'Colombia': 'Colombie',
  'Senegal': 'Sénégal', 'Tunisia': 'Tunisie', 'Cameroon': 'Cameroun',
  'Nigeria': 'Nigeria', 'Ghana': 'Ghana', 'Egypt': 'Égypte',
  'Algeria': 'Algérie', 'Mali': 'Mali', 'Uruguay': 'Uruguay',
  'Chile': 'Chili', 'Paraguay': 'Paraguay', 'Bolivia': 'Bolivie',
  'Venezuela': 'Venezuela', 'Peru': 'Pérou', 'Costa Rica': 'Costa Rica',
  'New Zealand': 'Nouvelle-Zélande', 'Iran': 'Iran', 'Qatar': 'Qatar',
};
function norm(n) { return NAME_MAP[n] || n; }

// ---- Build scores map from raw API matches ----
function buildScoresMap(apiMatches) {
  const map = {};
  apiMatches.forEach(m => {
    const h = norm(m.homeTeam?.name || m.homeTeam?.shortName || '');
    const a = norm(m.awayTeam?.name || m.awayTeam?.shortName || '');
    map[`${h}|${a}`] = {
      home:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      away:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      status: m.status,
      minute: m.minute ?? null,
    };
  });
  return map;
}

// ---- Public API ----
const WC_API = {
  getToken,
  saveToken,
  tournamentPhase,

  // Returns scores map or null (never throws)
  async loadScores() {
    const token = getToken();
    if (!token) return null;

    const phase = tournamentPhase();

    // Before tournament: don't hit the API at all
    if (phase === 'before') return null;

    // Check cache first
    const cached = readCache();
    if (cached) return buildScoresMap(cached);

    try {
      const matches = await fetchWithRetry(token);
      writeCache(matches);
      return buildScoresMap(matches);
    } catch (e) {
      console.warn('WC API unavailable:', e.message);
      return null;
    }
  },

  // Auto-refresh: only fires during tournament, adapts interval to live activity
  startAutoRefresh(callback) {
    if (tournamentPhase() !== 'during') return () => {};

    let timer = null;

    async function tick() {
      const token = getToken();
      if (!token || tournamentPhase() !== 'during') return;
      try {
        const matches = await fetchWithRetry(token);
        writeCache(matches);
        callback(buildScoresMap(matches));
        const delay = hasLiveMatch(matches) ? LIVE_REFRESH_MS : IDLE_REFRESH_MS;
        clearTimeout(timer);
        timer = setTimeout(tick, delay);
      } catch {
        // backoff already handled in fetchWithRetry; schedule a long retry
        timer = setTimeout(tick, IDLE_REFRESH_MS);
      }
    }

    // First refresh after initial load
    timer = setTimeout(tick, IDLE_REFRESH_MS);
    return () => clearTimeout(timer);
  },

  // Human-readable status message for the UI
  statusMessage() {
    const phase = tournamentPhase();
    if (phase === 'before') {
      const days = Math.ceil((TOURNAMENT_START - new Date()) / 86400000);
      return `⏳ Le tournoi commence dans ${days} jour${days > 1 ? 's' : ''}. Les scores s'activeront automatiquement le 11 juin.`;
    }
    if (phase === 'after') return '🏆 Tournoi terminé. Les scores finaux sont enregistrés.';
    return null; // during → normal operation
  }
};
