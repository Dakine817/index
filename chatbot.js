/* =====================================================================
   chatbot.js — Honolulu HVAC Chatbot
   ▸ Fully self-contained: injects its own CSS, HTML, and AI logic.
   ▸ Auto-reveals 3 s after page load via setTimeout.
   ▸ Also exposed as window.showChatbot(scroll) for the lead form.
   ▸ To change the chatbot, edit THIS file only — never index.html.
   ===================================================================== */
(function () {
  'use strict';

  /* ── 1. Styles ───────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '#chat-section{display:none;background:#fef9f0;padding:60px 20px}',
    '.chat-wrap{max-width:600px;margin:0 auto}',
    '.chat-head{text-align:center;margin-bottom:24px}',
    ".chat-head h2{font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:2rem;margin-bottom:4px}",
    '.chat-head p{color:#64748b;font-size:.9rem}',
    '.chat-box{background:white;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.1);overflow:hidden;display:flex;flex-direction:column;height:400px}',
    '.chat-bar{background:#0c2340;color:white;padding:13px 18px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:.9rem}',
    '.dot{width:9px;height:9px;border-radius:50%;background:#22c55e;animation:blink 2s infinite}',
    '@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}',
    '.msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}',
    '.msg{display:flex;gap:8px}',
    '.msg.user{flex-direction:row-reverse}',
    '.av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}',
    '.msg.bot .av{background:#0c2340;color:white}',
    '.msg.user .av{background:#f97316;color:white}',
    '.bbl{max-width:78%;padding:9px 13px;border-radius:10px;font-size:.87rem;line-height:1.5}',
    '.msg.bot .bbl{background:#f1f5f9;color:#0c2340}',
    '.msg.user .bbl{background:#0ea5e9;color:white}',
    '.typing{display:none;align-items:center;gap:8px;padding:0 18px 10px}',
    '.typing .av{width:30px;height:30px;border-radius:50%;background:#0c2340;color:white;display:flex;align-items:center;justify-content:center;font-size:.8rem}',
    '.dots{display:flex;gap:3px;padding:9px 13px;background:#f1f5f9;border-radius:10px}',
    '.dots span{width:5px;height:5px;border-radius:50%;background:#64748b;animation:up 1.2s infinite}',
    '.dots span:nth-child(2){animation-delay:.2s}',
    '.dots span:nth-child(3){animation-delay:.4s}',
    '@keyframes up{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',
    '.chat-input{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e2e8f0;background:white}',
    "#msg-input{flex:1;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:.9rem;outline:none}",
    '#msg-send{background:#0ea5e9;color:white;border:none;border-radius:8px;padding:9px 16px;cursor:pointer;font-weight:600;font-size:.9rem}',
    '#msg-send:disabled{background:#94a3b8;cursor:not-allowed}',
    '.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}'
  ].join('');
  document.head.appendChild(style);

  /* ── 2. HTML — injected before <footer> ──────────────────────────── */
  var section = document.createElement('div');
  section.id = 'chat-section';
  section.setAttribute('aria-label', 'HVAC Chat Assistant');
  section.innerHTML =
    '<div class="chat-wrap">' +
      '<div class="chat-head">' +
        '<h2>&#x1F4AC; Ask Our Assistant</h2>' +
        '<p>Have HVAC questions? We\'re here to help.</p>' +
      '</div>' +
      '<div class="chat-box" role="log" aria-live="polite">' +
        '<div class="chat-bar"><div class="dot" aria-hidden="true"></div>Honolulu HVAC Assistant</div>' +
        '<div class="msgs" id="msgs">' +
          '<div class="msg bot">' +
            '<div class="av" aria-hidden="true">&#x1F916;</div>' +
            '<div class="bbl">Aloha! &#x1F33A; I\'m your HVAC assistant. Ask me anything about AC repair, installation, maintenance, pricing, and more!</div>' +
          '</div>' +
        '</div>' +
        '<div class="typing" id="typing" aria-hidden="true">' +
          '<div class="av">&#x1F916;</div>' +
          '<div class="dots"><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="chat-input">' +
          '<label for="msg-input" class="visually-hidden">Your message</label>' +
          '<input type="text" id="msg-input" placeholder="Ask a question..." aria-label="Chat message">' +
          '<button id="msg-send" type="button" aria-label="Send message">Send</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var footer = document.querySelector('footer');
  if (footer) {
    document.body.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
  }

  /* ── 3. Show helper ──────────────────────────────────────────────── */
  /**
   * Show the chatbot panel.
   * @param {boolean} [andScroll] – if true, smoothly scroll the panel into view.
   */
  window.showChatbot = function (andScroll) {
    section.style.display = 'block';
    if (andScroll) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* Auto-reveal 3 s after page load; no forced scroll so the user isn't interrupted */
  setTimeout(function () { window.showChatbot(false); }, 3000);

  /* ── 4. Gemini AI ────────────────────────────────────────────────── */
  var GEMINI_KEY = 'AIzaSyBPEtUDpXKJ61bmcdwR8mFTjcKG6X6dKU8';
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY;
  var SYSTEM = 'You are a friendly HVAC customer service assistant for Honolulu HVAC Services on Oahu, Hawaii. ' +
    'Help customers with questions about AC repair, AC installation, heating, maintenance, emergency service, ' +
    'pricing, and scheduling. Be warm and professional. Use Aloha or Mahalo occasionally. ' +
    'Keep answers to 2-3 sentences. Do not use markdown formatting. ' +
    'If asked about something unrelated to HVAC, politely redirect back to HVAC topics.';

  function addMsg(text, role) {
    var m = document.createElement('div');
    m.className = 'msg ' + role;
    m.innerHTML =
      '<div class="av" aria-hidden="true">' + (role === 'bot' ? '&#x1F916;' : '&#x1F464;') + '</div>' +
      '<div class="bbl">' + text + '</div>';
    document.getElementById('msgs').appendChild(m);
    document.getElementById('msgs').scrollTop = 99999;
  }

  function send() {
    var inp = document.getElementById('msg-input');
    var txt = inp.value.trim();
    if (!txt) return;
    addMsg(txt, 'user');
    inp.value = '';
    document.getElementById('msg-send').disabled = true;
    document.getElementById('typing').style.display = 'flex';
    fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: SYSTEM + '\n\nCustomer: ' + txt }] }] })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      document.getElementById('typing').style.display = 'none';
      addMsg(data.candidates[0].content.parts[0].text, 'bot');
      document.getElementById('msg-send').disabled = false;
      inp.focus();
    })
    .catch(function () {
      document.getElementById('typing').style.display = 'none';
      addMsg('Sorry, I had trouble responding. Please try again!', 'bot');
      document.getElementById('msg-send').disabled = false;
    });
  }

  document.getElementById('msg-send').addEventListener('click', send);
  document.getElementById('msg-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') send();
  });
})();
