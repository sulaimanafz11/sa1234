// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  T212_KEY:    localStorage.getItem('t212_key')    || '',
  AV_KEY:      localStorage.getItem('av_key')      || '',
  GEMINI_KEY:  localStorage.getItem('gemini_key')  || '',
  WATCHLIST:   JSON.parse(localStorage.getItem('watchlist') || '[]'),
  get demoMode() { return !this.AV_KEY; }
};

// ─── STOCK UNIVERSE (50 stocks + ETFs) ───────────────────────────────────────
// halal:true = Shariah-compliant | halal:false = contains haram elements (flagged)
const STOCKS = [
  // ── US TECHNOLOGY ──
  { ticker:'AAPL',  name:'Apple Inc.',            market:'US', sector:'Technology',        emoji:'🍎', rsi:52, ma20:189, ma50:182, price:191.24, chg:+1.2,  mktCap:'$2.9T', vol:'58.2M', pe:28.4, eps:6.72, halal:true  },
  { ticker:'MSFT',  name:'Microsoft',             market:'US', sector:'Technology',        emoji:'🪟', rsi:48, ma20:418, ma50:405, price:421.90, chg:+0.8,  mktCap:'$3.1T', vol:'22.1M', pe:35.2, eps:11.98,halal:true  },
  { ticker:'NVDA',  name:'NVIDIA Corp.',          market:'US', sector:'Semiconductors',    emoji:'💚', rsi:38, ma20:870, ma50:920, price:875.50, chg:+2.4,  mktCap:'$2.1T', vol:'41.8M', pe:68.1, eps:12.85,halal:true  },
  { ticker:'GOOGL', name:'Alphabet (Google)',     market:'US', sector:'Technology',        emoji:'🔍', rsi:44, ma20:175, ma50:168, price:174.60, chg:-0.3,  mktCap:'$2.2T', vol:'24.5M', pe:24.8, eps:7.04, halal:true  },
  { ticker:'META',  name:'Meta Platforms',        market:'US', sector:'Technology',        emoji:'📘', rsi:60, ma20:520, ma50:498, price:524.10, chg:+1.1,  mktCap:'$1.3T', vol:'18.9M', pe:26.4, eps:19.84,halal:true  },
  { ticker:'AMZN',  name:'Amazon',                market:'US', sector:'E-Commerce/Cloud',  emoji:'📦', rsi:55, ma20:194, ma50:188, price:196.80, chg:+1.5,  mktCap:'$2.1T', vol:'36.4M', pe:41.2, eps:4.78, halal:true  },
  { ticker:'TSLA',  name:'Tesla Inc.',            market:'US', sector:'Electric Vehicles', emoji:'⚡', rsi:32, ma20:175, ma50:198, price:172.40, chg:-1.8,  mktCap:'$548B', vol:'92.1M', pe:44.8, eps:3.85, halal:true  },
  { ticker:'AMD',   name:'AMD',                   market:'US', sector:'Semiconductors',    emoji:'🔴', rsi:36, ma20:162, ma50:171, price:158.90, chg:+3.1,  mktCap:'$256B', vol:'45.7M', pe:38.4, eps:4.14, halal:true  },
  { ticker:'ARM',   name:'ARM Holdings',          market:'US', sector:'Semiconductors',    emoji:'🦾', rsi:42, ma20:142, ma50:151, price:138.60, chg:+1.8,  mktCap:'$148B', vol:'7.2M',  pe:92.4, eps:1.50, halal:true  },
  { ticker:'ADBE',  name:'Adobe Inc.',            market:'US', sector:'Software',          emoji:'🎨', rsi:41, ma20:468, ma50:480, price:465.30, chg:+0.7,  mktCap:'$205B', vol:'3.8M',  pe:28.6, eps:16.28,halal:true  },
  { ticker:'NFLX',  name:'Netflix',               market:'US', sector:'Streaming',         emoji:'🎬', rsi:58, ma20:620, ma50:598, price:628.50, chg:+0.9,  mktCap:'$270B', vol:'4.2M',  pe:42.1, eps:14.93,halal:true  },
  { ticker:'SNOW',  name:'Snowflake',             market:'US', sector:'Cloud Data',        emoji:'❄️', rsi:37, ma20:148, ma50:162, price:144.20, chg:-1.6,  mktCap:'$49B',  vol:'5.1M',  pe:null, eps:-1.24,halal:true  },
  { ticker:'PLTR',  name:'Palantir Technologies', market:'US', sector:'AI / Data',         emoji:'🔮', rsi:34, ma20:22,  ma50:26,  price:21.40,  chg:-2.1,  mktCap:'$47B',  vol:'28.4M', pe:98.2, eps:0.22, halal:true  },
  { ticker:'SHOP',  name:'Shopify',               market:'US', sector:'E-Commerce',        emoji:'🛍️', rsi:55, ma20:78,  ma50:72,  price:79.90,  chg:+1.8,  mktCap:'$102B', vol:'7.1M',  pe:68.4, eps:1.17, halal:true  },
  { ticker:'UBER',  name:'Uber Technologies',     market:'US', sector:'Mobility',          emoji:'🚗', rsi:52, ma20:74,  ma50:70,  price:76.20,  chg:+0.4,  mktCap:'$158B', vol:'15.3M', pe:29.8, eps:2.56, halal:true  },
  { ticker:'SPOT',  name:'Spotify Technology',    market:'US', sector:'Streaming',         emoji:'🎵', rsi:61, ma20:298, ma50:278, price:302.40, chg:+1.4,  mktCap:'$61B',  vol:'2.8M',  pe:78.2, eps:3.87, halal:true  },
  { ticker:'COIN',  name:'Coinbase Global',       market:'US', sector:'Crypto Exchange',   emoji:'🪙', rsi:48, ma20:218, ma50:205, price:215.60, chg:+2.1,  mktCap:'$54B',  vol:'8.9M',  pe:null, eps:-2.84,halal:true  },
  // ── US HEALTHCARE ──
  { ticker:'JNJ',   name:'Johnson & Johnson',     market:'US', sector:'Healthcare',        emoji:'💊', rsi:45, ma20:152, ma50:155, price:151.20, chg:-0.4,  mktCap:'$364B', vol:'8.2M',  pe:15.8, eps:9.57, halal:true  },
  { ticker:'PFE',   name:'Pfizer Inc.',           market:'US', sector:'Pharmaceuticals',   emoji:'💉', rsi:33, ma20:27.4,ma50:29.8,price:26.80,  chg:-1.2,  mktCap:'$152B', vol:'32.1M', pe:12.4, eps:2.16, halal:true  },
  { ticker:'LLY',   name:'Eli Lilly',             market:'US', sector:'Pharmaceuticals',   emoji:'🩺', rsi:62, ma20:798, ma50:752, price:812.40, chg:+1.8,  mktCap:'$770B', vol:'2.9M',  pe:64.2, eps:12.64,halal:true  },
  { ticker:'MRNA',  name:'Moderna Inc.',          market:'US', sector:'Biotechnology',     emoji:'🧬', rsi:31, ma20:112, ma50:128, price:108.40, chg:-2.4,  mktCap:'$42B',  vol:'6.8M',  pe:null, eps:-8.22,halal:true  },
  // ── US CONSUMER ──
  { ticker:'PG',    name:'Procter & Gamble',      market:'US', sector:'Consumer Goods',    emoji:'🧴', rsi:50, ma20:165, ma50:160, price:166.40, chg:+0.2,  mktCap:'$392B', vol:'6.1M',  pe:26.4, eps:6.30, halal:true  },
  { ticker:'NKE',   name:'Nike Inc.',             market:'US', sector:'Consumer Goods',    emoji:'👟', rsi:29, ma20:89,  ma50:98,  price:87.60,  chg:-0.9,  mktCap:'$131B', vol:'12.4M', pe:24.8, eps:3.53, halal:true  },
  { ticker:'COST',  name:'Costco Wholesale',      market:'US', sector:'Retail',            emoji:'🏪', rsi:54, ma20:824, ma50:798, price:831.20, chg:+0.6,  mktCap:'$368B', vol:'2.4M',  pe:52.1, eps:15.96,halal:true  },
  { ticker:'WMT',   name:'Walmart Inc.',          market:'US', sector:'Retail',            emoji:'🛒', rsi:57, ma20:61.2,ma50:58.4,price:62.80,  chg:+0.4,  mktCap:'$507B', vol:'14.2M', pe:28.4, eps:2.21, halal:true  },
  { ticker:'DIS',   name:'Walt Disney Co.',       market:'US', sector:'Entertainment',     emoji:'🏰', rsi:42, ma20:112, ma50:118, price:110.80, chg:-0.6,  mktCap:'$202B', vol:'9.8M',  pe:38.2, eps:2.90, halal:true  },
  // ── US ENERGY & INDUSTRIAL ──
  { ticker:'XOM',   name:'ExxonMobil',            market:'US', sector:'Energy',            emoji:'⛽', rsi:48, ma20:112, ma50:108, price:114.20, chg:+0.8,  mktCap:'$458B', vol:'18.4M', pe:14.2, eps:8.04, halal:true  },
  { ticker:'HON',   name:'Honeywell Intl.',       market:'US', sector:'Industrial',        emoji:'⚙️', rsi:46, ma20:198, ma50:202, price:196.80, chg:-0.3,  mktCap:'$129B', vol:'3.8M',  pe:24.8, eps:7.94, halal:true  },
  { ticker:'CAT',   name:'Caterpillar Inc.',      market:'US', sector:'Industrial',        emoji:'🟡', rsi:53, ma20:348, ma50:338, price:352.40, chg:+0.7,  mktCap:'$178B', vol:'2.1M',  pe:16.8, eps:20.96,halal:true  },
  // ── US FINTECH (note: some may have interest elements) ──
  { ticker:'PYPL',  name:'PayPal Holdings',       market:'US', sector:'FinTech',           emoji:'💳', rsi:38, ma20:64,  ma50:68,  price:62.40,  chg:-1.2,  mktCap:'$67B',  vol:'11.2M', pe:16.4, eps:3.80, halal:false },
  { ticker:'SQ',    name:'Block Inc.',            market:'US', sector:'FinTech',           emoji:'⬛', rsi:41, ma20:72,  ma50:78,  price:70.80,  chg:-0.8,  mktCap:'$44B',  vol:'6.2M',  pe:null, eps:-0.84,halal:false },
  // ── UK STOCKS ──
  { ticker:'AZN',   name:'AstraZeneca',           market:'UK', sector:'Pharmaceuticals',   emoji:'🔬', rsi:47, ma20:118, ma50:114, price:119.40, chg:+0.5,  mktCap:'£196B', vol:'4.1M',  pe:24.8, eps:4.81, halal:true  },
  { ticker:'ULVR',  name:'Unilever',              market:'UK', sector:'Consumer Goods',    emoji:'🧼', rsi:43, ma20:40.2,ma50:41.5,price:39.80,  chg:-0.6,  mktCap:'£98B',  vol:'5.8M',  pe:18.4, eps:2.16, halal:true  },
  { ticker:'GSK',   name:'GSK plc',               market:'UK', sector:'Pharmaceuticals',   emoji:'💉', rsi:39, ma20:16.2,ma50:17.1,price:15.90,  chg:+1.2,  mktCap:'£65B',  vol:'9.2M',  pe:12.8, eps:1.24, halal:true  },
  { ticker:'VOD',   name:'Vodafone Group',        market:'UK', sector:'Telecoms',          emoji:'📡', rsi:35, ma20:0.71,ma50:0.76,price:0.69,   chg:-1.4,  mktCap:'£17B',  vol:'62.1M', pe:null, eps:-0.04,halal:true  },
  { ticker:'REL',   name:'RELX plc',              market:'UK', sector:'Information Svcs',  emoji:'📰', rsi:53, ma20:36.8,ma50:35.2,price:37.10,  chg:+0.4,  mktCap:'£68B',  vol:'2.4M',  pe:32.4, eps:1.15, halal:true  },
  { ticker:'RIO',   name:'Rio Tinto',             market:'UK', sector:'Mining',            emoji:'⛏️', rsi:46, ma20:51.4,ma50:50.2,price:51.80,  chg:+0.9,  mktCap:'£82B',  vol:'3.6M',  pe:8.4,  eps:6.17, halal:true  },
  { ticker:'HLMA',  name:'Halma plc',             market:'UK', sector:'Safety Tech',       emoji:'🛡️', rsi:51, ma20:24.6,ma50:23.8,price:24.90,  chg:+0.3,  mktCap:'£10B',  vol:'1.2M',  pe:38.2, eps:0.65, halal:true  },
  { ticker:'BP',    name:'BP plc',                market:'UK', sector:'Energy',            emoji:'⛽', rsi:44, ma20:4.82,ma50:4.95,price:4.76,   chg:-0.4,  mktCap:'£75B',  vol:'24.1M', pe:8.2,  eps:0.58, halal:true  },
  { ticker:'SHEL',  name:'Shell plc',             market:'UK', sector:'Energy',            emoji:'🐚', rsi:50, ma20:28.4,ma50:27.8,price:28.90,  chg:+0.6,  mktCap:'£166B', vol:'8.2M',  pe:10.4, eps:2.78, halal:true  },
  { ticker:'CPG',   name:'Compass Group',         market:'UK', sector:'Food Services',     emoji:'🍽️', rsi:51, ma20:23.8,ma50:23.2,price:24.10,  chg:+0.5,  mktCap:'£42B',  vol:'3.2M',  pe:28.4, eps:0.85, halal:true  },
  { ticker:'LSEG',  name:'London Stock Exchange', market:'UK', sector:'Financial Svcs',    emoji:'📊', rsi:47, ma20:98.2,ma50:96.8,price:97.60,  chg:-0.3,  mktCap:'£72B',  vol:'1.4M',  pe:42.8, eps:2.28, halal:false },
  { ticker:'EXPN',  name:'Experian plc',          market:'UK', sector:'Data & Analytics',  emoji:'📈', rsi:54, ma20:38.4,ma50:37.2,price:38.90,  chg:+0.4,  mktCap:'£32B',  vol:'2.8M',  pe:34.8, eps:1.12, halal:false },
  { ticker:'SGE',   name:'Sage Group',            market:'UK', sector:'Software',          emoji:'🌿', rsi:49, ma20:12.8,ma50:12.2,price:12.96,  chg:+0.2,  mktCap:'£14B',  vol:'4.1M',  pe:42.4, eps:0.31, halal:true  },
  { ticker:'BARC',  name:'Barclays',              market:'UK', sector:'Banking',           emoji:'🏦', rsi:55, ma20:2.28,ma50:2.18,price:2.32,   chg:+1.2,  mktCap:'£38B',  vol:'42.1M', pe:8.2,  eps:0.28, halal:false },
  // ── ETFs — Islamic / Halal Screened ──
  { ticker:'HMWO',  name:'HSBC MSCI World Islamic',      market:'UK', sector:'ETF — Global Islamic',    emoji:'🌍', rsi:50, ma20:8.42, ma50:8.28,  price:8.56,   chg:+0.3, mktCap:'£1.2B',  vol:'0.8M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'ISDE',  name:'iShares MSCI EM Islamic',      market:'UK', sector:'ETF — Emerging Islamic',   emoji:'🌏', rsi:44, ma20:3.18, ma50:3.24,  price:3.14,   chg:-0.4, mktCap:'£0.6B',  vol:'0.4M',  pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — S&P 500 (UK-listed, GBP, available on T212 Invest) ──
  { ticker:'CSPX',  name:'iShares Core S&P 500 (Acc)',   market:'UK', sector:'ETF — US Large Cap',       emoji:'🇺🇸', rsi:53, ma20:524,  ma50:508,   price:531.20, chg:+0.5, mktCap:'£68B',   vol:'2.4M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'VUSA',  name:'Vanguard S&P 500 (Dist)',      market:'UK', sector:'ETF — US Large Cap',       emoji:'🇺🇸', rsi:52, ma20:98.4, ma50:94.8,  price:99.20,  chg:+0.4, mktCap:'£42B',   vol:'2.1M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'VUAG',  name:'Vanguard S&P 500 Acc GBP',    market:'UK', sector:'ETF — US Accumulating',    emoji:'📊', rsi:52, ma20:114.2,ma50:110.4,  price:115.60, chg:+0.4, mktCap:'£28B',   vol:'1.8M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'SPXP',  name:'SPDR S&P 500 (Acc)',          market:'UK', sector:'ETF — US Large Cap',       emoji:'🇺🇸', rsi:52, ma20:622,  ma50:602,   price:628.40, chg:+0.4, mktCap:'£12B',   vol:'0.9M',  pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — Global / All-World ──
  { ticker:'IWDA',  name:'iShares Core MSCI World (Acc)',market:'UK', sector:'ETF — Global Developed',   emoji:'🌐', rsi:51, ma20:98.2, ma50:95.4,  price:99.80,  chg:+0.4, mktCap:'£62B',   vol:'3.2M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'VWRP',  name:'Vanguard FTSE All-World Acc', market:'UK', sector:'ETF — Global All-World',   emoji:'🌎', rsi:51, ma20:124.2,ma50:121.4, price:125.60, chg:+0.3, mktCap:'£38B',   vol:'1.8M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'VWRL',  name:'Vanguard FTSE All-World Dist',market:'UK', sector:'ETF — Global All-World',   emoji:'🌎', rsi:50, ma20:112.4,ma50:109.8, price:113.80, chg:+0.3, mktCap:'£22B',   vol:'2.2M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'WSML',  name:'iShares MSCI World Small Cap', market:'UK', sector:'ETF — Global Small Cap',   emoji:'🔹', rsi:46, ma20:8.14, ma50:7.98,  price:8.22,   chg:+0.2, mktCap:'£6.8B',  vol:'2.4M',  pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — NASDAQ / Tech ──
  { ticker:'EQQQ',  name:'Invesco NASDAQ-100 (UK)',      market:'UK', sector:'ETF — US Tech',            emoji:'💻', rsi:54, ma20:448,  ma50:428,   price:452.80, chg:+0.8, mktCap:'£12B',   vol:'1.6M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'IITU',  name:'iShares S&P 500 IT Sector',   market:'UK', sector:'ETF — Tech Sector',        emoji:'🖥️', rsi:56, ma20:72.4, ma50:68.8,  price:74.20,  chg:+1.1, mktCap:'£3.2B',  vol:'0.8M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'QQQ',   name:'Invesco NASDAQ-100 (US)',      market:'US', sector:'ETF — US Tech',            emoji:'💻', rsi:54, ma20:448,  ma50:428,   price:452.80, chg:+0.8, mktCap:'$248B',  vol:'42.1M', pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — UK / Europe ──
  { ticker:'ISF',   name:'iShares Core FTSE 100',        market:'UK', sector:'ETF — UK Large Cap',      emoji:'🇬🇧', rsi:48, ma20:8.18, ma50:7.98,  price:8.24,   chg:+0.2, mktCap:'£18B',   vol:'5.4M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'UKDV',  name:'SPDR UK Dividend Aristocrats', market:'UK', sector:'ETF — UK Dividend',       emoji:'💷', rsi:46, ma20:18.4, ma50:18.1,  price:18.62,  chg:+0.3, mktCap:'£1.8B',  vol:'0.6M',  pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — Sector / Thematic ──
  { ticker:'HEAL',  name:'iShares Global Healthcare ETF',market:'UK', sector:'ETF — Healthcare',        emoji:'🏥', rsi:47, ma20:42.8, ma50:42.2,  price:43.10,  chg:+0.2, mktCap:'£2.4B',  vol:'0.7M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'INRG',  name:'iShares Global Clean Energy',  market:'UK', sector:'ETF — Clean Energy',      emoji:'♻️', rsi:38, ma20:12.8, ma50:13.8,  price:12.40,  chg:-0.6, mktCap:'£2.8B',  vol:'4.2M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'RBOT',  name:'iShares Automation & Robotics',market:'UK', sector:'ETF — Robotics/AI',       emoji:'🤖', rsi:42, ma20:11.8, ma50:12.4,  price:11.42,  chg:-0.4, mktCap:'£3.8B',  vol:'3.6M',  pe:null, eps:null, halal:true, isETF:true },
  // ── ETFs — US Total Market ──
  { ticker:'VTI',   name:'Vanguard Total Market ETF',    market:'US', sector:'ETF — US Total Market',   emoji:'📈', rsi:51, ma20:242,  ma50:234,   price:244.20, chg:+0.4, mktCap:'$368B',  vol:'4.8M',  pe:null, eps:null, halal:true, isETF:true },
  { ticker:'SPY',   name:'SPDR S&P 500 ETF',             market:'US', sector:'ETF — US Large Cap',      emoji:'🇺🇸', rsi:53, ma20:524,  ma50:508,   price:528.40, chg:+0.4, mktCap:'$508B',  vol:'68.4M', pe:null, eps:null, halal:true, isETF:true },
];

// ─── FUNDAMENTALS (extended data per stock) ───────────────────────────────────
const FUNDAMENTALS = {
  'AAPL': { revenue:'$383B', margin:'26.4%', debtEq:'1.8x', divYield:'0.5%', beta:1.24, week52H:198.23, week52L:164.08, analystTarget:210.00, analystRating:'Buy' },
  'MSFT': { revenue:'$211B', margin:'36.4%', debtEq:'0.4x', divYield:'0.7%', beta:0.92, week52H:430.82, week52L:362.90, analystTarget:460.00, analystRating:'Strong Buy' },
  'NVDA': { revenue:'$44B',  margin:'55.8%', debtEq:'0.4x', divYield:'0.0%', beta:1.68, week52H:974.00, week52L:402.12, analystTarget:1000.00,analystRating:'Strong Buy' },
  'GOOGL': { revenue:'$307B',margin:'24.0%', debtEq:'0.1x', divYield:'0.0%', beta:1.06, week52H:193.31, week52L:129.40, analystTarget:200.00, analystRating:'Buy' },
  'TSLA': { revenue:'$97B',  margin:'8.2%',  debtEq:'0.1x', divYield:'0.0%', beta:2.28, week52H:299.29, week52L:138.80, analystTarget:210.00, analystRating:'Hold' },
  'AMZN': { revenue:'$574B', margin:'8.6%',  debtEq:'0.6x', divYield:'0.0%', beta:1.18, week52H:201.20, week52L:153.63, analystTarget:225.00, analystRating:'Strong Buy' },
  'AMD':  { revenue:'$22B',  margin:'4.8%',  debtEq:'0.1x', divYield:'0.0%', beta:1.72, week52H:227.30, week52L:136.43, analystTarget:200.00, analystRating:'Buy' },
  'NKE':  { revenue:'$51B',  margin:'10.2%', debtEq:'1.1x', divYield:'1.7%', beta:0.88, week52H:123.39, week52L:82.46,  analystTarget:105.00, analystRating:'Hold' },
  'AZN':  { revenue:'$45B',  margin:'18.4%', debtEq:'0.8x', divYield:'2.1%', beta:0.42, week52H:132.84, week52L:104.58, analystTarget:138.00, analystRating:'Buy' },
  'ULVR': { revenue:'£59B',  margin:'15.2%', debtEq:'1.2x', divYield:'3.6%', beta:0.48, week52H:48.22,  week52L:36.40,  analystTarget:46.00,  analystRating:'Hold' },
};
function getFundamentals(ticker) {
  return FUNDAMENTALS[ticker] || { revenue:'N/A', margin:'N/A', debtEq:'N/A', divYield:'N/A', beta:'N/A', week52H:'N/A', week52L:'N/A', analystTarget:'N/A', analystRating:'N/A' };
}

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
    { id:'analyzer',  label:'Analyzer',   icon:'⬡', href:'analyzer.html'   },
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
            <span class="input-hint">Settings → API in your Trading 212 app. Make sure you are on the <strong>Invest</strong> account, not CFD.</span>
            <div class="cors-warning" style="margin-top:10px">
              <strong>ℹ️ Why can't it connect automatically?</strong><br>
              Trading 212's API is designed for apps, not websites. When a website tries to call it directly, browsers block it for security (this is called CORS — not a bug in StockIQ, it's a browser rule).<br><br>
              <strong>What you can do right now:</strong><br>
              ✅ Use the <a href="portfolio.html" style="color:var(--gold)">Portfolio page</a> to manually add your holdings — it tracks P&L, allocation and growth<br>
              ✅ Use the Screener and Analyzer to check signals on stocks you own<br>
              ✅ Your key is saved and ready if a sync feature is added in future
            </div>
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
