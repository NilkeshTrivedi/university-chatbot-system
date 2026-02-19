/**
 * dashboard.js – Dashboard page init, compression meter, quick programs.
 */

const Dashboard = (() => {
    let initialized = false;

    // ── Compression Ring ──────────────────────────────────────────────────
    function animateRing(ratio) {
        const circumference = 326.7;
        const offset = circumference - (ratio / 100) * circumference;
        const fill = document.getElementById('ring-fill');
        const val = document.getElementById('meter-value');
        if (fill) fill.style.strokeDashoffset = offset;
        if (val) val.textContent = `${Math.round(ratio)}%`;
    }

    function updateMeterStats(data) {
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('ms-original', data.original_tokens?.toLocaleString() ?? '—');
        set('ms-compressed', data.compressed_tokens?.toLocaleString() ?? '—');
        set('ms-saved', (data.tokens_saved ?? 0).toLocaleString());
        set('ms-provider', data.provider ?? '—');
        animateRing((data.compression_ratio ?? 0) * 100);
    }

    // ── Demo Compress ─────────────────────────────────────────────────────
    function bindDemoCompress() {
        const btn = document.getElementById('demo-compress-btn');
        if (!btn || btn._bound) return;
        btn._bound = true;

        const sampleText = `Massachusetts Institute of Technology Computer Science program requires 
applicants to have an unweighted GPA of 4.0, SAT scores between 1540-1590 or ACT 34-36. 
Students must submit two teacher recommendations from mathematics and science teachers, 
a counselor recommendation letter, personal statement of 500 words, challenge essay of 
500 words, and activity essay of 250 words. Extracurricular activities such as competitive 
programming at USACO Gold or Platinum level, research experience, hackathon participation, 
and open-source contributions on GitHub are strongly valued. An optional alumni interview 
is also highly recommended for all applicants seeking admission.`;

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Compressing…';
            try {
                const data = await App.api('/api/compress', {
                    method: 'POST',
                    body: JSON.stringify({ text: sampleText, ratio: 0.45 }),
                });
                updateMeterStats(data);
                App.addTokensSaved(data.tokens_saved ?? 0);
                App.toast(`Compressed! Saved ${data.tokens_saved} tokens (${Math.round(data.compression_ratio * 100)}% reduction)`, 'success');
            } catch (e) {
                App.toast('Compression failed: ' + e.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Run Again';
            }
        });
    }

    // ── SVG Gradient Def ─────────────────────────────────────────────────
    function injectSvgDefs() {
        const svg = document.querySelector('.meter-ring svg');
        if (!svg || svg.querySelector('defs')) return;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
      <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#6366f1"/>
        <stop offset="50%"  stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>`;
        svg.insertBefore(defs, svg.firstChild);
    }

    // ── Quick Programs ────────────────────────────────────────────────────
    async function loadQuickPrograms() {
        const container = document.getElementById('quick-programs');
        if (!container) return;

        try {
            const data = await App.api('/api/programs');
            const featured = data.programs.slice(0, 5);

            container.innerHTML = featured.map(p => `
        <div class="quick-prog-item" onclick="App.navigate('programs'); setTimeout(()=>Programs.openDetail('${p.id}'), 300)">
          <div class="qpi-dot" style="background:${p.logo_color}"></div>
          <div class="qpi-info">
            <span class="qpi-name">${p.short_name} – ${p.program}</span>
            <span class="qpi-sub">Deadline: ${p.deadline}</span>
          </div>
          <span class="qpi-rate">${p.acceptance_rate}</span>
        </div>
      `).join('');

            // Cache programs globally
            App.state.programs = data.programs;
        } catch (e) {
            container.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem">Could not load programs.</p>`;
        }
    }

    // ── Count-up animation ────────────────────────────────────────────────
    function countUp(el, target, suffix = '') {
        const start = Date.now();
        const duration = 1800;
        const update = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(eased * target);
            el.textContent = val.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // ── Init ──────────────────────────────────────────────────────────────
    function init() {
        injectSvgDefs();
        bindDemoCompress();
        loadQuickPrograms();

        // Animate ring to 0 initially
        animateRing(0);

        if (!initialized) {
            initialized = true;
            // Animate hero count-up stats
            setTimeout(() => {
                const compEl = document.getElementById('stat-compression');
                if (compEl) countUp(compEl, 47, '%');
            }, 600);
        }
    }

    return { init, updateMeterStats, animateRing };
})();
