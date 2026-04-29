// AI Tutor — powered by Google Gemini free API.
// Adapted from stocks-app/chat.js with NEXUS-specific system prompt.

const SYSTEM_PROMPT = `You are NEXUS Tutor, a friendly AI guide inside the NEXUS hub — a learning library for prompting, coding with AI, agentic workflows, image/video generation, the AI tools landscape, and making money with AI.

You help beginners get oriented. You answer in plain English, like explaining to a smart friend who's busy. Keep replies tight: 3-6 short paragraphs or bullets. Use formatting (bold, lists, code blocks) when it helps.

You know the hub has tabs: Home, Prompting Mastery, AI for Coding (Claude Code, Cursor, Lovable, v0, Bolt, Replit), Agentic Workflows (n8n, Manus, Claude Agent SDK, MCP, skills), Tools Atlas (50+ tools across chat / code / image / video / audio / agent / research), Image & Video Gen (Midjourney, NanoBanana, Flux, Sora, Veo, Runway), Make Money (7 paths from £0), Cowork (daily AI routines), Recipes (copy-paste system prompts, n8n flows, Cursor rules).

When asked "what's on tab X" — describe what's there honestly.
When asked to compare tools — give a 1-line "use this if…" for each.
When asked for prompts — give a working ready-to-paste prompt.
Never promise guaranteed income. Never give financial / legal advice.

Today's date context: 2026 spring. Models you can mention: Claude Opus 4.7, Sonnet 4.6, Haiku 4.5, ChatGPT GPT-5, Gemini 2.5, Sora 2, Veo 3, MJ v7, NanoBanana.`;

const QUICK_QUESTIONS = [
  'What is NEXUS and where do I start?',
  'Cursor vs Claude Code — which one for me?',
  'Give me a prompt to write LinkedIn posts in my voice',
  'What is an AI agent in plain English?',
  "I'm a non-coder — how do I ship a real app?",
  'Best image AI for product photos?',
  "How do I make my first £100 with AI?",
  'What does NanoBanana actually do?',
];

let chatHistory = [];

function renderPage() {
  const hasKey = !!CONFIG.GEMINI_KEY;
  document.getElementById('page').innerHTML = `
    <div class="page-hd" style="margin-bottom:18px">
      <div>
        <span class="page-eyebrow">AI Tutor</span>
        <div class="page-title">Ask anything about the hub</div>
        <div class="page-sub">Powered by Google Gemini · ${hasKey ? '<span class="tcyan">● Connected</span>' : '<span class="tgreen">○ Demo mode — add free key for live answers</span>'}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearChat()">Clear chat</button>
    </div>

    ${!hasKey ? `
    <div class="connect-banner">
      <div>
        <h3>Unlock the live tutor</h3>
        <p>Get a free Google Gemini key at <strong>aistudio.google.com</strong> — no card, no cost. Add it in Settings and the tutor gives real answers to any question about the hub.</p>
      </div>
      <button class="btn btn-primary" onclick="openSettings()">Add Key →</button>
    </div>` : ''}

    <div class="quick-prompts">
      ${QUICK_QUESTIONS.map(q => `<button class="qbtn" onclick="sendQuick(this)">${q}</button>`).join('')}
    </div>

    <div class="chat-shell">
      <div class="chat-messages" id="chatMessages">
        <div class="msg ai">
          <div class="msg-avatar">◇</div>
          <div class="msg-bubble">
            Hi — I'm the NEXUS tutor. Ask me about any tab, any tool, any prompt technique, or anything in the hub.<br><br>
            ${hasKey ? "I'll answer in plain English. Pick a quick question above or type your own." : "I'm in demo mode — I have built-in answers for common questions, and I'll give richer ones once you add a free Gemini key in Settings."}
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="chatInput" placeholder="Ask anything about prompting, tools, agents, making money…" rows="1" onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
        <button class="chat-send" onclick="sendMessage()">➤</button>
      </div>
    </div>`;
}

function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
function sendQuick(btn) { document.getElementById('chatInput').value = btn.textContent; sendMessage(); }

function clearChat() {
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML = `
    <div class="msg ai">
      <div class="msg-avatar">◇</div>
      <div class="msg-bubble">Chat cleared. Ask me anything.</div>
    </div>`;
}

function appendMsg(role, html) {
  const wrap = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="msg-avatar">${role === 'ai' ? '◇' : '👤'}</div><div class="msg-bubble">${html}</div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}
