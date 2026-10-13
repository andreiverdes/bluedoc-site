// The page's only JavaScript: theme toggle, sticky nav state, copy buttons, install tabs, scroll reveals and clips.

const THEME_KEY = 'bd-site-theme';
const root = document.documentElement;

// ---- theme ----
function syncThemeButton(): void {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-label', `Switch to ${next} theme`);
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'light' ? '#f5f8ff' : '#05070f');
}
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, root.dataset.theme);
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

// ---- tabs (WAI-ARIA tabs pattern: arrows, Home, End; automatic activation) ----
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
      const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      select(tabs[to], true);
    });
  });
});

// ---- scroll reveals: add .is-in once, when an element enters the viewport ----
const revealed = document.querySelectorAll('[data-reveal], [data-loop], [data-type]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('is-in'));
}

// ---- clips (Clip.astro): play while in view; with reduced motion, only after the play button ----
// The button's pick wins over both: a clip the reader paused stays paused, one they started plays while in view.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('[data-clip]').forEach((clip) => {
  const video = clip.querySelector('video');
  const toggle = clip.querySelector<HTMLButtonElement>('[data-clip-toggle]');
  if (!video || !toggle) return;
  let inView = false;
  let picked: 'play' | 'pause' | null = null;
  const paint = () => {
    const playing = !video.paused;
    clip.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pause clip' : 'Play clip');
  };
  const update = () => {
    const want = inView && (picked ? picked === 'play' : !reduceMotion.matches);
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
