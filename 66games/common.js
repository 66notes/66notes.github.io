// 66Games: shared by every game page
// "You vs Friend" ID entry, the sitting-view picker (P button), name animations and effects
const G66 = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // seats[0] = you, seats[1] = your friend (or the computer)
  const VIEWS = {
    'face-bottom': { name: 'Face to Face', face: true, seats: ['bottom', 'top'] },
    'face-top':    { name: 'Face Flip',    face: true, seats: ['top', 'bottom'] },
    'side-left':   { name: 'Side by Side', face: false, seats: ['left', 'right'] },
    'side-right':  { name: 'Side Swap',    face: false, seats: ['right', 'left'] }
  };

  const css = `
  .g66-ov{position:fixed;inset:0;z-index:500;display:flex;overflow-y:auto;padding:14px;background:rgba(13,43,78,.86);animation:g66-fade .2s}
  .g66-card{width:100%;max-width:370px;margin:auto;background:var(--surface,#fff);color:var(--text,#1e2a3e);border-radius:24px;padding:18px;text-align:center;animation:g66-rise .28s cubic-bezier(.2,1.3,.4,1)}
  .g66-card h2{font-size:1.3rem;font-weight:800;color:var(--navy,#0d2b4e);margin:0}
  .g66-sub{font-size:.78rem;color:#64748b;margin:2px 0 10px}
  .g66-boxes{display:flex;justify-content:center;gap:10px;margin:6px 0 12px}
  .g66-boxes b{width:60px;height:66px;border-radius:15px;border:2px solid #dbe7f3;display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--navy,#0d2b4e)}
  .g66-boxes b.typed{border-color:#123cf3;background:rgba(18,60,243,.08);animation:g66-pop .22s}
  .g66-boxes b.ghost{opacity:.4}
  .g66-err{font-size:.76rem;font-weight:700;color:#dc2626;background:rgba(220,38,38,.1);border-radius:10px;padding:8px;margin-bottom:10px;animation:g66-shake .3s}
  .g66-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .g66-keys.busy{opacity:.5;pointer-events:none}
  .g66-key{height:clamp(44px,7.5vh,56px);border-radius:15px;border:1px solid #dbe7f3;border-bottom-width:4px;background:var(--surface,#fff);color:var(--navy,#0d2b4e);font:700 1.35rem/1 inherit;font-family:inherit;cursor:pointer;touch-action:manipulation}
  .g66-key:active{transform:translateY(2px);border-bottom-width:2px;background:rgba(18,60,243,.1)}
  .g66-key.del{color:#dc2626}
  .g66-key.ok{background:#123cf3;border-color:#0b2bb5;color:#fff}
  .g66-btn{width:100%;min-height:46px;border-radius:14px;border:2px solid #123cf3;background:#123cf3;color:#fff;font:700 .92rem inherit;font-family:inherit;margin-top:10px;cursor:pointer}
  .g66-btn.alt{background:transparent;color:#123cf3}
  .g66-btn.ghost{background:transparent;border-color:transparent;color:#64748b}
  .g66-views{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:4px}
  .g66-view{border:2px solid #dbe7f3;border-radius:16px;background:transparent;padding:6px 4px 8px;cursor:pointer;font-family:inherit;color:inherit;animation:g66-rise .35s backwards}
  .g66-view:nth-child(2){animation-delay:.05s}.g66-view:nth-child(3){animation-delay:.1s}.g66-view:nth-child(4){animation-delay:.15s}
  .g66-view svg{display:block;width:100%;max-height:20vh}
  .g66-view strong{display:block;font-size:.82rem;color:var(--navy,#0d2b4e)}
  .g66-view small{display:block;font-size:.6rem;color:#64748b;line-height:1.3}
  .g66-view.on{border-color:#123cf3;background:rgba(18,60,243,.08)}
  .g66-view:active{transform:scale(.95)}
  .g66-hint{display:flex;align-items:center;justify-content:center;gap:8px;font-size:.72rem;font-weight:600;color:#64748b;margin-top:12px}
  .g66-hint b,.g66-pkey{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;background:#123cf3;color:#fff;font-size:.9rem;font-weight:800;line-height:1}

  .g66-intro{position:fixed;inset:0;z-index:600;overflow:hidden;background:#0d2b4e;animation:g66-fade .15s;cursor:pointer}
  .g66-intro.out{animation:g66-out .25s forwards}
  .g66-tag{position:absolute;max-width:78vw;padding:12px 26px;border-radius:40px;color:#fff;font-size:clamp(1.4rem,7.5vw,2.4rem);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:3px solid #fff;background:var(--c)}
  .g66-tag span{display:inline-block;animation:g66-letter .5s backwards cubic-bezier(.2,1.8,.4,1)}
  .g66-vs{position:absolute;left:50%;top:50%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:#fbbf24;color:#0d2b4e;display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-weight:900;animation:g66-vs .5s .35s backwards cubic-bezier(.2,1.8,.4,1)}
  .g66-pos-top{top:20%;left:50%;transform:translateX(-50%) rotate(180deg);animation:g66-down .45s backwards}
  .g66-pos-bottom{bottom:20%;left:50%;transform:translateX(-50%);animation:g66-up .45s backwards}
  .g66-pos-left{top:30%;left:6%;max-width:70vw;animation:g66-lr .45s backwards}
  .g66-pos-right{bottom:30%;right:6%;max-width:70vw;animation:g66-rl .45s backwards}

  .g66-banner{position:fixed;left:50%;top:50%;z-index:400;pointer-events:none;max-width:88vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:10px 24px;border-radius:40px;border:3px solid #fff;background:var(--c);color:#fff;font-size:1.15rem;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.35);transform:translate(-50%,-50%) rotate(var(--r));animation:g66-banner 1.2s forwards}
  .g66-pop{position:fixed;z-index:410;pointer-events:none;white-space:nowrap;font-size:1.5rem;font-weight:900;color:var(--c);text-shadow:0 0 3px #fff,0 0 3px #fff,0 2px 6px rgba(0,0,0,.3);transform:translate(-50%,-50%) rotate(var(--r));animation:g66-float 1s forwards}
  .g66-confetti{position:fixed;inset:0;width:100%;height:100%;z-index:450;pointer-events:none}
  .g66-name span{display:inline-block;animation:g66-wave 1.4s ease-in-out infinite;white-space:pre}

  @keyframes g66-fade{from{opacity:0}}
  @keyframes g66-out{to{opacity:0}}
  @keyframes g66-rise{from{opacity:0;transform:translateY(26px) scale(.94)}}
  @keyframes g66-pop{50%{transform:scale(1.14)}}
  @keyframes g66-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
  @keyframes g66-letter{from{opacity:0;transform:translateY(-26px) scale(.4)}}
  @keyframes g66-vs{from{opacity:0;transform:scale(3) rotate(-90deg)}}
  @keyframes g66-down{from{opacity:0;transform:translate(-50%,-30vh) rotate(180deg)}}
  @keyframes g66-up{from{opacity:0;transform:translate(-50%,30vh)}}
  @keyframes g66-lr{from{opacity:0;transform:translateX(-80vw)}}
  @keyframes g66-rl{from{opacity:0;transform:translateX(80vw)}}
  @keyframes g66-banner{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--r)) scale(.4)}18%{opacity:1;transform:translate(-50%,-50%) rotate(var(--r)) scale(1.1)}28%,78%{opacity:1;transform:translate(-50%,-50%) rotate(var(--r)) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--r)) scale(.9)}}
  @keyframes g66-float{0%{opacity:0;scale:.4}20%{opacity:1;scale:1.25}35%{scale:1}75%{opacity:1}100%{opacity:0;translate:0 -46px}}
  @keyframes g66-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-9px)}}
  @media (prefers-reduced-motion:reduce){.g66-ov,.g66-card,.g66-view,.g66-tag,.g66-tag span,.g66-vs,.g66-name span{animation:none!important}}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const lettersHTML = (text, delay = 0, step = 45) =>
    [...String(text)].map((c, i) => `<span style="animation-delay:${delay + i * step}ms">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');

  /* ───────── Pictures of a phone on a table ───────── */
  function picture(id, you, other) {
    const v = VIEWS[id], short = n => esc(n.length > 9 ? n.slice(0, 8) + '…' : n);
    const person = (seat, name, color) => {
      const [x, y, turn] = { top: [70, 17, 180], bottom: [70, 113, 0], left: [26, 66, 0], right: [114, 66, 0] }[seat];
      // long names are squeezed so they always stay inside the picture
      const squeeze = name.length > 7 ? ' textLength="46" lengthAdjust="spacingAndGlyphs"' : '';
      const label = (v.face ? 'x="19" y="6" text-anchor="start"' : 'x="0" y="27" text-anchor="middle"') + squeeze;
      return `<g transform="translate(${x} ${y}) rotate(${turn})">
        <circle cy="-8" r="8" fill="${color}"/><path d="M-14 12a14 12 0 0 1 28 0z" fill="${color}"/>
        <text ${label} font-size="9" font-weight="800" fill="currentColor">${short(name)}</text></g>`;
    };
    const mine = '#e11d48', theirs = '#123cf3';
    const zone = (seat, color) => {
      const [x, y, w, h] = { top: [56, 38, 28, 9], bottom: [56, 83, 28, 9], left: [54, 80, 15, 13], right: [71, 80, 15, 13] }[seat];
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${color}"/>`;
    };
    return `<svg viewBox="0 0 140 130" aria-hidden="true">
      <rect x="1" y="1" width="138" height="128" rx="18" fill="#aed6f6" opacity=".35"/>
      <rect x="50" y="30" width="40" height="70" rx="8" fill="#fff" stroke="#0d2b4e" stroke-width="3.5"/>
      <rect x="56" y="${v.face ? 52 : 40}" width="28" height="${v.face ? 26 : 34}" rx="3" fill="#dbeafe"/>
      ${zone(v.seats[0], mine)}${zone(v.seats[1], theirs)}
      ${person(v.seats[0], you, mine)}${person(v.seats[1], other, theirs)}</svg>`;
  }
  const describe = (id, you, other) => {
    const [a, b] = VIEWS[id].seats;
    return `${esc(you)}: ${a}<br>${esc(other)}: ${b}`;
  };

  /* ───────── Overlay helper ───────── */
  function overlay() {
    const el = document.createElement('div');
    el.className = 'g66-ov';
    el.innerHTML = '<div class="g66-card" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(el);
    return [el, el.firstChild];
  }
  const isOpen = () => !!$('.g66-ov,.g66-intro');

  function viewStep(card, you, other, current, closeLabel, done) {
    card.innerHTML = `<h2>How are you sitting?</h2>
      <p class="g66-sub">Put the phone on the table and pick your view</p>
      <div class="g66-views">${Object.keys(VIEWS).map(id => `
        <button type="button" class="g66-view${id === current ? ' on' : ''}" data-view="${id}">
          ${picture(id, you, other)}<strong>${VIEWS[id].name}</strong><small>${describe(id, you, other)}</small>
        </button>`).join('')}</div>
      <div class="g66-hint"><b>P</b> The P button changes the view any time</div>
      <button type="button" class="g66-btn ghost">${closeLabel}</button>`;
    card.querySelectorAll('.g66-view').forEach(btn => btn.onclick = () => { buzz(15); done(btn.dataset.view); });
    card.querySelector('.ghost').onclick = () => done(null);
  }

  // change the view during a game; resolves to a view id, or null if closed
  function pickView(you, other, current) {
    if (isOpen()) return Promise.resolve(null);
    return new Promise(resolve => {
      const [el, card] = overlay();
      viewStep(card, you, other, current, 'Close', view => { el.remove(); if (view) save(view); resolve(view); });
    });
  }

  /* ───────── "You vs Friend": ID keypad, then the view ───────── */
  function friend(me) {
    return new Promise(resolve => {
      const [el, card] = overlay();
      let id = '', checking = false;
      const finish = result => { document.removeEventListener('keydown', keys); el.remove(); resolve(result); };
      const chooseView = name => {
        document.removeEventListener('keydown', keys);
        viewStep(card, me.name, name, saved('face-bottom'), 'Cancel', view => {
          if (view) save(view);
          finish(view ? { name, view } : null);
        });
      };
      const error = msg => { const e = $('.g66-err', card); e.textContent = msg; e.hidden = false; };

      function entry() {
        card.innerHTML = `<h2>You vs Friend</h2><p class="g66-sub">Enter your friend's ID (5 means 005)</p>
          <div class="g66-boxes"><b></b><b></b><b></b></div><div class="g66-err" hidden></div>
          <div class="g66-keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k =>
            `<button type="button" class="g66-key ${k.length > 1 ? k : ''}" data-k="${k}">${k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k}</button>`).join('')}</div>
          <button type="button" class="g66-btn ghost">Cancel</button>`;
        card.querySelectorAll('.g66-key').forEach(b => b.onclick = () => press(b.dataset.k));
        $('.ghost', card).onclick = () => finish(null);
      }
      function draw() {
        const shown = id ? id.padStart(3, '0') : '';
        card.querySelectorAll('.g66-boxes b').forEach((box, i) => {
          const changed = box.textContent !== (shown[i] || '');
          box.textContent = shown[i] || '';
          const typed = id && i >= 3 - id.length;
          if (changed || !typed) { box.className = ''; void box.offsetWidth; }
          box.className = !id ? '' : typed ? 'typed' : 'ghost';
        });
      }
      function press(k) {
        if (checking || !$('.g66-keys', card)) return;
        if (k === 'ok') return submit();
        $('.g66-err', card).hidden = true;
        if (k === 'del') id = id.slice(0, -1);
        else if (id.length < 3) id += k;
        buzz(8);
        draw();
      }
      async function submit() {
        if (!id) return error('Enter an ID number');
        const value = id.padStart(3, '0');
        if (value === '138') return shared();
        if (typeof studentsReady === 'undefined') return error('students.js is missing. Upload it next to this page');
        checking = true; $('.g66-keys', card).classList.add('busy');
        await studentsReady;
        checking = false;
        if (!el.isConnected) return;
        $('.g66-keys', card).classList.remove('busy');
        if (!Object.keys(STUDENTS).length) return error('Cannot load students.json (' + studentsError + ')');
        const name = STUDENTS[value];
        if (!name) return error('ID not found!');
        if (value === me.roll) return error("That's you! Pick a friend.");
        chooseView(name);
      }
      function shared() {
        card.innerHTML = `<h2>Who is your friend?</h2><p class="g66-sub">ID 138 is shared</p><div class="g66-err" hidden></div>
          <button type="button" class="g66-btn" data-name="Aion">Aion</button>
          <button type="button" class="g66-btn alt" data-name="Maria">Maria</button>
          <button type="button" class="g66-btn ghost">Cancel</button>`;
        card.querySelectorAll('[data-name]').forEach(b => b.onclick = () => {
          if (me.roll === '138' && me.name === b.dataset.name) return error("That's you! Pick the other one.");
          chooseView(b.dataset.name);
        });
        $('.ghost', card).onclick = () => finish(null);
      }
      function keys(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('del');
        else if (e.key === 'Enter') { e.preventDefault(); press('ok'); }
        else if (e.key === 'Escape') finish(null);
      }
      document.addEventListener('keydown', keys);
      entry();
    });
  }

  /* ───────── Remember the last view ───────── */
  function saved(fallback) {
    try { const v = localStorage.getItem('66games_view'); if (VIEWS[v]) return v; } catch (e) {}
    return fallback;
  }
  function save(v) { try { localStorage.setItem('66games_view', v); } catch (e) {} }

  /* ───────── Name vs name opening ───────── */
  function intro(players, view) {
    return new Promise(resolve => {
      if (calm) return resolve();
      const el = document.createElement('div');
      el.className = 'g66-intro';
      el.innerHTML = players.map((p, i) => `<div class="g66-tag g66-pos-${VIEWS[view].seats[i]}" style="--c:${p.color}">${lettersHTML(p.name, 300 + i * 120)}</div>`).join('') +
        '<div class="g66-vs">VS</div>';
      document.body.appendChild(el);
      buzz(40);
      let done = false;
      const end = () => {
        if (done) return; done = true;
        el.classList.add('out');
        setTimeout(() => { el.remove(); resolve(); }, 250);
      };
      el.onclick = end;
      setTimeout(end, 1700);
    });
  }

  /* ───────── In-game effects ───────── */
  function banner(text, { color = '#123cf3', flip = false } = {}) {
    document.querySelectorAll('.g66-banner').forEach(e => e.remove());
    const el = document.createElement('div');
    el.className = 'g66-banner';
    el.textContent = text;
    el.style.setProperty('--c', color);
    el.style.setProperty('--r', flip ? '180deg' : '0deg');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1250);
  }
  // floating word at a screen position, or over the middle of an element
  function pop(text, target, { color = '#123cf3', flip = false } = {}) {
    let x = innerWidth / 2, y = innerHeight / 2;
    if (target && target.getBoundingClientRect) { const r = target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    else if (target) { x = target.x; y = target.y; }
    const el = document.createElement('div');
    el.className = 'g66-pop';
    el.textContent = text;
    el.style.cssText = `left:${Math.max(70, Math.min(innerWidth - 70, x))}px;top:${y}px`;
    el.style.setProperty('--c', color);
    el.style.setProperty('--r', flip ? '180deg' : '0deg');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1050);
  }

  // one small canvas burst; stops itself and removes the canvas (easy on low-end phones)
  function confetti({ x = .5, y = .45, count = 70 } = {}) {
    if (calm) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'g66-confetti';
    const w = canvas.width = innerWidth, h = canvas.height = innerHeight;
    document.body.appendChild(canvas);
    const g = canvas.getContext('2d');
    const colors = ['#ef4444', '#123cf3', '#fbbf24', '#22c55e', '#ec4899', '#38bdf8'];
    const bits = Array.from({ length: count }, (_, i) => {
      const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 8;
      return { x: w * x, y: h * y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, c: colors[i % colors.length], w: 6 + Math.random() * 5, r: Math.random() * 6 };
    });
    const start = performance.now();
    let last = start;
    (function frame(now) {
      const k = Math.min(3, (now - last) / 16.7); last = now;
      g.clearRect(0, 0, w, h);
      g.globalAlpha = Math.max(0, Math.min(1, (2200 - (now - start)) / 500));
      for (const b of bits) {
        b.vy += .22 * k; b.vx *= .985; b.x += b.vx * k; b.y += b.vy * k; b.r += .2 * k;
        g.fillStyle = b.c;
        g.fillRect(b.x, b.y, b.w, b.w * Math.abs(Math.cos(b.r)) + 1);
      }
      if (now - start < 2200) requestAnimationFrame(frame); else canvas.remove();
    })(start);
  }

  // winner's name bouncing letter by letter
  function wave(el, text) {
    el.innerHTML = `<span class="g66-name">${lettersHTML(text, 0, 70)}</span>`;
    el.setAttribute('aria-label', text);
  }
  function celebrate() { buzz([40, 60, 40, 60, 120]); confetti(); setTimeout(() => confetti({ x: .2, y: .3, count: 40 }), 350); setTimeout(() => confetti({ x: .8, y: .35, count: 40 }), 650); }

  // keyboard P does the same as the P button
  function onP(fn) {
    document.addEventListener('keydown', e => {
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !isOpen()) fn();
    });
  }

  return { VIEWS, friend, pickView, intro, banner, pop, confetti, celebrate, wave, buzz, onP, saved, isOpen };
})();
