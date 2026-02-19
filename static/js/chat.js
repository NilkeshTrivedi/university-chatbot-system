/**
 * chat.js – AI Chat interface with live messaging and compression stats display.
 */

const Chat = (() => {
    let selectedProgramId = '';
    let history = [];
    let isLoading = false;
    let initialized = false;

    // ── Render Messages ───────────────────────────────────────────────────
    function renderMessage(role, content, compressionStats = null, scrollSmooth = true) {
        const container = document.getElementById('chat-messages');

        const welcome = container.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isUser = role === 'user';

        const avatarIcon = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        let compBadgeHtml = '';
        if (!isUser && compressionStats && compressionStats.tokens_saved > 0) {
            compBadgeHtml = `
        <div class="msg-compress-badge">
          <i class="fa-solid fa-bolt"></i>
          ${compressionStats.tokens_saved} tokens saved (${Math.round(compressionStats.compression_ratio * 100)}%)
        </div>`;
        }

        const formattedContent = formatMarkdown(content);

        const msgEl = document.createElement('div');
        msgEl.className = `message ${role}`;
        msgEl.innerHTML = `
      <div class="msg-avatar">${avatarIcon}</div>
      <div class="msg-body">
        <div class="msg-bubble">${formattedContent}</div>
        <div class="msg-meta">
          <span class="msg-time">${now}</span>
          ${compBadgeHtml}
        </div>
      </div>
    `;

        container.appendChild(msgEl);
        container.scrollTo({
            top: container.scrollHeight,
            behavior: scrollSmooth ? 'smooth' : 'instant',
        });
    }

    // ── Markdown Formatter ────────────────────────────────────────────────
    // FIX #7: Rewrote list handling to correctly separate bullet <ul> from
    // numbered <ol> lists, and avoid the greedy regex swallowing non-list content.
    function formatMarkdown(text) {
        // Step 1: apply inline formatting
        let result = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^### (.+)$/gm, '<h4 style="margin:10px 0 4px;color:var(--text-primary)">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 style="margin:12px 0 6px;color:var(--text-primary)">$1</h3>')
            .replace(/^---$/gm, '<hr style="border-color:rgba(255,255,255,0.08);margin:10px 0">');

        // Step 2: convert lists line-by-line to avoid cross-contamination
        const lines = result.split('\n');
        const output = [];
        let inUl = false;
        let inOl = false;

        for (const line of lines) {
            const bulletMatch = line.match(/^[\-\*] (.+)$/);
            const numberedMatch = line.match(/^\d+\. (.+)$/);

            if (bulletMatch) {
                if (inOl) { output.push('</ol>'); inOl = false; }
                if (!inUl) { output.push('<ul>'); inUl = true; }
                output.push(`<li>${bulletMatch[1]}</li>`);
            } else if (numberedMatch) {
                if (inUl) { output.push('</ul>'); inUl = false; }
                if (!inOl) { output.push('<ol>'); inOl = true; }
                output.push(`<li>${numberedMatch[1]}</li>`);
            } else {
                if (inUl) { output.push('</ul>'); inUl = false; }
                if (inOl) { output.push('</ol>'); inOl = false; }
                output.push(line);
            }
        }
        if (inUl) output.push('</ul>');
        if (inOl) output.push('</ol>');

        // Step 3: paragraph and line break handling
        return output
            .join('\n')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    // ── Send Message ──────────────────────────────────────────────────────
    async function send() {
        if (isLoading) return;

        const input = document.getElementById('chat-input');
        const message = input?.value?.trim();
        if (!message) return;

        input.value = '';
        input.style.height = 'auto';
        input.dispatchEvent(new Event('input'));

        isLoading = true;
        renderMessage('user', message);
        history.push({ role: 'user', content: message });

        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.style.display = 'flex';

        const messagesEl = document.getElementById('chat-messages');
        if (messagesEl) messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });

        try {
            const response = await App.api('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    history: history.slice(-12),
                    program_id: selectedProgramId || undefined,
                }),
            });

            history.push({ role: 'assistant', content: response.reply });

            if (response.compression_stats) {
                updateCompressionBadge(response.compression_stats);
                App.addTokensSaved(response.compression_stats.tokens_saved ?? 0);
            }

            renderMessage('assistant', response.reply, response.compression_stats);

        } catch (e) {
            renderMessage('assistant', `⚠️ Error: ${e.message}. Please check your API keys in .env.`);
        } finally {
            isLoading = false;
            if (typingEl) typingEl.style.display = 'none';
        }
    }

    // ── Compression Badge (Sidebar) ───────────────────────────────────────
    function updateCompressionBadge(stats) {
        const box = document.getElementById('compression-badge-box');
        const statsEl = document.getElementById('cb-stats');
        if (!box || !statsEl) return;

        box.style.display = 'block';
        statsEl.innerHTML = `
      <div class="cb-stat"><span class="cb-val">${stats.original_tokens}</span><span class="cb-lab">Original Tokens</span></div>
      <div class="cb-stat"><span class="cb-val">${stats.compressed_tokens}</span><span class="cb-lab">Compressed</span></div>
      <div class="cb-stat"><span class="cb-val">${stats.tokens_saved}</span><span class="cb-lab">Tokens Saved</span></div>
      <div class="cb-stat"><span class="cb-val">${Math.round(stats.compression_ratio * 100)}%</span><span class="cb-lab">Reduction</span></div>
    `;
    }

    // ── Load Program List into Sidebar ────────────────────────────────────
    async function loadProgramList() {
        const list = document.getElementById('program-select-list');
        if (!list) return;

        let progs = App.state.programs;
        if (!progs || !progs.length) {
            try {
                const data = await App.api('/api/programs');
                progs = data.programs;
                App.state.programs = progs;
            } catch { return; }
        }

        list.querySelectorAll('.dynamic-prog-item').forEach(el => el.remove());

        progs.forEach(p => {
            const item = document.createElement('div');
            item.className = 'program-select-item dynamic-prog-item';
            item.dataset.id = p.id;
            item.innerHTML = `
        <div class="psi-dot" style="background:${p.logo_color}"></div>
        <div class="psi-text">
          <span class="psi-name">${p.short_name}</span>
          <span class="psi-sub">${p.program}</span>
        </div>
      `;
            item.addEventListener('click', () => selectProgram(p.id));
            list.appendChild(item);
        });

        const generalItem = list.querySelector('[data-id=""]');
        if (generalItem) {
            generalItem.addEventListener('click', () => selectProgram(''));
        }
    }

    // ── Select Program Context ────────────────────────────────────────────
    function selectProgram(programId) {
        selectedProgramId = programId;
        document.querySelectorAll('.program-select-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === programId);
        });
    }

    // ── Auto-resize textarea ──────────────────────────────────────────────
    function bindInputAutoResize() {
        const textarea = document.getElementById('chat-input');
        const charCount = document.getElementById('char-count');
        if (!textarea) return;

        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
            if (charCount) charCount.textContent = `${textarea.value.length} / 2000`;
        });

        textarea.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────
    function init() {
        if (!initialized) {
            initialized = true;
            bindInputAutoResize();
            document.getElementById('send-btn')?.addEventListener('click', send);
        }
        loadProgramList();
    }

    return { init, send, selectProgram };
})();