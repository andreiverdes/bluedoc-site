// window.stage: what a film scenario drives (through clips/lib/stage.mjs). Every timed call returns a promise that
// settles when it has played, so a scenario awaits each beat in real time and the recording shows it at that pace.
// Text takes a small inline markup: **bold**, `code`.
(() => {
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<span class="b">$1</span>').replace(/`([^`]+)`/g, '<span class="code">$1</span>');
  const out = $('out');

  function line(html, cls = '') {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.append(d);
    return d;
  }

  let spinTimer = null;
  let tools = 0;

  const term = {
    title(text) {
      $('term-title').textContent = text;
    },
    clear() {
      out.replaceChildren();
      $('input').textContent = '';
      $('ghost').textContent = '';
      term.spin(null);
    },
    footer(text) {
      $('footer').textContent = text || '';
    },
    /** a blank line between turns */
    gap() {
      line('', 'gap');
    },
    /** lines printed as they are: {text, cls} or a string; lps lines a second (0: all at once) */
    async block(lines, { lps = 0, cls = '' } = {}) {
      for (const l of lines) {
        const o = typeof l === 'string' ? { text: l } : l;
        line(o.html ?? inline(o.text), o.cls ?? cls);
        if (lps) await sleep(1000 / lps);
      }
    },
    /** types into the input box */
    async type(text, cps = 26) {
      $('ghost').textContent = '';
      const el = $('input');
      for (const ch of text) {
        el.textContent += ch;
        await sleep(1000 / cps * (ch === ' ' ? 0.6 : 1) * (0.75 + Math.random() * 0.5));
      }
    },
    /** Enter: the typed prompt goes into the scrollback */
    submit() {
      const el = $('input');
      line(esc(el.textContent), 'u');
      el.textContent = '';
    },
    ghost(text) {
      $('ghost').textContent = text || '';
    },
    /** a tool call, running (its dot blinks) until done(id); returns its id */
    tool(name, args = '') {
      const id = `t${++tools}`;
      const d = line(`<span class="dot"></span><span class="name">${esc(name)}</span>${args ? `(${inline(args)})` : ''}`, 'tool');
      d.id = id;
      return id;
    },
    /** the tool's dot turns green; its result lines follow under ⎿ (the first line) */
    async done(id, result = [], { lps = 0 } = {}) {
      const t = $(id);
      t.classList.add('ok');
      let after = t;
      for (const [i, l] of result.entries()) {
        const o = typeof l === 'string' ? { text: l } : l;
        const d = document.createElement('div');
        d.className = `res ${o.cls ?? ''}`;
        d.innerHTML = `<span class="k">${i ? '' : '⎿'}</span>${o.html ?? inline(o.text)}`;
        after.after(d);
        after = d;
        if (lps) await sleep(1000 / lps);
      }
    },
    /** the agent's own words, typed out fast */
    async say(text, cps = 110) {
      const d = line('<span class="dot" style="color:#fff"></span><span class="s"></span>', 'say');
      const s = d.querySelector('.s');
      let shown = '';
      for (const ch of text) {
        shown += ch;
        s.innerHTML = inline(shown);
        if (cps) await sleep(1000 / cps);
      }
    },
    /** the working spinner, with its seconds counter; verb null stops it */
    spin(verb) {
      clearInterval(spinTimer);
      const el = $('spin');
      if (!verb) {
        el.hidden = true;
        return;
      }
      const glyphs = '·✢✳✶✻✽✻✶✳✢';
      const t0 = performance.now();
      let k = 0;
      const draw = () => {
        const s = Math.floor((performance.now() - t0) / 1000);
        el.innerHTML = `${glyphs[k++ % glyphs.length]} ${esc(verb)}… <span class="t">(${s}s · esc to interrupt)</span>`;
      };
      el.hidden = false;
      draw();
      spinTimer = setInterval(draw, 120);
    },
  };

  const stage = {
    term,
    layout(mode) {
      document.body.classList.toggle('solo', mode === 'solo');
      return sleep(800);
    },
    /** html, or null to fade it out; [words] in the pixel face, {words} soft */
    async caption(text) {
      const el = $('caption');
      if (el.classList.contains('on')) {
        el.classList.remove('on');
        await sleep(380);
      }
      if (!text) return;
      el.innerHTML = esc(text).replace(/\[([^\]]+)\]/g, '<span class="px">$1</span>').replace(/\{([^}]+)\}/g, '<span class="soft">$1</span>');
      void el.offsetWidth;
      el.classList.add('on');
      await sleep(450);
    },
    /** loads url in the browser window; label is what its address bar shows */
    open(url, label) {
      $('url').textContent = label || url;
      $('frame').src = url;
    },
    /** the iframe's box and scale, for turning page coordinates into stage coordinates */
    frameBox() {
      const f = $('frame');
      const r = f.getBoundingClientRect();
      return { x: r.left, y: r.top, scale: r.width / f.offsetWidth };
    },
  };
  window.stage = stage;
})();
