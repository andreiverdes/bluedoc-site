// Everything that moves, with Motion (motion.dev). It runs only when <html> has .motion, which Base.astro sets
// before paint unless the reader asks for reduced motion; otherwise every element is already in its final state.
//
//   [data-reveal]        fades and rises in once in view; its value staggers siblings (data-reveal="0", "1", …)
//   [data-count]         a number that counts up from 0 to its text
//   [data-parallax]      an image that drifts against the scroll inside its frame
//   [data-autoplay]      a tab list that moves to the next tab every few seconds while in view
import { animate, inView, scroll, type AnimationPlaybackControls } from 'motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const root = document.documentElement;

if (root.classList.contains('motion')) {
  // ---- reveals ----
  // The rise uses Motion's own `y` (a transform): Motion holds the CSS `translate` property at its first keyframe
  // and only applies the last one when it finishes, which made everything snap up 28 px at the end. Once in, the
  // inline transform and filter are cleared, so the element is back to its own CSS.
  inView(
    '[data-reveal]',
    (el) => {
      const i = Number((el as HTMLElement).dataset.reveal) || 0;
      el.classList.add('is-in');
      animate(el, { opacity: [0, 1], y: [28, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.9, delay: i * 0.08, ease: EASE }).then(() => {
        (el as HTMLElement).style.filter = '';
        (el as HTMLElement).style.transform = '';
      });
    },
    { amount: 0.15, margin: '0px 0px -8% 0px' },
  );

  // ---- counters ----
  inView(
    '[data-count]',
    (el) => {
      const to = Number(el.textContent);
      animate(0, to, {
        duration: Math.min(1.6, 0.6 + to / 20),
        ease: EASE,
        onUpdate: (v) => (el.textContent = String(Math.round(v))),
      });
    },
    { amount: 0.6 },
  );

  // ---- parallax, linked to scroll ----
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
    scroll(animate(img, { y: ['-5%', '5%'] }, { ease: 'linear' }), {
      target: img.parentElement ?? img,
      offset: ['start end', 'end start'],
    });
  });
}

// ---- tab autoplay: only with motion, only while in view, and it stops for good once the reader picks a tab ----
// A tab's own data-seconds (its film's length) overrides the list's; the next tab's video starts from its start.
document.querySelectorAll<HTMLElement>('[data-autoplay]').forEach((box) => {
  if (!root.classList.contains('motion')) return;
  const tabs = [...box.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const seconds = Number(box.dataset.autoplay) || 6;
  let run: AnimationPlaybackControls | undefined;
  let stopped = false;
  const bar = (tab: HTMLElement) => tab.querySelector<HTMLElement>('[data-progress]');
  const play = () => {
    if (stopped) return;
    const at = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    tabs.forEach((t) => bar(t)?.style.setProperty('transform', 'scaleX(0)'));
    const progress = bar(tabs[at]);
    if (!progress) return;
    run = animate(progress, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: Number(tabs[at].dataset.seconds) || seconds, ease: 'linear' });
    run.finished.then(() => {
      if (stopped) return;
      const next = tabs[(at + 1) % tabs.length];
      document
        .getElementById(next.getAttribute('aria-controls') ?? '')
        ?.querySelectorAll('video')
        .forEach((v) => (v.currentTime = 0));
      next.click();
      play();
    });
  };
  tabs.forEach((t) =>
    t.addEventListener('click', (e) => {
      if (!e.isTrusted) return;
      stopped = true;
      run?.stop();
      tabs.forEach((x) => bar(x)?.style.setProperty('transform', x === t ? 'scaleX(1)' : 'scaleX(0)'));
    }),
  );
  inView(
    box,
    () => {
      if (run) run.play();
      else play();
      return () => run?.pause();
    },
    { amount: 0.4 },
  );
});
