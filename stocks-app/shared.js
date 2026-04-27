// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  T212_KEY:    localStorage.getItem('t212_key')    || '',
  AV_KEY:      localStorage.getItem('av_key')      || '',
  GEMINI_KEY:  localStorage.getItem('gemini_key')  || '',
  WATCHLIST:   JSON.parse(localStorage.getItem('watchlist') || '[]'),
  get demoMode() { return !this.AV_KEY; }
};

// ─── STOCK UNIVERSE ───────────────────────────────────────────────────────────
const STOCKS = [
  { ticker:'AAPL',  name:'Apple Inc.',          market:'US', sector:'Technology',       emoji:'🍎', rsi:52, ma20:189, ma50:182, price:191.24, chg:+1.2,  mktCap:'$2.9T', vol:'58.2M' },
  { ticker:'MSFT',  name:'Microsoft',           market:'US', sector:'Technology',       emoji:'🪟', rsi:48, ma20:418, ma50:405, price:421.90, chg:+0.8,  mktCap:'$3.1T', vol:'22.1M' },
  { ticker:'NVDA',  name:'NVIDIA Corp.',        market:'US', sector:'Semiconductors',   emoji:'🟢', rsi:38, ma20:870, ma50:920, price:875.50, chg:+2.4,  mktCap:'$2.1T', vol:'41.8M' },
  { ticker:'GOOGL', name:'Alphabet (Google)',   market:'US', sector:'Technology',       emoji:'🔍', rsi:44, ma20:175, ma50:168, price:174.60, chg:-0.3,  mktCap:'$2.2T', vol:'24.5M' },
  { ticker:'AMZN',  name:'Amazon',              market:'US', sector:'E-Commerce/Cloud', emoji:'📦', rsi:55, ma20:194, ma50:188, price:196.80, chg:+1.5,  mktCap:'$2.1T', vol:'36.4M' },
  { ticker:'TSLA',  name:'Tesla Inc.',          market:'US', sector:'Electric Vehicles',emoji:'⚡', rsi:32, ma20:175, ma50:198, price:172.40, chg:-1.8,  mktCap:'$548B', vol:'92.1M' },
  { ticker:'AMD',   name:'AMD',                 market:'US', sector:'Semiconductors',   emoji:'🔴', rsi:36, ma20:162, ma50:171, price:158.90, chg:+3.1,  mktCap:'$256B', vol:'45.7M' },
  { ticker:'JNJ',   name:'Johnson & Johnson',   market:'US', sector:'Healthcare',       emoji:'💊', rsi:45, ma20:152, ma50:155, price:151.20, chg:-0.4,  mktCap:'$364B', vol:'8.2M'  },
  { ticker:'PG',    name:'Procter & Gamble',    market:'US', sector:'Consumer Goods',   emoji:'🧴', rsi:50, ma20:165, ma50:160, price:166.40, chg:+0.2,  mktCap:'$392B', vol:'6.1M'  },
  { ticker:'NKE',   name:'Nike Inc.',           market:'US', sector:'Consumer Goods',   emoji:'👟', rsi:29, ma20:89,  ma50:98,  price:87.60,  chg:-0.9,  mktCap:'$131B', vol:'12.4M' },
  { ticker:'META',  name:'Meta Platforms',      market:'US', sector:'Technology',       emoji:'📘', rsi:60, ma20:520, ma50:498, price:524.10, chg:+1.1,  mktCap:'$1.3T', vol:'18.9M' },
  { ticker:'ADBE',  name:'Adobe Inc.',          market:'US', sector:'Software',         emoji:'🎨', rsi:41, ma20:468, ma50:480, price:465.30, chg:+0.7,  mktCap:'$205B', vol:'3.8M'  },
  { ticker:'ARM',   name:'ARM Holdings',        market:'US', sector:'Semiconductors',   emoji:'🦾', rsi:42, ma20:142, ma50:151, price:138.60, chg:+1.8,  mktCap:'$148B', vol:'7.2M'  },
  { ticker:'AZN',   name:'AstraZeneca',         market:'UK', sector:'Pharmaceuticals',  emoji:'🔬', rsi:47, ma20:118, ma50:114, price:119.40, chg:+0.5,  mktCap:'£196B', vol:'4.1M'  },
  { ticker:'ULVR',  name:'Unilever',            market:'UK', sector:'Consumer Goods',   emoji:'🧼', rsi:43, ma20:40.2,ma50:41.5,price:39.80,  chg:-0.6,  mktCap:'£98B',  vol:'5.8M'  },
  { ticker:'GSK',   name:'GSK plc',             market:'UK', sector:'Pharmaceuticals',  emoji:'💉', rsi:39, ma20:16.2,ma50:17.1,price:15.90,  chg:+1.2,  mktCap:'£65B',  vol:'9.2M'  },
  { ticker:'VOD',   name:'Vodafone Group',      market:'UK', sector:'Telecoms',         emoji:'📡', rsi:35, ma20:0.71,ma50:0.76,price:0.69,   chg:-1.4,  mktCap:'£17B',  vol:'62.1M' },
  { ticker:'REL',   name:'RELX plc',            market:'UK', sector:'Information',      emoji:'📰', rsi:53, ma20:36.8,ma50:35.2,price:37.10,  chg:+0.4,  mktCap:'£68B',  vol:'2.4M'  },
  { ticker:'RIO',   name:'Rio Tinto',           market:'UK', sector:'Mining',           emoji:'⛏️', rsi:46, ma20:51.4,ma50:50.2,price:51.80,  chg:+0.9,  mktCap:'£82B',  vol:'3.6M'  },
  { ticker:'HLMA',  name:'Halma plc',           market:'UK', sector:'Safety Tech',      emoji:'🛡️', rsi:51, ma20:24.6,ma50:23.8,price:24.90,  chg:+0.3,  mktCap:'£10B',  vol:'1.2M'  },
];

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
let PORTFOLIO = JSON.parse(localStorage.getItem('portfolio') || 'null') || [
  { ticker:'AAPL',  name:'Apple Inc.',   emoji:'🍎', shares:0.5,  avgCost:182.00, market:'US' },
  { ticker:'NVDA',  name:'NVIDIA Corp.', emoji:'🟢', shares:0.1,  avgCost:820.00, market:'US' },
  { ticker:'AZN',   name:'AstraZeneca',  emoji:'🔬', shares:0.3,  avgCost:112.00, market:'UK' },
  { ticker:'TSLA',  name:'Tesla Inc.',   emoji:'⚡', shares:0.15, avgCost:190.00, market:'US' },
];

