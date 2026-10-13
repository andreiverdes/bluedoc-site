import { features } from '../content/site';
import { html, raw } from './html';

const ICONS: Record<(typeof features.items)[number]['icon'], string> = {
  log: '<path d="M4 6h16M4 12h10M4 18h7"/>',
  goal: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  coach: '<path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"/><circle cx="12" cy="8" r="3.5"/>',
};

export const Features = () => html`
  <section class="features" id="features">
    <div class="wrap">
      <h2>${features.title}</h2>
      <p class="lead">${features.lead}</p>
      <div class="grid3">
        ${features.items.map((f) => html`
          <article class="card">
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${raw(ICONS[f.icon])}</svg>
            <h3>${f.title}</h3>
            <p>${f.body}</p>
          </article>`)}
      </div>
    </div>
  </section>`;
