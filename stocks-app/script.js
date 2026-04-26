// ─── CONFIG ──────────────────────────────────────────────────────
const CONFIG = {
  T212_KEY: localStorage.getItem('t212_key') || '',
  AV_KEY:   localStorage.getItem('av_key')   || '',
  get demoMode() { return !this.T212_KEY || !this.AV_KEY; }
};

// ─── HALAL STOCK UNIVERSE ────────────────────────────────────────
const HALAL_STOCKS = [
  // US Stocks
  { ticker:'AAPL',  name:'Apple Inc.',            market:'US', sector:'Technology',      emoji:'🍎', rsi:52, ma20:189, ma50:182, price:191.24, chg:+1.2,  mktCap:'$2.9T' },
  { ticker:'MSFT',  name:'Microsoft',             market:'US', sector:'Technology',      emoji:'🪟', rsi:48, ma20:418, ma50:405, price:421.90, chg:+0.8,  mktCap:'$3.1T' },
  { ticker:'NVDA',  name:'NVIDIA Corp.',          market:'US', sector:'Semiconductors',  emoji:'🟢', rsi:38, ma20:870, ma50:920, price:875.50, chg:+2.4,  mktCap:'$2.1T' },
  { ticker:'GOOGL', name:'Alphabet (Google)',     market:'US', sector:'Technology',      emoji:'🔍', rsi:44, ma20:175, ma50:168, price:174.60, chg:-0.3,  mktCap:'$2.2T' },
  { ticker:'AMZN',  name:'Amazon',                market:'US', sector:'E-Commerce/Cloud',emoji:'📦', rsi:55, ma20:194, ma50:188, price:196.80, chg:+1.5,  mktCap:'$2.1T' },
  { ticker:'TSLA',  name:'Tesla Inc.',            market:'US', sector:'Electric Vehicles',emoji:'⚡', rsi:32, ma20:175, ma50:198, price:172.40, chg:-1.8,  mktCap:'$548B' },
  { ticker:'AMD',   name:'AMD',                   market:'US', sector:'Semiconductors',  emoji:'🔴', rsi:36, ma20:162, ma50:171, price:158.90, chg:+3.1,  mktCap:'$256B' },
  { ticker:'JNJ',   name:'Johnson & Johnson',     market:'US', sector:'Healthcare',      emoji:'💊', rsi:45, ma20:152, ma50:155, price:151.20, chg:-0.4,  mktCap:'$364B' },
  { ticker:'PG',    name:'Procter & Gamble',      market:'US', sector:'Consumer Goods',  emoji:'🧴', rsi:50, ma20:165, ma50:160, price:166.40, chg:+0.2,  mktCap:'$392B' },
  { ticker:'NKE',   name:'Nike Inc.',             market:'US', sector:'Consumer Goods',  emoji:'👟', rsi:29, ma20:89,  ma50:98,  price:87.60,  chg:-0.9,  mktCap:'$131B' },
  { ticker:'META',  name:'Meta Platforms',        market:'US', sector:'Technology',      emoji:'📘', rsi:60, ma20:520, ma50:498, price:524.10, chg:+1.1,  mktCap:'$1.3T' },
  { ticker:'ADBE',  name:'Adobe Inc.',            market:'US', sector:'Software',        emoji:'🎨', rsi:41, ma20:468, ma50:480, price:465.30, chg:+0.7,  mktCap:'$205B' },
  // UK Stocks
  { ticker:'AZN',   name:'AstraZeneca',           market:'UK', sector:'Pharmaceuticals', emoji:'🔬', rsi:47, ma20:118, ma50:114, price:119.40, chg:+0.5,  mktCap:'£196B' },
  { ticker:'ULVR',  name:'Unilever',              market:'UK', sector:'Consumer Goods',  emoji:'🧼', rsi:43, ma20:40.2,ma50:41.5,price:39.80,  chg:-0.6,  mktCap:'£98B'  },
  { ticker:'GSK',   name:'GSK plc',               market:'UK', sector:'Pharmaceuticals', emoji:'💉', rsi:39, ma20:16.2,ma50:17.1,price:15.90,  chg:+1.2,  mktCap:'£65B'  },
  { ticker:'VOD',   name:'Vodafone Group',        market:'UK', sector:'Telecoms',        emoji:'📡', rsi:35, ma20:0.71,ma50:0.76,price:0.69,   chg:-1.4,  mktCap:'£17B'  },
  { ticker:'REL',   name:'RELX plc',              market:'UK', sector:'Information',     emoji:'📰', rsi:53, ma20:36.8,ma50:35.2,price:37.10,  chg:+0.4,  mktCap:'£68B'  },
  { ticker:'RIO',   name:'Rio Tinto',             market:'UK', sector:'Mining',          emoji:'⛏️', rsi:46, ma20:51.4,ma50:50.2,price:51.80,  chg:+0.9,  mktCap:'£82B'  },
  { ticker:'ARM',   name:'ARM Holdings',          market:'US', sector:'Semiconductors',  emoji:'🦾', rsi:42, ma20:142, ma50:151, price:138.60, chg:+1.8,  mktCap:'$148B' },
  { ticker:'HLMA',  name:'Halma plc',             market:'UK', sector:'Safety Tech',     emoji:'🛡️', rsi:51, ma20:24.6,ma50:23.8,price:24.90,  chg:+0.3,  mktCap:'£10B'  },
];

