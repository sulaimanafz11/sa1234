// Tools Atlas — render, filter, modal detail.
let activeCat = 'all';

function setCat(cat) {
  activeCat = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  filterTools();
}

function renderTools() {
  const q = (document.getElementById('search')?.value || '').toLowerCase();
  const list = TOOLS.filter(t => {
    if (activeCat !== 'all' && t.cat !== activeCat) return false;
    if (q && !(t.name + ' ' + t.tagline + ' ' + t.best).toLowerCase().includes(q)) return false;
    return true;
  });
  const grid = document.getElementById('grid');
  if (!list.length) {
    grid.innerHTML = '<div class="muted" style="padding:24px">No tools match. Try clearing the search or category.</div>';
    return;
  }
  grid.innerHTML = list.map(t => `
    <div class="tool-card" onclick="openTool('${t.id}')">
      <div class="tool-emoji">${t.emoji}</div>
      <div class="tool-cat">${t.cat}</div>
      <div class="tool-name">${t.name}</div>
      <div class="tool-desc">${t.tagline}</div>
      <div class="tool-meta"><span class="tag cyan">${t.pricing}</span></div>
    </div>`).join('');
}

function filterTools() { renderTools(); }

function openTool(id) {
  const t = TOOLS.find(x => x.id === id);
  if (!t) return;
  document.getElementById('tool-modal').innerHTML = `
    <button class="modal-close" onclick="closeTool()">✕</button>
    <div style="font-size:36px">${t.emoji}</div>
    <h2 style="margin:8px 0 4px">${t.name}</h2>
    <div class="muted" style="margin-bottom:16px">${t.tagline}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">
      <span class="tag cyan">${t.cat}</span>
      <span class="tag violet">${t.pricing}</span>
    </div>
    <h4 class="tcyan" style="margin:14px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:0.6px">Best for</h4>
    <p style="margin:0 0 14px;color:var(--t2)">${t.best}</p>
    <h4 class="tcyan" style="margin:14px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:0.6px">Watch out for</h4>
    <p style="margin:0 0 18px;color:var(--t2)">${t.weak}</p>
    <a class="btn btn-primary" href="${t.link}" target="_blank" style="width:100%">Open ${t.name} →</a>`;
  document.getElementById('modal-bg').classList.add('show');
}

function closeTool() {
  document.getElementById('modal-bg').classList.remove('show');
}
