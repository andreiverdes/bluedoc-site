import { footer, nav } from '../content/site';
import { html } from './html';

export const Footer = () => html`
  <footer class="foot" id="footer">
    <div class="wrap">
      <a class="logo" href="/"><i aria-hidden="true"></i>${nav.brand}</a>
      <nav aria-label="Footer">${footer.links.map((l) => html`<a href="/">${l}</a>`)}</nav>
      <span class="legal">${footer.legal}</span>
    </div>
  </footer>`;