// ─── MOCK PORTFOLIO ──────────────────────────────────────────────
const MOCK_PORTFOLIO = [
  { ticker:'AAPL',  name:'Apple Inc.',     emoji:'🍎', shares:0.5,  avgCost:182.00, currentPrice:191.24, market:'US' },
  { ticker:'NVDA',  name:'NVIDIA Corp.',   emoji:'🟢', shares:0.1,  avgCost:820.00, currentPrice:875.50, market:'US' },
  { ticker:'AZN',   name:'AstraZeneca',    emoji:'🔬', shares:0.3,  avgCost:112.00, currentPrice:119.40, market:'UK' },
  { ticker:'TSLA',  name:'Tesla Inc.',     emoji:'⚡', shares:0.15, avgCost:190.00, currentPrice:172.40, market:'US' },
];

// ─── SIGNAL ENGINE ───────────────────────────────────────────────
function getSignal(stock) {
  const { rsi, ma20, ma50 } = stock;
  const uptrend = ma20 > ma50;

  if (rsi < 30 && uptrend)   return { signal:'STRONG BUY', cls:'buy',  conf:92 };
  if (rsi < 30 && !uptrend)  return { signal:'BUY',        cls:'buy',  conf:70 };
  if (rsi < 45 && uptrend)   return { signal:'BUY',        cls:'buy',  conf:75 };
  if (rsi < 45 && !uptrend)  return { signal:'WATCH',      cls:'watch',conf:50 };
  if (rsi > 70 && !uptrend)  return { signal:'STRONG SELL',cls:'sell', conf:90 };
  if (rsi > 70 && uptrend)   return { signal:'SELL',       cls:'sell', conf:68 };
  if (rsi > 55 && !uptrend)  return { signal:'SELL',       cls:'sell', conf:62 };
  if (rsi > 55 && uptrend)   return { signal:'WATCH',      cls:'watch',conf:55 };
  return                              { signal:'HOLD',       cls:'hold', conf:45 };
}

function getSignalReason(stock) {
  const { rsi, ma20, ma50, name } = stock;
  const uptrend = ma20 > ma50;

  if (rsi < 30 && uptrend)   return `${name} has pulled back hard but the trend is still up — classic dip-buy opportunity.`;
  if (rsi < 30 && !uptrend)  return `${name} looks very oversold at RSI ${rsi}. Risky but potential for a bounce.`;
  if (rsi < 45 && uptrend)   return `${name} is below average price but trending upward — solid entry point for new buyers.`;
  if (rsi > 70 && !uptrend)  return `${name} is overbought and the trend is turning down. Consider taking profit now.`;
  if (rsi > 70 && uptrend)   return `${name} has run hot recently (RSI ${rsi}). Wait for a dip before adding more.`;
  if (rsi > 55 && !uptrend)  return `${name} is losing momentum and trending down. Monitor closely — may be time to exit.`;
  if (rsi < 45 && !uptrend)  return `${name} is weak on both trend and momentum. Watch for stabilisation before buying.`;
  return                       `${name} is neutral — no strong signal either way. Hold if you own it, wait if you don't.`;
}

// ─── CHART HELPERS ───────────────────────────────────────────────
function sparklineData(trend = 'up', points = 12) {
  const data = [];
  let val = 100 + Math.random() * 20;
  for (let i = 0; i < points; i++) {
    const drift = trend === 'up' ? 0.4 : trend === 'down' ? -0.4 : 0;
    val += drift + (Math.random() - 0.5) * 3;
    data.push(parseFloat(val.toFixed(2)));
  }
  return data;
}