function appendTyping() {
  const wrap = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-avatar">◇</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}
function removeTyping() { document.getElementById('typing-indicator')?.remove(); }

function builtinAnswer(q) {
  const lower = q.toLowerCase();
  if (lower.includes('what is nexus') || lower.includes('where do i start'))
    return 'NEXUS is a single, organised hub for everything AI: <strong>Prompting</strong>, <strong>Coding tools</strong>, <strong>Agents</strong>, <strong>Tools Atlas</strong>, <strong>Image/Video</strong>, <strong>Make Money</strong>, <strong>Cowork</strong>, and a <strong>Recipes</strong> library.<br><br>Start with <strong>Prompting Mastery</strong> — every other tab gets easier once you can prompt well. Then pick the path that matches your goal (Build / Run agents / Make money).';
  if (lower.includes('cursor') && lower.includes('claude'))
    return 'Both are great. <strong>Cursor</strong>: VS Code fork, polished day-to-day editor, £16/mo. <strong>Claude Code</strong>: more agentic, can do whole-codebase reasoning, multi-file edits, runs in CLI/IDE/web. Use <strong>Cursor for daily coding</strong> and <strong>Claude Code for big agentic tasks</strong>. Many people pay for both.';
  if (lower.includes('agent') && (lower.includes('what is') || lower.includes('plain english')))
    return 'An AI agent is just a chat AI in a loop with two extras: <strong>tools</strong> (it can call APIs / read files / send emails) and <strong>memory</strong> (it can keep going across multiple steps). It receives a goal, picks an action, uses a tool, looks at the result, picks the next action, and repeats until done. Everything else (n8n, MCP, ReAct) is just plumbing around that loop.';
  if (lower.includes('linkedin') && lower.includes('voice'))
    return 'Try this prompt:<br><br><code>You are my writing partner. Write 3 LinkedIn posts in MY voice. My voice is: warm, direct, slightly informal, UK English, never uses corporate-speak. Each post: hook + insight + soft CTA, max 200 words. Topic: [TOPIC]. Examples of past posts: [PASTE 2-3].</code><br><br>The two example posts are the magic — they teach the model your style faster than any description.';
  if (lower.includes('non-coder') || lower.includes('no code'))
    return 'Pick <strong>Lovable</strong> for full apps (auth, DB, deploy) or <strong>v0</strong> for just UI. Both are prompt-to-real-web-app. Steps: (1) describe the smallest version of your app in 1 paragraph, (2) generate the first iteration, (3) ask for one feature change at a time, (4) deploy with their built-in button. Friday goal: app live, share the URL.';
  if (lower.includes('image') && (lower.includes('product') || lower.includes('photo')))
    return 'For product shots: <strong>NanoBanana</strong> (in Gemini app, free) is unbeatable for fast iteration and edits — say "now make it night-time" and it just does it. <strong>Midjourney</strong> wins for polished hero/brand images. <strong>Flux</strong> wins for photorealism.<br><br>Always specify: subject + lighting + composition + lens + mood + aspect ratio. See the Image/Video tab for full prompts to copy.';
  if (lower.includes('£100') || lower.includes('first 100') || lower.includes('make money'))
    return 'Fastest route: pick a service you already know (writing, research, admin, design), use AI to deliver it 5× faster, charge per project. <strong>Email rewriting £30/hr</strong>, <strong>Blog posts £150-300 each</strong>, <strong>Research briefs £80-150</strong>, <strong>SEO meta £100/20 pages</strong>.<br><br>3 steps: (1) pick the niche you know, (2) build 2 portfolio samples for free for someone real, (3) DM 50 specific people who need it. Don\'t post — DM. See the Make Money tab for all 7 paths.';
  if (lower.includes('nanobanana') || lower.includes('nano banana'))
    return 'NanoBanana is the nickname for <strong>Gemini 2.5 Flash Image</strong> — Google\'s image generator inside the Gemini app. Three things make it special:<br>1. <strong>Conversational edits</strong> — say "now make it sunset" and it just does it<br>2. <strong>Character consistency</strong> — keep the same person across multiple scenes<br>3. <strong>Free</strong> via Gemini app, paid API for builders.<br><br>Less artistic than Midjourney but unbeatable for product shots, edits, and Photoshop-style fixes.';
  return 'Good question. Add your free Gemini key in Settings (top right cog) and I\'ll give you a richer, real-time answer. The key takes 30 seconds at <strong>aistudio.google.com</strong> — no card needed.';
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';

  appendMsg('user', escapeHtml(text));
  appendTyping();
  chatHistory.push({ role: 'user', parts: [{ text }] });

  const useClaude = CONFIG.TUTOR_PROVIDER === 'anthropic' && CONFIG.ANTHROPIC_KEY;
  const useGemini = CONFIG.GEMINI_KEY && !useClaude;

  if (!useClaude && !useGemini) {
    await new Promise(r => setTimeout(r, 600));
    removeTyping();
    const answer = builtinAnswer(text);
    appendMsg('ai', answer);
    chatHistory.push({ role: 'model', parts: [{ text: answer }] });
    return;
  }

  try {
    let reply;
    if (useClaude) {
      const messages = chatHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text,
      }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    } else {
      const messages = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Got it — I'm NEXUS Tutor. Ask me anything." }] },
        ...chatHistory,
      ];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: messages }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    }
    removeTyping();
    appendMsg('ai', reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\n/g, '<br>'));
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
  } catch (e) {
    removeTyping();
    const err = String(e.message).includes('401') || String(e.message).includes('400')
      ? 'Invalid API key — double-check it in Settings.'
      : 'Connection error. Check your internet and try again.';
    appendMsg('ai', `⚠ ${err}`);
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function init() {
  sharedInit('chat');
  renderPage();
}
document.addEventListener('DOMContentLoaded', init);
