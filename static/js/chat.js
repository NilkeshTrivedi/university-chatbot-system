/**
 * chat.js – AI Chat interface with live messaging.
 */

const Chat = (() => {
    let selectedProgramId = '';
    let history = [];
    let isLoading = false;
    let initialized = false;

    // ── Render a message bubble ───────────────────────────────────────
    function renderMessage(role, content, compressionStats = null) {
        const container = document.getElementById('chat-messages');

        // Remove welcome screen on first real message
        const welcome = container.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isUser = role === 'user';
        const avatarIcon = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        // Show compression badge only when a program is selected and tokens were saved
        let compBadgeHtml = '';
        if (!isUser && compressionStats && compressionStats.tokens_saved > 0) {
            compBadgeHtml = `
                <div class="msg-compress-badge">
                    <i class="fa-solid fa-bolt"></i>
                    ${compressionStats.tokens_saved} tokens saved
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
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    // ── Basic markdown → HTML ─────────────────────────────────────────
    function formatMarkdown(text) {
        // Process lists line by line to avoid broken regex
        const lines = text.split('\n');
        const processed = [];
        let inUl = false;

        for (const line of lines) {
            if (/^[-*] (.+)$/.test(line)) {
                if (!inUl) { processed.push('<ul>'); inUl = true; }
                processed.push('<li>' + line.replace(/^[-*] /, '') + '</li>');
            } else if (/^\d+\. (.+)$/.test(line)) {
                if (!inUl) { processed.push('<ul>'); inUl = true; }
                processed.push('<li>' + line.replace(/^\d+\. /, '') + '</li>');
            } else {
                if (inUl) { processed.push('</ul>'); inUl = false; }
                processed.push(line);
            }
        }
        if (inUl) processed.push('</ul>');

        return processed.join('\n')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^### (.+)$/gm, '<h4 style="margin:10px 0 4px;color:var(--text-primary)">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 style="margin:12px 0 6px;color:var(--text-primary)">$1</h3>')
            .replace(/^---$/gm, '<hr style="border-color:rgba(255,255,255,0.08);margin:10px 0">')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    // ── Send message ──────────────────────────────────────────────────
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

        // Show typing indicator
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

            // Safely update compression badge if stats exist
            if (response.compression_stats) {
                updateCompressionBadge(response.compression_stats);
                // addTokensSaved exists safely in app.js now
                App.addTokensSaved(response.compression_stats.tokens_saved ?? 0);
            }

            renderMessage('assistant', response.reply, response.compression_stats);

        } catch (e) {
            renderMessage('assistant', `⚠️ Error: ${e.message}`);
        } finally {
            isLoading = false;
            if (typingEl) typingEl.style.display = 'none';
        }
    }

    // ── Send from suggestion chip or quick prompt ─────────────────────
    function sendQuick(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            input.dispatchEvent(new Event('input'));
        }
        send();
    }

    // ── Update sidebar compression stats box ──────────────────────────
    function updateCompressionBadge(stats) {
        const box     = document.getElementById('compression-badge-box');
        const statsEl = document.getElementById('cb-stats');
        if (!box || !statsEl) return;

        box.style.display = 'block';
        statsEl.innerHTML = `
            <div class="cb-stat">
                <span class="cb-val">${stats.original_tokens ?? '—'}</span>
                <span class="cb-lab">Original Tokens</span>
            </div>
            <div class="cb-stat">
                <span class="cb-val">${stats.compressed_tokens ?? '—'}</span>
                <span class="cb-lab">Compressed</span>
            </div>
            <div class="cb-stat">
                <span class="cb-val">${stats.tokens_saved ?? '—'}</span>
                <span class="cb-lab">Tokens Saved</span>
            </div>
            <div class="cb-stat">
                <span class="cb-val">${stats.compression_ratio ? Math.round(stats.compression_ratio * 100) + '%' : '—'}</span>
                <span class="cb-lab">Reduction</span>
            </div>
        `;
    }

    // ── Load program list into sidebar ────────────────────────────────
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

        // Remove old dynamically added items
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

        // Bind the "General" item
        const generalItem = list.querySelector('[data-id=""]');
        if (generalItem) {
            generalItem.addEventListener('click', () => selectProgram(''));
        }
    }

    // ── Select a program context ──────────────────────────────────────
    function selectProgram(programId) {
        selectedProgramId = programId;
        document.querySelectorAll('.program-select-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === programId);
        });

        // Hide compression box when switching to general
        if (!programId) {
            const box = document.getElementById('compression-badge-box');
            if (box) box.style.display = 'none';
        }
    }

    // ── Auto-resize textarea ──────────────────────────────────────────
    function bindInputAutoResize() {
        const textarea  = document.getElementById('chat-input');
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

    // ── Init ──────────────────────────────────────────────────────────
    function init() {
        if (!initialized) {
            initialized = true;
            bindInputAutoResize();
            document.getElementById('send-btn')?.addEventListener('click', send);
        }
        loadProgramList();
    }

    return { init, send, sendQuick, selectProgram };
})();