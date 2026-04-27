// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────

function renderTicker() {
  const items = [
    { name:'S&P 500', val:'5,218', chg:'+0.42%', pos:true },
    { name:'FTSE 100', val:'8,147', chg:'+0.18%', pos:true },
    { name:'NASDAQ', val:'16,742', chg:'+0.88%', pos:true },
    { name:'DOW', val:'39,112', chg:'-0.11%', pos:false },
    { name:'Gold', val:'$2,339', chg:'-0.21%', pos:false },
    { name:'Oil (WTI)', val:'$82.40', chg:'+1.14%', pos:true },
    { name:'GBP/USD', val:'1.2641', chg:'+0.08%', pos:true },
  ];
  document.getElementById('mktTicker').innerHTML = items.map(i => `
    <div class="ti">
      <span class="ti-name">${i.name}</span>
      <span class="ti-val">${i.val}</span>
      <span class="ti-chg ${i.pos ? 'pos' : 'neg'}">${i.chg}</span>
    </div>`).join('');
}

function portfolioStats() {
  let invested = 0, cost = 0;
  PORTFOLIO.forEach(h => {
    const s = STOCKS.find(x => x.ticker === h.ticker);
    const px = s?.price ?? h.avgCost;
    invested += h.shares * px;
    cost     += h.shares * h.avgCost;
  });
  const cash = 45.00;
  const total = invested + cash;
  const pl = invested - cost;
  const plPct = cost ? (pl / cost) * 100 : 0;
  return { total, invested, cash, pl, plPct };
}

function renderHero(stats) {
  const plCls  = stats.pl >= 0 ? 'pos' : 'neg';
  const plSign = stats.pl >= 0 ? '+' : '';
  return `
    <div class="stat-row">
      <div class="stat-card" style="grid-column:span 2;background:linear-gradient(135deg,#0f1c2e,#142035);border-color:var(--border2)">
        <div class="stat-label">Total Portfolio Value</div>
        <div class="stat-val" style="font-size:36px">£${stats.total.toFixed(2)}</div>
        <div class="stat-change ${plCls}" style="margin-top:8px">
          ${plSign}£${Math.abs(stats.pl).toFixed(2)} &nbsp; ${plSign}${stats.plPct.toFixed(2)}% all time
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">${CONFIG.demoMode ? '⚠ Demo data — add API keys in Settings for live prices' : '● Live data'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cash Available</div>
        <div class="stat-val">£${stats.cash.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Ready to invest</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Invested</div>
        <div class="stat-val">£${stats.invested.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">${PORTFOLIO.length} holdings</div>
      </div>
    </div>`;
}

function renderPortfolioChart() {
  const labels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const data   = [200, 208, 205, 218, 226, 234.80];
  return `
    <div class="chart-box">
      <div class="section-hd" style="margin-bottom:14px">
        <div class="section-title">📈 Portfolio Growth</div>
        <span style="font-size:11px;color:var(--text3)">Last 6 months</span>
      </div>
      <div class="chart-area"><canvas id="growthChart"></canvas></div>
    </div>`;
}

