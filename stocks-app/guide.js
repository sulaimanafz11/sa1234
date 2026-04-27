// ─── MY GUIDE PAGE ────────────────────────────────────────────────────────────
// Written so a complete beginner knows EXACTLY what to do.

function getBuyRecommendations() {
  return [...STOCKS]
    .map(s => ({ ...s, sig: getSignal(s) }))
    .filter(s => s.sig.cls === 'buy')
    .sort((a, b) => b.sig.conf - a.sig.conf)
    .slice(0, 3);
}

function riskLabel(ticker) {
  const highRisk  = ['TSLA','NVDA','AMD','ARM','VOD'];
  const lowRisk   = ['AAPL','MSFT','JNJ','PG','AZN','ULVR','GSK','REL'];
  if (highRisk.includes(ticker)) return { label:'High Risk', color:'var(--red)',   tip:'Can move ±5% in a day. Only put a small amount here.' };
  if (lowRisk.includes(ticker))  return { label:'Low Risk',  color:'var(--green)', tip:'Stable, large company. Good for beginners.'           };
  return                                 { label:'Medium Risk',color:'var(--gold)', tip:'Normal volatility. Fine for most investors.'          };
}

function howMuchToBuy(stock, totalCash) {
  const risk = riskLabel(stock.ticker);
  const maxPct = risk.label === 'High Risk' ? 0.10 : risk.label === 'Low Risk' ? 0.25 : 0.20;
  const amount = totalCash * maxPct;
  const shares = amount / stock.price;
  const cur    = getCurrency(stock.market);
  return { amount, shares, maxPct, cur };
}

function renderHero() {
  return `
    <div style="background:linear-gradient(135deg,#0f1c2e 0%,#142035 60%,#0f1c2e 100%);border:1px solid var(--border2);border-radius:var(--r);padding:32px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(245,166,35,0.08),transparent 70%);pointer-events:none"></div>
      <div style="font-size:13px;color:var(--gold);font-weight:600;letter-spacing:.5px;margin-bottom:10px">★ YOUR PERSONAL GUIDE</div>
      <h1 style="font-size:28px;font-weight:900;letter-spacing:-.5px;margin-bottom:10px">What should I do with my money?</h1>
      <p style="font-size:15px;color:var(--text2);max-width:600px;line-height:1.7">This page tells you exactly what to buy, how much to spend, and when to sell — explained so simply that anyone can follow it. No jargon. Just clear steps.</p>
    </div>`;
}