function createSparkline(canvasId, trend, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const data = sparklineData(trend);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: color.replace(')', ', 0.08)').replace('rgb', 'rgba'),
        tension: 0.4,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: { duration: 800 },
    }
  });
}

function createPortfolioChart() {
  const ctx = document.getElementById('portfolioChart');
  if (!ctx) return;
  const labels = ['3mo ago','2mo ago','1mo ago','3w ago','2w ago','1w ago','Today'];
  const data = [200, 208, 204, 215, 220, 228, 234.80];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#f5a623',
        borderWidth: 2,
        fill: true,
        backgroundColor: 'rgba(245,166,35,0.06)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#f5a623',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1c2e',
          borderColor: '#1e2f47',
          borderWidth: 1,
          titleColor: '#8b9ab5',
          bodyColor: '#e8edf6',
          bodyFont: { family: 'Inter', weight: '700', size: 14 },
          callbacks: { label: ctx => `£${ctx.raw.toFixed(2)}` }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { color: 'rgba(30,47,71,0.5)', drawBorder: false },
          ticks: { color: '#5a6b82', font: { family: 'Inter', size: 10 } }
        },
        y: {
          display: true,
          position: 'right',
          grid: { color: 'rgba(30,47,71,0.5)', drawBorder: false },
          ticks: { color: '#5a6b82', font: { family: 'Inter', size: 10 }, callback: v => `£${v}` }
        }
      },
      interaction: { intersect: false, mode: 'index' },
    }
  });
}

// ─── FORMAT HELPERS ──────────────────────────────────────────────
function fmt(n, currency = '£') {
  return `${currency}${Math.abs(n).toFixed(2)}`;
}

