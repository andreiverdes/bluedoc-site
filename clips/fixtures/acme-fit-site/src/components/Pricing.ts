import { pricing } from '../content/site';
import { html } from './html';

export const Pricing = () => html`
  <section class="pricing" id="pricing">
    <div class="wrap">
      <h2>${pricing.title}</h2>
      <p class="lead">${pricing.lead}</p>
      <div class="plans">
        ${pricing.plans.map((p, i) => html`
          <div class="plan${p.lead ? ' hl' : ''}" id="${i === 0 ? 'plan-lead' : 'plan-other'}">
            <h3>${p.name}</h3>
            <div class="price">${p.price}<span>${p.per}</span></div>
            <p class="note">${p.note}</p>
            <ul>${pricing.includes.map((x) => html`<li>${x}</li>`)}</ul>
            <a class="btn btn-l${p.lead ? '' : ' ghost'}" href="/#pricing">${p.cta}</a>
          </div>`)}
      </div>
    </div>
  </section>`;
