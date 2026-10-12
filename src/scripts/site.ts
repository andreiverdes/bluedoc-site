// The page's only JavaScript: theme toggle, sticky nav state, copy buttons, install tabs and scroll reveals.

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
// close the mobile menu after picking a link
const menu = document.querySelector<HTMLDetailsElement>('[data-nav-menu]');
menu?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) menu.open = false;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.open) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
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
