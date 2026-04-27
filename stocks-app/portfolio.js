// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────

function renderTicker() {
  const items = [
    {name:'S&P 500',val:'5,218',chg:'+0.42%',pos:true},{name:'FTSE 100',val:'8,147',chg:'+0.18%',pos:true},
    {name:'NASDAQ',val:'16,742',chg:'+0.88%',pos:true},{name:'Gold',val:'$2,339',chg:'-0.21%',pos:false},
  ];
  document.getElementById('mktTicker').innerHTML = items.map(i=>`<div class="ti"><span class="ti-name">${i.name}</span><span class="ti-val">${i.val}</span><span class="ti-chg ${i.pos?'pos':'neg'}">${i.chg}</span></div>`).join('');
}

function calcPortfolio() {
  let invested=0, cost=0, items=[];
  PORTFOLIO.forEach(h => {
    const s    = STOCKS.find(x=>x.ticker===h.ticker);
    const px   = s?.price ?? h.avgCost;
    const val  = h.shares * px;
    const c    = h.shares * h.avgCost;
    const pl   = val - c;
    invested  += val; cost += c;
    items.push({...h, px, val, cost:c, pl, plPct:(pl/c)*100, sig:getSignal(s||{rsi:50,ma20:1,ma50:1}), s });
  });
  return { items, invested, cost, pl:invested-cost, plPct:cost?((invested-cost)/cost)*100:0, cash:45 };
}

function renderSummary(p) {
  const total  = p.invested + p.cash;
  const plCls  = p.pl >= 0 ? 'pos' : 'neg';
  const sign   = p.pl >= 0 ? '+' : '';
  return `
    <div class="page-hd">
      <div><div class="page-title">My Portfolio</div><div class="page-sub">All your positions in one place</div></div>
      <button class="btn btn-gold btn-sm" onclick="openSettings()">⚙ Connect Trading 212</button>
    </div>
    <div class="stat-row">
      <div class="stat-card" style="background:linear-gradient(135deg,#0f1c2e,#142035);border-color:var(--border2)">
        <div class="stat-label">Total Value</div>
        <div class="stat-val">£${total.toFixed(2)}</div>
        <div class="stat-change ${plCls}">${sign}£${Math.abs(p.pl).toFixed(2)} (${sign}${p.plPct.toFixed(2)}%)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cash Available</div>
        <div class="stat-val">£${p.cash.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Ready to deploy</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Invested</div>
        <div class="stat-val">£${p.invested.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">${p.items.length} positions</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Gain/Loss</div>
        <div class="stat-val ${plCls}">${sign}£${Math.abs(p.pl).toFixed(2)}</div>
        <div class="stat-change ${plCls}">${sign}${p.plPct.toFixed(2)}% return</div>
      </div>
    </div>`;
}

