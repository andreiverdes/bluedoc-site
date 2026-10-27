// Behaviour that works with or without motion: theme toggle, sticky nav state, menus, copy buttons, tabs and clips.
// Everything that animates is in motion.ts.

const THEME_KEY = 'bd-site-theme';
const root = document.documentElement;

// ---- theme: dark by default; a switch lasts for this tab session (sessionStorage), so every new visit opens dark ----
function syncThemeButton(): void {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-label', `Switch to ${next} theme`);
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'light' ? '#f3f6fc' : '#05070f');
}
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try {
      sessionStorage.setItem(THEME_KEY, root.dataset.theme);
    } catch {
      /* private mode: the pick lasts for this page view */
    }
    syncThemeButton();
  });
});
syncThemeButton();

// ---- nav: glass background once the page scrolls ----
const nav = document.querySelector<HTMLElement>('[data-nav]');
const sentinel = document.querySelector('[data-nav-sentinel]');
if (nav && sentinel) {
  new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
}
// The mobile menu and the Doc types menu are <details>: close them after a link is picked, on Escape (focus back
// on the summary), on a click outside, and when keyboard focus moves out of them.
const menus = document.querySelectorAll<HTMLDetailsElement>('[data-nav-menu], [data-nav-types]');
menus.forEach((menu) => {
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) menu.open = false;
  });
  menu.addEventListener('focusout', (e) => {
    const to = e.relatedTarget as Node | null;
    if (to && !menu.contains(to)) menu.open = false;
  });
});
document.addEventListener('click', (e) => {
  menus.forEach((menu) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  menus.forEach((menu) => {
    if (!menu.open) return;
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });
});

// ---- copy buttons ----
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => {
  let timer: number | undefined;
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy ?? '');
    } catch {
      return;
    }
    const label = b.getAttribute('aria-label') ?? '';
    b.setAttribute('data-copied', '');
    b.setAttribute('aria-label', 'Copied');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      b.removeAttribute('data-copied');
      b.setAttribute('aria-label', label);
    }, 1600);
  });
});

// ---- tabs (WAI-ARIA tabs pattern: arrows, Home, End; automatic activation). Up and Down work too, for the
// install tabs that run down the page on a desktop. ----
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((box) => {
  const tabs = [...box.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement, focus: boolean) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const next = (i + 1) % n;
      const prev = (i - 1 + n) % n;
      const to = { ArrowRight: next, ArrowDown: next, ArrowLeft: prev, ArrowUp: prev, Home: 0, End: n - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      select(tabs[to], true);
    });
  });
});

// ---- clips (Clip.astro): play while in view; with reduced motion, only after the play button ----
// The button's pick wins over both: a clip the reader paused stays paused, one they started plays while in view.
// Clips that share one spot (the loop's sticky stage, motion.ts) get `bd:stage` to say whether theirs is the one on
// show; a clip that isn't stays paused.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('[data-clip]').forEach((clip) => {
  const video = clip.querySelector('video');
  const toggle = clip.querySelector<HTMLButtonElement>('[data-clip-toggle]');
  if (!video || !toggle) return;
  let inView = false;
  let onStage = true;
  let picked: 'play' | 'pause' | null = null;
  const paint = () => {
    const playing = !video.paused;
    clip.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pause clip' : 'Play clip');
  };
  const update = () => {
    const want = inView && onStage && (picked ? picked === 'play' : !reduceMotion.matches);
    if (want && video.paused) video.play().catch(() => {});
    else if (!want && !video.paused) video.pause();
  };
  const syncMotion = () => {
    clip.toggleAttribute('data-reduce', reduceMotion.matches);
    update();
  };
  video.addEventListener('play', paint);
  video.addEventListener('pause', paint);
  toggle.addEventListener('click', () => {
    picked = video.paused ? 'play' : 'pause';
    update();
  });
  clip.addEventListener('bd:stage', (e) => {
    onStage = (e as CustomEvent<boolean>).detail;
    update();
  });
  reduceMotion.addEventListener('change', syncMotion);
  toggle.hidden = false;
  paint();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        update();
      },
      { threshold: 0.35 },
    ).observe(clip);
  } else {
    inView = true;
  }
  syncMotion();
});
