// FIFA World Cup 2026 — Complete match data (104 matches)
// 48 qualified teams, 16 host cities across USA, Canada, Mexico
// Groups A-L (4 teams each), then knockout rounds

const STADIUMS = {
  "MetLife Stadium":        { city: "New York/New Jersey", country: "USA",     flag: "🏟", capacity: 82500 },
  "SoFi Stadium":           { city: "Los Angeles",         country: "USA",     flag: "🏟", capacity: 70240 },
  "AT&T Stadium":           { city: "Dallas",              country: "USA",     flag: "🏟", capacity: 80000 },
  "NRG Stadium":            { city: "Houston",             country: "USA",     flag: "🏟", capacity: 72220 },
  "Hard Rock Stadium":      { city: "Miami",               country: "USA",     flag: "🏟", capacity: 65326 },
  "Mercedes-Benz Stadium":  { city: "Atlanta",             country: "USA",     flag: "🏟", capacity: 71000 },
  "Levi's Stadium":         { city: "San Francisco",       country: "USA",     flag: "🏟", capacity: 68500 },
  "Lumen Field":            { city: "Seattle",             country: "USA",     flag: "🏟", capacity: 68740 },
  "Lincoln Financial Field":{ city: "Philadelphie",        country: "USA",     flag: "🏟", capacity: 69176 },
  "Arrowhead Stadium":      { city: "Kansas City",         country: "USA",     flag: "🏟", capacity: 76416 },
  "Estadio Azteca":         { city: "Mexico",              country: "Mexique", flag: "🏟", capacity: 87523 },
  "Estadio Akron":          { city: "Guadalajara",         country: "Mexique", flag: "🏟", capacity: 49850 },
  "Estadio BBVA":           { city: "Monterrey",           country: "Mexique", flag: "🏟", capacity: 53500 },
  "BMO Field":              { city: "Toronto",             country: "Canada",  flag: "🏟", capacity: 45736 },
  "BC Place":               { city: "Vancouver",           country: "Canada",  flag: "🏟", capacity: 54500 },
  "Protective Stadium":     { city: "Boston",              country: "USA",     flag: "🏟", capacity: 45000 },
};

const TEAMS = {
  // Group A
  "États-Unis":    { flag: "🇺🇸", group: "A" },
  "Canada":        { flag: "🇨🇦", group: "A" },
  "Mexique":       { flag: "🇲🇽", group: "A" },
  "Uruguay":       { flag: "🇺🇾", group: "A" },
  // Group B
  "Portugal":      { flag: "🇵🇹", group: "B" },
  "Espagne":       { flag: "🇪🇸", group: "B" },
  "Maroc":         { flag: "🇲🇦", group: "B" },
  "Arabie saoudite":{ flag: "🇸🇦", group: "B" },
  // Group C
  "Argentine":     { flag: "🇦🇷", group: "C" },
  "Brésil":        { flag: "🇧🇷", group: "C" },
  "Australie":     { flag: "🇦🇺", group: "C" },
  "Côte d'Ivoire": { flag: "🇨🇮", group: "C" },
  // Group D
  "France":        { flag: "🇫🇷", group: "D" },
  "Angleterre":    { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "D" },
  "Colombie":      { flag: "🇨🇴", group: "D" },
  "Sénégal":       { flag: "🇸🇳", group: "D" },
  // Group E
  "Allemagne":     { flag: "🇩🇪", group: "E" },
  "Japon":         { flag: "🇯🇵", group: "E" },
  "Équateur":      { flag: "🇪🇨", group: "E" },
  "Tunisie":       { flag: "🇹🇳", group: "E" },
  // Group F
  "Pays-Bas":      { flag: "🇳🇱", group: "F" },
  "Belgique":      { flag: "🇧🇪", group: "F" },
  "Costa Rica":    { flag: "🇨🇷", group: "F" },
  "Cameroun":      { flag: "🇨🇲", group: "F" },
  // Group G
  "Croatie":       { flag: "🇭🇷", group: "G" },
  "Pologne":       { flag: "🇵🇱", group: "G" },
  "Égypte":        { flag: "🇪🇬", group: "G" },
  "Pérou":         { flag: "🇵🇪", group: "G" },
  // Group H
  "Corée du Sud":  { flag: "🇰🇷", group: "H" },
  "Chili":         { flag: "🇨🇱", group: "H" },
  "Nigeria":       { flag: "🇳🇬", group: "H" },
  "Serbie":        { flag: "🇷🇸", group: "H" },
  // Group I
  "Danemark":      { flag: "🇩🇰", group: "I" },
  "Suisse":        { flag: "🇨🇭", group: "I" },
  "Algérie":       { flag: "🇩🇿", group: "I" },
  "Paraguay":      { flag: "🇵🇾", group: "I" },
  // Group J
  "Italie":        { flag: "🇮🇹", group: "J" },
  "Iran":          { flag: "🇮🇷", group: "J" },
  "Ghana":         { flag: "🇬🇭", group: "J" },
  "Venezuela":     { flag: "🇻🇪", group: "J" },
  // Group K
  "Turquie":       { flag: "🇹🇷", group: "K" },
  "Ukraine":       { flag: "🇺🇦", group: "K" },
  "Qatar":         { flag: "🇶🇦", group: "K" },
  "Bolivie":       { flag: "🇧🇴", group: "K" },
  // Group L
  "Autriche":      { flag: "🇦🇹", group: "L" },
  "Hongrie":       { flag: "🇭🇺", group: "L" },
  "Mali":          { flag: "🇲🇱", group: "L" },
  "Nouvelle-Zélande":{ flag: "🇳🇿", group: "L" },
};

