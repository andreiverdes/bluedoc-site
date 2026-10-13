// The synthetic cursor, injected into every document before its own scripts run (Page.addScriptToEvaluateOnNewDocument).
// Headless Chrome draws no cursor, so the recorder moves this one: window.__clipCursor.move(x, y), .down(), .up().
// It lives in the top layer (a manual popover), so it stays above the page's own modal dialogs, and takes no
// pointer events, so hit-testing and hover go to the page under it.
(() => {
  if (window.__clipCursor) return;
  const SHAPES = {
    // macOS arrow: black fill, white outline; tip at (3, 2)
    arrow: {
      hot: [3, 2],
      svg: '<path d="M3 2v21.5l5.3-5.1 3.4 7.9 3.6-1.5-3.4-7.8h7.3z" fill="#fff"/><path d="M4.6 5.8v13.9l3.9-3.7 3.5 8.1 1.2-.5-3.5-8.1h5.4z" fill="#000"/>',
    },
    // pointing hand, fingertip at (10.5, 3)
    hand: {
      hot: [10.5, 3],
      svg: '<path d="M9 2.2c1.2 0 2.1.9 2.1 2.1v6.3l.4-.1c1-.3 2 .2 2.3 1l.1.3.5-.1c1-.2 1.9.3 2.2 1.2l.1.2.4-.1c1.2-.2 2.3.7 2.3 1.9v5.3c0 3.3-2.6 5.9-5.9 5.9h-2.3c-1.9 0-3.6-.9-4.7-2.4l-4.2-5.9c-.6-.9-.4-2.1.5-2.7.8-.5 1.8-.4 2.4.3l1.6 1.8V4.3c0-1.2.9-2.1 2.1-2.1z" fill="#fff"/><path d="M9 3.6c.4 0 .7.3.7.7v8.9h1.2v-1.5c0-.4.3-.7.7-.7s.7.3.7.7v1.5h1.2v-.7c0-.4.3-.7.7-.7s.7.3.7.7v.9h1.2v-.2c0-.4.3-.7.7-.7s.7.3.7.7v4.7c0 2.5-2 4.5-4.5 4.5h-2.3c-1.4 0-2.8-.7-3.6-1.8l-4.2-5.9c-.2-.3-.1-.6.1-.8.3-.2.6-.1.8.1l2.8 3.2h1.1V4.3c0-.4.3-.7.7-.7z" fill="#000"/>',
    },
    // text I-beam, centre (12, 13)
    ibeam: {
      hot: [12, 13],
      svg: '<path d="M8 3.5h3c.4 0 .8.2 1 .4.2-.2.6-.4 1-.4h3M8 22.5h3c.4 0 .8-.2 1-.4.2.2.6.4 1 .4h3M12 4v18" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M8 3.5h3c.4 0 .8.2 1 .4.2-.2.6-.4 1-.4h3M8 22.5h3c.4 0 .8-.2 1-.4.2.2.6.4 1 .4h3M12 4v18" fill="none" stroke="#000" stroke-width="1.3" stroke-linecap="round"/>',
    },
  };
  const CSS = `
    #__clip-cursor { position: fixed; inset: auto; left: 0; top: 0; width: 0; height: 0; margin: 0; padding: 0; border: 0;
      background: transparent; overflow: visible; pointer-events: none; z-index: 2147483647; contain: layout style; }
    #__clip-cursor svg { position: absolute; width: 26px; height: 30px; overflow: visible;
      filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / .45)); transition: transform .12s ease-out; }
    #__clip-cursor.down svg { transform: scale(.88); }
    #__clip-cursor i { position: absolute; left: -22px; top: -22px; width: 44px; height: 44px; border-radius: 50%;
      border: 2.5px solid rgb(60 140 255 / .95); background: rgb(60 140 255 / .22); pointer-events: none;
      animation: __clip-ripple .55s cubic-bezier(.2, .7, .3, 1) forwards; }
    @keyframes __clip-ripple { from { transform: scale(.2); opacity: 1; } to { transform: scale(1); opacity: 0; } }`;
  let el = null, svg = null, shape = 'arrow', forced = null, x = -100, y = -100;

  function mount() {
    if (el && el.isConnected) return;
    const root = document.documentElement;
    if (!root) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    el = document.createElement('div');
    el.id = '__clip-cursor';
    el.setAttribute('popover', 'manual');
    el.setAttribute('aria-hidden', 'true');
    el.append(style);
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 26 30');
    el.append(svg);
    root.append(el);
    el.__above = new Set();
    draw();
  }
  function raise() {
    // a modal dialog or a full-screen element that went into the top layer since the cursor did sits above it:
    // go in again, on top
    if (!el.showPopover) return;
    const top = [document.fullscreenElement, ...document.querySelectorAll('dialog:modal')].filter(Boolean);
    const open = el.matches(':popover-open');
    if (open && top.every((t) => el.__above.has(t))) return;
    if (open) el.hidePopover();
    el.showPopover();
    el.__above = new Set(top);
  }
  function pick() {
    if (forced) return forced;
    const under = document.elementFromPoint(x, y);
    if (!under) return 'arrow';
    const c = getComputedStyle(under).cursor;
    return c === 'pointer' ? 'hand' : c === 'text' ? 'ibeam' : 'arrow';
  }
  function draw() {
    const s = SHAPES[shape];
    if (svg.__shape !== shape) {
      svg.innerHTML = s.svg;
      svg.style.left = -s.hot[0] + 'px';
      svg.style.top = -s.hot[1] + 'px';
      svg.style.transformOrigin = `${s.hot[0]}px ${s.hot[1]}px`;
      svg.__shape = shape;
    }
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
  window.__clipCursor = {
    move(nx, ny) {
      mount();
      if (!el) return;
      x = nx;
      y = ny;
      raise();
      shape = pick();
      draw();
    },
    down() {
      mount();
      el.classList.add('down');
      const r = document.createElement('i');
      el.append(r);
      r.addEventListener('animationend', () => r.remove());
    },
    up() {
      el && el.classList.remove('down');
    },
    /** 'arrow' | 'hand' | 'ibeam' to pin a shape, null to follow the page's CSS cursor */
    shape(name) {
      forced = name && SHAPES[name] ? name : null;
      if (el) { shape = pick(); draw(); }
    },
    hide() { el && (el.style.visibility = 'hidden'); },
    show() { el && (el.style.visibility = ''); },
  };
})();
