/**
 * app.js – Core SPA routing, global state, toast utility.
 * Home page is the default. Logo always goes back to home.
 */

const App = (() => {
  const state = {
    currentPage: 'home',
    programs: [],
    chatHistory: [],
    selectedProgram: null,
    checklistProgram: null,
  };

  // ── Navigation ──────────────────────────────────────────────────────
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    const tabEl  = document.getElementById(`tab-${page}`);

    if (pageEl) pageEl.classList.add('active');
    if (tabEl)  tabEl.classList.add('active');

    state.currentPage = page;

    if (page === 'home'      && typeof loadHomeUniGrid !== 'undefined') loadHomeUniGrid();
    if (page === 'programs'  && typeof Programs !== 'undefined') Programs.init();
    if (page === 'chat'      && typeof Chat     !== 'undefined') Chat.init();
    if (page === 'checklist' && typeof Checklist!== 'undefined') Checklist.init();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Toast ──────────────────────────────────────────────────────────
  function toast(message, type = 'info', duration = 3500) {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(16px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ── API helper ─────────────────────────────────────────────────────
  async function api(endpoint, options = {}) {
    const defaults = { headers: { 'Content-Type': 'application/json' } };
    const res = await fetch(endpoint, { ...defaults, ...options });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ── Bind nav tabs ──────────────────────────────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => navigate(tab.dataset.page));
    });
  }

  // ── Init ───────────────────────────────────────────────────────────
  function init() {
    bindNav();
    window.addEventListener('load', () => {
      loadHomeUniGrid();
    });
  }

  return { navigate, toast, api, state, init };
})();

// ── Home page university grid ────────────────────────────────────────
async function loadHomeUniGrid() {
  const grid = document.getElementById('home-uni-grid');
  if (!grid) return;

  let progs = App.state.programs;
  if (!progs || !progs.length) {
    try {
      const data = await App.api('/api/programs');
      progs = data.programs;
      App.state.programs = progs;
    } catch {
      grid.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem">Could not load programs.</p>`;
      return;
    }
  }

  grid.innerHTML = progs.map(p => `
    <div class="uni-card" onclick="App.navigate('programs'); setTimeout(()=>Programs.openDetail('${p.id}'), 300)">
      <div class="uni-logo" style="background:${p.logo_color}">${p.short_name.substring(0,2)}</div>
      <div class="uni-name">${p.short_name}</div>
      <div class="uni-program">${p.program}</div>
      <span class="uni-rate">${p.acceptance_rate}</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => App.init());