function renderBrief() {
  const top = [...STOCKS].sort((a, b) => {
    const order = {'STRONG BUY':0,'BUY':1,'STRONG SELL':2,'SELL':3,'WATCH':4,'HOLD':5};
    return (order[getSignal(a).signal] ?? 9) - (order[getSignal(b).signal] ?? 9);
  }).slice(0, 3);

  const cards = top.map((s, i) => {
    const sig = getSignal(s);
    const cur = getCurrency(s.market);
    return `
      <div class="brief-card ${sig.cls}" onclick="window.location='screener.html'">
        <div class="brief-top">
          <div>
            <span class="pill pill-${sig.cls}">${sig.signal}</span>
            <div class="brief-ticker">${s.ticker}</div>
          </div>
          <div class="conf-wrap">
            <span class="conf-label">Confidence</span>
            <div class="conf-bar"><div class="conf-fill ${sig.cls}" style="width:${sig.conf}%"></div></div>
            <span style="font-size:10px;color:var(--text2);font-weight:600">${sig.conf}%</span>
          </div>
        </div>
        <div class="brief-name">${s.name}</div>
        <div class="brief-reason">${getSignalReason(s)}</div>
        <div class="brief-price-row">
          <span class="brief-price">${cur}${s.price.toFixed(2)}</span>
          <span class="${s.chg >= 0 ? 'pos' : 'neg'}" style="font-size:12px;font-weight:600">${fmtPct(s.chg)} today</span>
        </div>
        <canvas id="brief-chart-${i}" style="height:36px;display:block"></canvas>
      </div>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-hd">
        <div class="section-title">🤖 AI Daily Brief — Top Signals</div>
        <a href="screener.html" style="font-size:12px;color:var(--gold)">View all stocks →</a>
      </div>
      <div class="brief-grid">${cards}</div>
    </div>`;
}

function renderHoldings() {
  const rows = PORTFOLIO.map((h, i) => {
    const s      = STOCKS.find(x => x.ticker === h.ticker);
    const px     = s?.price ?? h.avgCost;
    const val    = h.shares * px;
    const pl     = val - h.shares * h.avgCost;
    const plPct  = (pl / (h.shares * h.avgCost)) * 100;
    const sig    = getSignal(s || { rsi:50, ma20:1, ma50:1 });
    const cur    = getCurrency(h.market);
    return `
      <div class="holding-row">
        <div class="h-emoji">${h.emoji}</div>
        <div class="h-info">
          <div class="h-name">${h.name}</div>
          <div class="h-sub">${h.shares} shares · avg ${cur}${h.avgCost.toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Value</div>
          <div class="h-val">${cur}${val.toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">P&amp;L</div>
          <div class="h-val ${pl >= 0 ? 'pos' : 'neg'}">${pl >= 0 ? '+' : ''}${cur}${Math.abs(pl).toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Return</div>
          <div class="h-val ${plPct >= 0 ? 'pos' : 'neg'}">${fmtPct(plPct)}</div>
        </div>
        <canvas class="h-spark" id="hs-${i}"></canvas>
        <span class="pill pill-${sig.cls}" style="margin-left:auto">${sig.signal}</span>
      </div>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-hd">
        <div class="section-title">📊 Your Holdings</div>
        <a href="portfolio.html" style="font-size:12px;color:var(--gold)">Full portfolio →</a>
      </div>
      <div class="holdings-list">${rows}</div>
    </div>`;
}

function renderMarket() {
  const mkts = [
    { name:'S&P 500',     val:'5,218.19', chg:+0.42, desc:'US Top 500' },
    { name:'FTSE 100',    val:'8,147.34', chg:+0.18, desc:'UK Top 100' },
    { name:'NASDAQ 100',  val:'16,742',   chg:+0.88, desc:'US Tech'    },
    { name:'Dow Jones',   val:'39,112',   chg:-0.11, desc:'US 30 Blue' },
    { name:'Gold (XAU)',  val:'$2,339',   chg:-0.21, desc:'Safe haven' },
    { name:'USD/GBP',     val:'0.7901',   chg:-0.08, desc:'FX Rate'    },
  ];
  const cards = mkts.map((m, i) => `
    <div class="stat-card">
      <div class="stat-label">${m.name}<br><span style="font-size:10px;opacity:.6">${m.desc}</span></div>
      <div class="stat-val" style="font-size:20px;margin-top:6px">${m.val}</div>
      <div class="stat-change ${m.chg >= 0 ? 'pos' : 'neg'}">${fmtPct(m.chg)} today</div>
      <div style="height:40px;margin-top:10px"><canvas id="mkt-${i}"></canvas></div>
    </div>`).join('');

  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">🌍 Market Pulse</div></div>
      <div class="stat-row">${cards}</div>
    </div>`;
}

function renderQuickLinks() {
  const links = [
    { icon:'★', label:'My Guide',       sub:'What to buy, step by step', href:'guide.html',     col:'var(--gold)'   },
    { icon:'◉', label:'Market News',    sub:'Latest headlines & sentiment', href:'news.html',   col:'var(--blue)'   },
    { icon:'⊿', label:'Stock Screener', sub:'Browse all 20 stocks', href:'screener.html',       col:'var(--green)'  },
    { icon:'◈', label:'Ask AI',         sub:'Chat with your AI advisor', href:'chat.html',      col:'var(--purple)' },
  ];
  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">Quick Actions</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
        ${links.map(l => `
          <a href="${l.href}" style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px;display:flex;align-items:center;gap:14px;transition:var(--t);text-decoration:none" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="width:40px;height:40px;border-radius:10px;background:${l.col}18;display:flex;align-items:center;justify-content:center;font-size:18px;color:${l.col};flex-shrink:0">${l.icon}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text)">${l.label}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${l.sub}</div>
            </div>
          </a>`).join('')}
      </div>
    </div>`;
}

function drawCharts() {
  // Portfolio growth chart
  const gc = document.getElementById('growthChart');
  if (gc) new Chart(gc, {
    type:'line',
    data:{ labels:['Nov','Dec','Jan','Feb','Mar','Apr'], datasets:[{ data:[200,208,205,218,226,234.80], borderColor:'#f5a623', borderWidth:2, fill:true, backgroundColor:'rgba(245,166,35,0.06)', tension:0.4, pointRadius:3, pointBackgroundColor:'#f5a623' }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0f1c2e', borderColor:'#1e2f47', borderWidth:1, bodyColor:'#e8edf6', callbacks:{ label: c => `£${c.raw.toFixed(2)}` } } }, scales:{ x:{ grid:{color:'rgba(30,47,71,0.4)'}, ticks:{color:'#5a6b82',font:{family:'Inter',size:11}} }, y:{ position:'right', grid:{color:'rgba(30,47,71,0.4)'}, ticks:{color:'#5a6b82',font:{family:'Inter',size:11},callback:v=>`£${v}`} } }, interaction:{intersect:false,mode:'index'} }
  });

  // Brief sparklines
  const topStocks = [...STOCKS].sort((a,b) => {
    const o = {'STRONG BUY':0,'BUY':1,'STRONG SELL':2,'SELL':3,'WATCH':4,'HOLD':5};
    return (o[getSignal(a).signal]??9)-(o[getSignal(b).signal]??9);
  }).slice(0,3);
  topStocks.forEach((s,i) => {
    const trend = s.ma20 > s.ma50 ? 'up' : 'down';
    const col   = s.chg >= 0 ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    makeSparkline(`brief-chart-${i}`, trend, col);
  });

  // Holding sparklines
  PORTFOLIO.forEach((h,i) => {
    const s = STOCKS.find(x => x.ticker === h.ticker);
    const trend = s?.ma20 > s?.ma50 ? 'up' : 'down';
    const col   = (s?.chg ?? 0) >= 0 ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    setTimeout(() => makeSparkline(`hs-${i}`, trend, col), i * 40);
  });

  // Market charts
  [true,true,true,false,false,false].forEach((pos,i) => {
    const col = pos ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    setTimeout(() => makeSparkline(`mkt-${i}`, pos?'up':'down', col), i * 30);
  });
}

function init() {
  sharedInit('dashboard');
  renderTicker();
  const stats = portfolioStats();
  document.getElementById('page').innerHTML = [
    renderHero(stats),
    renderPortfolioChart(),
    renderBrief(),
    renderHoldings(),
    renderMarket(),
    renderQuickLinks(),
  ].join('');
  setTimeout(drawCharts, 80);
}

document.addEventListener('DOMContentLoaded', init);
