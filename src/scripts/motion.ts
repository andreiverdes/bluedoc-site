// Everything that moves, with Motion (motion.dev). It runs only when <html> has .motion, which Base.astro sets
// before paint unless the reader asks for reduced motion; otherwise every element is already in its final state.
//
//   [data-reveal]        fades and rises in once in view; its value staggers siblings (data-reveal="0", "1", …)
//   [data-count]         a number that counts up from 0 to its text
//   [data-parallax]      an image that drifts against the scroll inside its frame
//   [data-tilt]          a frame that tilts back and settles flat as it scrolls into view
//   [data-steps]         a pinned row of [data-step] slides driven by scroll, with a bar of [data-step-go] steps that
//                        fill as it passes (state, so it runs with or without motion; desktop only)
//   [data-autoplay]      a tab list that moves to the next tab every few seconds while in view
//   [data-scan]          a giant wordmark lit by a scan line
import { animate, inView, scroll, type AnimationPlaybackControls } from 'motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const root = document.documentElement;
const desktop = matchMedia('(min-width: 1024px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Elements that only need .is-in (the CSS typing in CodePeek): with no motion, at once.
const flagged = document.querySelectorAll('[data-type]');

if (!root.classList.contains('motion')) {
  flagged.forEach((el) => el.classList.add('is-in'));
} else {
  inView(flagged, (el) => void el.classList.add('is-in'), { amount: 0.2 });

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

  // ---- parallax and tilt, linked to scroll ----
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
    scroll(animate(img, { y: ['-5%', '5%'] }, { ease: 'linear' }), {
      target: img.parentElement ?? img,
      offset: ['start end', 'end start'],
    });
  });
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((frame) => {
    scroll(
      animate(
        frame,
        { transform: ['perspective(1600px) rotateX(16deg) scale(0.93)', 'perspective(1600px) rotateX(0deg) scale(1)'] },
        { ease: 'linear' },
      ),
      { target: frame, offset: ['start end', 'center center'] },
    );
  });

  // ---- footer wordmark ----
  inView(
    '[data-scan]',
    (el) => {
      const lit = el.querySelector<HTMLElement>('[data-scan-lit]');
      const line = el.querySelector<HTMLElement>('[data-scan-line]');
      if (!lit || !line) return;
      animate(lit, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 1.8, ease: [0.65, 0, 0.35, 1] });
      animate(line, { left: ['0%', '100%'], opacity: [1, 1, 0] }, { duration: 1.8, ease: [0.65, 0, 0.35, 1] });
    },
    { amount: 0.5 },
  );
}

// ---- the loop: while the row scrolls past, its progress picks the slide on show (one equal stretch each) and fills
// the bar step by step. Only that slide's clip plays and only it takes focus. Below 1024 px every slide shows and
// plays in place. A step in the bar scrolls to the middle of its stretch. ----
document.querySelectorAll<HTMLElement>('[data-steps]').forEach((box) => {
  const slides = [...box.querySelectorAll<HTMLElement>('[data-step]')];
  const goes = [...box.querySelectorAll<HTMLElement>('[data-step-go]')];
  const n = slides.length;
  let at: number | undefined;
  const light = (i: number) => {
    if (i === at) return;
    at = i;
    slides.forEach((slide, k) => {
      const shown = i < 0 || k === i;
      slide.toggleAttribute('data-on', k === i);
      slide.inert = !shown;
      slide.querySelectorAll('[data-clip]').forEach((clip) => clip.dispatchEvent(new CustomEvent('bd:stage', { detail: shown })));
    });
    goes.forEach((g, k) => g.toggleAttribute('data-on', k === i));
  };
  scroll(
    (p: number) => {
      if (!desktop.matches) return light(-1);
      const s = Math.min(n - 1e-4, Math.max(0, p * n));
      const i = Math.floor(s);
      goes.forEach((g, k) => g.style.setProperty('--fill', String(k < i ? 1 : k > i ? 0 : s - i)));
      light(i);
    },
    { target: box, offset: ['start start', 'end end'] },
  );
  goes.forEach((g, i) =>
    g.addEventListener('click', () => {
      const top = box.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + ((i + 0.5) / n) * (box.offsetHeight - innerHeight), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }),
  );
});

// ---- tab autoplay: only with motion, only while in view, and it stops for good once the reader picks a tab ----
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
    run = animate(progress, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: seconds, ease: 'linear' });
    run.finished.then(() => {
      if (stopped) return;
      tabs[(at + 1) % tabs.length].click();
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