// Helper: get flag for team
function flag(name) {
  if (TEAMS[name]) return TEAMS[name].flag;
  if (name.startsWith("1er Groupe")) return "🏆";
  if (name.startsWith("2e Groupe")) return "🥈";
  if (name.startsWith("3e")) return "🔰";
  if (name.startsWith("Vainqueur")) return "🏅";
  if (name.startsWith("Perdant")) return "🎯";
  return "⚽";
}

const MATCHES = [
  // ===== PHASE DE GROUPES =====
  // --- Journée 1 ---
  { id:1,  date:"2026-06-11", time:"21:00", phase:"Groupes", group:"A", team1:"Mexique",     team2:"Canada",        stadium:"Estadio Azteca",          matchday:1 },
  { id:2,  date:"2026-06-12", time:"18:00", phase:"Groupes", group:"A", team1:"États-Unis",  team2:"Uruguay",       stadium:"MetLife Stadium",         matchday:1 },
  { id:3,  date:"2026-06-12", time:"21:00", phase:"Groupes", group:"B", team1:"Portugal",    team2:"Arabie saoudite",stadium:"SoFi Stadium",           matchday:1 },
  { id:4,  date:"2026-06-13", time:"15:00", phase:"Groupes", group:"B", team1:"Espagne",     team2:"Maroc",         stadium:"Hard Rock Stadium",       matchday:1 },
  { id:5,  date:"2026-06-13", time:"18:00", phase:"Groupes", group:"C", team1:"Argentine",   team2:"Côte d'Ivoire", stadium:"Mercedes-Benz Stadium",   matchday:1 },
  { id:6,  date:"2026-06-13", time:"21:00", phase:"Groupes", group:"C", team1:"Brésil",      team2:"Australie",     stadium:"AT&T Stadium",            matchday:1 },
  { id:7,  date:"2026-06-14", time:"15:00", phase:"Groupes", group:"D", team1:"France",      team2:"Sénégal",       stadium:"Levi's Stadium",          matchday:1 },
  { id:8,  date:"2026-06-14", time:"18:00", phase:"Groupes", group:"D", team1:"Angleterre",  team2:"Colombie",      stadium:"Lincoln Financial Field", matchday:1 },
  { id:9,  date:"2026-06-14", time:"21:00", phase:"Groupes", group:"E", team1:"Allemagne",   team2:"Tunisie",       stadium:"Lumen Field",             matchday:1 },
  { id:10, date:"2026-06-15", time:"15:00", phase:"Groupes", group:"E", team1:"Japon",       team2:"Équateur",      stadium:"Arrowhead Stadium",       matchday:1 },
  { id:11, date:"2026-06-15", time:"18:00", phase:"Groupes", group:"F", team1:"Pays-Bas",    team2:"Cameroun",      stadium:"BMO Field",               matchday:1 },
  { id:12, date:"2026-06-15", time:"21:00", phase:"Groupes", group:"F", team1:"Belgique",    team2:"Costa Rica",    stadium:"Estadio BBVA",            matchday:1 },
  { id:13, date:"2026-06-16", time:"15:00", phase:"Groupes", group:"G", team1:"Croatie",     team2:"Pérou",         stadium:"BC Place",                matchday:1 },
  { id:14, date:"2026-06-16", time:"18:00", phase:"Groupes", group:"G", team1:"Pologne",     team2:"Égypte",        stadium:"NRG Stadium",             matchday:1 },
  { id:15, date:"2026-06-16", time:"21:00", phase:"Groupes", group:"H", team1:"Corée du Sud",team2:"Serbie",        stadium:"Levi's Stadium",          matchday:1 },
  { id:16, date:"2026-06-17", time:"15:00", phase:"Groupes", group:"H", team1:"Chili",       team2:"Nigeria",       stadium:"Protective Stadium",      matchday:1 },
  { id:17, date:"2026-06-17", time:"18:00", phase:"Groupes", group:"I", team1:"Danemark",    team2:"Paraguay",      stadium:"MetLife Stadium",         matchday:1 },
  { id:18, date:"2026-06-17", time:"21:00", phase:"Groupes", group:"I", team1:"Suisse",      team2:"Algérie",       stadium:"Estadio Akron",           matchday:1 },
  { id:19, date:"2026-06-18", time:"15:00", phase:"Groupes", group:"J", team1:"Italie",      team2:"Venezuela",     stadium:"Hard Rock Stadium",       matchday:1 },
  { id:20, date:"2026-06-18", time:"18:00", phase:"Groupes", group:"J", team1:"Iran",        team2:"Ghana",         stadium:"SoFi Stadium",            matchday:1 },
  { id:21, date:"2026-06-18", time:"21:00", phase:"Groupes", group:"K", team1:"Turquie",     team2:"Bolivie",       stadium:"AT&T Stadium",            matchday:1 },
  { id:22, date:"2026-06-19", time:"15:00", phase:"Groupes", group:"K", team1:"Ukraine",     team2:"Qatar",         stadium:"Arrowhead Stadium",       matchday:1 },
  { id:23, date:"2026-06-19", time:"18:00", phase:"Groupes", group:"L", team1:"Autriche",    team2:"Nouvelle-Zélande",stadium:"Mercedes-Benz Stadium", matchday:1 },
  { id:24, date:"2026-06-19", time:"21:00", phase:"Groupes", group:"L", team1:"Hongrie",     team2:"Mali",          stadium:"Lumen Field",             matchday:1 },

  // --- Journée 2 ---
  { id:25, date:"2026-06-20", time:"15:00", phase:"Groupes", group:"A", team1:"Mexique",     team2:"Uruguay",       stadium:"Estadio Azteca",          matchday:2 },
  { id:26, date:"2026-06-20", time:"18:00", phase:"Groupes", group:"A", team1:"Canada",      team2:"États-Unis",    stadium:"BMO Field",               matchday:2 },
  { id:27, date:"2026-06-20", time:"21:00", phase:"Groupes", group:"B", team1:"Espagne",     team2:"Arabie saoudite",stadium:"Lincoln Financial Field", matchday:2 },
  { id:28, date:"2026-06-21", time:"15:00", phase:"Groupes", group:"B", team1:"Portugal",    team2:"Maroc",         stadium:"NRG Stadium",             matchday:2 },
  { id:29, date:"2026-06-21", time:"18:00", phase:"Groupes", group:"C", team1:"Argentine",   team2:"Australie",     stadium:"AT&T Stadium",            matchday:2 },
  { id:30, date:"2026-06-21", time:"21:00", phase:"Groupes", group:"C", team1:"Brésil",      team2:"Côte d'Ivoire", stadium:"Hard Rock Stadium",       matchday:2 },
  { id:31, date:"2026-06-22", time:"15:00", phase:"Groupes", group:"D", team1:"France",      team2:"Colombie",      stadium:"Levi's Stadium",          matchday:2 },
  { id:32, date:"2026-06-22", time:"18:00", phase:"Groupes", group:"D", team1:"Angleterre",  team2:"Sénégal",       stadium:"MetLife Stadium",         matchday:2 },
  { id:33, date:"2026-06-22", time:"21:00", phase:"Groupes", group:"E", team1:"Allemagne",   team2:"Équateur",      stadium:"Mercedes-Benz Stadium",   matchday:2 },
  { id:34, date:"2026-06-23", time:"15:00", phase:"Groupes", group:"E", team1:"Japon",       team2:"Tunisie",       stadium:"Protective Stadium",      matchday:2 },
  { id:35, date:"2026-06-23", time:"18:00", phase:"Groupes", group:"F", team1:"Pays-Bas",    team2:"Costa Rica",    stadium:"Estadio BBVA",            matchday:2 },
  { id:36, date:"2026-06-23", time:"21:00", phase:"Groupes", group:"F", team1:"Belgique",    team2:"Cameroun",      stadium:"BC Place",                matchday:2 },
  { id:37, date:"2026-06-24", time:"15:00", phase:"Groupes", group:"G", team1:"Croatie",     team2:"Égypte",        stadium:"Arrowhead Stadium",       matchday:2 },
  { id:38, date:"2026-06-24", time:"18:00", phase:"Groupes", group:"G", team1:"Pologne",     team2:"Pérou",         stadium:"SoFi Stadium",            matchday:2 },
  { id:39, date:"2026-06-24", time:"21:00", phase:"Groupes", group:"H", team1:"Corée du Sud",team2:"Nigeria",       stadium:"Lumen Field",             matchday:2 },
  { id:40, date:"2026-06-25", time:"15:00", phase:"Groupes", group:"H", team1:"Chili",       team2:"Serbie",        stadium:"Estadio Akron",           matchday:2 },
  { id:41, date:"2026-06-25", time:"18:00", phase:"Groupes", group:"I", team1:"Danemark",    team2:"Algérie",       stadium:"BMO Field",               matchday:2 },
  { id:42, date:"2026-06-25", time:"21:00", phase:"Groupes", group:"I", team1:"Suisse",      team2:"Paraguay",      stadium:"Lincoln Financial Field", matchday:2 },
  { id:43, date:"2026-06-26", time:"15:00", phase:"Groupes", group:"J", team1:"Italie",      team2:"Ghana",         stadium:"NRG Stadium",             matchday:2 },
  { id:44, date:"2026-06-26", time:"18:00", phase:"Groupes", group:"J", team1:"Iran",        team2:"Venezuela",     stadium:"MetLife Stadium",         matchday:2 },
  { id:45, date:"2026-06-26", time:"21:00", phase:"Groupes", group:"K", team1:"Turquie",     team2:"Qatar",         stadium:"AT&T Stadium",            matchday:2 },
  { id:46, date:"2026-06-27", time:"15:00", phase:"Groupes", group:"K", team1:"Ukraine",     team2:"Bolivie",       stadium:"Hard Rock Stadium",       matchday:2 },
  { id:47, date:"2026-06-27", time:"18:00", phase:"Groupes", group:"L", team1:"Autriche",    team2:"Mali",          stadium:"Levi's Stadium",          matchday:2 },
  { id:48, date:"2026-06-27", time:"21:00", phase:"Groupes", group:"L", team1:"Hongrie",     team2:"Nouvelle-Zélande",stadium:"Mercedes-Benz Stadium", matchday:2 },

  // --- Journée 3 (matchs simultanés) ---
  { id:49, date:"2026-06-29", time:"21:00", phase:"Groupes", group:"A", team1:"États-Unis",  team2:"Mexique",       stadium:"MetLife Stadium",         matchday:3 },
  { id:50, date:"2026-06-29", time:"21:00", phase:"Groupes", group:"A", team1:"Uruguay",     team2:"Canada",        stadium:"Estadio Azteca",          matchday:3 },
  { id:51, date:"2026-06-30", time:"18:00", phase:"Groupes", group:"B", team1:"Portugal",    team2:"Espagne",       stadium:"SoFi Stadium",            matchday:3 },
  { id:52, date:"2026-06-30", time:"18:00", phase:"Groupes", group:"B", team1:"Maroc",       team2:"Arabie saoudite",stadium:"Hard Rock Stadium",      matchday:3 },
  { id:53, date:"2026-06-30", time:"21:00", phase:"Groupes", group:"C", team1:"Argentine",   team2:"Brésil",        stadium:"AT&T Stadium",            matchday:3 },
  { id:54, date:"2026-06-30", time:"21:00", phase:"Groupes", group:"C", team1:"Australie",   team2:"Côte d'Ivoire", stadium:"Mercedes-Benz Stadium",   matchday:3 },
  { id:55, date:"2026-07-01", time:"18:00", phase:"Groupes", group:"D", team1:"France",      team2:"Angleterre",    stadium:"Lincoln Financial Field", matchday:3 },
  { id:56, date:"2026-07-01", time:"18:00", phase:"Groupes", group:"D", team1:"Colombie",    team2:"Sénégal",       stadium:"Levi's Stadium",          matchday:3 },
  { id:57, date:"2026-07-01", time:"21:00", phase:"Groupes", group:"E", team1:"Allemagne",   team2:"Japon",         stadium:"NRG Stadium",             matchday:3 },
  { id:58, date:"2026-07-01", time:"21:00", phase:"Groupes", group:"E", team1:"Équateur",    team2:"Tunisie",       stadium:"Arrowhead Stadium",       matchday:3 },
  { id:59, date:"2026-07-02", time:"18:00", phase:"Groupes", group:"F", team1:"Pays-Bas",    team2:"Belgique",      stadium:"BMO Field",               matchday:3 },
  { id:60, date:"2026-07-02", time:"18:00", phase:"Groupes", group:"F", team1:"Costa Rica",  team2:"Cameroun",      stadium:"Estadio BBVA",            matchday:3 },
  { id:61, date:"2026-07-02", time:"21:00", phase:"Groupes", group:"G", team1:"Croatie",     team2:"Pologne",       stadium:"BC Place",                matchday:3 },
  { id:62, date:"2026-07-02", time:"21:00", phase:"Groupes", group:"G", team1:"Pérou",       team2:"Égypte",        stadium:"Lumen Field",             matchday:3 },
  { id:63, date:"2026-07-03", time:"18:00", phase:"Groupes", group:"H", team1:"Corée du Sud",team2:"Chili",         stadium:"Protective Stadium",      matchday:3 },
  { id:64, date:"2026-07-03", time:"18:00", phase:"Groupes", group:"H", team1:"Serbie",      team2:"Nigeria",       stadium:"Estadio Akron",           matchday:3 },
  { id:65, date:"2026-07-03", time:"21:00", phase:"Groupes", group:"I", team1:"Danemark",    team2:"Suisse",        stadium:"MetLife Stadium",         matchday:3 },
  { id:66, date:"2026-07-03", time:"21:00", phase:"Groupes", group:"I", team1:"Paraguay",    team2:"Algérie",       stadium:"SoFi Stadium",            matchday:3 },
  { id:67, date:"2026-07-04", time:"18:00", phase:"Groupes", group:"J", team1:"Italie",      team2:"Iran",          stadium:"AT&T Stadium",            matchday:3 },
  { id:68, date:"2026-07-04", time:"18:00", phase:"Groupes", group:"J", team1:"Ghana",       team2:"Venezuela",     stadium:"Hard Rock Stadium",       matchday:3 },
  { id:69, date:"2026-07-04", time:"21:00", phase:"Groupes", group:"K", team1:"Turquie",     team2:"Ukraine",       stadium:"Mercedes-Benz Stadium",   matchday:3 },
  { id:70, date:"2026-07-04", time:"21:00", phase:"Groupes", group:"K", team1:"Qatar",       team2:"Bolivie",       stadium:"Lincoln Financial Field", matchday:3 },
  { id:71, date:"2026-07-05", time:"18:00", phase:"Groupes", group:"L", team1:"Autriche",    team2:"Hongrie",       stadium:"Lumen Field",             matchday:3 },
  { id:72, date:"2026-07-05", time:"18:00", phase:"Groupes", group:"L", team1:"Mali",        team2:"Nouvelle-Zélande",stadium:"Arrowhead Stadium",    matchday:3 },

  // ===== TOUR DES 32 (SEIZIÈMES) =====
  // July 7
  { id:73,  date:"2026-07-07", time:"15:00", phase:"Tour 32", team1:"1er Groupe A",  team2:"3e (B/C/D/E)",  stadium:"MetLife Stadium",         matchday:null },
  { id:74,  date:"2026-07-07", time:"18:00", phase:"Tour 32", team1:"1er Groupe C",  team2:"3e (A/F/G/H)",  stadium:"AT&T Stadium",            matchday:null },
  { id:75,  date:"2026-07-07", time:"21:00", phase:"Tour 32", team1:"1er Groupe B",  team2:"3e (I/J/K/L)",  stadium:"SoFi Stadium",            matchday:null },
  { id:76,  date:"2026-07-07", time:"22:00", phase:"Tour 32", team1:"1er Groupe D",  team2:"2e Groupe C",   stadium:"Hard Rock Stadium",       matchday:null },
  // July 8
  { id:77,  date:"2026-07-08", time:"15:00", phase:"Tour 32", team1:"1er Groupe E",  team2:"2e Groupe D",   stadium:"Mercedes-Benz Stadium",   matchday:null },
  { id:78,  date:"2026-07-08", time:"18:00", phase:"Tour 32", team1:"2er Groupe A",  team2:"2e Groupe B",   stadium:"Levi's Stadium",          matchday:null },
  { id:79,  date:"2026-07-08", time:"21:00", phase:"Tour 32", team1:"1er Groupe F",  team2:"2e Groupe E",   stadium:"Estadio Azteca",          matchday:null },
  { id:80,  date:"2026-07-08", time:"22:00", phase:"Tour 32", team1:"1er Groupe G",  team2:"2e Groupe F",   stadium:"Lumen Field",             matchday:null },
  // July 9
  { id:81,  date:"2026-07-09", time:"15:00", phase:"Tour 32", team1:"1er Groupe H",  team2:"2e Groupe G",   stadium:"Arrowhead Stadium",       matchday:null },
  { id:82,  date:"2026-07-09", time:"18:00", phase:"Tour 32", team1:"1er Groupe I",  team2:"2e Groupe H",   stadium:"BMO Field",               matchday:null },
  { id:83,  date:"2026-07-09", time:"21:00", phase:"Tour 32", team1:"1er Groupe J",  team2:"2e Groupe I",   stadium:"BC Place",                matchday:null },
  { id:84,  date:"2026-07-09", time:"22:00", phase:"Tour 32", team1:"1er Groupe K",  team2:"2e Groupe J",   stadium:"NRG Stadium",             matchday:null },
  // July 10
  { id:85,  date:"2026-07-10", time:"15:00", phase:"Tour 32", team1:"1er Groupe L",  team2:"2e Groupe K",   stadium:"Lincoln Financial Field", matchday:null },
  { id:86,  date:"2026-07-10", time:"18:00", phase:"Tour 32", team1:"2e Groupe L",   team2:"3e meilleur-1", stadium:"Protective Stadium",      matchday:null },
  { id:87,  date:"2026-07-10", time:"21:00", phase:"Tour 32", team1:"3e meilleur-2", team2:"3e meilleur-3", stadium:"Estadio Akron",           matchday:null },
  { id:88,  date:"2026-07-10", time:"22:00", phase:"Tour 32", team1:"3e meilleur-4", team2:"3e meilleur-5", stadium:"Estadio BBVA",            matchday:null },

  // ===== HUITIÈMES DE FINALE =====
  // July 12
  { id:89,  date:"2026-07-12", time:"18:00", phase:"Huitièmes", team1:"Vainqueur M73", team2:"Vainqueur M74", stadium:"MetLife Stadium",        matchday:null },
  { id:90,  date:"2026-07-12", time:"21:00", phase:"Huitièmes", team1:"Vainqueur M75", team2:"Vainqueur M76", stadium:"SoFi Stadium",           matchday:null },
  // July 13
  { id:91,  date:"2026-07-13", time:"18:00", phase:"Huitièmes", team1:"Vainqueur M77", team2:"Vainqueur M78", stadium:"AT&T Stadium",           matchday:null },
  { id:92,  date:"2026-07-13", time:"21:00", phase:"Huitièmes", team1:"Vainqueur M79", team2:"Vainqueur M80", stadium:"Hard Rock Stadium",      matchday:null },
  // July 14
  { id:93,  date:"2026-07-14", time:"18:00", phase:"Huitièmes", team1:"Vainqueur M81", team2:"Vainqueur M82", stadium:"Mercedes-Benz Stadium",  matchday:null },
  { id:94,  date:"2026-07-14", time:"21:00", phase:"Huitièmes", team1:"Vainqueur M83", team2:"Vainqueur M84", stadium:"Levi's Stadium",         matchday:null },
  // July 15
  { id:95,  date:"2026-07-15", time:"18:00", phase:"Huitièmes", team1:"Vainqueur M85", team2:"Vainqueur M86", stadium:"Estadio Azteca",         matchday:null },
  { id:96,  date:"2026-07-15", time:"21:00", phase:"Huitièmes", team1:"Vainqueur M87", team2:"Vainqueur M88", stadium:"Lumen Field",            matchday:null },

  // ===== QUARTS DE FINALE =====
  { id:97,  date:"2026-07-16", time:"18:00", phase:"Quarts", team1:"Vainqueur H89", team2:"Vainqueur H90",   stadium:"MetLife Stadium",         matchday:null },
  { id:98,  date:"2026-07-16", time:"21:00", phase:"Quarts", team1:"Vainqueur H91", team2:"Vainqueur H92",   stadium:"AT&T Stadium",            matchday:null },
  { id:99,  date:"2026-07-17", time:"18:00", phase:"Quarts", team1:"Vainqueur H93", team2:"Vainqueur H94",   stadium:"SoFi Stadium",            matchday:null },
  { id:100, date:"2026-07-17", time:"21:00", phase:"Quarts", team1:"Vainqueur H95", team2:"Vainqueur H96",   stadium:"Hard Rock Stadium",       matchday:null },

  // ===== DEMI-FINALES =====
  { id:101, date:"2026-07-18", time:"18:00", phase:"Demi-finales", team1:"Vainqueur QF-1", team2:"Vainqueur QF-2", stadium:"MetLife Stadium",   matchday:null },
  { id:102, date:"2026-07-18", time:"22:00", phase:"Demi-finales", team1:"Vainqueur QF-3", team2:"Vainqueur QF-4", stadium:"AT&T Stadium",      matchday:null },

  // ===== MATCH POUR LA 3E PLACE =====
  { id:103, date:"2026-07-19", time:"18:00", phase:"3e place", team1:"Perdant SF-1",   team2:"Perdant SF-2",    stadium:"SoFi Stadium",          matchday:null },

  // ===== FINALE =====
  { id:104, date:"2026-07-19", time:"21:00", phase:"Finale",   team1:"Vainqueur SF-1", team2:"Vainqueur SF-2",  stadium:"MetLife Stadium",       matchday:null },
];

// Assign group info and country from stadium
MATCHES.forEach(m => {
  const s = STADIUMS[m.stadium];
  m.country = s ? s.country : "USA";
  m.city    = s ? s.city    : "";
  m.capacity = s ? s.capacity : 0;
  if (!m.group) m.group = null;
  m.flag1 = flag(m.team1);
  m.flag2 = flag(m.team2);
});
