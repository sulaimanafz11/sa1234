// ─── ANALYZER PAGE ────────────────────────────────────────────────────────────
(function () {
  renderNav('analyzer');

  const page = document.getElementById('page');
  const params = new URLSearchParams(location.search);
  let currentTicker = params.get('ticker') || 'AAPL';
  let activeTab = 'technical';
  let priceChart = null;

  function stock() { return STOCKS.find(s => s.ticker === currentTicker) || STOCKS[0]; }

  // ── Shell ──
  page.innerHTML = `
    <div class="analyzer-wrap">
      <div class="analyzer-header">
        <div>
          <h1 class="page-title" style="margin:0 0 4px">Stock Analyzer</h1>
          <p style="color:var(--muted);margin:0">Deep-dive any stock or ETF — technicals, fundamentals, AI memo</p>
        </div>
        <div class="analyzer-search-row">
          <input id="az-search" class="az-search-input" placeholder="Search ticker or name…" autocomplete="off">
          <div id="az-dropdown" class="az-dropdown hidden"></div>
        </div>
      </div>

      <div id="az-hero" class="az-hero card-glow-green"></div>

      <div class="az-tabs">
        <button class="az-tab active" data-tab="technical">Technical</button>
        <button class="az-tab" data-tab="fundamentals">Fundamentals</button>
        <button class="az-tab" data-tab="news">News & Sentiment</button>
        <button class="az-tab" data-tab="memo">AI Memo</button>
      </div>

      <div id="az-panel" class="az-panel"></div>
    </div>`;

  // ── Search ──
  const searchEl = document.getElementById('az-search');
  const dropEl   = document.getElementById('az-dropdown');

  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim().toLowerCase();
    if (!q) { dropEl.classList.add('hidden'); return; }
    const hits = STOCKS.filter(s =>
      s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!hits.length) { dropEl.classList.add('hidden'); return; }
    dropEl.innerHTML = hits.map(s => `
      <div class="az-drop-item" data-ticker="${s.ticker}">
        <span class="az-drop-emoji">${s.emoji}</span>
        <span class="az-drop-ticker">${s.ticker}</span>
        <span class="az-drop-name">${s.name}</span>
        <span class="az-drop-mkt">${s.market}</span>
      </div>`).join('');
    dropEl.classList.remove('hidden');
  });

  dropEl.addEventListener('click', e => {
    const item = e.target.closest('.az-drop-item');
    if (!item) return;
    currentTicker = item.dataset.ticker;
    searchEl.value = '';
    dropEl.classList.add('hidden');
    render();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.analyzer-search-row')) dropEl.classList.add('hidden');
  });

  // ── Tabs ──
  document.addEventListener('click', e => {
    const btn = e.target.closest('.az-tab');
    if (!btn) return;
    document.querySelectorAll('.az-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    renderPanel();
  });

  // ── Main render ──
  function render() {
    renderHero();
    renderPanel();
  }

  // ── Technical helpers ──
  function genPriceSeries(s) {
    let v = s.price * 0.88, arr = [];
    for (let i = 0; i < 60; i++) {
      v += (s.ma20 > s.ma50 ? 0.3 : -0.2) + (Math.random() - 0.48) * (s.price * 0.012);
      arr.push(+v.toFixed(4));
    }
    arr[59] = s.price;
    return arr;
  }

  function calcBB(prices, period = 20) {
    return prices.map((_, i) => {
      if (i < period - 1) return null;
      const slice = prices.slice(i - period + 1, i + 1);
      const mean  = slice.reduce((a, b) => a + b, 0) / period;
      const std   = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
      return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
    });
  }

  function calcMACD(prices) {
    const ema = (arr, k) => arr.reduce((acc, v, i) => {
      if (!i) return [v];
      acc.push(v * k + acc[i - 1] * (1 - k));
      return acc;
    }, []);
    const e12 = ema(prices, 2 / 13);
    const e26 = ema(prices, 2 / 27);
    const macd = e12.map((v, i) => v - e26[i]);
    const signal = ema(macd, 2 / 10);
    const hist   = macd.map((v, i) => v - signal[i]);
    return { macd, signal, hist };
  }

  function rsiColor(r) { return r < 35 ? 'var(--green)' : r > 65 ? 'var(--red)' : 'var(--gold)'; }

  // ── Panel router ──
  function renderPanel() {
    const panel = document.getElementById('az-panel');
    if (activeTab === 'technical')    renderTechnical(panel);
    else if (activeTab === 'fundamentals') renderFundamentals(panel);
    else if (activeTab === 'news')    renderNews(panel);
    else if (activeTab === 'memo')    renderMemo(panel);
  }

  // ── TECHNICAL TAB ──
  function renderTechnical(panel) {
    const s  = stock();
    const prices = genPriceSeries(s);
    const bb  = calcBB(prices);
    const mcd = calcMACD(prices);
    const labels = prices.map((_, i) => `D${i + 1}`);
    const rc = rsiColor(s.rsi);

    panel.innerHTML = `
      <div class="az-grid-2">
        <div class="card az-card">
          <div class="card-label">RSI Gauge <span style="color:${rc}">${s.rsi}</span></div>
          <div class="rsi-gauge-wrap">
            <div class="rsi-gauge-bar">
              <div class="rsi-gauge-fill" style="left:${s.rsi}%;background:${rc}"></div>
              <div class="rsi-zone rsi-os" title="Oversold (<30)">OS</div>
              <div class="rsi-zone rsi-ob" title="Overbought (>70)">OB</div>
            </div>
            <div class="rsi-gauge-labels"><span>0</span><span>30</span><span>50</span><span>70</span><span>100</span></div>
          </div>
          <p class="az-explain">${s.rsi < 30 ? '🟢 Oversold — historically a good entry point.' : s.rsi > 70 ? '🔴 Overbought — price may cool off soon.' : '🟡 Neutral RSI — no extreme signal.'}</p>
        </div>
        <div class="card az-card">
          <div class="card-label">Moving Averages</div>
          <div class="az-ma-row">
            <div class="az-ma-box" style="border-color:${s.ma20>s.ma50?'var(--green)':'var(--red)'}">
              <div class="az-ma-val">${getCurrency(s.market)}${s.ma20.toFixed(s.ma20<10?4:2)}</div>
              <div class="az-ma-lbl">MA20</div>
            </div>
            <div class="az-ma-box">
              <div class="az-ma-val">${getCurrency(s.market)}${s.ma50.toFixed(s.ma50<10?4:2)}</div>
              <div class="az-ma-lbl">MA50</div>
            </div>
            <div class="az-ma-box" style="border-color:var(--accent)">
              <div class="az-ma-val">${getCurrency(s.market)}${s.price.toFixed(s.price<10?4:2)}</div>
              <div class="az-ma-lbl">Current</div>
            </div>
          </div>
          <p class="az-explain">${s.ma20>s.ma50 ? '🟢 MA20 above MA50 — uptrend confirmed (golden cross).' : '🔴 MA20 below MA50 — downtrend signal (death cross).'}</p>
        </div>
      </div>

      <div class="card az-card" style="margin-top:16px">
        <div class="card-label">60-Day Price + Bollinger Bands</div>
        <div style="height:220px;position:relative"><canvas id="az-price-chart"></canvas></div>
      </div>

      <div class="card az-card" style="margin-top:16px">
        <div class="card-label">MACD (12/26/9)</div>
        <div style="height:140px;position:relative"><canvas id="az-macd-chart"></canvas></div>
        <p class="az-explain" style="margin-top:8px">${mcd.hist[59] > 0 ? '🟢 MACD histogram positive — bullish momentum building.' : '🔴 MACD histogram negative — bearish momentum.'}</p>
      </div>`;

    // Price + BB chart
    setTimeout(() => {
      const bbUpper = bb.map(b => b ? +b.upper.toFixed(4) : null);
      const bbLower = bb.map(b => b ? +b.lower.toFixed(4) : null);
      const bbMid   = bb.map(b => b ? +b.mid.toFixed(4)   : null);
      const pEl = document.getElementById('az-price-chart');
      if (pEl) {
        if (priceChart) priceChart.destroy();
        priceChart = new Chart(pEl, {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label:'Price',  data:prices,  borderColor:'#a78bfa', borderWidth:2, pointRadius:0, tension:0.3, fill:false },
              { label:'BB Upper', data:bbUpper, borderColor:'rgba(250,204,21,0.5)', borderWidth:1, pointRadius:0, borderDash:[4,4], fill:false },
              { label:'BB Mid',   data:bbMid,   borderColor:'rgba(250,204,21,0.3)', borderWidth:1, pointRadius:0, borderDash:[2,4], fill:false },
              { label:'BB Lower', data:bbLower, borderColor:'rgba(250,204,21,0.5)', borderWidth:1, pointRadius:0, borderDash:[4,4], fill:false },
            ]
          },
          options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#94a3b8', boxWidth:12 } } }, scales:{ x:{ ticks:{ color:'#64748b', maxTicksLimit:10 }, grid:{ color:'rgba(255,255,255,0.04)' } }, y:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.04)' } } } }
        });
      }
      // MACD chart
      const mEl = document.getElementById('az-macd-chart');
      if (mEl) {
        new Chart(mEl, {
          type:'bar',
          data: {
            labels,
            datasets: [
              { label:'Histogram', data:mcd.hist, backgroundColor: mcd.hist.map(v => v>=0?'rgba(74,222,128,0.6)':'rgba(248,113,113,0.6)'), borderRadius:2 },
              { label:'MACD',   data:mcd.macd,   borderColor:'#a78bfa', borderWidth:1.5, type:'line', pointRadius:0, tension:0.3, fill:false },
              { label:'Signal', data:mcd.signal, borderColor:'#f59e0b', borderWidth:1.5, type:'line', pointRadius:0, tension:0.3, fill:false },
            ]
          },
          options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#94a3b8', boxWidth:10 } } }, scales:{ x:{ ticks:{ color:'#64748b', maxTicksLimit:10 }, grid:{ color:'rgba(255,255,255,0.04)' } }, y:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.04)' } } } }
        });
      }
    }, 50);
  }

  // ── FUNDAMENTALS TAB ──
  function renderFundamentals(panel) {
    const s = stock();
    const f = getFundamentals(s.ticker);
    const cur = getCurrency(s.market);
    const ratingColor = { 'Strong Buy':'var(--green)', 'Buy':'#4ade80', 'Hold':'var(--gold)', 'Sell':'var(--red)', 'Strong Sell':'#f87171' };
    const rc = ratingColor[f.analystRating] || 'var(--muted)';
    const na = v => v === 'N/A' || v == null;

    panel.innerHTML = `
      <div class="az-fund-grid">
        ${[
          { label:'Revenue (Annual)', val: f.revenue, tip:'Total money the company earned last year' },
          { label:'Profit Margin',    val: f.margin,  tip:'What % of revenue becomes profit' },
          { label:'Debt / Equity',    val: f.debtEq,  tip:'How much debt vs shareholder funds — lower is safer' },
          { label:'Dividend Yield',   val: f.divYield,tip:'Annual income paid to shareholders as % of price' },
          { label:'P/E Ratio',        val: s.pe ? s.pe.toFixed(1)+'x' : 'N/A', tip:'Price divided by earnings — lower may mean better value' },
          { label:'EPS',              val: s.eps ? `${cur}${s.eps.toFixed(2)}` : 'N/A', tip:'Earnings per share — profit per single share' },
          { label:'Beta',             val: na(f.beta) ? 'N/A' : f.beta+'x', tip:'Volatility vs market — >1 means more volatile' },
          { label:'Market Cap',       val: s.mktCap,  tip:'Total value of all shares combined' },
        ].map(item => `
          <div class="az-fund-cell card">
            <div class="az-fund-label" title="${item.tip}">${item.label} <span class="az-fund-tip">?</span></div>
            <div class="az-fund-val">${item.val}</div>
            <div class="az-fund-tip-text">${item.tip}</div>
          </div>`).join('')}
      </div>

      <div class="card az-card" style="margin-top:16px">
        <div class="card-label">52-Week Range</div>
        ${na(f.week52L) ? '<p class="az-explain">No range data available.</p>' : (() => {
          const lo = f.week52L, hi = f.week52H, cur2 = s.price;
          const pct = Math.min(100, Math.max(0, ((cur2 - lo) / (hi - lo)) * 100));
          return `
            <div class="az-52w-bar-wrap">
              <span class="az-52w-lbl">${cur}${lo}</span>
              <div class="az-52w-bar">
                <div class="az-52w-fill" style="width:${pct.toFixed(1)}%"></div>
                <div class="az-52w-dot" style="left:${pct.toFixed(1)}%" title="Current: ${cur}${cur2}"></div>
              </div>
              <span class="az-52w-lbl">${cur}${hi}</span>
            </div>
            <p class="az-explain" style="margin-top:8px">Currently at <strong>${pct.toFixed(0)}%</strong> of its 52-week range — ${pct < 30 ? 'near lows, potential value.' : pct > 70 ? 'near highs, be cautious.' : 'in the middle of the range.'}</p>`;
        })()}
      </div>

      <div class="card az-card" style="margin-top:16px">
        <div class="card-label">Analyst Consensus</div>
        <div class="az-analyst-row">
          <div class="az-analyst-rating" style="color:${rc}">${f.analystRating}</div>
          <div class="az-analyst-target">
            <div class="az-fund-label">Price Target</div>
            <div class="az-fund-val">${na(f.analystTarget) ? 'N/A' : cur + f.analystTarget.toFixed(2)}</div>
          </div>
          ${!na(f.analystTarget) ? `<div class="az-analyst-upside" style="color:${f.analystTarget > s.price ? 'var(--green)' : 'var(--red)'}">
            ${f.analystTarget > s.price ? '▲' : '▼'} ${Math.abs(((f.analystTarget - s.price)/s.price)*100).toFixed(1)}% ${f.analystTarget > s.price ? 'upside' : 'downside'}
          </div>` : ''}
        </div>
      </div>`;
  }

  // ── AI MEMO TAB ──
  function renderMemo(panel) {
    const s   = stock();
    const sig = getSignal(s);
    const f   = getFundamentals(s.ticker);
    const cur = getCurrency(s.market);

    panel.innerHTML = `
      <div class="card az-card">
        <div class="card-label">AI Investment Memo — ${s.ticker}</div>
        <div id="az-memo-body">
          <div class="az-memo-auto">
            <div class="memo-section">
              <div class="memo-heading">Signal Summary</div>
              <p><span class="signal-pill pill-${sig.cls}">${sig.signal}</span> <span style="color:var(--muted);margin-left:8px">Confidence ${sig.conf}%</span></p>
              <p>${getSignalReason(s)}</p>
            </div>
            <div class="memo-section">
              <div class="memo-heading">Technicals</div>
              <p>RSI is <strong>${s.rsi}</strong> — ${s.rsi < 30 ? 'oversold, potential bounce.' : s.rsi > 70 ? 'overbought, consider waiting.' : 'in neutral territory.'} The 20-day moving average (${cur}${s.ma20.toFixed(2)}) is ${s.ma20 > s.ma50 ? 'above' : 'below'} the 50-day (${cur}${s.ma50.toFixed(2)}), indicating a ${s.ma20 > s.ma50 ? 'bullish uptrend' : 'bearish downtrend'}.</p>
            </div>
            <div class="memo-section">
              <div class="memo-heading">Key Metrics</div>
              <p>Market cap: <strong>${s.mktCap}</strong>. P/E ratio: <strong>${s.pe ? s.pe.toFixed(1)+'x' : 'N/A'}</strong>. Annual revenue: <strong>${f.revenue}</strong>. Profit margin: <strong>${f.margin}</strong>. Analyst target: <strong>${f.analystTarget !== 'N/A' ? cur + f.analystTarget : 'N/A'}</strong> (${f.analystRating}).</p>
            </div>
            <div class="memo-section">
              <div class="memo-heading">Risk Assessment</div>
              <p>Beta of <strong>${f.beta !== 'N/A' ? f.beta+'x' : 'N/A'}</strong> vs the market. ${f.beta !== 'N/A' && +f.beta > 1.5 ? 'High volatility — suitable for experienced investors only.' : f.beta !== 'N/A' && +f.beta < 0.7 ? 'Low volatility — relatively stable compared to the market.' : 'Moderate volatility — reasonable for most investors.'} ${s.isETF ? 'As an ETF, this is already diversified — lower single-stock risk.' : ''}</p>
            </div>
            <div class="memo-section">
              <div class="memo-heading">Plain-English Verdict</div>
              <p>${sig.signal === 'STRONG BUY' || sig.signal === 'BUY'
                ? `If you have spare cash, <strong>${s.ticker}</strong> looks like a reasonable entry. Don't put everything in — consider 5–15% of your portfolio.`
                : sig.signal === 'HOLD'
                ? `No urgent action needed on <strong>${s.ticker}</strong>. If you own it, hold it. If you don't, wait for a better entry.`
                : `<strong>${s.ticker}</strong> is flashing caution signals. Not the right time to buy. If you own it, think about whether you still believe in the long-term story.`
              }</p>
            </div>
          </div>
          ${CONFIG.GEMINI_KEY ? `
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
              <button class="btn-primary" id="az-gemini-btn" onclick="generateGeminiMemo()">✨ Generate AI-Enhanced Memo</button>
              <div id="az-gemini-out" style="margin-top:12px"></div>
            </div>` : `
            <div class="cors-warning" style="margin-top:16px">
              <strong>Want AI-enhanced analysis?</strong> Add your free Gemini API key in Settings to generate a personalised investment memo for ${s.name}.
            </div>`}
        </div>
      </div>`;

    window.generateGeminiMemo = async function() {
      const btn = document.getElementById('az-gemini-btn');
      const out = document.getElementById('az-gemini-out');
      btn.disabled = true; btn.textContent = '⏳ Generating…';
      out.innerHTML = '<div style="color:var(--muted)">Asking Gemini to analyse this stock…</div>';
      const prompt = `Write a concise investment memo for a beginner investor about ${s.name} (${s.ticker}) on ${s.market} market. Current price: ${cur}${s.price}. RSI: ${s.rsi}. MA20: ${s.ma20}, MA50: ${s.ma50}. Signal: ${sig.signal}. Revenue: ${f.revenue}, Margin: ${f.margin}, P/E: ${s.pe || 'N/A'}. Analyst rating: ${f.analystRating}. Keep it friendly, clear, under 200 words. Include: what the company does, current signal, key risk, your plain-English recommendation.`;
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{ parts:[{ text:prompt }] }] })
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          out.innerHTML = `<div class="az-gemini-result">${text.replace(/\n/g,'<br>')}</div>`;
        } else {
          out.innerHTML = '<div style="color:var(--red)">No response from Gemini. Check your API key in Settings.</div>';
        }
      } catch(e) {
        out.innerHTML = `<div style="color:var(--red)">Error: ${e.message}</div>`;
      }
      btn.disabled = false; btn.textContent = '✨ Regenerate';
    };
  }

  // ── NEWS items (per-stock + market) ──
  const NEWS_ITEMS = [
    { title:'Fed holds rates steady — markets rally on pause signal', sentiment:'positive', impact:'high', source:'Reuters', time:'2h ago', what:'Lower rates mean cheaper borrowing — good for growth stocks like tech.', tickers:[] },
    { title:'US jobs report beats expectations, unemployment falls to 3.7%', sentiment:'positive', impact:'high', source:'Bloomberg', time:'4h ago', what:'Strong jobs = strong economy = good for consumer and retail stocks.', tickers:[] },
    { title:'Oil prices surge 4% on Middle East supply concerns', sentiment:'negative', impact:'medium', source:'FT', time:'5h ago', what:'Higher oil costs squeeze margins for transport and consumer companies.', tickers:[] },
    { title:'Apple reports record iPhone sales in China despite headwinds', sentiment:'positive', impact:'high', source:'CNBC', time:'1d ago', what:'Strong China sales boost Apple\'s growth story and investor confidence.', tickers:['AAPL'] },
    { title:'NVIDIA data center revenue hits new all-time high', sentiment:'positive', impact:'high', source:'Bloomberg', time:'2d ago', what:'AI chip demand remains insatiable — NVIDIA is the clear market leader.', tickers:['NVDA'] },
    { title:'Tesla deliveries miss Q4 estimates by 8%', sentiment:'negative', impact:'high', source:'Reuters', time:'3d ago', what:'Slower EV demand growth raises questions about Tesla\'s near-term targets.', tickers:['TSLA'] },
    { title:'Microsoft Azure cloud growth accelerates to 31% YoY', sentiment:'positive', impact:'high', source:'CNBC', time:'1d ago', what:'Cloud and AI products driving Microsoft\'s strongest growth segment.', tickers:['MSFT'] },
    { title:'AstraZeneca raises full-year guidance on cancer drug pipeline', sentiment:'positive', impact:'medium', source:'FT', time:'2d ago', what:'New drug approvals and pipeline strength support AZN\'s long-term growth.', tickers:['AZN'] },
    { title:'Amazon AWS logs 17% revenue growth, beats estimates', sentiment:'positive', impact:'high', source:'Reuters', time:'1d ago', what:'Cloud division continues to be Amazon\'s most profitable business unit.', tickers:['AMZN'] },
    { title:'Alphabet faces EU antitrust probe over AI search practices', sentiment:'negative', impact:'medium', source:'Bloomberg', time:'3d ago', what:'Regulatory risk could limit Google\'s AI monetisation in Europe.', tickers:['GOOGL'] },
    { title:'Nike revenue falls for third consecutive quarter', sentiment:'negative', impact:'high', source:'WSJ', time:'2d ago', what:'Consumer slowdown in key markets weighing on Nike\'s top line.', tickers:['NKE'] },
    { title:'HSBC World Islamic ETF sees record £420M inflows in Q1', sentiment:'positive', impact:'medium', source:'ETF Stream', time:'4d ago', what:'Growing demand for ethical investing products boosting Islamic ETF assets.', tickers:['HMWO'] },
    { title:'S&P 500 ETFs draw $18B in weekly inflows amid AI optimism', sentiment:'positive', impact:'medium', source:'FT', time:'5d ago', what:'Passive index funds continuing to attract strong investor capital.', tickers:['VUSA','CSPX','SPY','VUAG'] },
    { title:'AMD gains market share in server CPUs against Intel', sentiment:'positive', impact:'medium', source:'Reuters', time:'2d ago', what:'AMD\'s EPYC processors winning enterprise deals — growth catalyst.', tickers:['AMD'] },
    { title:'Unilever cuts 7,500 jobs in restructuring drive', sentiment:'neutral', impact:'medium', source:'BBC', time:'3d ago', what:'Cost cuts may improve margins but also signal weaker near-term growth.', tickers:['ULVR'] },
  ];

  // ── NEWS TAB ──
  function renderNews(panel) {
    const s = stock();
    const items = NEWS_ITEMS.filter(n => n.tickers && n.tickers.includes(s.ticker));
    const general = NEWS_ITEMS.filter(n => !n.tickers || !n.tickers.length).slice(0, 3);
    const all = [...items, ...general].slice(0, 6);

    const pos = all.filter(n => n.sentiment === 'positive').length;
    const neg = all.filter(n => n.sentiment === 'negative').length;
    const neu = all.length - pos - neg;
    const total = all.length || 1;

    panel.innerHTML = `
      <div class="card az-card">
        <div class="card-label">Sentiment Score — ${s.name}</div>
        <div class="sentiment-bar" style="margin:12px 0">
          <div class="sb-pos" style="width:${(pos/total*100).toFixed(0)}%">${pos > 0 ? pos + ' positive' : ''}</div>
          <div class="sb-neu" style="width:${(neu/total*100).toFixed(0)}%">${neu > 0 ? neu + ' neutral' : ''}</div>
          <div class="sb-neg" style="width:${(neg/total*100).toFixed(0)}%">${neg > 0 ? neg + ' negative' : ''}</div>
        </div>
        <p class="az-explain">${pos > neg ? '🟢 Mostly positive news — market sentiment is favourable.' : neg > pos ? '🔴 More negative than positive coverage — stay alert.' : '🟡 Mixed or neutral news flow.'}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
        ${all.length ? all.map(n => `
          <div class="news-card card">
            <div class="news-top">
              <span class="news-impact impact-${n.impact}">${n.impact.toUpperCase()}</span>
              <span class="news-sentiment sent-${n.sentiment}">${n.sentiment}</span>
              <span class="news-source">${n.source} · ${n.time}</span>
            </div>
            <div class="news-title">${n.title}</div>
            <div class="news-what">💡 ${n.what}</div>
          </div>`).join('') : '<div class="card az-card" style="color:var(--muted)">No specific news found for this ticker. Showing general market news below.</div>'}
      </div>`;
  }

  // ── Hero bar ──
  function renderHero() {
    const s  = stock();
    const sig = getSignal(s);
    const cur = getCurrency(s.market);
    const chgColor = s.chg >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('az-hero').innerHTML = `
      <div class="az-hero-left">
        <span class="az-hero-emoji">${s.emoji}</span>
        <div>
          <div class="az-hero-ticker">${s.ticker} <span class="az-hero-market">${s.market} · ${s.isETF ? 'ETF' : s.sector}</span></div>
          <div class="az-hero-name">${s.name}</div>
        </div>
      </div>
      <div class="az-hero-right">
        <div class="az-hero-price">${cur}${Math.abs(s.price).toFixed(s.price < 10 ? 4 : 2)}</div>
        <div style="color:${chgColor};font-weight:600">${s.chg >= 0 ? '+' : ''}${s.chg.toFixed(2)}% today</div>
        <span class="signal-pill pill-${sig.cls}">${sig.signal}</span>
      </div>`;
  }

  // ── Boot ──
  render();
})();
