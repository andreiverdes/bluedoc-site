import { nav } from '../content/site';
import { html } from './html';

export const Nav = (current: string) => html`
  <header class="nav" id="nav">
    <div class="wrap">
      <a class="logo" href="/"><i aria-hidden="true"></i>${nav.brand}</a>
      <nav class="links" aria-label="Main">
        ${nav.links.map((l) => html`<a href="${l.href}"${l.href === current ? html` aria-current="page"` : ''}>${l.label}</a>`)}
      </nav>
      <a class="btn btn-s" href="/#pricing">${nav.cta}</a>
    </div>
  </header>`;
