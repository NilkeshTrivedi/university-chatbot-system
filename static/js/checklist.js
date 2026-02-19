/**
 * checklist.js – Interactive application checklist with localStorage persistence.
 */

const Checklist = (() => {
    let currentProgramId = '';
    let checklistData = null;
    let initialized = false;

    // ── Load Checklist for Program ────────────────────────────────────────
    async function loadForProgram(programId) {
        if (!programId) return;
        currentProgramId = programId;

        const sel = document.getElementById('checklist-program-select');
        if (sel) sel.value = programId;

        const body = document.getElementById('checklist-body');
        if (!body) return;
        body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:40vh">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;color:var(--text-muted)"></i>
    </div>`;

        try {
            const data = await App.api(`/api/checklist/${programId}`);
            checklistData = data;
            renderChecklist(data);
        } catch (e) {
            body.innerHTML = `<p style="color:var(--accent-rose);padding:20px">Error: ${e.message}</p>`;
        }
    }

    // ── Get / Save State via localStorage ─────────────────────────────────
    // FIX #4: Wrap the localStorage.getItem call itself inside the try block.
    // In some browsers (private mode, strict security policies), accessing
    // localStorage throws a SecurityError before .getItem is even called.
    function getState(programId) {
        try {
            const raw = localStorage.getItem(`checklist_${programId}`);
            return JSON.parse(raw || '{}');
        } catch {
            return {};
        }
    }

    function saveState(programId, state) {
        try {
            localStorage.setItem(`checklist_${programId}`, JSON.stringify(state));
        } catch {
            console.warn('Could not save checklist state to localStorage.');
        }
    }

    // ── Render Checklist ──────────────────────────────────────────────────
    // FIX #15: Removed inline onclick="Checklist.toggle(...)" from innerHTML.
    // Uses event delegation on the container instead.
    function renderChecklist(data) {
        const body = document.getElementById('checklist-body');
        if (!body) return;

        const state = getState(data.program_id);
        const totalDone = Object.values(state).filter(Boolean).length;
        const total = data.total;
        const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

        const categories = {};
        data.items.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });

        const deadlineHtml = `
      <div class="cl-deadline-warn">
        <i class="fa-regular fa-calendar"></i> Deadline: ${data.deadline}
      </div>`;

        const circumference = 201.1;
        const offset = circumference - (pct / 100) * circumference;

        body.innerHTML = `
      <div class="cl-header">
        <div>
          <div class="cl-title">${data.university}</div>
          <div class="cl-subtitle">${data.program} · ${totalDone}/${total} tasks completed</div>
          <div style="margin-top:10px">${deadlineHtml}</div>
        </div>
        <div class="cl-progress-ring">
          <svg viewBox="0 0 72 72" width="72" height="72">
            <circle class="clr-bg" cx="36" cy="36" r="32"/>
            <circle class="clr-fill" cx="36" cy="36" r="32"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              id="progress-ring-fill"
            />
          </svg>
          <div class="clr-text">
            <span class="clr-pct" id="progress-pct">${pct}%</span>
            <span class="clr-done" id="progress-done">${totalDone}/${total}</span>
          </div>
        </div>
      </div>

      <div id="cl-categories">
        ${Object.entries(categories).map(([cat, items]) => `
          <div class="cl-category">
            <div class="cl-cat-title">
              ${_catIcon(cat)} ${cat}
              <span class="cl-cat-count">${items.length}</span>
            </div>
            ${items.map(item => `
              <div class="cl-item ${state[item.id] ? 'done' : ''}" data-id="${item.id}">
                <div class="cl-check">${state[item.id] ? '<i class="fa-solid fa-check"></i>' : ''}</div>
                <span class="cl-task">${item.task}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

        // FIX #15: Single delegated listener — no inline onclick needed.
        const categoriesEl = body.querySelector('#cl-categories');
        if (categoriesEl) {
            categoriesEl.addEventListener('click', (e) => {
                const item = e.target.closest('.cl-item');
                if (item && item.dataset.id) {
                    toggle(item.dataset.id);
                }
            });
        }
    }

    // ── Toggle a checklist item ───────────────────────────────────────────
    function toggle(itemId) {
        if (!currentProgramId || !checklistData) return;

        const state = getState(currentProgramId);
        state[itemId] = !state[itemId];
        saveState(currentProgramId, state);

        const itemEl = document.querySelector(`.cl-item[data-id="${itemId}"]`);
        if (itemEl) {
            const isDone = state[itemId];
            itemEl.classList.toggle('done', isDone);
            itemEl.querySelector('.cl-check').innerHTML = isDone ? '<i class="fa-solid fa-check"></i>' : '';
        }

        const totalDone = Object.values(state).filter(Boolean).length;
        const total = checklistData.total;
        const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

        const circumference = 201.1;
        const offset = circumference - (pct / 100) * circumference;
        const fill = document.getElementById('progress-ring-fill');
        if (fill) fill.style.strokeDashoffset = offset;
        const pctEl = document.getElementById('progress-pct');
        if (pctEl) pctEl.textContent = `${pct}%`;
        const doneEl = document.getElementById('progress-done');
        if (doneEl) doneEl.textContent = `${totalDone}/${total}`;

        if (pct === 100) {
            App.toast('🎉 All tasks complete! Best of luck with your application!', 'success', 5000);
        }
    }

    // ── Category Icons ────────────────────────────────────────────────────
    function _catIcon(cat) {
        const icons = {
            'Essays': '<i class="fa-solid fa-pen-nib" style="color:var(--accent-purple)"></i>',
            'Recommendations': '<i class="fa-solid fa-envelope-open-text" style="color:var(--accent-blue)"></i>',
            'Testing': '<i class="fa-solid fa-pencil" style="color:var(--accent-orange)"></i>',
            'Academics': '<i class="fa-solid fa-graduation-cap" style="color:var(--accent-green)"></i>',
            'Application': '<i class="fa-solid fa-file-alt" style="color:var(--primary-light)"></i>',
            'Interviews': '<i class="fa-solid fa-user-tie" style="color:var(--accent-teal)"></i>',
            'Other': '<i class="fa-solid fa-ellipsis" style="color:var(--text-muted)"></i>',
        };
        return icons[cat] || icons['Other'];
    }

    // ── Populate select dropdown ──────────────────────────────────────────
    async function populateSelect() {
        const sel = document.getElementById('checklist-program-select');
        if (!sel) return;

        let progs = App.state.programs;
        if (!progs || !progs.length) {
            try {
                const data = await App.api('/api/programs');
                progs = data.programs;
                App.state.programs = progs;
            } catch { return; }
        }

        sel.innerHTML = '<option value="">Choose a program…</option>';
        progs.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.short_name} – ${p.program}`;
            sel.appendChild(opt);
        });

        if (currentProgramId) {
            sel.value = currentProgramId;
            loadForProgram(currentProgramId);
        }
    }

    // ── Init ──────────────────────────────────────────────────────────────
    function init() {
        if (!initialized) {
            initialized = true;
            const sel = document.getElementById('checklist-program-select');
            if (sel) {
                sel.addEventListener('change', () => {
                    if (sel.value) {
                        loadForProgram(sel.value);
                    } else {
                        const body = document.getElementById('checklist-body');
                        if (body) body.innerHTML = `
              <div class="checklist-empty">
                <i class="fa-solid fa-list-check"></i>
                <h3>Select a program above to load your checklist</h3>
                <p>We'll show you every step you need to complete, organized by category.</p>
              </div>`;
                    }
                });
            }
        }
        populateSelect();
    }

    return { init, loadForProgram, toggle };
})();