function renderRules() {
  const rules = [
    { icon:'💰', title:'Only invest money you don\'t need', body:'If you need this money in the next 6 months — for rent, bills, emergencies — do NOT invest it. Stocks go up AND down. You might need to wait to get your money back.' },
    { icon:'🎯', title:'Spread across 4–5 stocks max', body:'Don\'t put all your money into one stock. If that one company has bad news, you lose everything. Spread it out. Think of it like not putting all your eggs in one basket.' },
    { icon:'📏', title:'Max 20% per stock (Max 25% for safe ones)', body:'With £200, that means no more than £40 per stock normally, or £50 for very safe, big companies like Apple or AstraZeneca.' },
    { icon:'⏳', title:'Think in months, not days', body:'Don\'t check your portfolio every hour. Stocks bounce around daily — that\'s normal. Check once a week. Think about where the stock will be in 6–12 months.' },
    { icon:'🚫', title:'Never sell in a panic', body:'If a stock drops 5%, don\'t panic and sell. Check the signal first. If it still says HOLD or BUY, the dip is probably temporary. Selling in panic locks in your loss.' },
    { icon:'📖', title:'Always know WHY you bought it', body:'Before buying, write down one reason why. "NVIDIA is making chips for AI and demand is huge." If that reason is still true, hold it. If it\'s not true anymore, then consider selling.' },
  ];

  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">📋 The Golden Rules (Read these first)</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${rules.map(r => `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px;display:flex;gap:14px">
            <div style="font-size:24px;flex-shrink:0;line-height:1">${r.icon}</div>
            <div>
              <div style="font-size:14px;font-weight:700;margin-bottom:5px">${r.title}</div>
              <div style="font-size:13px;color:var(--text2);line-height:1.6">${r.body}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderBuyNow() {
  const recs   = getBuyRecommendations();
  const budget = 200;

  const cards = recs.map((s, i) => {
    const risk  = riskLabel(s.ticker);
    const alloc = howMuchToBuy(s, budget);
    const cur   = alloc.cur;
    return `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;position:relative">
        <div style="background:rgba(0,208,156,0.06);border-bottom:1px solid var(--border);padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px">RECOMMENDED BUY #${i+1}</div>
            <div style="font-size:20px;font-weight:900;margin-top:2px">${s.emoji} ${s.ticker}</div>
            <div style="font-size:12px;color:var(--text2)">${s.name}</div>
          </div>
          <div style="text-align:right">
            <div class="pill pill-buy" style="font-size:11px">${s.sig.signal}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:6px">${s.sig.conf}% confidence</div>
          </div>
        </div>
        <div style="padding:18px 20px;display:flex;flex-direction:column;gap:14px">
          <div style="font-size:14px;color:var(--text2);line-height:1.6">${getSignalReason(s)}</div>

          <div style="background:var(--bg2);border-radius:var(--rs);padding:16px">
            <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px">💰 How much to invest (from £${budget} budget)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
              <div>
                <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Invest</div>
                <div style="font-size:18px;font-weight:800;color:var(--gold)">£${alloc.amount.toFixed(0)}</div>
                <div style="font-size:10px;color:var(--text3)">${(alloc.maxPct*100).toFixed(0)}% of budget</div>
              </div>
              <div>
                <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">That buys</div>
                <div style="font-size:18px;font-weight:800">${alloc.shares.toFixed(3)} shares</div>
                <div style="font-size:10px;color:var(--text3)">at ${cur}${s.price.toFixed(2)}/share</div>
              </div>
              <div>
                <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Risk Level</div>
                <div style="font-size:15px;font-weight:700;color:${risk.color}">${risk.label}</div>
                <div style="font-size:10px;color:var(--text3)">${risk.tip}</div>
              </div>
            </div>
          </div>

          <div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.15);border-radius:var(--rs);padding:12px;font-size:12px;color:var(--text2)">
            <strong style="color:var(--gold)">When to sell:</strong> If the signal changes to SELL, OR if it goes up 20–30% and you want to lock in profit. Set a mental stop: if it drops 15% from your buy price, consider cutting your loss.
          </div>

          <a href="screener.html?ticker=${s.ticker}" class="btn btn-gold" style="text-align:center;justify-content:center">View Full Analysis →</a>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-hd">
        <div class="section-title">🟢 What to Buy Right Now</div>
        <span style="font-size:11px;color:var(--text3)">Based on signals today</span>
      </div>
      <div style="background:rgba(0,208,156,0.05);border:1px solid rgba(0,208,156,0.15);border-radius:var(--rs);padding:14px;font-size:13px;color:var(--text2);margin-bottom:4px">
        ✅ These are the <strong style="color:var(--text)">top BUY signals right now</strong>. This doesn't mean guaranteed profit — it means the data looks good for buying. Only invest what you can afford to leave alone.
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">${cards}</div>
    </div>`;
}

function renderBudgetPlan() {
  const budget = 200;
  const recs   = getBuyRecommendations();

  const allocs = recs.map(s => {
    const a = howMuchToBuy(s, budget);
    return { ...s, ...a };
  });
  const totalSpend = allocs.reduce((sum, a) => sum + a.amount, 0);
  const cashLeft   = budget - totalSpend;

  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">📊 Your £${budget} Budget Plan</div></div>
      <div class="chart-box">
        <div style="font-size:14px;color:var(--text2);margin-bottom:18px">Here's exactly how to split your £${budget} across the top picks:</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${allocs.map(a => `
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:36px;text-align:center;font-size:18px">${a.emoji}</div>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:13px;font-weight:700">${a.ticker} — ${a.name}</span>
                  <span style="font-size:13px;font-weight:700;color:var(--gold)">£${a.amount.toFixed(0)}</span>
                </div>
                <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                  <div style="width:${(a.amount/budget)*100}%;height:100%;background:var(--green);border-radius:3px"></div>
                </div>
              </div>
              <div style="width:60px;text-align:right;font-size:11px;color:var(--text3)">${(a.maxPct*100).toFixed(0)}%</div>
            </div>`).join('')}
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;text-align:center;font-size:18px">💵</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                <span style="font-size:13px;font-weight:700">Keep as Cash (safety buffer)</span>
                <span style="font-size:13px;font-weight:700;color:var(--text2)">£${cashLeft.toFixed(0)}</span>
              </div>
              <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                <div style="width:${(cashLeft/budget)*100}%;height:100%;background:var(--border2);border-radius:3px"></div>
              </div>
            </div>
            <div style="width:60px;text-align:right;font-size:11px;color:var(--text3)">${((cashLeft/budget)*100).toFixed(0)}%</div>
          </div>
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--bg2);border-radius:var(--rs);font-size:12px;color:var(--text2)">
          💡 <strong style="color:var(--text)">Keep some cash.</strong> Always keep at least £20–30 unspent. If a great opportunity appears or one of your stocks dips, you'll have money ready to add more.
        </div>
      </div>
    </div>`;
}

function renderStepByStep() {
  const steps = [
    { n:'1', icon:'🔍', title:'Check the signal first', body:'Before buying anything, go to the Screener page and look at the signal. It should say <strong>BUY</strong> or <strong>STRONG BUY</strong>. If it says HOLD, WATCH, or SELL — do not buy it today.', action:'Go to Screener →', href:'screener.html', color:'var(--green)' },
    { n:'2', icon:'📰', title:'Check the news', body:'Go to the News page. If there is any big negative news about that company TODAY — hold off. Wait for things to settle. A bad earnings report or scandal can send a stock down fast.', action:'Go to News →', href:'news.html', color:'var(--blue)' },
    { n:'3', icon:'💰', title:'Decide how much to spend', body:'Use the budget plan above. Never go over the suggested amount for each stock. It\'s better to buy a little of several stocks than a lot of just one.', action:null, href:null, color:'var(--gold)' },
    { n:'4', icon:'📱', title:'Open Trading 212 and buy', body:'Search for the stock by ticker (e.g. "AAPL"). Choose <strong>Invest</strong> (not CFD!). Enter the amount in pounds (e.g. £40). Tap Buy. Done. You own a piece of that company.', action:null, href:null, color:'var(--purple)' },
    { n:'5', icon:'📅', title:'Check in once a week', body:'Set a reminder on your phone for every Sunday. Open StockIQ, look at the signals and your portfolio. If something has changed to SELL, then consider selling. If everything is still BUY or HOLD — leave it alone.', action:'Go to Dashboard →', href:'index.html', color:'var(--text2)' },
    { n:'6', icon:'💸', title:'When to sell', body:'Sell when: (1) The signal changes to STRONG SELL, (2) You\'ve made 25–30% profit and want to lock it in, (3) The company has serious bad news that won\'t go away. <strong>Never sell just because it went down 5–10%.</strong>', action:null, href:null, color:'var(--red)' },
  ];

  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">📍 Step-by-Step: What To Do</div></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${steps.map(s => `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;display:flex;gap:16px;align-items:flex-start">
            <div style="width:36px;height:36px;border-radius:50%;background:${s.color}18;border:2px solid ${s.color}50;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;font-weight:900;color:${s.color}">${s.n}</div>
            <div style="flex:1">
              <div style="font-size:15px;font-weight:700;margin-bottom:6px">${s.icon} ${s.title}</div>
              <div style="font-size:13px;color:var(--text2);line-height:1.65">${s.body}</div>
              ${s.action ? `<a href="${s.href}" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:${s.color};margin-top:10px;text-decoration:none">${s.action}</a>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderDontDo() {
  const mistakes = [
    { title:'Don\'t buy a stock because someone on YouTube said so', body:'Even if they show big profits on screen. They may have bought it much cheaper, or they\'re being paid to promote it. Always check the signal yourself.' },
    { title:'Don\'t invest money you might need soon', body:'If you\'d need this money in an emergency, keep it in savings. Stocks can drop 20–30% and take months to recover.' },
    { title:'Don\'t buy a stock just because it\'s cheap', body:'A stock at £1 is not automatically a bargain. Sometimes cheap stocks are cheap for a reason — the company is struggling. Look at the signal, not just the price.' },
    { title:'Don\'t check your portfolio every hour', body:'It will stress you out and make you make bad decisions. Set a reminder to check once a week and stick to it.' },
    { title:'Don\'t buy more when a stock is falling', body:'If a stock drops suddenly, don\'t "average down" by buying more — not until you understand why it dropped and the signal turns back to BUY.' },
  ];

  return `
    <div class="section">
      <div class="section-hd"><div class="section-title">🚫 Common Mistakes to Avoid</div></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${mistakes.map(m => `
          <div style="background:rgba(255,79,109,0.04);border:1px solid rgba(255,79,109,0.15);border-radius:var(--r);padding:16px 20px">
            <div style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:5px">✗ ${m.title}</div>
            <div style="font-size:13px;color:var(--text2);line-height:1.6">${m.body}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderGlossary() {
  const terms = [
    { term:'BUY Signal',    def:'The data says this is a good time to buy the stock. Price looks reasonable and trend is up.' },
    { term:'SELL Signal',   def:'The data says this might be a good time to sell. Stock may be overpriced or losing momentum.' },
    { term:'HOLD',          def:'No strong reason to buy or sell. If you own it, keep it. If you don\'t, wait.' },
    { term:'RSI',           def:'A number from 0–100. Below 30 = cheap/oversold. Above 70 = expensive/overbought.' },
    { term:'Moving Average',def:'The average price over 20 or 50 days. Helps show if a stock is trending up or down.' },
    { term:'P&L',           def:'Profit and Loss. How much money you\'ve made or lost on a position.' },
    { term:'Shares',        def:'A tiny piece of ownership in a company. You can buy fractions of a share (e.g. 0.5 of Apple).' },
    { term:'Portfolio',     def:'All the stocks you own, plus your cash. Your total investment account.' },
    { term:'Volatility',    def:'How much a stock\'s price jumps around. High volatility = bigger swings up and down.' },
    { term:'Market Cap',    def:'The total value of a company. $2T means "2 trillion dollars". Bigger = usually safer.' },
  ];

  return `
    <div class="section">
      <details style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
        <summary style="padding:18px 22px;cursor:pointer;list-style:none;font-size:16px;font-weight:700;display:flex;justify-content:space-between">
          📖 Stock Words Explained (Glossary) <span style="font-size:12px;color:var(--text2)">▼</span>
        </summary>
        <div style="padding:0 22px 22px;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
          ${terms.map(t => `
            <div style="background:var(--bg2);border-radius:var(--rs);padding:14px">
              <div style="font-size:13px;font-weight:700;color:var(--gold);margin-bottom:5px">${t.term}</div>
              <div style="font-size:12px;color:var(--text2);line-height:1.6">${t.def}</div>
            </div>`).join('')}
        </div>
      </details>
    </div>`;
}

function init() {
  sharedInit('guide');
  document.getElementById('page').innerHTML = [
    renderHero(),
    renderRules(),
    renderBuyNow(),
    renderBudgetPlan(),
    renderStepByStep(),
    renderDontDo(),
    renderGlossary(),
  ].join('');
}

document.addEventListener('DOMContentLoaded', init);
