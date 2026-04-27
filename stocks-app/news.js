// ─── NEWS PAGE ────────────────────────────────────────────────────────────────

const NEWS = [
  // Market-wide
  { id:1, cat:'market', headline:'Fed holds interest rates steady — markets rally on hopes of summer cuts', summary:'The Federal Reserve kept rates unchanged for the third consecutive meeting, signalling potential cuts later this year. US stocks surged on the news, with the S&P 500 gaining 0.9%.', sentiment:'positive', impact:'high', time:'2h ago', tickers:[], source:'Reuters' },
  { id:2, cat:'market', headline:'UK inflation drops to 2.8% — lowest in 3 years', summary:'UK CPI fell to 2.8%, beating analyst forecasts of 3.1%. This raises hopes that the Bank of England may cut rates sooner than expected, boosting UK stocks and consumer confidence.', sentiment:'positive', impact:'high', time:'4h ago', tickers:['ULVR','AZN','GSK'], source:'BBC Business' },
  { id:3, cat:'market', headline:'Global tech stocks dip as China tensions rise', summary:'Concerns over US-China trade relations sent semiconductor stocks lower. NVIDIA, AMD, and ARM all fell 1–3% in early trading before recovering partially.', sentiment:'negative', impact:'medium', time:'6h ago', tickers:['NVDA','AMD','ARM'], source:'FT' },
  // US Stocks
  { id:4, cat:'US', headline:'Apple announces record services revenue — stock up 1.2%', summary:'Apple reported $23.1B in services revenue for Q1, beating estimates by 8%. CEO Tim Cook highlighted AI integration in iPhone as a key growth driver going forward.', sentiment:'positive', impact:'medium', time:'1h ago', tickers:['AAPL'], source:'CNBC' },
  { id:5, cat:'US', headline:'NVIDIA\'s AI chip demand exceeds supply — backlog grows to 12 months', summary:'NVIDIA confirmed demand for its H100 and H200 AI chips continues to outpace production capacity. Analysts raised price targets, with the stock up 2.4% on the session.', sentiment:'positive', impact:'high', time:'3h ago', tickers:['NVDA'], source:'Bloomberg' },
  { id:6, cat:'US', headline:'Tesla misses delivery targets for second quarter running', summary:'Tesla delivered 386,000 vehicles in Q1, below Wall Street expectations of 408,000. The company cited production disruptions at its Berlin factory and softer European demand.', sentiment:'negative', impact:'high', time:'5h ago', tickers:['TSLA'], source:'Reuters' },
  { id:7, cat:'US', headline:'Microsoft Azure cloud revenue grows 21% year-on-year', summary:'Microsoft\'s cloud division continues to outperform, driven by AI services. The company said Copilot AI integration is accelerating enterprise adoption of Azure.', sentiment:'positive', impact:'medium', time:'7h ago', tickers:['MSFT'], source:'WSJ' },
  { id:8, cat:'US', headline:'Nike sales fall in North America as consumer spending weakens', summary:'Nike reported a 3% decline in North American revenue, blaming cautious consumer spending and inventory challenges. The stock fell 0.9%, extending its 12-month decline.', sentiment:'negative', impact:'medium', time:'1d ago', tickers:['NKE'], source:'CNBC' },
  { id:9, cat:'US', headline:'AMD gains market share from Intel — data centre chips up 80%', summary:'AMD\'s data centre division posted $2.3B in revenue, up 80% year-on-year. The company is rapidly taking share from Intel in server CPUs, boosting investor confidence.', sentiment:'positive', impact:'high', time:'8h ago', tickers:['AMD'], source:'The Verge' },
  { id:10, cat:'US', headline:'Amazon Web Services adds 500 new AI features in latest update', summary:'AWS announced 500 new AI and machine learning features at its annual re:Invent developer conference. Amazon shares rose 1.5% as investors cheered the cloud expansion.', sentiment:'positive', impact:'medium', time:'1d ago', tickers:['AMZN'], source:'TechCrunch' },
  // UK Stocks
  { id:11, cat:'UK', headline:'AstraZeneca lung cancer drug gets FDA approval — shares jump 1.8%', summary:'AstraZeneca\'s Tagrisso received expanded FDA approval for early-stage lung cancer treatment. The approval significantly expands the addressable market for the drug in the US.', sentiment:'positive', impact:'high', time:'2h ago', tickers:['AZN'], source:'Pharma Journal' },
  { id:12, cat:'UK', headline:'GSK wins key patent case — stock rises 1.2%', summary:'GSK successfully defended a patent challenge for its respiratory drug Trelegy, protecting an estimated $800M in annual revenues from generic competition until 2031.', sentiment:'positive', impact:'medium', time:'4h ago', tickers:['GSK'], source:'FT' },
  { id:13, cat:'UK', headline:'Vodafone agrees £15B merger with Three UK — competition review begins', summary:'Vodafone and Three UK have agreed terms on their proposed £15B merger. The deal now faces a lengthy review by the UK Competition and Markets Authority, expected to last 12–18 months.', sentiment:'neutral', impact:'medium', time:'1d ago', tickers:['VOD'], source:'Sky News' },
  { id:14, cat:'UK', headline:'Unilever cuts 3,200 jobs as part of restructuring plan', summary:'Unilever announced plans to cut approximately 3,200 roles globally and spin off its ice cream division (Ben & Jerry\'s, Magnum). The restructuring is expected to save £800M annually.', sentiment:'neutral', impact:'high', time:'2d ago', tickers:['ULVR'], source:'Guardian' },
  { id:15, cat:'UK', headline:'Rio Tinto secures £2.8B lithium project in Serbia', summary:'Rio Tinto\'s Jadar lithium project in Serbia received final approval after years of delays. The project could supply enough lithium for over 1M electric vehicle batteries annually by 2027.', sentiment:'positive', impact:'high', time:'3h ago', tickers:['RIO'], source:'Mining Weekly' },
];

