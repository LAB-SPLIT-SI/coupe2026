// Lecture des scores depuis scores.json (généré par GitHub Actions)
// Le token API reste dans les secrets GitHub — jamais exposé au navigateur.
// Tous les visiteurs partagent le même fichier mis à jour toutes les 10 min.

const SCORES_URL = './scores.json';

const TOURNAMENT_START = new Date('2026-06-11T00:00:00');
const TOURNAMENT_END   = new Date('2026-07-20T00:00:00');

const LIVE_REFRESH_MS  = 45000;   // 45s si un match est en cours
const IDLE_REFRESH_MS  = 300000;  // 5min sinon (scores.json n'est mis à jour que toutes les 10min)

// Noms API-Football (anglais FIFA) → français du calendrier
const NAME_MAP = {
  // Amérique du Nord
  'United States':      'États-Unis',
  'USA':                'États-Unis',
  'Mexico':             'Mexique',
  'Canada':             'Canada',
  'Costa Rica':         'Costa Rica',
  // Amérique du Sud
  'Brazil':             'Brésil',
  'Argentina':          'Argentine',
  'Uruguay':            'Uruguay',
  'Colombia':           'Colombie',
  'Chile':              'Chili',
  'Ecuador':            'Équateur',
  'Paraguay':           'Paraguay',
  'Bolivia':            'Bolivie',
  'Venezuela':          'Venezuela',
  'Peru':               'Pérou',
  // Europe
  'France':             'France',
  'Spain':              'Espagne',
  'Germany':            'Allemagne',
  'England':            'Angleterre',
  'Portugal':           'Portugal',
  'Netherlands':        'Pays-Bas',
  'Belgium':            'Belgique',
  'Italy':              'Italie',
  'Croatia':            'Croatie',
  'Poland':             'Pologne',
  'Serbia':             'Serbie',
  'Switzerland':        'Suisse',
  'Denmark':            'Danemark',
  'Austria':            'Autriche',
  'Hungary':            'Hongrie',
  'Turkey':             'Turquie',
  'Turkiye':            'Turquie',   // variante API-Football
  'Ukraine':            'Ukraine',
  // Asie
  'South Korea':        'Corée du Sud',
  'Korea Republic':     'Corée du Sud', // variante FIFA
  'Japan':              'Japon',
  'Iran':               'Iran',
  'Saudi Arabia':       'Arabie saoudite',
  'Australia':          'Australie',
  'Qatar':              'Qatar',
  // Afrique
  'Morocco':            'Maroc',
  'Senegal':            'Sénégal',
  'Cameroon':           'Cameroun',
  'Nigeria':            'Nigeria',
  'Ghana':              'Ghana',
  "Ivory Coast":        "Côte d'Ivoire",
  "Côte d'Ivoire":      "Côte d'Ivoire",
  'Egypt':              'Égypte',
  'Algeria':            'Algérie',
  'Tunisia':            'Tunisie',
  'Mali':               'Mali',
  // Océanie
  'New Zealand':        'Nouvelle-Zélande',
};
function norm(n) { return NAME_MAP[n] || n; }

function tournamentPhase() {
  const now = new Date();
  if (now < TOURNAMENT_START) return 'before';
  if (now >= TOURNAMENT_END)  return 'after';
  return 'during';
}

function hasLive(matches) {
  return matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
}

function buildScoresMap(matches) {
  const map = {};
  matches.forEach(m => {
    const h = norm(m.homeTeam || '');
    const a = norm(m.awayTeam || '');
    map[`${h}|${a}`] = {
      home:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      away:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      status: m.status,
      minute: m.minute ?? null,
    };
  });
  return map;
}

const WC_API = {
  tournamentPhase,

  // Retourne { scores, updated } ou null si avant le tournoi
  async loadScores() {
    if (tournamentPhase() === 'before') return null;
    try {
      // Cache-bust léger : on ajoute les minutes arrondies à 10min
      const t = Math.floor(Date.now() / 60000 / 10);
      const res = await fetch(`${SCORES_URL}?t=${t}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.matches?.length) return null;
      return { scores: buildScoresMap(data.matches), updated: data.updated };
    } catch {
      return null;
    }
  },

  // Auto-refresh : adapte l'intervalle selon présence d'un match live
  startAutoRefresh(callback) {
    const phase = tournamentPhase();
    if (phase === 'before') return () => {};

    let timer = null;

    async function tick() {
      const result = await WC_API.loadScores();
      if (result) {
        callback(result);
        // Vérifie si un match est en cours pour accélérer le refresh
        const live = Object.values(result.scores)
          .some(s => s.status === 'IN_PLAY' || s.status === 'PAUSED');
        const delay = live ? LIVE_REFRESH_MS : IDLE_REFRESH_MS;
        timer = setTimeout(tick, delay);
      } else {
        timer = setTimeout(tick, IDLE_REFRESH_MS);
      }
    }

    timer = setTimeout(tick, IDLE_REFRESH_MS);
    return () => clearTimeout(timer);
  },

  // Message informatif affiché avant le tournoi
  countdownMessage() {
    const days = Math.ceil((TOURNAMENT_START - new Date()) / 86400000);
    if (days > 0) return `⏳ Tournoi dans ${days} jour${days > 1 ? 's' : ''} (11 juin 2026) — les scores s'afficheront automatiquement`;
    return null;
  },
};
