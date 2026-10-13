import { hero } from '../content/site';
import { html } from './html';

export const Hero = () => html`
  <section class="hero" id="hero">
    <div class="wrap">
      <div class="hero-copy">
        <span class="kicker">${hero.kicker}</span>
        <h1 id="hero-title">${hero.headline}</h1>
        <p class="sub">${hero.subline}</p>
        <div class="ctas">
          <a class="btn btn-l" href="/#pricing">${hero.cta}</a>
          <a class="btn btn-l ghost" href="/#features">${hero.cta2}</a>
        </div>
      </div>
      <div class="phone" aria-hidden="true">
        <div class="screen">
          <span class="ring" style="--done: ${hero.ring.done}"><b>${hero.ring.done}%<small>${hero.ring.label}</small></b></span>
          <ul class="stats">${hero.stats.map((s) => html`<li><b>${s.value}</b>${s.label}</li>`)}</ul>
        </div>
      </div>
    </div>
  </section>`;