const SENTIMENT_LABELS = { positive:'🟢 Positive', negative:'🔴 Negative', neutral:'🟡 Neutral' };
const IMPACT_LABELS    = { high:'🔥 High Impact', medium:'📊 Medium', low:'ℹ Low' };

let activeFilter = 'all';

function renderTicker() {
  const items = [{name:'S&P 500',val:'5,218',chg:'+0.42%',pos:true},{name:'FTSE 100',val:'8,147',chg:'+0.18%',pos:true},{name:'NASDAQ',val:'16,742',chg:'+0.88%',pos:true},{name:'Gold',val:'$2,339',chg:'-0.21%',pos:false}];
  document.getElementById('mktTicker').innerHTML = items.map(i=>`<div class="ti"><span class="ti-name">${i.name}</span><span class="ti-val">${i.val}</span><span class="ti-chg ${i.pos?'pos':'neg'}">${i.chg}</span></div>`).join('');
}

function sentimentColor(s) {
  return s === 'positive' ? 'var(--green)' : s === 'negative' ? 'var(--red)' : 'var(--gold)';
}

function renderSentimentBar() {
  const pos  = NEWS.filter(n => n.sentiment === 'positive').length;
  const neg  = NEWS.filter(n => n.sentiment === 'negative').length;
  const neu  = NEWS.filter(n => n.sentiment === 'neutral').length;
  const total = NEWS.length;
  return `
    <div class="chart-box" style="padding:22px">
      <div class="section-title" style="margin-bottom:16px">📡 Market Sentiment Today</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px">
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--green)">${pos}</div>
          <div style="font-size:11px;color:var(--text2)">Positive stories</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--gold)">${neu}</div>
          <div style="font-size:11px;color:var(--text2)">Neutral stories</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--red)">${neg}</div>
          <div style="font-size:11px;color:var(--text2)">Negative stories</div>
        </div>
      </div>
      <div style="height:10px;background:var(--border);border-radius:6px;overflow:hidden;display:flex">
        <div style="width:${(pos/total)*100}%;background:var(--green);transition:.4s"></div>
        <div style="width:${(neu/total)*100}%;background:var(--gold);transition:.4s"></div>
        <div style="width:${(neg/total)*100}%;background:var(--red);transition:.4s"></div>
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;font-size:11px;color:var(--text2)">
        <div><span style="color:var(--green)">■</span> Positive (${Math.round((pos/total)*100)}%)</div>
        <div><span style="color:var(--gold)">■</span> Neutral (${Math.round((neu/total)*100)}%)</div>
        <div><span style="color:var(--red)">■</span> Negative (${Math.round((neg/total)*100)}%)</div>
      </div>
      <div style="margin-top:16px;padding:12px;background:var(--bg2);border-radius:var(--rs);font-size:13px;color:var(--text2)">
        <strong style="color:var(--text)">Overall mood: ${pos > neg ? '🟢 Cautiously Bullish' : pos < neg ? '🔴 Cautiously Bearish' : '🟡 Mixed'}</strong> —
        ${pos > neg ? 'More positive than negative stories today. Markets appear to be in a confident mood. A reasonable time to hold or add to positions.' : 'More negative stories than positive today. Consider being cautious with new buys and watch your holdings closely.'}
      </div>
    </div>`;
}

