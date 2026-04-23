// football-data.org API integration
// Free tier: 10 req/min, no credit card needed
// Sign up at: https://www.football-data.org/client/register

const API_BASE   = 'https://api.football-data.org/v4';
const COMP_CODE  = 'WC';          // FIFA World Cup
const CACHE_KEY  = 'wc2026_matches';
const CACHE_TTL  = 60 * 1000;     // 1 min during live, 5 min otherwise
const TOKEN_KEY  = 'wc2026_token';

// ---- Token management ----
function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
function saveToken(t) { localStorage.setItem(TOKEN_KEY, t.trim()); }

// ---- Cache ----
function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    const ttl = hasLiveMatch(data) ? CACHE_TTL : CACHE_TTL * 5;
    if (Date.now() - ts > ttl) return null;
    return data;
  } catch { return null; }
}

function writeCache(data) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
}

function hasLiveMatch(matches) {
  return matches && matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
}

// ---- Fetch from API ----
async function fetchMatches(token) {
  const res = await fetch(`${API_BASE}/competitions/${COMP_CODE}/matches`, {
    headers: { 'X-Auth-Token': token }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.matches || [];
}

// ---- Normalize team name (API → our French names) ----
const NAME_MAP = {
  'United States': 'États-Unis',
  'USA': 'États-Unis',
  'Mexico': 'Mexique',
  'South Korea': 'Corée du Sud',
  'Saudi Arabia': 'Arabie saoudite',
  "Ivory Coast": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  'Netherlands': 'Pays-Bas',
  'Australia': 'Australie',
  'Japan': 'Japon',
  'Germany': 'Allemagne',
  'Spain': 'Espagne',
  'France': 'France',
  'England': 'Angleterre',
  'Italy': 'Italie',
  'Brazil': 'Brésil',
  'Argentina': 'Argentine',
  'Portugal': 'Portugal',
  'Morocco': 'Maroc',
  'Belgium': 'Belgique',
  'Croatia': 'Croatie',
  'Poland': 'Pologne',
  'Serbia': 'Serbie',
  'Switzerland': 'Suisse',
  'Denmark': 'Danemark',
  'Austria': 'Autriche',
  'Hungary': 'Hongrie',
  'Turkey': 'Turquie',
  'Ukraine': 'Ukraine',
  'Ecuador': 'Équateur',
  'Colombia': 'Colombie',
  'Senegal': 'Sénégal',
  'Tunisia': 'Tunisie',
  'Cameroon': 'Cameroun',
  'Nigeria': 'Nigeria',
  'Ghana': 'Ghana',
  'Egypt': 'Égypte',
  'Algeria': 'Algérie',
  'Mali': 'Mali',
  'Uruguay': 'Uruguay',
  'Chile': 'Chili',
  'Paraguay': 'Paraguay',
  'Bolivia': 'Bolivie',
  'Venezuela': 'Venezuela',
  'Peru': 'Pérou',
  'Costa Rica': 'Costa Rica',
  'New Zealand': 'Nouvelle-Zélande',
  'Iran': 'Iran',
  'Qatar': 'Qatar',
};

function normalizeName(n) { return NAME_MAP[n] || n; }

// ---- Build a scores map: "Team1|Team2" → { home, away, status, minute } ----
function buildScoresMap(apiMatches) {
  const map = {};
  apiMatches.forEach(m => {
    const h = normalizeName(m.homeTeam?.name || m.homeTeam?.shortName || '');
    const a = normalizeName(m.awayTeam?.name || m.awayTeam?.shortName || '');
    const key = `${h}|${a}`;
    map[key] = {
      home:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      away:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      status: m.status,   // SCHEDULED, IN_PLAY, PAUSED, FINISHED, POSTPONED
      minute: m.minute ?? null,
    };
  });
  return map;
}

// ---- Public API ----
const WC_API = {
  getToken,
  saveToken,

  async loadScores() {
    const token = getToken();
    if (!token) return null;
    const cached = readCache();
    if (cached) return buildScoresMap(cached);
    try {
      const matches = await fetchMatches(token);
      writeCache(matches);
      return buildScoresMap(matches);
    } catch (e) {
      console.warn('WC API fetch failed:', e.message);
      return null;
    }
  },

  startAutoRefresh(callback) {
    let interval = null;
    async function tick() {
      const token = getToken();
      if (!token) return;
      try {
        const matches = await fetchMatches(token);
        writeCache(matches);
        const scores = buildScoresMap(matches);
        callback(scores);
        const live = hasLiveMatch(matches);
        const delay = live ? 30000 : 300000; // 30s live, 5min otherwise
        clearInterval(interval);
        interval = setInterval(tick, delay);
      } catch { /* silent */ }
    }
    interval = setInterval(tick, CACHE_TTL);
    return () => clearInterval(interval);
  }
};
