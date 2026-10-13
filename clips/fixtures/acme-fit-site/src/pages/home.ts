/// <reference types="vite/client" />
// The home page (index.html): nav, hero, features, pricing, FAQ, footer.
import '../styles/site.css';
import { Faq } from '../components/Faq';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { mount } from '../components/html';
import { Nav } from '../components/Nav';
import { Pricing } from '../components/Pricing';

mount([Nav('/'), Hero(), Features(), Pricing(), Faq(), Footer()]);

// a copy or component edit re-renders the page in place instead of reloading it
import.meta.hot?.accept();