function renderNews() {
  let filtered = NEWS;
  if (activeFilter === 'US')       filtered = NEWS.filter(n => n.cat === 'US');
  if (activeFilter === 'UK')       filtered = NEWS.filter(n => n.cat === 'UK');
  if (activeFilter === 'market')   filtered = NEWS.filter(n => n.cat === 'market');
  if (activeFilter === 'positive') filtered = NEWS.filter(n => n.sentiment === 'positive');
  if (activeFilter === 'negative') filtered = NEWS.filter(n => n.sentiment === 'negative');

  return filtered.map(n => {
    const col   = sentimentColor(n.sentiment);
    const ticks = n.tickers.map(t => `<a href="screener.html?ticker=${t}" style="font-size:10px;font-weight:700;color:var(--gold);background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.2);padding:2px 7px;border-radius:10px;text-decoration:none">${t}</a>`).join('');
    return `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden;transition:var(--t)" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="position:absolute;left:0;top:0;width:3px;height:100%;background:${col}"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <span style="font-size:10px;font-weight:700;color:${col};background:${col}18;border:1px solid ${col}40;padding:2px 8px;border-radius:10px">${SENTIMENT_LABELS[n.sentiment]}</span>
            <span style="font-size:10px;font-weight:600;color:var(--text3)">${IMPACT_LABELS[n.impact]}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            ${ticks}
            <span style="font-size:11px;color:var(--text3)">${n.time} · ${n.source}</span>
          </div>
        </div>
        <div style="font-size:15px;font-weight:700;color:var(--text);line-height:1.4">${n.headline}</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6">${n.summary}</div>
        ${n.tickers.length ? `<div style="font-size:12px;color:var(--text2)">📊 <strong>What this means for you:</strong> ${explainImpact(n)}</div>` : ''}
      </div>`;
  }).join('');
}

function explainImpact(n) {
  if (n.sentiment === 'positive' && n.impact === 'high') return 'This is good news for the stocks mentioned. If you own any of them, this supports holding. If you don\'t, watch for a pullback before buying.';
  if (n.sentiment === 'positive')                        return 'Mildly good news. Not a reason to act immediately, but adds confidence to holding these stocks.';
  if (n.sentiment === 'negative' && n.impact === 'high') return 'This is bad news for the stocks mentioned. If you own any, check the signal page. You may want to hold and wait, or set a mental stop-loss level.';
  if (n.sentiment === 'negative')                        return 'Minor negative news. Don\'t panic-sell. Check if the signal has changed — if it\'s still HOLD or BUY, the dip may be temporary.';
  return 'Mixed/neutral news. No immediate action needed. Monitor for follow-up developments.';
}

