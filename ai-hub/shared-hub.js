// ═══════════════════════════════════════════════════════════════════════════
// NEXUS — shared nav, settings modal, CONFIG
// Reuses the same `gemini_key` from localStorage as StockIQ for instant setup.
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  GEMINI_KEY: localStorage.getItem('gemini_key') || '',
};

const NAV_PAGES = [
  { id: 'home',      label: 'Home',       icon: '◆', href: 'index.html' },
  { id: 'prompting', label: 'Prompting',  icon: '✎', href: 'prompting.html' },
  { id: 'coding',    label: 'Coding',     icon: '⌬', href: 'coding.html' },
  { id: 'agents',    label: 'Agents',     icon: '◈', href: 'agents.html' },
  { id: 'tools',     label: 'Tools Atlas',icon: '⊞', href: 'tools.html' },
  { id: 'image',     label: 'Image/Video',icon: '◐', href: 'image.html' },
  { id: 'business',  label: 'Make Money', icon: '◉', href: 'business.html' },
  { id: 'cowork',    label: 'Cowork',     icon: '⊕', href: 'cowork.html' },
  { id: 'recipes',   label: 'Recipes',    icon: '★', href: 'recipes.html' },
  { id: 'chat',      label: 'AI Tutor',   icon: '◇', href: 'chat.html' },
];

function renderNav(activePage) {
  const hasKey = !!CONFIG.GEMINI_KEY;
  const pill = hasKey
    ? '<span class="mode-pill live"><span class="dot"></span>AI Connected</span>'
    : '<span class="mode-pill"><span class="dot"></span>Demo</span>';

  document.getElementById('app-nav').innerHTML = `
    <div class="nav-brand">
      <div class="logo">N</div>
      <span class="brand-name">NEX<span class="brand-accent">US</span></span>
      <span class="brand-tag">AI Bible</span>
    </div>
    <nav class="nav-links">
      ${NAV_PAGES.map(p => `
        <a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">
          <span class="nav-icon">${p.icon}</span>
          <span>${p.label}</span>
        </a>`).join('')}
    </nav>
    <div class="nav-right">
      ${pill}
      <button class="btn-icon" onclick="openSettings()" title="Settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      </button>
    </div>`;
}

function renderSettingsModal() {
  if (document.getElementById('settings-modal')) return;
  const wrap = document.createElement('div');
  wrap.id = 'settings-modal';
  wrap.className = 'modal-bg';
  wrap.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeSettings()">✕</button>
      <h2 style="margin:0 0 6px">Settings</h2>
      <p style="color:var(--t2);margin:0 0 20px;font-size:14px">Add a free Google Gemini API key to power the AI tutor with live answers.</p>

      <div class="field-grp">
        <label>Gemini API Key (free, no card needed)</label>
        <input type="password" id="settings-gemini" placeholder="AIza..." value="${CONFIG.GEMINI_KEY}">
        <div class="field-help">Get one in 30 seconds at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a> · stored only in your browser</div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px">
        <button class="btn btn-primary" onclick="saveSettings()" style="flex:1">Save</button>
        <button class="btn btn-ghost" onclick="closeSettings()">Cancel</button>
      </div>

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line);color:var(--t3);font-size:12px">
        NEXUS shares the Gemini key with StockIQ on this device. Set it once, works in both apps.
      </div>
    </div>`;
  wrap.addEventListener('click', closeSettings);
  document.body.appendChild(wrap);
}

function openSettings() {
  renderSettingsModal();
  document.getElementById('settings-modal').classList.add('show');
}
function closeSettings() {
  document.getElementById('settings-modal')?.classList.remove('show');
}
function saveSettings() {
  const key = document.getElementById('settings-gemini').value.trim();
  if (key) localStorage.setItem('gemini_key', key);
  else localStorage.removeItem('gemini_key');
  CONFIG.GEMINI_KEY = key;
  closeSettings();
  location.reload();
}

function renderFooter() {
  const f = document.getElementById('app-foot');
  if (!f) return;
  f.innerHTML = `
    <div>NEXUS — Your AI Bible · curated April 2026 · client-side only · your data stays in your browser</div>
    <div>Built with Claude Code · Gemini powers the tutor (free)</div>`;
}

function sharedInit(activePage) {
  renderNav(activePage);
  renderFooter();
}

// global copy-to-clipboard for recipes
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
  });
}
function copyPre(btn) {
  const pre = btn.parentElement.querySelector('pre');
  if (pre) copyText(btn, pre.innerText);
}
