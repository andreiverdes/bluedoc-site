// The home page's copy, one export per section.

export const nav = {
  brand: 'Acme Fit',
  links: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Blog', href: '/blog/' },
  ],
  cta: 'Get the app',
};

export const hero = {
  kicker: 'New: weekly goals',
  headline: 'Track every workout in one place.',
  subline: 'Acme Fit logs runs, rides and lifts from your watch and phone, then shows your week at a glance.',
  cta: 'Start free trial',
  cta2: 'See how it works',
  ring: { done: 72, label: 'of this week' },
  stats: [
    { value: '4', label: 'workouts' },
    { value: '3 h 10', label: 'active' },
    { value: '28 km', label: 'moved' },
  ],
};

export const features = {
  title: 'Everything your week needs',
  lead: 'Three things members open the app for every day.',
  items: [
    { icon: 'log', title: 'Automatic log', body: 'Workouts arrive from your watch. Nothing to type, nothing to forget.' },
    { icon: 'goal', title: 'Weekly goals', body: 'Pick a target for the week; the ring fills as you move.' },
    { icon: 'coach', title: 'Coach notes', body: 'A short plan for tomorrow, written from what you did today.' },
  ],
} as const;

export const pricing = {
  title: 'One plan, two ways to pay',
  lead: 'Every feature on every plan. Cancel any time from the app.',
  plans: [
    { name: 'Monthly', price: '$7.99', per: '/month', note: 'Billed every month', cta: 'Start free trial', lead: true },
    { name: 'Yearly', price: '$79', per: '/year', note: 'Two months free', cta: 'Choose yearly', lead: false },
  ],
  includes: ['Every feature', 'Watch and phone', '14-day free trial'],
};

export const faq = {
  title: 'Questions',
  items: [
    { q: 'Which watches work with Acme Fit?', a: 'Any watch that writes workouts to Apple Health or Health Connect.' },
    { q: 'Can I pause my plan?', a: 'Yes, for up to three months, from Settings › Plan.' },
    { q: 'Do coach notes need a watch?', a: 'They read your heart rate, so they need a watch. Everything else works on a phone alone.' },
    { q: 'What happens after the free trial?', a: 'Your plan starts on day 15. We remind you two days before.' },
  ],
};

export const footer = {
  links: ['Privacy', 'Terms', 'Support', 'Careers'],
  legal: '© 2026 Acme Corp',
};
