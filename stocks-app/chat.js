// ─── AI CHAT PAGE (powered by Google Gemini free API) ────────────────────────
const SYSTEM_PROMPT = `You are StockIQ, a friendly stock market advisor for beginners.
You help people understand stocks, when to buy/sell, and how to grow a small portfolio (starting around £200).
Keep answers clear, short, and jargon-free — like explaining to a smart teenager.
Focus on: explaining signals, reading charts, risk management, halal/ethical investing.
Never give guaranteed profit promises. Always remind users this is educational, not financial advice.
Current portfolio stocks being tracked: AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA, AMD, JNJ, NKE, META, AZN, ULVR, GSK, VOD, ARM.`;

let chatHistory = [];

const QUICK_QUESTIONS = [
  'What does RSI mean?',
  'How much should I invest in one stock?',
  'When is a good time to sell?',
  'What is a moving average?',
  'Is NVDA a good buy right now?',
  'How do I reduce my risk?',
  'What are halal stocks?',
  'Explain buy signals simply',
];

function renderPage() {
  const hasKey = !!CONFIG.GEMINI_KEY;

  document.getElementById('page').innerHTML = `
    <div class="page-hd" style="margin-bottom:0">
      <div>
        <div class="page-title">AI Chat Advisor</div>
        <div class="page-sub">Powered by Google Gemini · ${hasKey ? '<span style="color:var(--green)">● Connected</span>' : '<span style="color:var(--gold)">⚠ Add Gemini key in Settings for live AI</span>'}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearChat()">Clear chat</button>
    </div>

    ${!hasKey ? `
    <div class="connect-banner">
      <div>
        <h3>Connect free AI to unlock this page</h3>
        <p>Get a <strong>completely free</strong> Google Gemini API key at <strong>aistudio.google.com</strong> — no credit card, no cost. Add it in Settings and you'll have a real AI advisor to answer any stock question.</p>
      </div>
      <button class="btn btn-gold" onclick="openSettings()">Add Key →</button>
    </div>` : ''}

    <div class="quick-prompts">
      ${QUICK_QUESTIONS.map(q => `<button class="qbtn" onclick="sendQuick('${q}')">${q}</button>`).join('')}
    </div>

    <div class="chat-shell">
      <div class="chat-messages" id="chatMessages">
        <div class="msg ai">
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble">
            Hi! I'm your StockIQ AI advisor. I can help you understand your stocks, explain signals, and guide you on what to buy or sell — in plain English.<br><br>
            ${hasKey ? 'Ask me anything about your portfolio or the market!' : 'Add your free Gemini key in Settings to unlock full AI responses. Until then, I\'ll do my best with built-in answers.'}
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="chatInput" placeholder="Ask anything about stocks, your portfolio, signals..." rows="1" onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
        <button class="chat-send" onclick="sendMessage()">➤</button>
      </div>
    </div>`;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function sendQuick(q) {
  document.getElementById('chatInput').value = q;
  sendMessage();
}

function clearChat() {
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = `
    <div class="msg ai">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">Chat cleared. Ask me anything!</div>
    </div>`;
}

function appendMsg(role, html) {
  const wrap = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `
    <div class="msg-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
    <div class="msg-bubble">${html}</div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}

function appendTyping() {
  const wrap = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

// Simple built-in fallback answers for demo mode
function builtinAnswer(q) {
  const lower = q.toLowerCase();
  if (lower.includes('rsi'))          return 'RSI stands for <strong>Relative Strength Index</strong>. It goes from 0–100. Below 30 means the stock may be cheap (oversold). Above 70 means it may be expensive (overbought). Think of it like a temperature gauge.';
  if (lower.includes('moving average') || lower.includes('ma20') || lower.includes('ma50')) return 'A <strong>Moving Average</strong> is the average price over the last 20 or 50 days. When the 20-day average crosses above the 50-day average, that\'s usually a good sign (uptrend). When it crosses below, that\'s a warning sign.';
  if (lower.includes('sell'))         return 'Generally consider selling when: (1) RSI goes above 70 and the trend is turning down, (2) the stock has risen a lot and you\'ve made good profit, or (3) something fundamental changed about the company. Never sell just because it dipped a little!';
  if (lower.includes('how much') || lower.includes('invest')) return 'For a £200 portfolio, a good rule is: <strong>max 20–25% in any one stock</strong>. So max £40–50 per stock. Spread across 4–5 stocks. Never invest money you can\'t afford to leave alone for 6–12 months.';
  if (lower.includes('risk'))         return 'To reduce risk: (1) Spread across 4–5 different stocks, (2) Don\'t put more than 20% in one stock, (3) Only buy stocks with a BUY signal — not WATCH or SELL, (4) Never invest money you need in the next 3 months.';
  if (lower.includes('halal'))        return 'Halal stocks avoid: interest-based banks, alcohol, gambling, pork, and weapons. Tech companies (Apple, Microsoft, NVIDIA), healthcare (AstraZeneca), and consumer goods (Unilever) are generally considered halal. Always verify with a scholar if unsure.';
  if (lower.includes('buy signal'))   return 'A BUY signal means our analysis shows it\'s a good time to enter the stock. It usually means: RSI is below 45 (not too expensive) AND the trend is pointing upward. The higher the confidence %, the stronger the signal.';
  if (lower.includes('nvda') || lower.includes('nvidia')) {
    const s = STOCKS.find(x=>x.ticker==='NVDA');
    if (s) { const sig=getSignal(s); return `NVDA (NVIDIA) currently has a <strong>${sig.signal}</strong> signal with ${sig.conf}% confidence. ${getSignalReason(s)} RSI is ${s.rsi}, which is ${s.rsi<40?'in oversold territory — potentially a good entry':'in normal range'}.`; }
  }
  return 'Great question! To get a detailed AI answer, add your free <strong>Google Gemini key</strong> in Settings → it takes 30 seconds and is completely free. I\'ll then give you real, personalised analysis on anything.';
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';

  appendMsg('user', text);
  appendTyping();

  chatHistory.push({ role:'user', parts:[{ text }] });

  if (!CONFIG.GEMINI_KEY) {
    await new Promise(r => setTimeout(r, 700));
    removeTyping();
    const answer = builtinAnswer(text);
    appendMsg('ai', answer);
    chatHistory.push({ role:'model', parts:[{ text: answer }] });
    return;
  }

  // Live Gemini API call
  try {
    const messages = [
      { role:'user', parts:[{ text: SYSTEM_PROMPT }] },
      { role:'model', parts:[{ text:'Understood! I\'m StockIQ, your friendly stock advisor. How can I help?' }] },
      ...chatHistory,
    ];

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ contents: messages })
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I couldn\'t generate a response.';

    removeTyping();
    appendMsg('ai', reply.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'));
    chatHistory.push({ role:'model', parts:[{ text: reply }] });
  } catch(e) {
    removeTyping();
    const err = e.message.includes('401') ? 'Invalid API key — check your Gemini key in Settings.' : 'Connection error. Check your internet and try again.';
    appendMsg('ai', `⚠ ${err}`);
  }
}

function init() {
  sharedInit('chat');
  renderPage();
}

document.addEventListener('DOMContentLoaded', init);