// ─── SIGNAL ENGINE ────────────────────────────────────────────────────────────
function getSignal(stock) {
  const { rsi, ma20, ma50 } = stock;
  const up = ma20 > ma50;
  if (rsi < 30 && up)   return { signal:'STRONG BUY', cls:'buy',  conf:92 };
  if (rsi < 30)         return { signal:'BUY',        cls:'buy',  conf:72 };
  if (rsi < 45 && up)   return { signal:'BUY',        cls:'buy',  conf:75 };
  if (rsi < 45)         return { signal:'WATCH',      cls:'watch',conf:48 };
  if (rsi > 70 && !up)  return { signal:'STRONG SELL',cls:'sell', conf:90 };
  if (rsi > 70)         return { signal:'SELL',       cls:'sell', conf:68 };
  if (rsi > 55 && !up)  return { signal:'SELL',       cls:'sell', conf:62 };
  if (rsi > 55)         return { signal:'WATCH',      cls:'watch',conf:55 };
  return                       { signal:'HOLD',       cls:'hold', conf:45 };
}

function getSignalReason(stock) {
  const { rsi, ma20, ma50, name } = stock;
  const up = ma20 > ma50;
  if (rsi < 30 && up)  return `${name} has pulled back hard but trend is still up — classic dip-buy opportunity.`;
  if (rsi < 30)        return `${name} looks very oversold at RSI ${rsi}. Risky but potential bounce is coming.`;
  if (rsi < 45 && up)  return `${name} is below average price but trending upward — solid entry point.`;
  if (rsi > 70 && !up) return `${name} is overbought and trend is turning down. Consider taking profit.`;
  if (rsi > 70)        return `${name} has run hot (RSI ${rsi}). Wait for a dip before adding more.`;
  if (rsi > 55 && !up) return `${name} is losing momentum. Monitor closely — may be time to exit.`;
  if (rsi < 45)        return `${name} is weak on both trend and momentum. Watch for stabilisation.`;
  return                      `${name} is neutral — no strong signal either way. Hold if you own it.`;
}

