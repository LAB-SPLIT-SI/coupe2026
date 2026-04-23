// FIFA World Cup 2026 — Interactive Calendar App

(function () {
  'use strict';

  // --- State ---
  let filters = { country: 'all', phase: 'all', group: 'all', city: 'all', team: '' };

  // --- DOM refs ---
  const calendarEl   = document.getElementById('calendar');
  const statFiltered = document.getElementById('statFiltered');
  const progressBar  = document.getElementById('progressBar');
  const progressLbl  = document.getElementById('progressLabel');
  const modal        = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const modalClose   = document.getElementById('modalClose');
  const filterTeam   = document.getElementById('filterTeam');
  const filterCity   = document.getElementById('filterCity');

  // --- Build city dropdown ---
  const cities = [...new Set(Object.values(STADIUMS).map(s => s.city))].sort();
  cities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    filterCity.appendChild(opt);
  });

  // --- Build group buttons ---
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const filterGroupEl = document.getElementById('filterGroup');
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'btn-filter';
    btn.dataset.value = g;
    btn.textContent = `Gr. ${g}`;
    filterGroupEl.appendChild(btn);
  });

  // --- Progress tracker ---
  function updateProgress() {
    const today = new Date().toISOString().slice(0, 10);
    const total  = MATCHES.length;
    const played = MATCHES.filter(m => m.date < today || (m.date === today)).length;
    const pct    = Math.round((played / total) * 100);
    progressBar.style.width = pct + '%';
    progressLbl.textContent = `${played} match${played > 1 ? 's' : ''} joué${played > 1 ? 's' : ''} sur ${total} (${pct}%)`;
  }

  // --- Group matches by date ---
  function groupByDate(matches) {
    const map = {};
    matches.forEach(m => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }

  // --- Format date in French ---
  const DAYS_FR  = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

  function formatDate(dateStr) {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, mo - 1, d);
    return `${DAYS_FR[dt.getDay()]} ${d} ${MONTHS_FR[mo - 1]} ${y}`;
  }

  function formatDateShort(dateStr) {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, mo - 1, d);
    return `${DAYS_FR[dt.getDay()].slice(0,3).toUpperCase()}. ${d} ${MONTHS_FR[mo - 1].toUpperCase().slice(0,3)}`;
  }

  // --- Build card HTML ---
  function buildCard(m) {
    const phaseClass = m.phase.replace(/[^a-zA-Z0-9]/g, '').replace(' ', '-');
    const grpTag = m.group ? `<span class="group-tag">Gr. ${m.group}</span>` : '';
    const jrnTag = m.matchday ? `<span class="group-tag">J${m.matchday}</span>` : '';
    return `
    <div class="match-card"
         data-id="${m.id}"
         data-country="${m.country}"
         data-phase="${m.phase}"
         data-group="${m.group || ''}"
         data-city="${m.city}"
         data-team1="${m.team1}"
         data-team2="${m.team2}">
      <div class="card-top">
        <span class="phase-badge phase-${m.phase}">${m.phase}${m.group ? ` · Groupe ${m.group}` : ''}</span>
        <span class="match-time">${m.time}</span>
      </div>
      <div class="teams-row">
        <div class="team">
          <span class="team-flag">${m.flag1}</span>
          <span class="team-name">${m.team1}</span>
        </div>
        <div class="vs-divider">VS</div>
        <div class="team">
          <span class="team-flag">${m.flag2}</span>
          <span class="team-name">${m.team2}</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="stadium-icon">🏟</span>
        <span>${m.stadium}</span>
        <span class="country-dot ${m.country}">${m.country}</span>
      </div>
    </div>`;
  }

  // --- Render calendar ---
  function render() {
    const teamQ = filters.team.trim().toLowerCase();
    const visible = MATCHES.filter(m => {
      if (filters.country !== 'all' && m.country !== filters.country) return false;
      if (filters.phase   !== 'all' && m.phase   !== filters.phase)   return false;
      if (filters.group   !== 'all' && m.group   !== filters.group)   return false;
      if (filters.city    !== 'all' && m.city    !== filters.city)    return false;
      if (teamQ) {
        const t1 = m.team1.toLowerCase();
        const t2 = m.team2.toLowerCase();
        if (!t1.includes(teamQ) && !t2.includes(teamQ)) return false;
      }
      return true;
    });

    statFiltered.textContent = visible.length;

    // Group by date
    const byDate = groupByDate(visible);
    const sortedDates = Object.keys(byDate).sort();

    if (sortedDates.length === 0) {
      calendarEl.innerHTML = '<div class="no-results visible">Aucun match ne correspond à vos filtres.</div>';
      return;
    }

    // Group phase sections
    let html = '';
    let currentPhase = null;

    sortedDates.forEach(date => {
      const dayMatches = byDate[date];
      // Phase separator (only for knockout rounds)
      dayMatches.forEach(m => {
        if (m.phase !== 'Groupes' && m.phase !== currentPhase) {
          currentPhase = m.phase;
        }
      });

      const count = dayMatches.length;
      html += `
      <div class="day-block">
        <div class="day-header">
          <span class="day-date">${formatDate(date)}</span>
          <span class="day-count">${count} match${count > 1 ? 's' : ''}</span>
        </div>
        <div class="matches-grid">
          ${dayMatches.map(buildCard).join('')}
        </div>
      </div>`;
    });

    calendarEl.innerHTML = html;

    // Attach click handlers
    calendarEl.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => openModal(+card.dataset.id));
    });
  }

  // --- Modal ---
  function openModal(id) {
    const m = MATCHES.find(x => x.id === id);
    if (!m) return;
    const s = STADIUMS[m.stadium] || {};
    modalContent.innerHTML = `
      <div class="modal-phase">${m.phase}${m.group ? ` · Groupe ${m.group}` : ''}${m.matchday ? ` · Journée ${m.matchday}` : ''}</div>
      <div class="modal-match-num">Match #${m.id} · ${formatDate(m.date)}</div>
      <div class="modal-teams">
        <div class="modal-team">
          <div class="modal-team-flag">${m.flag1}</div>
          <div class="modal-team-name">${m.team1}</div>
        </div>
        <div class="modal-vs">VS</div>
        <div class="modal-team">
          <div class="modal-team-flag">${m.flag2}</div>
          <div class="modal-team-name">${m.team2}</div>
        </div>
      </div>
      <div class="modal-details">
        <div class="modal-detail">
          <div class="modal-detail-label">🕐 Heure locale</div>
          <div class="modal-detail-value">${m.time}</div>
        </div>
        <div class="modal-detail">
          <div class="modal-detail-label">📅 Date</div>
          <div class="modal-detail-value">${formatDateShort(m.date)}</div>
        </div>
        <div class="modal-detail">
          <div class="modal-detail-label">🏟 Stade</div>
          <div class="modal-detail-value">${m.stadium}</div>
        </div>
        <div class="modal-detail">
          <div class="modal-detail-label">📍 Ville</div>
          <div class="modal-detail-value">${m.city}</div>
        </div>
        <div class="modal-detail">
          <div class="modal-detail-label">🌎 Pays hôte</div>
          <div class="modal-detail-value">${m.country}</div>
        </div>
        <div class="modal-detail">
          <div class="modal-detail-label">👥 Capacité</div>
          <div class="modal-detail-value">${s.capacity ? s.capacity.toLocaleString('fr-FR') : '—'}</div>
        </div>
      </div>`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // --- Filter event bindings ---
  function bindFilterBtns(groupId, filterKey) {
    document.getElementById(groupId).addEventListener('click', e => {
      const btn = e.target.closest('.btn-filter');
      if (!btn) return;
      document.querySelectorAll(`#${groupId} .btn-filter`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filters[filterKey] = btn.dataset.value;
      render();
    });
  }

  bindFilterBtns('filterCountry', 'country');
  bindFilterBtns('filterPhase',   'phase');
  bindFilterBtns('filterGroup',   'group');

  filterCity.addEventListener('change', () => {
    filters.city = filterCity.value;
    render();
  });

  filterTeam.addEventListener('input', () => {
    filters.team = filterTeam.value;
    render();
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    filters = { country: 'all', phase: 'all', group: 'all', city: 'all', team: '' };
    filterTeam.value = '';
    filterCity.value = 'all';
    document.querySelectorAll('.btn-filter').forEach(b => {
      b.classList.toggle('active', b.dataset.value === 'all');
    });
    render();
  });

  // --- Scroll to top button ---
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top';
  scrollBtn.textContent = '↑';
  scrollBtn.title = 'Retour en haut';
  document.body.appendChild(scrollBtn);
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });

  // --- Keyboard shortcuts ---
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === '/') { e.preventDefault(); filterTeam.focus(); }
  });

  // --- Init ---
  updateProgress();
  render();

})();
