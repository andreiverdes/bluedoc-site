// The blog's posts and its subscribe box.

export const blog = {
  title: 'The Acme Fit blog',
  lead: 'Training notes, member stories and what is new in the app.',
};

export const posts = [
  { slug: 'weekly-goals', tag: 'Product', date: 'Oct 8, 2026', title: 'Weekly goals are here', excerpt: 'Set a target for the week and watch the ring fill. Here is how we picked the defaults.', tone: 'indigo' },
  { slug: 'first-10k', tag: 'Member story', date: 'Oct 1, 2026', title: 'From the couch to a 10K in twelve weeks', excerpt: 'One member ran her first 10K in March. She logged every run and missed only two.', tone: 'emerald' },
  { slug: 'rest-days', tag: 'Training', date: 'Sep 24, 2026', title: 'Why rest days count as training', excerpt: 'Your muscles grow between workouts, not during them. Plan the rest like the work.', tone: 'amber' },
  { slug: 'coach-notes', tag: 'Product', date: 'Sep 17, 2026', title: 'How coach notes read your week', excerpt: 'Heart rate, sleep and what you did yesterday: the three inputs behind every note.', tone: 'sky' },
  { slug: 'strength-basics', tag: 'Training', date: 'Sep 10, 2026', title: 'Four lifts that cover the whole body', excerpt: 'Squat, hinge, push and pull. Twenty minutes, twice a week, is enough to start.', tone: 'rose' },
  { slug: 'run-club', tag: 'Community', date: 'Sep 3, 2026', title: 'Start a run club at work', excerpt: 'Shared goals, a weekly route and one rule: nobody runs alone.', tone: 'violet' },
];

export const subscribe = {
  title: 'Get the weekly note',
  body: 'One workout idea and one member story, every Sunday.',
  placeholder: 'you@example.com',
  cta: 'Subscribe',
};