// ─── WATCHLIST ────────────────────────────────────────────────────────────────
function isWatched(ticker) { return CONFIG.WATCHLIST.includes(ticker); }

function toggleWatch(ticker) {
  const idx = CONFIG.WATCHLIST.indexOf(ticker);
  if (idx >= 0) CONFIG.WATCHLIST.splice(idx, 1);
  else CONFIG.WATCHLIST.push(ticker);
  localStorage.setItem('watchlist', JSON.stringify(CONFIG.WATCHLIST));
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const getCurrency = m => m === 'UK' ? '£' : '$';
const fmtPrice    = (n, m) => `${getCurrency(m)}${Math.abs(n).toFixed(n < 10 ? 4 : 2)}`;
const fmtPct      = n => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const fmtPL       = (n, m) => `${n >= 0 ? '+' : '-'}${getCurrency(m)}${Math.abs(n).toFixed(2)}`;

// ─── CHART HELPERS ────────────────────────────────────────────────────────────
function sparkData(trend = 'up', pts = 14) {
  let v = 100 + Math.random() * 20, arr = [];
  for (let i = 0; i < pts; i++) {
    v += (trend === 'up' ? 0.5 : trend === 'down' ? -0.5 : 0) + (Math.random() - 0.5) * 2.5;
    arr.push(+v.toFixed(2));
  }
  return arr;
}

function makeSparkline(id, trend, color) {
  const el = document.getElementById(id);
  if (!el || !window.Chart) return;
  // Destroy existing chart on canvas if any
  const existing = Chart.getChart(el);
  if (existing) existing.destroy();
  const data = sparkData(trend);
  const mn = Math.min(...data), mx = Math.max(...data), pad = (mx - mn) * 0.15 || 1;
  const rgba = color.startsWith('rgb(')
    ? color.replace('rgb(', 'rgba(').replace(')', ', 0.08)')
    : color;
  new Chart(el, {
    type: 'line',
    data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 1.5, fill: true, backgroundColor: rgba, tension: 0.4, pointRadius: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false, min: mn - pad, max: mx + pad } },
      animation: { duration: 800, easing: 'easeInOutQuart' }
    }
  });
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function renderNav(activePage) {
  const pages = [
    { id:'dashboard', label:'Dashboard',  icon:'⊞', href:'index.html'     },
    { id:'portfolio', label:'Portfolio',  icon:'◎', href:'portfolio.html'  },
    { id:'screener',  label:'Screener',   icon:'⊿', href:'screener.html'   },
    { id:'news',      label:'News',       icon:'◉', href:'news.html'       },
    { id:'guide',     label:'My Guide',   icon:'★', href:'guide.html'      },
    { id:'chat',      label:'AI Chat',    icon:'◈', href:'chat.html'       },
  ];

  const liveCount = CONFIG.T212_KEY ? 1 : 0;
  const badge = CONFIG.demoMode
    ? '<span class="mode-badge demo">DEMO</span>'
    : '<span class="mode-badge live">● LIVE</span>';

  document.getElementById('app-nav').innerHTML = `
    <div class="nav-brand">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <polygon points="13,2 24,8 24,20 13,24 2,20 2,8" fill="#f5a623" opacity="0.12"/>
        <polygon points="13,4 22,9.5 22,19.5 13,22 4,19.5 4,9.5" stroke="#f5a623" stroke-width="1.5" fill="none"/>
        <text x="13" y="17" text-anchor="middle" fill="#f5a623" font-size="10" font-weight="800" font-family="Inter">S</text>
      </svg>
      <span class="brand-name">Stock<span class="brand-accent">IQ</span></span>
      ${badge}
    </div>
    <nav class="nav-links">
      ${pages.map(p => `
        <a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">
          <span class="nav-icon">${p.icon}</span>
          <span>${p.label}</span>
          ${p.id === 'chat' && CONFIG.GEMINI_KEY ? '<span class="nav-dot"></span>' : ''}
        </a>
      `).join('')}
    </nav>
    <div class="nav-right">
      <div class="market-status-pill">
        <span class="status-dot"></span>
        <span id="mktStatusTxt">Markets Open</span>
      </div>
      <button class="btn-icon" onclick="openSettings()" title="Settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      </button>
    </div>
  `;

  updateMarketStatus();
}