function renderCharts(p) {
  // Pie data
  const labels = p.items.map(h => h.ticker);
  const values = p.items.map(h => +h.val.toFixed(2));
  const colors = ['#f5a623','#00d09c','#4a9eff','#9b59f5','#ff4f6d','#ffc15e'];

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="chart-box">
        <div class="section-title" style="margin-bottom:14px">📈 Portfolio Value Over Time</div>
        <div class="chart-area"><canvas id="growthChart"></canvas></div>
      </div>
      <div class="chart-box">
        <div class="section-title" style="margin-bottom:14px">🥧 Allocation</div>
        <div style="height:200px;position:relative"><canvas id="pieChart"></canvas></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
          ${labels.map((l,i) => `<div style="display:flex;align-items:center;gap:5px;font-size:11px"><div style="width:10px;height:10px;border-radius:2px;background:${colors[i%colors.length]};flex-shrink:0"></div>${l}</div>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderHoldings(p) {
  const rows = p.items.map((h, i) => {
    const cur  = getCurrency(h.market);
    const sign = h.pl >= 0 ? '+' : '';
    return `
      <div class="holding-row" style="cursor:pointer" onclick="openDetail('${h.ticker}')">
        <div class="h-emoji">${h.emoji}</div>
        <div class="h-info">
          <div class="h-name">${h.name}</div>
          <div class="h-sub">${h.ticker} · ${h.market} · ${h.s?.sector ?? ''}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Shares</div>
          <div class="h-val">${h.shares}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Avg Cost</div>
          <div class="h-val">${cur}${h.avgCost.toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Current</div>
          <div class="h-val">${cur}${h.px.toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Value</div>
          <div class="h-val">${cur}${h.val.toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">P&amp;L</div>
          <div class="h-val ${h.pl>=0?'pos':'neg'}">${sign}${cur}${Math.abs(h.pl).toFixed(2)}</div>
        </div>
        <div class="h-col">
          <div class="h-lbl">Return</div>
          <div class="h-val ${h.plPct>=0?'pos':'neg'}">${fmtPct(h.plPct)}</div>
        </div>
        <canvas class="h-spark" id="ps-${i}"></canvas>
        <span class="pill pill-${h.sig.cls}">${h.sig.signal}</span>
      </div>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-hd">
        <div class="section-title">📋 Positions</div>
        <span style="font-size:11px;color:var(--text3)">Click any row for full analysis</span>
      </div>
      <div class="holdings-list">${rows}</div>
    </div>`;
}

function renderConnectBanner() {
  if (CONFIG.T212_KEY) return '';
  return `
    <div class="connect-banner">
      <div>
        <h3>Connect Trading 212 for live portfolio data</h3>
        <p>Right now this shows demo data. Add your Trading 212 API key in Settings to see your real positions, real P&L, and real cash balance automatically synced.</p>
      </div>
      <button class="btn btn-gold" onclick="openSettings()">Connect Now →</button>
    </div>`;
}

function renderManualAdd() {
  return `
    <div class="section">
      <details style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
        <summary style="padding:18px 22px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px">
          ✏️ Manually add a holding
          <span style="font-size:12px;color:var(--text2)">▼</span>
        </summary>
        <div style="padding:0 22px 22px;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end">
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:5px">Ticker (e.g. AAPL)</div>
            <input id="m-ticker" class="search-input" style="width:100%;border-radius:var(--rs)" placeholder="AAPL">
          </div>
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:5px">Shares</div>
            <input id="m-shares" class="search-input" style="width:100%;border-radius:var(--rs)" placeholder="0.5" type="number" step="0.001">
          </div>
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:5px">Avg Buy Price (£/$)</div>
            <input id="m-cost" class="search-input" style="width:100%;border-radius:var(--rs)" placeholder="182.00" type="number" step="0.01">
          </div>
          <button class="btn btn-gold" onclick="addHolding()">Add</button>
        </div>
      </details>
    </div>`;
}

function addHolding() {
  const ticker = document.getElementById('m-ticker').value.trim().toUpperCase();
  const shares = parseFloat(document.getElementById('m-shares').value);
  const cost   = parseFloat(document.getElementById('m-cost').value);
  if (!ticker || !shares || !cost) return alert('Fill in all fields.');
  const s = STOCKS.find(x => x.ticker === ticker);
  PORTFOLIO.push({ ticker, name: s?.name ?? ticker, emoji: s?.emoji ?? '📈', shares, avgCost: cost, market: s?.market ?? 'US' });
  localStorage.setItem('portfolio', JSON.stringify(PORTFOLIO));
  init();
}

function openDetail(ticker) {
  window.location = `screener.html?ticker=${ticker}`;
}

function drawCharts(p) {
  // Growth chart
  const gc = document.getElementById('growthChart');
  if (gc) new Chart(gc, {
    type:'line',
    data:{ labels:['Nov','Dec','Jan','Feb','Mar','Apr'], datasets:[{ data:[200,208,205,218,226,234.80], borderColor:'#f5a623', borderWidth:2, fill:true, backgroundColor:'rgba(245,166,35,0.06)', tension:0.4, pointRadius:3, pointBackgroundColor:'#f5a623' }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{backgroundColor:'#0f1c2e',borderColor:'#1e2f47',borderWidth:1,bodyColor:'#e8edf6',callbacks:{label:c=>`£${c.raw.toFixed(2)}`}}}, scales:{ x:{grid:{color:'rgba(30,47,71,0.4)'},ticks:{color:'#5a6b82',font:{size:11}}}, y:{position:'right',grid:{color:'rgba(30,47,71,0.4)'},ticks:{color:'#5a6b82',font:{size:11},callback:v=>`£${v}`}} }, interaction:{intersect:false,mode:'index'} }
  });

  // Pie chart
  const pc = document.getElementById('pieChart');
  const colors = ['#f5a623','#00d09c','#4a9eff','#9b59f5','#ff4f6d','#ffc15e'];
  if (pc) new Chart(pc, {
    type:'doughnut',
    data:{ labels:p.items.map(h=>h.ticker), datasets:[{ data:p.items.map(h=>+h.val.toFixed(2)), backgroundColor:colors, borderColor:'#0f1c2e', borderWidth:3 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0f1c2e', borderColor:'#1e2f47', borderWidth:1, bodyColor:'#e8edf6', callbacks:{ label:c=>`${c.label}: £${c.raw.toFixed(2)}` } } } }
  });

  // Holding sparklines
  p.items.forEach((h,i) => {
    const trend = h.s?.ma20 > h.s?.ma50 ? 'up' : 'down';
    const col   = h.pl >= 0 ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    setTimeout(() => makeSparkline(`ps-${i}`, trend, col), i * 40);
  });
}

function init() {
  sharedInit('portfolio');
  renderTicker();
  const p = calcPortfolio();
  document.getElementById('page').innerHTML = [
    renderSummary(p),
    renderConnectBanner(),
    renderCharts(p),
    renderHoldings(p),
    renderManualAdd(),
  ].join('');
  setTimeout(() => drawCharts(p), 80);
}

document.addEventListener('DOMContentLoaded', init);
