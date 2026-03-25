/**
 * app.js
 * Responsibility: navigation/routing, global toast utility, shared API helper.
 * Nothing else lives here.
 */

const App = (() => {

  // ── Navigate between pages ────────────────────────────────────────
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    const tabEl  = document.getElementById(`tab-${page}`);

    if (pageEl) pageEl.classList.add('active');
    if (tabEl)  tabEl.classList.add('active');

    // Close mobile menu on navigation
    document.getElementById('mobile-nav')?.classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger lazy inits
    if (page === 'home')        Home.init();
    if (page === 'courses')     Courses.init();
    if (page === 'eligibility') Eligibility.init();
    if (page === 'chat')        Chat.init();
  }

  // ── Toast notifications ───────────────────────────────────────────
  function toast(message, type = 'info', duration = 3200) {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(8px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, duration);
  }

  // ── API helper — wraps fetch with JSON and error handling ─────────
  async function api(endpoint, options = {}) {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };
    const res = await fetch(endpoint, config);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ── Bind all [data-nav] elements globally ─────────────────────────
  function bindNav() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-nav]');
      if (target) navigate(target.dataset.nav);
    });

    document.getElementById('hamburger')?.addEventListener('click', () => {
      document.getElementById('mobile-nav')?.classList.toggle('open');
    });
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    bindNav();
    Home.init();
  }

  return { navigate, toast, api };
})();

document.addEventListener('DOMContentLoaded', () => App.init());