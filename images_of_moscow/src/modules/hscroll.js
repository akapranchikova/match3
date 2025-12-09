// it was harder than i think
// one gesture cancel other with debounce
// scale is simple and center is center of image
import TheFinger from 'the-finger';

const parentElement = document.getElementById('hscroll');
const element = document.getElementById('hscroll');
const finger = new TheFinger(parentElement, {
  preventDefault: true,
  visualize: true
});

// State
let x = 0;
let y = 0;
let baseScale, baseX, baseY;

// Minimum constraint only
const rect = element.getBoundingClientRect();
const minScale = window.innerWidth / rect.width;
const maxScale = (window.innerWidth / rect.width) * 10;

function update() {
  element.style.transform = `translate3d(${x}px,0, 0)`;
}

// Save base on touch start
// Save base on touch start
parentElement.addEventListener('touchstart', () => {
  baseX = x;
  baseY = y;
  baseScale = scale;
});

finger.track('drag', (g) => {
  x = baseX + g.x - g.startX;
  y = baseY + g.y - g.startY;
  update();
});

// On touchend → release lock after short debounce
parentElement.addEventListener('touchend', () => {
  baseX = x;
  baseY = y;
  baseScale = scale;
});
