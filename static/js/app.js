/**
 * app.js – Core SPA routing, global state, and toast utility.
 */

const App = (() => {
  // ── Global State ─────────────────────────────────────────────────────
  const state = {
    currentPage: 'dashboard',
    programs: [],
    totalTokensSaved: 0,
    chatHistory: [],
    selectedProgram: null,
    checklistProgram: null,
  };

  // ── Navigation ───────────────────────────────────────────────────────
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    const tabEl  = document.getElementById(`tab-${page}`);

    if (pageEl) pageEl.classList.add('active');
    if (tabEl)  tabEl.classList.add('active');

    state.currentPage = page;

    if (page === 'programs' && typeof Programs !== 'undefined') Programs.init();
    if (page === 'chat'     && typeof Chat     !== 'undefined') Chat.init();
    if (page === 'checklist'&& typeof Checklist!== 'undefined') Checklist.init();
    if (page === 'dashboard'&& typeof Dashboard!== 'undefined') Dashboard.init();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Toast ─────────────────────────────────────────────────────────────
  function toast(message, type = 'info', duration = 3500) {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ── Token Counter Update ──────────────────────────────────────────────
  function addTokensSaved(n) {
    if (!n || n <= 0) return;
    state.totalTokensSaved += n;
    const el = document.getElementById('nav-tokens-saved');
    if (el) el.textContent = state.totalTokensSaved.toLocaleString();
    const statEl = document.getElementById('stat-tokens');
    if (statEl) statEl.textContent = state.totalTokensSaved.toLocaleString();
  }

  // ── API Helper ────────────────────────────────────────────────────────
  async function api(endpoint, options = {}) {
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
    };
    const res = await fetch(endpoint, { ...defaults, ...options });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ── Bind Nav Tabs ─────────────────────────────────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => navigate(tab.dataset.page));
    });
  }

  // ── Quick Prompts (Dashboard) ─────────────────────────────────────────
  function bindQuickPrompts() {
    document.querySelectorAll('.quick-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        navigate('chat');
        setTimeout(() => {
          const input = document.getElementById('chat-input');
          // FIX #10: Guard against Chat module not being available (e.g. script load failure).
          if (input && typeof Chat !== 'undefined') {
            input.value = q;
            input.dispatchEvent(new Event('input'));
            Chat.send();
          } else if (!input) {
            console.warn('AdmissAI: chat-input element not found.');
          } else {
            console.warn('AdmissAI: Chat module not loaded. Cannot send quick prompt.');
          }
        }, 200);
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    bindNav();

    window.addEventListener('load', () => {
      bindQuickPrompts();
      // FIX #10: Guard Dashboard reference for consistency.
      if (typeof Dashboard !== 'undefined') {
        Dashboard.init();
      }
    });
  }

  // ── Expose ────────────────────────────────────────────────────────────
  return { navigate, toast, api, state, addTokensSaved, init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());