/**
 * eligibility.js
 * Responsibility: Eligibility checker form — stream selection, marks input,
 * eligibility computation, and results rendering.
 * Reads from DATA.courses and DATA.streamMap (data.js).
 */

const Eligibility = (() => {
  let initialized = false;

  // Form state
  let selectedStream = '';
  let selectedLevel  = 'ug';

  function init() {
    if (initialized) return;
    initialized = true;
    bindStream();
    bindMarks();
    bindLevel();
    bindCheckButton();
  }

  // ── Stream buttons ───────────────────────────────────────────────
  function bindStream() {
    document.querySelectorAll('[data-stream]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-stream]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStream = btn.dataset.stream;
      });
    });
  }

  // ── Marks input bar ──────────────────────────────────────────────
  function bindMarks() {
    const input = document.getElementById('marks-input');
    const fill  = document.getElementById('marks-fill');
    const hint  = document.getElementById('marks-hint');

    input?.addEventListener('input', () => {
      const v = parseFloat(input.value) || 0;
      const pct = Math.min(Math.max(v, 0), 100);
      if (fill) fill.style.width = pct + '%';
      if (hint) {
        const labels = [
          [95, 'Outstanding — top colleges are realistic'],
          [85, 'Excellent — strong profile across most courses'],
          [75, 'Good — wide range of options'],
          [60, 'Moderate — some selective courses need entrance scores'],
          [45, 'Meets minimum for several courses'],
          [0,  'Very limited options at this percentage'],
        ];
        const label = labels.find(([threshold]) => v >= threshold);
        hint.textContent = v ? (label ? label[1] : '') : '';
      }
    });
  }

  // ── UG / PG toggle ──────────────────────────────────────────────
  function bindLevel() {
    document.querySelectorAll('[data-level]').forEach(btn => {
      // Skip the course-level filter chips (they have class 'chip')
      if (btn.classList.contains('chip')) return;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLevel = btn.dataset.level;
      });
    });
  }

  // ── Check button ─────────────────────────────────────────────────
  function bindCheckButton() {
    document.getElementById('check-btn')?.addEventListener('click', () => {
      const marks = parseFloat(document.getElementById('marks-input')?.value);

      if (!selectedStream) {
        App.toast('Please select your 12th stream first', 'error');
        return;
      }
      if (!marks || marks < 1 || marks > 100) {
        App.toast('Please enter a valid percentage (1–100)', 'error');
        return;
      }

      const scores = {
        jee:  parseFloat(document.getElementById('sc-jee')?.value)  || 0,
        neet: parseFloat(document.getElementById('sc-neet')?.value) || 999999,
        cat:  parseFloat(document.getElementById('sc-cat')?.value)  || 0,
        gate: parseFloat(document.getElementById('sc-gate')?.value) || 0,
        clat: parseFloat(document.getElementById('sc-clat')?.value) || 999999,
        cuet: parseFloat(document.getElementById('sc-cuet')?.value) || 0,
      };

      const results = compute(selectedStream, marks, selectedLevel, scores);
      render(results, marks, selectedStream);
    });
  }

  // ── Eligibility engine ───────────────────────────────────────────
  function compute(stream, marks, level, scores) {
    const eligibleIds = DATA.streamMap[stream] || [];

    return DATA.courses
      .filter(c => {
        // Level filter
        if (level === 'ug' && c.level !== 'UG') return false;
        if (level === 'pg' && c.level !== 'PG') return false;
        // Stream eligibility
        if (!eligibleIds.includes(c.id)) return false;
        // Minimum marks
        if (marks < c.minPct) return false;
        return true;
      })
      .map(course => {
        const { score, reasons } = scoreProfile(course, marks, scores);
        const match = score >= 70 ? 'Strong Match' : score >= 50 ? 'Good Match' : score >= 30 ? 'Possible' : 'Low Match';
        const colleges = topCollegeProbabilities(course.id, score);
        return { course, score, match, reasons, colleges };
      })
      .sort((a, b) => b.score - a.score);
  }

  function scoreProfile(course, marks, scores) {
    let score   = 10;
    const reasons = [];

    // 12th marks contribution
    if (marks >= 95)      { score += 28; reasons.push(`Outstanding 12th (${marks}%)`); }
    else if (marks >= 85) { score += 20; reasons.push(`Strong 12th (${marks}%)`); }
    else if (marks >= 75) { score += 13; reasons.push(`Good 12th (${marks}%)`); }
    else                  { score += 5;  reasons.push(`Meets minimum (${marks}%)`); }

    // Exam scores
    if (course.exams.includes('JEE Main') && scores.jee > 0) {
      if      (scores.jee >= 99)  { score += 38; reasons.push(`JEE ${scores.jee}%ile — IIT zone`); }
      else if (scores.jee >= 97)  { score += 28; reasons.push(`JEE ${scores.jee}%ile — NIT/BITS zone`); }
      else if (scores.jee >= 90)  { score += 16; reasons.push(`JEE ${scores.jee}%ile`); }
      else                        { score += 7;  reasons.push(`JEE ${scores.jee}%ile`); }
    }

    if (course.exams.includes('CAT') && scores.cat > 0) {
      if      (scores.cat >= 99)  { score += 38; reasons.push(`CAT ${scores.cat}%ile — IIM A/B/C zone`); }
      else if (scores.cat >= 95)  { score += 28; reasons.push(`CAT ${scores.cat}%ile — top IIMs`); }
      else if (scores.cat >= 85)  { score += 16; reasons.push(`CAT ${scores.cat}%ile`); }
      else                        { score += 7; }
    }

    if (course.exams.includes('GATE') && scores.gate > 0) {
      if      (scores.gate >= 700) { score += 36; reasons.push(`GATE ${scores.gate} — IIT zone`); }
      else if (scores.gate >= 550) { score += 22; reasons.push(`GATE ${scores.gate} — NIT zone`); }
      else                         { score += 9; }
    }

    if (course.exams.includes('NEET-UG') && scores.neet < 999999) {
      if      (scores.neet <= 50)    { score += 38; reasons.push(`NEET ${scores.neet} — AIIMS level`); }
      else if (scores.neet <= 5000)  { score += 28; reasons.push(`NEET ${scores.neet} — Govt medical`); }
      else if (scores.neet <= 50000) { score += 14; reasons.push(`NEET ${scores.neet}`); }
      else                           { score += 5; }
    }

    if (course.exams.includes('CLAT') && scores.clat < 999999) {
      if      (scores.clat <= 100)  { score += 36; reasons.push(`CLAT ${scores.clat} — Top NLU`); }
      else if (scores.clat <= 1000) { score += 22; reasons.push(`CLAT ${scores.clat}`); }
      else                          { score += 9; }
    }

    if (course.exams.includes('CUET') && scores.cuet > 0) {
      if      (scores.cuet >= 700)  { score += 26; reasons.push(`CUET ${scores.cuet} — DU top colleges`); }
      else if (scores.cuet >= 550)  { score += 15; reasons.push(`CUET ${scores.cuet}`); }
      else                          { score += 7; }
    }

    return { score: Math.min(score, 100), reasons };
  }

  function topCollegeProbabilities(courseId, profileScore) {
    // Per-course probability tiers: [collegeName, baseProbabilityModifier]
    const tierData = {
      btech: [
        { name: 'IIT (Top 5)',    tier: 1, baseOffset: -28 },
        { name: 'NIT (Top 5)',    tier: 2, baseOffset: -14 },
        { name: 'BITS Pilani',    tier: 2, baseOffset: -10 },
        { name: 'VIT / SRM',      tier: 3, baseOffset: 5   },
      ],
      bca: [
        { name: 'Symbiosis Pune', tier: 2, baseOffset: -5 },
        { name: 'Christ Bangalore', tier: 2, baseOffset: 0 },
        { name: 'NMIMS Mumbai',   tier: 2, baseOffset: -8 },
        { name: 'DU colleges',    tier: 3, baseOffset: 8  },
      ],
      mba: [
        { name: 'IIM A / B / C',  tier: 1, baseOffset: -32 },
        { name: 'IIM (other)',    tier: 2, baseOffset: -18 },
        { name: 'XLRI / ISB',     tier: 1, baseOffset: -24 },
        { name: 'Top private',    tier: 3, baseOffset: 5   },
      ],
      mbbs: [
        { name: 'AIIMS / JIPMER', tier: 1, baseOffset: -36 },
        { name: 'Govt medical',   tier: 2, baseOffset: -12 },
        { name: 'Private medical',tier: 3, baseOffset: 10  },
      ],
      llb: [
        { name: 'NLSIU / NLU Delhi', tier: 1, baseOffset: -28 },
        { name: 'Other top NLUs',    tier: 2, baseOffset: -10 },
        { name: 'Private law',       tier: 3, baseOffset: 12  },
      ],
    };

    const entries = tierData[courseId] || [
      { name: 'Top colleges',    tier: 1, baseOffset: -20 },
      { name: 'Good colleges',   tier: 2, baseOffset: -5  },
      { name: 'Other colleges',  tier: 3, baseOffset: 10  },
    ];

    return entries.map(e => {
      const raw = Math.max(5, Math.min(95, profileScore + e.baseOffset));
      const color = raw >= 65 ? '#4ade80' : raw >= 40 ? '#fbbf24' : '#fb7185';
      const barBg = raw >= 65
        ? 'linear-gradient(90deg,#22c55e,#4ade80)'
        : raw >= 40
        ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
        : 'linear-gradient(90deg,#ef4444,#fb7185)';
      return { name: e.name, p: raw, color, barBg };
    });
  }

  // ── Render results ───────────────────────────────────────────────
  function render(results, marks, stream) {
    document.getElementById('results-empty').style.display   = 'none';
    const listEl = document.getElementById('results-list');
    listEl.style.display = 'block';
    listEl.innerHTML = '';

    // Summary row
    const streamLabel = stream.replace(/_/g, ' + ').toUpperCase();
    const summary = document.createElement('div');
    summary.className = 'results-summary';
    summary.innerHTML = `
      <div class="results-count">${results.length}</div>
      <div class="results-info">
        <strong>${results.length === 1 ? 'course' : 'courses'} you qualify for</strong>
        <span>${marks}% · ${streamLabel}</span>
      </div>
    `;
    listEl.appendChild(summary);

    if (!results.length) {
      listEl.innerHTML += `
        <div class="results-empty" style="display:flex">
          <i class="fa-solid fa-circle-xmark"></i>
          <h3>No courses found</h3>
          <p>Try a different stream or lower your minimum percentage filter.</p>
        </div>`;
      return;
    }

    const matchClass = {
      'Strong Match': 'match-strong',
      'Good Match':   'match-good',
      'Possible':     'match-possible',
      'Low Match':    'match-low',
    };

    const barGradient = score =>
      score >= 70 ? 'linear-gradient(90deg,var(--blue),var(--blue-2))'
      : score >= 50 ? 'linear-gradient(90deg,var(--orange),var(--orange-2))'
      : score >= 30 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
      : 'linear-gradient(90deg,#475569,#64748b)';

    results.forEach(r => {
      const card = document.createElement('div');
      card.className = 'result-card';

      const probRows = r.colleges.map(col => `
        <div class="prob-row">
          <span class="prob-name">${col.name}</span>
          <div class="prob-bar-wrap">
            <div class="prob-bar-inner" style="width:${col.p}%;background:${col.barBg}"></div>
          </div>
          <span class="prob-pct" style="color:${col.color}">${col.p}%</span>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="rc-top">
          <div class="rc-icon" style="background:${r.course.color}20">
            <i class="fa-solid ${r.course.icon}" style="color:${r.course.color}"></i>
          </div>
          <div class="rc-meta">
            <div class="rc-name">${r.course.name}</div>
            <div class="rc-sub">${r.course.full} · ${r.course.duration}</div>
          </div>
          <span class="match-pill ${matchClass[r.match]}">${r.match}</span>
        </div>
        <div class="rc-track">
          <div class="rc-fill" style="width:${r.score}%;background:${barGradient(r.score)}"></div>
        </div>
        <div class="rc-reasons">
          ${r.reasons.map(x => `<span class="reason-tag">${x}</span>`).join('')}
        </div>
        <div class="prob-section">
          <div class="prob-label">Admission probability by college tier</div>
          ${probRows}
        </div>
        <div class="rc-actions">
          <button class="rc-btn primary" data-elig-open-course="${r.course.id}">
            <i class="fa-solid fa-info-circle"></i> Course details
          </button>
          <button class="rc-btn" data-elig-ask-ai="${r.course.name}|${marks}|${streamLabel}">
            <i class="fa-solid fa-comments"></i> Ask AI
          </button>
        </div>
      `;

      card.querySelector('[data-elig-open-course]').addEventListener('click', e => {
        Courses.init();
        Courses.openDrawer(e.currentTarget.dataset.eligOpenCourse);
        App.navigate('courses');
      });

      card.querySelector('[data-elig-ask-ai]').addEventListener('click', e => {
        const [name, marks, stream] = e.currentTarget.dataset.eligAskAi.split('|');
        Chat.sendQuestion(
          `I scored ${marks}% in ${stream}. Tell me about ${name} — am I a good candidate? What are my college options and what should I do next?`
        );
        App.navigate('chat');
      });

      listEl.appendChild(card);
    });
  }

  return { init };
})();