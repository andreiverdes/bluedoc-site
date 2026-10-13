import { subscribe } from '../content/blog';
import { html } from './html';

export const Subscribe = () => html`
  <section class="subscribe" id="subscribe">
    <div class="wrap">
      <div>
        <h2>${subscribe.title}</h2>
        <p>${subscribe.body}</p>
      </div>
      <form onsubmit="return false">
        <input type="email" placeholder="${subscribe.placeholder}" aria-label="Email" />
        <button class="btn btn-l" type="submit">${subscribe.cta}</button>
      </form>
    </div>
  </section>`;