function updateMarketStatus() {
  const h = new Date().getUTCHours();
  const open = (h >= 8 && h < 16) || (h >= 13 && h < 21);
  const dot  = document.querySelector('.status-dot');
  const txt  = document.getElementById('mktStatusTxt');
  if (!dot || !txt) return;
  dot.style.background  = open ? 'var(--green)' : 'var(--text3)';
  dot.style.animation   = open ? '' : 'none';
  txt.textContent       = open ? 'Markets Open' : 'Markets Closed';
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
function renderSettingsModal() {
  const existing = document.getElementById('settings-modal');
  if (existing) return;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="modal-overlay" id="settings-modal" onclick="closeSettingsOutside(event)">
      <div class="modal">
        <div class="modal-hd">
          <div><h3>Settings & API Keys</h3><p class="modal-sub">Connect live data sources</p></div>
          <button class="modal-close" onclick="closeSettings()">✕</button>
        </div>
        <div class="modal-bd">

          <div class="settings-section">
            <div class="settings-label">📈 Alpha Vantage <span class="tag-free">FREE</span></div>
            <div class="input-row">
              <input type="password" id="inp-av" placeholder="Your Alpha Vantage key..." value="${CONFIG.AV_KEY}">
              <button onclick="toggleVis('inp-av')">👁</button>
            </div>
            <span class="input-hint">Get free key at <strong>alphavantage.co</strong> — real stock prices. Free = 25 calls/day.</span>
            <button class="btn-test" id="test-av-btn" onclick="testAV()">Test Connection</button>
            <div id="av-status" class="conn-status"></div>
          </div>

          <div class="settings-section">
            <div class="settings-label">📊 Trading 212 <span class="tag-opt">optional</span></div>
            <div class="input-row">
              <input type="password" id="inp-t212" placeholder="Your Trading 212 API key..." value="${CONFIG.T212_KEY}">
              <button onclick="toggleVis('inp-t212')">👁</button>
            </div>
            <span class="input-hint">Settings → API in your Trading 212 app.</span>
            <div class="cors-warning">⚠️ <strong>Browser limitation:</strong> Trading 212's API blocks direct browser calls (CORS). Your key is saved and ready — but live sync needs a small backend. For now, use the <strong>manual portfolio entry</strong> on the Portfolio page to track your real positions.</div>
          </div>

          <div class="settings-section">
            <div class="settings-label">🤖 Google Gemini AI <span class="tag-free">FREE</span></div>
            <div class="input-row">
              <input type="password" id="inp-gemini" placeholder="Your Gemini API key..." value="${CONFIG.GEMINI_KEY}">
              <button onclick="toggleVis('inp-gemini')">👁</button>
            </div>
            <span class="input-hint">Get free key at <strong>aistudio.google.com</strong> — 1M tokens/day free, no card needed.</span>
            <button class="btn-test" id="test-gemini-btn" onclick="testGemini()">Test Connection</button>
            <div id="gemini-status" class="conn-status"></div>
          </div>

          <button class="btn-save" onclick="saveSettings()">💾 Save & Reload</button>
          <p class="modal-note">🔒 Keys stored on your device only. Never sent anywhere except their own APIs.</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(div.firstElementChild);
}

async function testAV() {
  const key = document.getElementById('inp-av').value.trim();
  const status = document.getElementById('av-status');
  const btn = document.getElementById('test-av-btn');
  if (!key) { status.innerHTML = '<span class="conn-fail">⚠ Enter a key first</span>'; return; }
  btn.textContent = 'Testing…'; btn.disabled = true;
  status.innerHTML = '';
  try {
    const r = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`);
    const d = await r.json();
    if (d['Global Quote']?.['05. price']) {
      status.innerHTML = `<span class="conn-ok">✓ Connected — AAPL: $${parseFloat(d['Global Quote']['05. price']).toFixed(2)}</span>`;
    } else if (d.Note || d.Information) {
      status.innerHTML = `<span class="conn-warn">⚠ Key valid but rate limited (25 calls/day). Try again later.</span>`;
    } else {
      status.innerHTML = `<span class="conn-fail">✗ Invalid key or API error</span>`;
    }
  } catch(e) {
    status.innerHTML = `<span class="conn-fail">✗ Network error — check your internet</span>`;
  }
  btn.textContent = 'Test Connection'; btn.disabled = false;
}

async function testGemini() {
  const key = document.getElementById('inp-gemini').value.trim();
  const status = document.getElementById('gemini-status');
  const btn = document.getElementById('test-gemini-btn');
  if (!key) { status.innerHTML = '<span class="conn-fail">⚠ Enter a key first</span>'; return; }
  btn.textContent = 'Testing…'; btn.disabled = true;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ parts:[{ text:'Say "StockIQ connected" in 3 words.' }] }] })
    });
    const d = await r.json();
    if (d.candidates?.[0]?.content?.parts?.[0]?.text) {
      status.innerHTML = `<span class="conn-ok">✓ Gemini AI connected successfully</span>`;
    } else if (r.status === 400) {
      status.innerHTML = `<span class="conn-fail">✗ Invalid API key</span>`;
    } else {
      status.innerHTML = `<span class="conn-fail">✗ Error ${r.status}</span>`;
    }
  } catch(e) {
    status.innerHTML = `<span class="conn-fail">✗ Network error</span>`;
  }
  btn.textContent = 'Test Connection'; btn.disabled = false;
}

function openSettings()  { document.getElementById('settings-modal')?.classList.add('open'); }
function closeSettings() { document.getElementById('settings-modal')?.classList.remove('open'); }
function closeSettingsOutside(e) { if (e.target.id === 'settings-modal') closeSettings(); }
function toggleVis(id) { const el = document.getElementById(id); if(el) el.type = el.type === 'password' ? 'text' : 'password'; }

function saveSettings() {
  const t212   = document.getElementById('inp-t212')?.value.trim();
  const av     = document.getElementById('inp-av')?.value.trim();
  const gemini = document.getElementById('inp-gemini')?.value.trim();
  if (t212)   { CONFIG.T212_KEY   = t212;   localStorage.setItem('t212_key',    t212);   }
  if (av)     { CONFIG.AV_KEY     = av;     localStorage.setItem('av_key',      av);     }
  if (gemini) { CONFIG.GEMINI_KEY = gemini; localStorage.setItem('gemini_key',  gemini); }
  closeSettings();
  location.reload();
}

// ─── TRADING 212 FETCH ────────────────────────────────────────────────────────
async function fetchT212Portfolio() {
  if (!CONFIG.T212_KEY) return null;
  try {
    const r = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
      headers: { 'Authorization': CONFIG.T212_KEY }
    });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    return await r.json();
  } catch(e) {
    console.warn('Trading 212 API:', e.message, '— CORS may block browser calls. Use manual mode.');
    return null;
  }
}

async function fetchT212Cash() {
  if (!CONFIG.T212_KEY) return null;
  try {
    const r = await fetch('https://live.trading212.com/api/v0/equity/account/cash', {
      headers: { 'Authorization': CONFIG.T212_KEY }
    });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    return await r.json();
  } catch(e) {
    console.warn('Trading 212 cash:', e.message);
    return null;
  }
}

// ─── SHARED INIT ─────────────────────────────────────────────────────────────
function sharedInit(activePage) {
  renderNav(activePage);
  renderSettingsModal();
}
