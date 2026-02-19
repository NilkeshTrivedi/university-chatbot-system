/**
 * programs.js – Program Explorer: grid, search, filter, detail drawer.
 */

const Programs = (() => {
    let programs = [];
    let activeCategory = 'All';
    let activeSearch = '';
    let initialized = false;

    async function load() {
        try {
            const data = await App.api(`/api/programs?category=${encodeURIComponent(activeCategory)}&q=${encodeURIComponent(activeSearch)}`);
            programs = data.programs;
            App.state.programs = data.programs;
            renderGrid(programs);
            renderCategories(data.categories);
        } catch (e) {
            document.getElementById('programs-grid').innerHTML =
                `<p style="color:var(--text-muted);grid-column:1/-1">Failed to load programs: ${e.message}</p>`;
        }
    }

    function renderGrid(list) {
        const grid = document.getElementById('programs-grid');
        if (!grid) return;
        if (!list.length) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
        <i class="fa-solid fa-search" style="font-size:2.5rem;opacity:0.3;display:block;margin-bottom:16px"></i>
        <p>No programs found. Try a different search.</p>
      </div>`;
            return;
        }
        grid.innerHTML = list.map(p => `
      <div class="program-card" onclick="Programs.openDetail('${p.id}')">
        <div class="pc-top">
          <div class="pc-logo" style="background:${p.logo_color}">${p.short_name.substring(0, 2)}</div>
          <div class="pc-rate-badge">${p.acceptance_rate}</div>
        </div>
        <div class="pc-university">${p.university}</div>
        <div class="pc-program">${p.program}</div>
        <div class="pc-category"><i class="fa-solid fa-tag"></i>${p.category}</div>
        <div class="pc-stats">
          <div class="pc-stat"><span class="pc-stat-val">${p.avg_gpa}</span><span class="pc-stat-lab">Avg GPA</span></div>
          <div class="pc-stat"><span class="pc-stat-val">${p.avg_sat}</span><span class="pc-stat-lab">Avg SAT</span></div>
          <div class="pc-stat"><span class="pc-stat-val">${p.avg_act}</span><span class="pc-stat-lab">Avg ACT</span></div>
        </div>
        <div class="pc-deadline"><i class="fa-regular fa-calendar"></i>${p.deadline}</div>
        <div class="pc-cta">
          <span>View Full Requirements</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    `).join('');
    }

    // FIX #6: Removed _rendered guard. DOM is built once (via !container._rendered),
    // but syncActiveCategoryBtn() is ALWAYS called so buttons reflect current state
    // even after re-navigation when activeCategory may have changed.
    function renderCategories(categories) {
        const container = document.getElementById('category-filters');
        if (!container) return;
        if (!container._rendered) {
            container._rendered = true;
            container.innerHTML = categories.map(c =>
                `<button class="cat-btn" data-cat="${c}">${c}</button>`
            ).join('');
            container.querySelectorAll('.cat-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    activeCategory = btn.dataset.cat;
                    syncActiveCategoryBtn(container);
                    load();
                });
            });
        }
        syncActiveCategoryBtn(container);
    }

    function syncActiveCategoryBtn(container) {
        container.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === activeCategory);
        });
    }

    async function openDetail(programId) {
        const overlay = document.getElementById('detail-overlay');
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        overlay.classList.add('open');
        drawer.classList.add('open');
        content.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:60vh;color:var(--text-muted)">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem"></i>
    </div>`;
        try {
            const data = await App.api(`/api/programs/${programId}`);
            const p = data.program;
            const comp = data.compression;
            if (Dashboard && Dashboard.updateMeterStats) {
                Dashboard.updateMeterStats(comp);
                App.addTokensSaved(comp.tokens_saved ?? 0);
            }
            const reqs = p.requirements;
            const essayItems = (reqs.essays || []).map(e => `<div class="essay-item">${e}</div>`).join('');
            const tipItems = (p.tips || []).map(t => `<div class="tip-item">${t}</div>`).join('');
            const mistakeItems = (p.common_mistakes || []).map(m => `<div class="mistake-item">${m}</div>`).join('');

            // FIX #5: Show provider clearly (Live vs Fallback).
            const providerLabel = comp.provider === 'scaledown'
                ? '<span style="color:var(--accent-green);font-size:0.72rem;margin-left:6px">● Live</span>'
                : '<span style="color:var(--accent-gold);font-size:0.72rem;margin-left:6px">● Fallback</span>';

            content.innerHTML = `
        <div class="drawer-header">
          <div class="drawer-logo" style="background:${p.logo_color}">${p.short_name.substring(0, 2)}</div>
          <div class="drawer-uni">${p.university}</div>
          <div class="drawer-prog">${p.program}</div>
          <div class="drawer-meta">
            <div class="dmeta-chip"><i class="fa-solid fa-percent"></i>${p.acceptance_rate} acceptance</div>
            <div class="dmeta-chip"><i class="fa-regular fa-calendar"></i>${p.application_deadline}</div>
            <div class="dmeta-chip"><i class="fa-solid fa-dollar-sign"></i>${p.application_fee} fee</div>
          </div>
        </div>
        <div class="drawer-compression">
          <div class="dc-title"><i class="fa-solid fa-bolt"></i> Scaledown Compression Stats ${providerLabel}</div>
          <div class="dc-stats">
            <div class="dc-stat"><div class="dc-val">${comp.original_tokens}</div><div class="dc-lab">Original Tokens</div></div>
            <div class="dc-stat"><div class="dc-val">${comp.compressed_tokens}</div><div class="dc-lab">Compressed</div></div>
            <div class="dc-stat"><div class="dc-val">${Math.round(comp.compression_ratio * 100)}%</div><div class="dc-lab">Reduction</div></div>
          </div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title"><i class="fa-solid fa-clipboard-list"></i> Requirements</div>
          <div class="req-row"><span class="req-key">GPA</span><span class="req-val">${reqs.gpa || '—'}</span></div>
          <div class="req-row"><span class="req-key">Test Scores</span><span class="req-val">${reqs.tests || '—'}</span></div>
          <div class="req-row"><span class="req-key">Recs</span><span class="req-val">${reqs.recommendations || '—'}</span></div>
          <div class="req-row"><span class="req-key">ECs</span><span class="req-val">${reqs.extracurriculars || '—'}</span></div>
          <div class="req-row"><span class="req-key">Interviews</span><span class="req-val">${reqs.interviews || 'Not offered'}</span></div>
          ${reqs.international ? `<div class="req-row"><span class="req-key">International</span><span class="req-val">${reqs.international}</span></div>` : ''}
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title"><i class="fa-solid fa-pen-nib"></i> Essays Required</div>
          ${essayItems}
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title"><i class="fa-solid fa-lightbulb"></i> Pro Tips</div>
          ${tipItems}
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title"><i class="fa-solid fa-triangle-exclamation"></i> Common Mistakes</div>
          ${mistakeItems}
        </div>
        <div class="drawer-cta">
          <button class="btn btn-primary" onclick="Programs.chatAbout('${p.id}', '${p.short_name}')">
            <i class="fa-solid fa-comments"></i> Ask AI About This
          </button>
          <button class="btn btn-secondary" onclick="Checklist.loadForProgram('${p.id}');App.navigate('checklist')">
            <i class="fa-solid fa-list-check"></i> Open Checklist
          </button>
        </div>
      `;
        } catch (e) {
            content.innerHTML = `<p style="color:var(--accent-rose);padding:20px">Error: ${e.message}</p>`;
        }
    }

    function chatAbout(programId, programName) {
        closeDrawer();
        App.navigate('chat');
        setTimeout(() => {
            Chat.selectProgram(programId);
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = `Tell me about the requirements and tips for ${programName}.`;
                input.dispatchEvent(new Event('input'));
                Chat.send();
            }
        }, 300);
    }

    function closeDrawer() {
        document.getElementById('detail-overlay')?.classList.remove('open');
        document.getElementById('detail-drawer')?.classList.remove('open');
    }

    function init() {
        if (!initialized) {
            initialized = true;
            const searchInput = document.getElementById('programs-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    activeSearch = searchInput.value.trim();
                    load();
                });
            }
            document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
            document.getElementById('detail-overlay')?.addEventListener('click', closeDrawer);
        }
        load();
    }

    return { init, openDetail, chatAbout, closeDrawer };
})();