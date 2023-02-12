import { preloadFonts } from './utils.js';
import { RepeatTextScrollFx } from './repeatTextScrollFx.js';

// Preload images and fonts and remove loader
// preloadFonts('fxx5dng').then(() => {

// Apply the effect on these elements
document.querySelectorAll('[data-text-rep]').forEach(textEl => {
    new RepeatTextScrollFx(textEl);
});

document.body.classList.remove('loading');

// });