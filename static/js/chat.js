/**
 * chat.js
 * Responsibility: AI chat interface.
 *
 * KEY FIX — history bug:
 * history[] stores COMPLETED turns only.
 * The current message is sent separately to /api/chat as `message`.
 * The server appends history + message itself.
 * We push to history ONLY AFTER the API responds successfully.
 *
 * This means:
 *   - history sent: [{role:"user","Hi"}, {role:"assistant","Hello!"}]
 *   - message sent: "What is JEE?"
 *   - NOT: [...history, {role:"user","What is JEE?"}] ← this was the bug
 */

const Chat = (() => {
  let initialized     = false;
  let isLoading       = false;
  let history         = [];           // completed turns only
  let selectedProgram = '';           // program context id

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    if (initialized) return;
    initialized = true;

    bindInput();
    bindSuggestions();
    loadProgramList();
    checkApiStatus();
  }

  // ── Input bindings ────────────────────────────────────────────────
  function bindInput() {
    const textarea = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('send-btn');

    textarea?.addEventListener('input', () => {
      // Auto-resize
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 130) + 'px';

      // Char count
      document.getElementById('char-count').textContent = `${textarea.value.length} / 2000`;

      // Enable/disable send button
      sendBtn.disabled = !textarea.value.trim() || isLoading;
    });

    textarea?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!textarea.value.trim() || isLoading) return;
        send(textarea.value.trim());
      }
    });

    sendBtn?.addEventListener('click', () => {
      const msg = textarea?.value.trim();
      if (msg && !isLoading) send(msg);
    });
  }

  // ── Suggestion chips ──────────────────────────────────────────────
  function bindSuggestions() {
    document.querySelectorAll('.suggestion[data-q]').forEach(btn => {
      btn.addEventListener('click', () => send(btn.dataset.q));
    });
  }

  // ── Program context sidebar ───────────────────────────────────────
  function loadProgramList() {
    const list = document.getElementById('program-list');
    if (!list || list.querySelectorAll('[data-prog]').length > 0) return;

    // Build list from DATA (no API call needed — data.js has it)
    DATA.courses.forEach(c => {
      const item = document.createElement('div');
      item.className = 'program-item';
      item.dataset.prog = c.id;
      item.innerHTML = `
        <div class="prog-dot" style="background:${c.color}"></div>
        <div class="prog-info">
          <div class="prog-name">${c.name}</div>
          <div class="prog-sub">${c.full}</div>
        </div>
      `;
      item.addEventListener('click', () => selectProgram(c.id, item));
      list.appendChild(item);
    });

    // First item (General) — select on click
    const general = list.querySelector('[data-prog=""]') || list.firstElementChild;
    general?.addEventListener('click', () => {
      selectProgram('', general);
    });
  }

  function selectProgram(id, clickedEl) {
    selectedProgram = id;
    document.querySelectorAll('.program-item').forEach(el => el.classList.remove('active'));
    clickedEl?.classList.add('active');
  }

  // ── Check API key status via /api/health ──────────────────────────
  async function checkApiStatus() {
    const dot  = document.getElementById('ks-dot');
    const text = document.getElementById('ks-text');
    const help = document.getElementById('key-help');

    try {
      const data = await fetch('/api/health').then(r => r.json());

      if (data.groq_key_configured) {
        dot.className  = 'ks-dot ok';
        text.textContent = 'AI ready';
        if (help) help.style.display = 'none';
      } else {
        dot.className  = 'ks-dot err';
        text.textContent = 'API key missing';
        if (help) {
          help.style.display = 'block';
          help.innerHTML = 'Add <code>GROQ_API_KEY=gsk_...</code> to your <code>.env</code> file, then restart the server.';
        }
      }
    } catch {
      dot.className  = 'ks-dot err';
      text.textContent = 'Cannot reach server';
    }
  }

  // ── Send a message ────────────────────────────────────────────────
  async function send(message) {
    if (!message || isLoading) return;

    // Hide welcome screen on first message
    const welcome = document.getElementById('chat-welcome');
    if (welcome) welcome.style.display = 'none';

    // Clear input
    const textarea = document.getElementById('chat-input');
    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
      document.getElementById('char-count').textContent = '0 / 2000';
    }
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.disabled = true;

    isLoading = true;

    // Render user message
    addMessage('user', message);

    // Show typing indicator
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.style.display = 'flex';
    scrollToBottom();

    try {
      // KEY FIX: send history (completed turns) + message (current turn) separately.
      // Do NOT push message to history before sending.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: history.slice(-10),          // last 10 completed turns
          program_id: selectedProgram || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'No response received.';

      // Now push both turns to history (after successful response)
      history.push({ role: 'user',      content: message });
      history.push({ role: 'assistant', content: reply });

      // Keep history manageable
      if (history.length > 20) history = history.slice(-20);

      addMessage('assistant', reply);

    } catch (err) {
      addMessage('assistant', `**Error:** ${err.message}`);
    } finally {
      isLoading = false;
      if (typingEl) typingEl.style.display = 'none';
      if (sendBtn) sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  // ── Public: send a pre-filled question (from other pages) ─────────
  function sendQuestion(text) {
    // Navigate to chat then send
    const ta = document.getElementById('chat-input');
    if (ta) ta.value = text;
    // Use setTimeout so the page transition completes first
    setTimeout(() => send(text), 50);
  }

  // ── Render a message bubble ───────────────────────────────────────
  function addMessage(role, content) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `message ${role}`;

    const icon = role === 'user'
      ? '<i class="fa-solid fa-user"></i>'
      : '<i class="fa-solid fa-graduation-cap"></i>';

    el.innerHTML = `
      <div class="msg-avatar">${icon}</div>
      <div class="msg-bubble">${formatMarkdown(content)}</div>
    `;

    container.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    const c = document.getElementById('chat-messages');
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
  }

  // ── Simple markdown renderer ──────────────────────────────────────
  function formatMarkdown(text) {
    const lines = text.split('\n');
    const out   = [];
    let inList  = false;

    for (const line of lines) {
      if (/^[-*•] (.+)/.test(line)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${line.replace(/^[-*•] /, '')}</li>`);
      } else if (/^\d+\. (.+)/.test(line)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');

    return out.join('\n')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code>$1</code>')
      .replace(/^### (.+)$/gm,   '<h4 style="margin:10px 0 4px;color:var(--text)">$1</h4>')
      .replace(/^## (.+)$/gm,    '<h3 style="margin:12px 0 6px;color:var(--text)">$1</h3>')
      .replace(/\n{2,}/g,        '<br><br>')
      .replace(/\n/g,            '<br>');
  }

  return { init, sendQuestion };
})();