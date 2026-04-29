// Research Box — uses Perplexity (with sources) or Tavily (web search) depending on which key is set.
// Drop a div with id="research-box" on any page and call renderResearchBox().

function renderResearchBox(targetId = 'research-box') {
  const target = document.getElementById(targetId);
  if (!target) return;
  const hasPpx = !!CONFIG.PERPLEXITY_KEY;
  const hasTvl = !!CONFIG.TAVILY_KEY;
  const provider = hasPpx ? 'Perplexity' : (hasTvl ? 'Tavily' : null);

  target.innerHTML = `
    <div class="lesson">
      <h3 style="margin-top:0">🔍 Live research with sources</h3>
      ${!provider ? `
      <div class="connect-banner">
        <div>
          <h3>Add a research key to unlock</h3>
          <p>Free Tavily key (1k searches/mo) at <strong>tavily.com</strong>, or Perplexity at <strong>perplexity.ai/settings/api</strong>. Either powers this box.</p>
        </div>
        <button class="btn btn-primary" onclick="openSettings()">Add Key →</button>
      </div>` : `
      <p class="muted" style="font-size:13.5px;margin:0 0 12px">Powered by ${provider} · returns a synthesised answer with citation links</p>
      <div style="display:flex;gap:10px">
        <input id="rb-input" class="search-box" placeholder="e.g. 'best AI tools for legal research in 2026'" onkeydown="if(event.key==='Enter') runResearch()">
        <button class="btn btn-primary" onclick="runResearch()">Search</button>
      </div>
      <div id="rb-output" style="margin-top:18px"></div>`}
    </div>`;
}

async function runResearch() {
  const q = document.getElementById('rb-input').value.trim();
  if (!q) return;
  const out = document.getElementById('rb-output');
  out.innerHTML = '<div class="typing" style="padding:14px"><span></span><span></span><span></span></div>';

  try {
    let answer = '', sources = [];
    if (CONFIG.PERPLEXITY_KEY) {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.PERPLEXITY_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: q }],
          return_citations: true,
        }),
      });
      if (!res.ok) throw new Error(`Perplexity error ${res.status}`);
      const data = await res.json();
      answer = data.choices?.[0]?.message?.content || '';
      sources = data.citations || [];
    } else if (CONFIG.TAVILY_KEY) {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: CONFIG.TAVILY_KEY,
          query: q,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 6,
        }),
      });
      if (!res.ok) throw new Error(`Tavily error ${res.status}`);
      const data = await res.json();
      answer = data.answer || '';
      sources = (data.results || []).map(r => r.url);
    }

    const sourcesHtml = sources.length ?
      `<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)"><div class="muted" style="font-size:12px;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">Sources</div>${sources.map((s, i) => `<a href="${s}" target="_blank" style="display:block;font-size:13px;margin:4px 0">[${i+1}] ${s}</a>`).join('')}</div>` : '';

    out.innerHTML = `<div class="card">${answer.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}${sourcesHtml}</div>`;
  } catch (e) {
    out.innerHTML = `<div class="callout gold">⚠ ${e.message}. Check your key in Settings.</div>`;
  }
}