function renderEconomicCalendar() {
  const events = [
    { date:'Mon 29 Apr', time:'15:00',  event:'US Consumer Confidence',        impact:'high',   forecast:'103.5', prev:'104.7', affect:'S&P 500, retail stocks, consumer ETFs' },
    { date:'Wed 1 May',  time:'19:00',  event:'Fed Interest Rate Decision',    impact:'high',   forecast:'5.25%', prev:'5.25%', affect:'All US stocks — high volatility expected' },
    { date:'Wed 1 May',  time:'19:30',  event:'Fed Press Conference',          impact:'high',   forecast:'—',     prev:'—',     affect:'Markets move on every word — expect swings' },
    { date:'Thu 2 May',  time:'13:30',  event:'US Jobless Claims',             impact:'medium', forecast:'212K',  prev:'207K',  affect:'USD, tech stocks, growth sectors' },
    { date:'Fri 3 May',  time:'13:30',  event:'US Non-Farm Payrolls (NFP)',    impact:'high',   forecast:'+238K', prev:'+303K', affect:'Biggest monthly jobs report — moves all markets' },
    { date:'Fri 3 May',  time:'13:30',  event:'US Unemployment Rate',         impact:'high',   forecast:'3.8%',  prev:'3.7%',  affect:'All US markets, dollar strength' },
    { date:'Tue 7 May',  time:'07:00',  event:'UK Halifax House Price Index', impact:'low',    forecast:'+0.2%', prev:'+0.3%', affect:'UK consumer stocks, ULVR, CPG' },
    { date:'Wed 8 May',  time:'07:00',  event:'UK GDP (Q1 Preliminary)',       impact:'high',   forecast:'+0.4%', prev:'+0.1%', affect:'FTSE 100, UK stocks, GBP/USD' },
    { date:'Thu 9 May',  time:'12:00',  event:'Bank of England Rate Decision', impact:'high',   forecast:'5.25%','prev':'5.25%',affect:'UK stocks, ISF ETF, FTSE 100' },
    { date:'Fri 10 May', time:'07:00',  event:'UK Trade Balance',              impact:'low',    forecast:'-£3.2B','prev':'-£3.0B',affect:'GBP currency, import/export stocks' },
    { date:'Tue 14 May', time:'13:30',  event:'US CPI Inflation',              impact:'high',   forecast:'+3.4%','prev':'+3.5%',affect:'Biggest inflation print — moves all markets' },
    { date:'Wed 15 May', time:'13:30',  event:'US Retail Sales',               impact:'high',   forecast:'+0.3%','prev':'+0.7%',affect:'Consumer stocks: WMT, COST, NKE, AMZN' },
  ];

  const impactColor = { high:'var(--red)', medium:'var(--gold)', low:'var(--text3)' };

  return `
    <div class="chart-box" style="padding:22px;margin-bottom:16px">
      <div class="section-title" style="margin-bottom:16px">📅 Economic Calendar — Next 2 Weeks</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px">Key dates that could move markets. High-impact events = expect price swings. Best to avoid new trades on these days unless you're confident.</p>
      <div class="eco-cal-table">
        <div class="eco-cal-hd">
          <span>Date / Time</span><span>Event</span><span>Impact</span><span>Forecast</span><span>Previous</span><span>Affects</span>
        </div>
        ${events.map(e => `
          <div class="eco-cal-row impact-row-${e.impact}">
            <div class="eco-date"><div>${e.date}</div><div style="color:var(--text3);font-size:11px">${e.time} GMT</div></div>
            <div class="eco-event">${e.event}</div>
            <div><span class="eco-impact-pill" style="background:${impactColor[e.impact]}22;color:${impactColor[e.impact]};border:1px solid ${impactColor[e.impact]}44">${e.impact.toUpperCase()}</span></div>
            <div class="eco-num eco-forecast">${e.forecast}</div>
            <div class="eco-num" style="color:var(--text3)">${e.prev}</div>
            <div class="eco-affects">${e.affect}</div>
          </div>`).join('')}
      </div>
      <p style="font-size:11px;color:var(--text3);margin-top:12px">All times in GMT. Forecasts are estimates — actual results drive market moves.</p>
    </div>`;
}

function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('news-list').innerHTML = renderNews();
}

function init() {
  sharedInit('news');
  renderTicker();
  document.getElementById('page').innerHTML = `
    <div class="page-hd">
      <div><div class="page-title">Market News</div><div class="page-sub">Headlines, sentiment & upcoming events</div></div>
      <span style="font-size:11px;color:var(--text3)">Demo data · Updates with live API key</span>
    </div>
    ${renderSentimentBar()}
    ${renderEconomicCalendar()}
    <div class="section">
      <div class="section-hd">
        <div class="section-title">📰 Latest Headlines</div>
      </div>
      <div class="filter-bar">
        <button class="filter-btn active" onclick="setFilter('all',this)">All (${NEWS.length})</button>
        <button class="filter-btn" onclick="setFilter('market',this)">🌍 Market</button>
        <button class="filter-btn" onclick="setFilter('US',this)">🇺🇸 US</button>
        <button class="filter-btn" onclick="setFilter('UK',this)">🇬🇧 UK</button>
        <button class="filter-btn" onclick="setFilter('positive',this)">🟢 Positive</button>
        <button class="filter-btn" onclick="setFilter('negative',this)">🔴 Negative</button>
      </div>
      <div id="news-list" style="display:flex;flex-direction:column;gap:12px">${renderNews()}</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', init);
