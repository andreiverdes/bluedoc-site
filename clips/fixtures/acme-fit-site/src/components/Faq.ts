import { faq } from '../content/site';
import { html } from './html';

export const Faq = () => html`
  <section class="faq" id="faq">
    <div class="wrap">
      <h2>${faq.title}</h2>
      <div class="qs">
        ${faq.items.map((x, i) => html`
          <details${i === 0 ? html` open` : ''}>
            <summary>${x.q}</summary>
            <p>${x.a}</p>
          </details>`)}
      </div>
    </div>
  </section>`;
