// ─── SCREENER PAGE ────────────────────────────────────────────────────────────
let currentFilter = 'stocks', currentSort = 'signal', searchTerm = '';

function renderTicker() {
  const items = [
    {name:'S&P 500', val:'5,218', chg:'+0.42%', pos:true},
    {name:'FTSE 100',val:'8,147', chg:'+0.18%', pos:true},
    {name:'NASDAQ',  val:'16,742',chg:'+0.88%', pos:true},
    {name:'Gold',    val:'$2,339',chg:'-0.21%', pos:false}
  ];
  document.getElementById('mktTicker').innerHTML = items.map(i =>
    `<div class="ti"><span class="ti-name">${i.name}</span><span class="ti-val">${i.val}</span><span class="ti-chg ${i.pos?'pos':'neg'}">${i.chg}</span></div>`
  ).join('');
}

function signalOrder(s) {
  return {'STRONG BUY':0,'BUY':1,'WATCH':2,'HOLD':3,'SELL':4,'STRONG SELL':5}[s] ?? 9;
}

function filteredStocks() {
  let list = [...STOCKS];

  // Mode tabs
  if (currentFilter === 'stocks')   list = list.filter(s => !s.isETF);
  if (currentFilter === 'etfs')     list = list.filter(s => s.isETF);
  if (currentFilter === 'US')       list = list.filter(s => s.market === 'US' && !s.isETF);
  if (currentFilter === 'UK')       list = list.filter(s => s.market === 'UK' && !s.isETF);
  if (currentFilter === 'buy')      list = list.filter(s => getSignal(s).cls === 'buy');
  if (currentFilter === 'watch')    list = list.filter(s => getSignal(s).cls === 'watch');
  if (currentFilter === 'watchlist')list = list.filter(s => isWatched(s.ticker));

  if (searchTerm) list = list.filter(s =>
    s.ticker.includes(searchTerm.toUpperCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentSort === 'signal') list.sort((a,b) => signalOrder(getSignal(a).signal) - signalOrder(getSignal(b).signal));
  if (currentSort === 'price')  list.sort((a,b) => b.price - a.price);
  if (currentSort === 'change') list.sort((a,b) => b.chg - a.chg);
  if (currentSort === 'rsi')    list.sort((a,b) => a.rsi - b.rsi);

  return list;
}

function renderPage() {
  const list = filteredStocks();
  const isETFView = currentFilter === 'etfs';

  const cards = list.map((s, i) => {
    const sig    = getSignal(s);
    const cur    = getCurrency(s.market);
    const chgCls = s.chg >= 0 ? 'pos' : 'neg';
    const watched = isWatched(s.ticker);

    if (s.isETF) {
      // ETF card — different layout
      const etfCategory = s.sector.replace('ETF — ','');
      return `
        <div class="stock-card etf-card" onclick="openDetail('${s.ticker}')">
          <div class="etf-badge">ETF</div>
          <div class="stock-card-top">
            <div>
              <div class="stock-ticker">${s.emoji} ${s.ticker} <span style="font-size:11px">${s.market==='US'?'🇺🇸':'🇬🇧'}</span></div>
              <div class="stock-name">${s.name}</div>
              <div class="etf-category">${etfCategory}</div>
            </div>
            <div style="text-align:right">
              <div class="stock-price">${cur}${s.price < 10 ? s.price.toFixed(4) : s.price.toFixed(2)}</div>
              <div class="stock-chg ${chgCls}">${fmtPct(s.chg)}</div>
            </div>
          </div>
          <div class="stock-chart-wrap"><canvas id="sc-${i}"></canvas></div>
          <div class="stock-card-btm">
            <div class="stock-meta">RSI: ${s.rsi} · ${s.mktCap}<br>${s.market} · Vol ${s.vol}</div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
              <span class="pill pill-${sig.cls}">${sig.signal}</span>
              <button class="watch-btn ${watched?'watched':''}" onclick="event.stopPropagation();toggleWatchBtn('${s.ticker}',this)">${watched?'★ Watching':'☆ Watch'}</button>
            </div>
          </div>
          <div class="stock-why">${getSignalReason(s)}</div>
        </div>`;
    }

    return `
      <div class="stock-card" onclick="openDetail('${s.ticker}')">
        <div class="stock-card-top">
          <div>
            <div class="stock-ticker">${s.emoji} ${s.ticker} <span style="font-size:11px">${s.market==='US'?'🇺🇸':'🇬🇧'}</span></div>
            <div class="stock-name">${s.name}</div>
          </div>
          <div style="text-align:right">
            <div class="stock-price">${cur}${s.price < 10 ? s.price.toFixed(4) : s.price.toFixed(2)}</div>
            <div class="stock-chg ${chgCls}">${fmtPct(s.chg)}</div>
          </div>
        </div>
        <div class="stock-chart-wrap"><canvas id="sc-${i}"></canvas></div>
        <div class="stock-card-btm">
          <div class="stock-meta">${s.sector}<br>RSI: ${s.rsi} · ${s.mktCap}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
            <span class="pill pill-${sig.cls}">${sig.signal}</span>
            <button class="watch-btn ${watched?'watched':''}" onclick="event.stopPropagation();toggleWatchBtn('${s.ticker}',this)">${watched?'★ Watching':'☆ Watch'}</button>
          </div>
        </div>
        <div class="stock-why">${getSignalReason(s)}</div>
      </div>`;
  }).join('') || `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text2)">
    <h3>No results match your filters</h3>
    <p style="color:var(--text3);font-size:12px;margin-top:6px">Try clearing the search or changing the filter</p>
  </div>`;

  document.getElementById('stocks-grid').innerHTML = cards;

  list.forEach((s, i) => {
    const trend = s.ma20 > s.ma50 ? 'up' : 'down';
    const col   = s.chg >= 0 ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    setTimeout(() => makeSparkline(`sc-${i}`, trend, col), i * 20);
  });
}

function toggleWatchBtn(ticker, btn) {
  toggleWatch(ticker);
  const watched = isWatched(ticker);
  btn.textContent = watched ? '★ Watching' : '☆ Watch';
  btn.classList.toggle('watched', watched);
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderPage();
}

function setSort(s, el) {
  currentSort = s;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderPage();
}

function onSearch(val) {
  searchTerm = val;
  renderPage();
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function openDetail(ticker) {
  const s   = STOCKS.find(x => x.ticker === ticker);
  if (!s) return;
  const sig  = getSignal(s);
  const cur  = getCurrency(s.market);
  const f    = getFundamentals(ticker);
  const owned = PORTFOLIO.find(h => h.ticker === ticker);

  document.getElementById('detailHd').innerHTML = `
    <div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:24px">${s.emoji}</span>
        <div>
          <div style="font-size:20px;font-weight:800">${s.ticker} <span class="pill pill-${sig.cls}" style="font-size:11px">${sig.signal}</span>${s.isETF?'<span style="margin-left:6px;font-size:10px;background:var(--accent);color:#fff;padding:2px 7px;border-radius:8px;font-weight:700">ETF</span>':''}</div>
          <div style="font-size:13px;color:var(--text2)">${s.name} · ${s.market==='US'?'🇺🇸 US':'🇬🇧 UK'} · ${s.sector}</div>
        </div>
      </div>
    </div>
    <button class="modal-close" onclick="closeDetail()">✕</button>`;

  document.getElementById('detailBd').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:28px;font-weight:800">${cur}${s.price < 10 ? s.price.toFixed(4) : s.price.toFixed(2)}</div>
        <div class="${s.chg>=0?'pos':'neg'}" style="font-size:14px;font-weight:600;margin-top:2px">${fmtPct(s.chg)} today</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:var(--text3)">Signal confidence</div>
        <div style="font-size:20px;font-weight:800;color:${sig.cls==='buy'?'var(--green)':sig.cls==='sell'?'var(--red)':'var(--gold)'}">${sig.conf}%</div>
      </div>
    </div>
    <div style="height:140px"><canvas id="detail-chart"></canvas></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">RSI</div>
        <div style="font-size:18px;font-weight:700;color:${s.rsi<40?'var(--green)':s.rsi>60?'var(--red)':'var(--text)'}">${s.rsi}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">${s.rsi<30?'Oversold — possible buy':s.rsi>70?'Overbought — be careful':'Normal range'}</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">Trend (MA)</div>
        <div style="font-size:18px;font-weight:700;color:${s.ma20>s.ma50?'var(--green)':'var(--red)'}">${s.ma20>s.ma50?'↗ Uptrend':'↘ Downtrend'}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">MA20 vs MA50</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">Market Cap</div>
        <div style="font-size:18px;font-weight:700">${s.mktCap}</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">Volume</div>
        <div style="font-size:18px;font-weight:700">${s.vol}</div>
      </div>
      ${!s.isETF && s.pe ? `
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">P/E Ratio</div>
        <div style="font-size:18px;font-weight:700">${s.pe.toFixed(1)}x</div>
      </div>` : ''}
      ${!s.isETF && f.analystRating !== 'N/A' ? `
      <div style="background:var(--bg2);border-radius:var(--rs);padding:12px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px">Analyst Rating</div>
        <div style="font-size:15px;font-weight:700;color:var(--green)">${f.analystRating}</div>
        ${f.analystTarget !== 'N/A' ? `<div style="font-size:10px;color:var(--text3);margin-top:2px">Target: ${cur}${f.analystTarget}</div>` : ''}
      </div>` : ''}
    </div>
    <div style="background:var(--bg2);border-radius:var(--rs);padding:14px;font-size:13px;color:var(--text2);line-height:1.6">
      <strong style="color:var(--text);display:block;margin-bottom:6px">Signal Explanation</strong>
      ${getSignalReason(s)}
    </div>
    ${owned ? `<div style="background:rgba(0,208,156,0.06);border:1px solid rgba(0,208,156,0.2);border-radius:var(--rs);padding:14px;font-size:13px">
      <strong style="color:var(--green)">You own this</strong><br>
      <span style="color:var(--text2)">${owned.shares} shares · avg cost ${cur}${owned.avgCost.toFixed(2)} · now ${cur}${s.price < 10 ? s.price.toFixed(4) : s.price.toFixed(2)}</span>
    </div>` : `<div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.2);border-radius:var(--rs);padding:14px;font-size:13px;color:var(--text2)">
      💡 Not sure whether to buy? See the <a href="guide.html" style="color:var(--gold)">Investment Guide</a> for a plain-English recommendation.
    </div>`}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="toggleWatch('${ticker}');this.textContent=isWatched('${ticker}')?'★ Watching':'☆ Watch'">${isWatched(ticker)?'★ Watching':'☆ Watch'}</button>
      <a href="analyzer.html?ticker=${ticker}" class="btn btn-primary btn-sm">Deep Analyze →</a>
      <a href="guide.html" class="btn btn-gold btn-sm">Buy Guide →</a>
    </div>`;

  document.getElementById('detailModal').classList.add('open');
  setTimeout(() => {
    const trend = s.ma20 > s.ma50 ? 'up' : 'down';
    const col   = s.chg >= 0 ? 'rgb(0,208,156)' : 'rgb(255,79,109)';
    makeSparkline('detail-chart', trend, col);
  }, 80);
}

function closeDetail()         { document.getElementById('detailModal').classList.remove('open'); }
function closeDetailOutside(e) { if (e.target.id === 'detailModal') closeDetail(); }

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  sharedInit('screener');
  renderTicker();

  const stockCount = STOCKS.filter(s => !s.isETF).length;
  const etfCount   = STOCKS.filter(s => s.isETF).length;

  document.getElementById('page').innerHTML = `
    <div class="page-hd">
      <div>
        <div class="page-title">Screener</div>
        <div class="page-sub">${stockCount} stocks · ${etfCount} ETFs · all screened for Trading 212 Invest</div>
      </div>
    </div>

    <div class="screener-mode-tabs">
      <button class="smode-tab active" onclick="setFilter('stocks',this)" data-filter="stocks">
        📈 Stocks <span class="smode-count">${stockCount}</span>
      </button>
      <button class="smode-tab" onclick="setFilter('etfs',this)" data-filter="etfs">
        🧺 ETFs <span class="smode-count">${etfCount}</span>
      </button>
      <button class="smode-tab" onclick="setFilter('buy',this)" data-filter="buy">
        🟢 Buy Signals
      </button>
      <button class="smode-tab" onclick="setFilter('watchlist',this)" data-filter="watchlist">
        ★ Watchlist
      </button>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:4px">
      <div class="filter-bar" id="sub-filters">
        <button class="filter-btn active" onclick="setFilter('stocks',this)">All Stocks</button>
        <button class="filter-btn" onclick="setFilter('US',this)">🇺🇸 US</button>
        <button class="filter-btn" onclick="setFilter('UK',this)">🇬🇧 UK</button>
        <button class="filter-btn" onclick="setFilter('watch',this)">🟡 Watch</button>
      </div>
      <input class="search-input" placeholder="Search ticker or name…" oninput="onSearch(this.value)">
    </div>

    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      <span style="font-size:12px;color:var(--text2)">Sort:</span>
      <button class="filter-btn sort-btn active" onclick="setSort('signal',this)">Signal Strength</button>
      <button class="filter-btn sort-btn" onclick="setSort('change',this)">% Change</button>
      <button class="filter-btn sort-btn" onclick="setSort('rsi',this)">RSI (lowest)</button>
      <button class="filter-btn sort-btn" onclick="setSort('price',this)">Price</button>
    </div>

    <div class="stocks-grid" id="stocks-grid"></div>`;

  // Big mode tabs also control sub-filter visibility
  document.querySelectorAll('.smode-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.smode-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      const subBar = document.getElementById('sub-filters');
      subBar.style.display = (f === 'stocks') ? 'flex' : 'none';
    });
  });

  renderPage();

  const ticker = new URLSearchParams(location.search).get('ticker');
  if (ticker) setTimeout(() => openDetail(ticker), 200);
}

document.addEventListener('DOMContentLoaded', init);