function fmtChg(n, currency = '') {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${currency}${Math.abs(n).toFixed(2)}`;
}

function fmtPct(n) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function getCurrency(market) {
  return market === 'UK' ? '£' : '$';
}

// ─── RENDER FUNCTIONS ────────────────────────────────────────────
function renderHeader() {
  const tickers = [
    { name: 'S&P 500',  val: '5,218.19', chg: '+0.42%', pos: true },
    { name: 'FTSE 100', val: '8,147.34', chg: '+0.18%', pos: true },
    { name: 'NASDAQ',   val: '16,742.39',chg: '+0.88%', pos: true },
    { name: 'Gold',     val: '$2,339',   chg: '-0.21%', pos: false },
  ];
  document.getElementById('marketTicker').innerHTML = tickers.map(t => `
    <div class="ticker-item">
      <span class="ticker-name">${t.name}</span>
      <span class="ticker-val">${t.val}</span>
      <span class="ticker-chg ${t.pos ? 'pos' : 'neg'}">${t.chg}</span>
    </div>
  `).join('');
}

function renderBriefGrid() {
  const topStocks = [...HALAL_STOCKS].sort((a, b) => {
    const sa = getSignal(a), sb = getSignal(b);
    const order = { 'STRONG BUY': 0, 'BUY': 1, 'STRONG SELL': 2, 'SELL': 3, 'WATCH': 4, 'HOLD': 5 };
    return (order[sa.signal] ?? 9) - (order[sb.signal] ?? 9);
  }).slice(0, 3);

  document.getElementById('briefGrid').innerHTML = topStocks.map(s => {
    const sig = getSignal(s);
    const reason = getSignalReason(s);
    const cur = getCurrency(s.market);
    const chgClass = s.chg >= 0 ? 'pos' : 'neg';
    return `
      <div class="brief-card ${sig.cls}">
        <div class="brief-card-top">
          <div class="brief-action">
            <span class="brief-badge badge-${sig.cls}">${sig.signal}</span>
            <span class="brief-ticker">${s.ticker}</span>
          </div>
          <div class="brief-confidence">
            <span class="conf-label">Confidence</span>
            <div class="conf-bar">
              <div class="conf-fill ${sig.cls}" style="width:${sig.conf}%"></div>
            </div>
          </div>
        </div>
        <div class="brief-name">${s.name}</div>
        <div class="brief-reason">${reason}</div>
        <div class="brief-price-row">
          <span class="brief-price">${cur}${s.price.toFixed(2)}</span>
          <span class="brief-chg ${chgClass}">${fmtPct(s.chg)} today</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderHoldings() {
  const grid = document.getElementById('holdingsGrid');
  if (!MOCK_PORTFOLIO.length) {
    grid.innerHTML = `<div class="empty-state"><h3>No holdings yet</h3><p>Add your Trading 212 API key to see your real portfolio.</p></div>`;
    return;
  }

  let totalValue = 0, totalCost = 0;
  MOCK_PORTFOLIO.forEach(h => {
    const val = h.shares * h.currentPrice;
    const cost = h.shares * h.avgCost;
    totalValue += val;
    totalCost  += cost;
  });
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;

  document.getElementById('portfolioValue').textContent = `£${(totalValue + 45).toFixed(2)}`;
  document.getElementById('cashVal').textContent = '£45.00';
  document.getElementById('investedVal').textContent = `£${totalValue.toFixed(2)}`;
  document.getElementById('allTimeVal').textContent = fmtPct(totalPLPct);
  document.getElementById('allTimeVal').className = `hero-stat-val ${totalPL >= 0 ? 'positive' : 'negative'}`;
  document.getElementById('holdingsCount').textContent = MOCK_PORTFOLIO.length;

  grid.innerHTML = MOCK_PORTFOLIO.map((h, i) => {
    const val   = h.shares * h.currentPrice;
    const cost  = h.shares * h.avgCost;
    const pl    = val - cost;
    const plPct = (pl / cost) * 100;
    const cur   = getCurrency(h.market);
    const sig   = getSignal(HALAL_STOCKS.find(s => s.ticker === h.ticker) || { rsi:50, ma20:1, ma50:1 });
    const trend = pl >= 0 ? 'up' : 'down';
    const chartColor = pl >= 0 ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';

    return `
      <div class="holding-card">
        <div class="holding-top">
          <div class="holding-logo">${h.emoji}</div>
          <span class="signal-pill ${sig.signal}">${sig.signal}</span>
        </div>
        <div>
          <div class="holding-name">${h.name}</div>
          <div class="holding-ticker">${h.ticker} · ${h.shares} shares</div>
        </div>
        <div class="holding-chart-wrap">
          <canvas id="hold-chart-${i}"></canvas>
        </div>
        <div class="holding-bottom">
          <div class="hb-item">
            <span class="hb-label">Value</span>
            <span class="hb-val">${cur}${val.toFixed(2)}</span>
          </div>
          <div class="hb-item">
            <span class="hb-label">Price</span>
            <span class="hb-val">${cur}${h.currentPrice.toFixed(2)}</span>
          </div>
          <div class="hb-item">
            <span class="hb-label">P&amp;L</span>
            <span class="hb-val ${pl >= 0 ? 'pos' : 'neg'}">${fmtChg(pl, cur)}</span>
          </div>
          <div class="hb-item">
            <span class="hb-label">Return</span>
            <span class="hb-val ${plPct >= 0 ? 'pos' : 'neg'}">${fmtPct(plPct)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  MOCK_PORTFOLIO.forEach((_, i) => {
    const stock = HALAL_STOCKS.find(s => s.ticker === MOCK_PORTFOLIO[i].ticker);
    const trend = stock?.ma20 > stock?.ma50 ? 'up' : 'down';
    const color = trend === 'up' ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';
    setTimeout(() => createSparkline(`hold-chart-${i}`, trend, color), 50 * i);
  });
}

function renderStocksGrid(filter = 'all') {
  const grid = document.getElementById('stocksGrid');
  let stocks = HALAL_STOCKS;
  if (filter === 'US') stocks = stocks.filter(s => s.market === 'US');
  if (filter === 'UK') stocks = stocks.filter(s => s.market === 'UK');
  if (filter === 'buy') stocks = stocks.filter(s => getSignal(s).cls === 'buy');

  grid.innerHTML = stocks.map((s, i) => {
    const sig = getSignal(s);
    const cur = getCurrency(s.market);
    const chgClass = s.chg >= 0 ? 'pos' : 'neg';
    const trend = s.ma20 > s.ma50 ? 'up' : 'down';
    const chartColor = s.chg >= 0 ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';
    const flag = s.market === 'US' ? '🇺🇸' : '🇬🇧';

    return `
      <div class="stock-card" data-market="${s.market}" data-signal="${sig.cls}">
        <div class="stock-top">
          <div class="stock-info">
            <div class="stock-ticker">${s.ticker} <span class="stock-country">${flag}</span></div>
            <div class="stock-name">${s.name}</div>
          </div>
          <div class="stock-right">
            <div class="stock-price">${cur}${s.price.toFixed(2)}</div>
            <div class="stock-chg ${chgClass}">${fmtPct(s.chg)}</div>
          </div>
        </div>
        <div class="stock-chart-wrap">
          <canvas id="stock-chart-${i}"></canvas>
        </div>
        <div class="stock-bottom">
          <div class="stock-meta">
            <div class="stock-sector">${s.sector}</div>
            <div class="stock-rsi">RSI: ${s.rsi} · ${s.mktCap}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <span class="signal-pill ${sig.signal}">${sig.signal}</span>
            <span class="halal-badge">☪️ Halal</span>
          </div>
        </div>
        <div class="stock-why">${getSignalReason(s)}</div>
      </div>
    `;
  }).join('');

  stocks.forEach((s, i) => {
    const trend = s.ma20 > s.ma50 ? 'up' : 'down';
    const color = s.chg >= 0 ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';
    setTimeout(() => createSparkline(`stock-chart-${i}`, trend, color), 30 * i);
  });
}

function renderMarketGrid() {
  const markets = [
    { name:'S&P 500',      val:'5,218.19', chg:+0.42, desc:'US large-cap index' },
    { name:'FTSE 100',     val:'8,147.34', chg:+0.18, desc:'UK top 100 companies' },
    { name:'NASDAQ 100',   val:'16,742.39',chg:+0.88, desc:'US tech-heavy index' },
    { name:'Dow Jones',    val:'39,112.16',chg:-0.11, desc:'US 30 major companies' },
    { name:'Gold (XAU)',   val:'$2,339.40',chg:-0.21, desc:'Safe haven asset' },
    { name:'USD/GBP',      val:'0.7901',   chg:-0.08, desc:'Dollar to Pound rate' },
  ];

  document.getElementById('marketGrid').innerHTML = markets.map((m, i) => {
    const cls = m.chg >= 0 ? 'pos' : 'neg';
    const trend = m.chg >= 0 ? 'up' : 'down';
    const color = m.chg >= 0 ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';
    return `
      <div class="market-card">
        <div class="market-name">${m.name}<br><small style="color:var(--text3);font-size:10px">${m.desc}</small></div>
        <div class="market-val">${m.val}</div>
        <div class="market-chg ${cls}">${fmtPct(m.chg)} today</div>
        <div class="market-chart-wrap"><canvas id="mkt-chart-${i}"></canvas></div>
      </div>
    `;
  }).join('');

  markets.forEach((m, i) => {
    const trend = m.chg >= 0 ? 'up' : 'down';
    const color = m.chg >= 0 ? 'rgb(0, 208, 156)' : 'rgb(255, 79, 109)';
    setTimeout(() => createSparkline(`mkt-chart-${i}`, trend, color), 40 * i);
  });
}

function renderLearnGrid() {
  const lessons = [
    { icon:'🟢', title:'BUY Signal',         body:'The stock price has dipped but the overall trend is still up. Good time to buy at a lower price before it rises again.' },
    { icon:'🔴', title:'SELL Signal',        body:'The stock has risen a lot recently and may be due for a pullback. Consider taking some profit before the price drops.' },
    { icon:'🔵', title:'HOLD Signal',        body:'No strong reason to buy or sell. If you own it, keep it. If you don\'t, wait for a clearer signal before entering.' },
    { icon:'🟡', title:'WATCH Signal',       body:'Something is changing — the trend or momentum is shifting. Keep an eye on it. Don\'t buy yet, but stay alert.' },
    { icon:'📊', title:'RSI (Strength)',     body:'Scores from 0–100. Below 30 means the stock is very oversold (possibly cheap). Above 70 means overbought (possibly expensive).' },
    { icon:'📈', title:'Moving Average',     body:'The average price over 20 or 50 days. When the 20-day crosses above the 50-day, that\'s a bullish (positive) sign.' },
    { icon:'💰', title:'Start Small',        body:'With £200, only put 20% max into any single stock. Spread across 4–5 stocks to reduce risk. Never invest money you can\'t afford to lose.' },
    { icon:'☪️',  title:'Halal Screening',   body:'All stocks shown avoid: interest-based banking, alcohol, gambling, pork products, and weapons manufacturing.' },
    { icon:'📉', title:'Don\'t Panic Sell',  body:'Short-term dips are normal. Don\'t sell just because a stock drops 5–10%. Check the signal first and think long-term.' },
  ];

  document.getElementById('learnGrid').innerHTML = lessons.map(l => `
    <div class="learn-card">
      <h4>${l.icon} ${l.title}</h4>
      <p>${l.body}</p>
    </div>
  `).join('');
}

function renderHeroChange() {
  const el = document.getElementById('heroChange');
  document.getElementById('changeAmt').textContent = '+£4.20';
  document.getElementById('changePct').textContent = '(+1.82%)';
  el.className = 'hero-change positive';
}

function updateBriefTime() {
  const now = new Date();
  document.getElementById('briefTime').textContent =
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function updateMarketStatus() {
  const now = new Date();
  const hour = now.getUTCHours();
  const isUSOpen = hour >= 13 && hour < 21;
  const isUKOpen = hour >= 8 && hour < 16;
  const isOpen = isUSOpen || isUKOpen;

  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('marketStatusText');
  if (isOpen) {
    dot.style.background = 'var(--green)';
    text.textContent = 'Markets Open';
  } else {
    dot.style.background = 'var(--text3)';
    dot.style.animation = 'none';
    text.textContent = 'Markets Closed';
  }
}

// ─── SETTINGS ────────────────────────────────────────────────────
function openSettings() {
  document.getElementById('t212Key').value = CONFIG.T212_KEY;
  document.getElementById('avKey').value   = CONFIG.AV_KEY;
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

function closeSettingsOutside(e) {
  if (e.target === document.getElementById('settingsModal')) closeSettings();
}

function saveKeys() {
  const t212 = document.getElementById('t212Key').value.trim();
  const av   = document.getElementById('avKey').value.trim();
  if (t212) { CONFIG.T212_KEY = t212; localStorage.setItem('t212_key', t212); }
  if (av)   { CONFIG.AV_KEY   = av;   localStorage.setItem('av_key',   av);   }

  const badge = document.getElementById('demoBadge');
  if (!CONFIG.demoMode) {
    badge.textContent = '● LIVE';
    badge.classList.add('live');
  }
  closeSettings();
  refreshData();
}

function toggleVis(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

// ─── FILTER ──────────────────────────────────────────────────────
function filterStocks(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStocksGrid(filter);
}

// ─── REFRESH ─────────────────────────────────────────────────────
function refreshData() {
  updateBriefTime();
  renderBriefGrid();

  if (!CONFIG.demoMode) {
    fetchLiveData();
  }
}

async function fetchLiveData() {
  // Trading 212 portfolio
  if (CONFIG.T212_KEY) {
    try {
      const r = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
        headers: { 'Authorization': CONFIG.T212_KEY }
      });
      if (r.ok) {
        const data = await r.json();
        console.log('T212 Portfolio:', data);
        // Data will be mapped here when API is live
      }
    } catch (e) {
      console.warn('Trading 212 API (CORS may block browser calls):', e.message);
    }
  }

  // Alpha Vantage prices for top picks
  if (CONFIG.AV_KEY) {
    const topTickers = ['AAPL', 'MSFT', 'NVDA'];
    for (const ticker of topTickers) {
      try {
        const r = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${CONFIG.AV_KEY}`
        );
        if (r.ok) {
          const data = await r.json();
          const q = data['Global Quote'];
          if (q) {
            const stock = HALAL_STOCKS.find(s => s.ticker === ticker);
            if (stock) {
              stock.price = parseFloat(q['05. price']);
              stock.chg   = parseFloat(q['10. change percent']);
            }
          }
        }
      } catch (e) {
        console.warn(`AV fetch failed for ${ticker}:`, e.message);
      }
    }
    renderStocksGrid();
    renderBriefGrid();
  }
}

// ─── INIT ────────────────────────────────────────────────────────
function init() {
  renderHeader();
  renderHeroChange();
  renderBriefGrid();
  renderHoldings();
  renderStocksGrid();
  renderMarketGrid();
  renderLearnGrid();
  updateBriefTime();
  updateMarketStatus();

  setTimeout(createPortfolioChart, 100);

  const badge = document.getElementById('demoBadge');
  if (!CONFIG.demoMode) {
    badge.textContent = '● LIVE';
    badge.classList.add('live');
  }

  // Auto-refresh brief time every minute
  setInterval(updateBriefTime, 60_000);
}

document.addEventListener('DOMContentLoaded', init);
