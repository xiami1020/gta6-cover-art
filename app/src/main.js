// Wires the cover maker: photo slots with zoom/pan, layout and look picks,
// editable title and subtitle, and PNG export in the three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCoverArt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

export const state = {
  layout: 'collage',
  look: 'sunset',
  title: 'VICE CITY',
  subtitle: 'A SUNSET STORY',
  photos: [
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
  ],
};

export function redraw() {
  drawCoverArt(ctx, canvas.width, canvas.height, state);
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Loads a sample photo into a slot and redraws. */
export async function loadSample(slot, name) {
  state.photos[slot].img = await loadImage(`samples/${name}.jpg`);
  redraw();
}

function bindSlot(slot) {
  const file = document.getElementById(`photo${slot}`);
  const sample = document.getElementById(`sample${slot}`);
  const zoom = document.getElementById(`zoom${slot}`);
  const panX = document.getElementById(`panx${slot}`);
  const panY = document.getElementById(`pany${slot}`);
  file.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.photos[slot].img = await loadImage(URL.createObjectURL(f));
    sample.value = '';
    redraw();
  });
  sample.addEventListener('change', () => {
    if (sample.value) loadSample(slot, sample.value);
  });
  zoom.addEventListener('input', () => { state.photos[slot].zoom = Number(zoom.value); redraw(); });
  panX.addEventListener('input', () => { state.photos[slot].ox = Number(panX.value); redraw(); });
  panY.addEventListener('input', () => { state.photos[slot].oy = Number(panY.value); redraw(); });
}

function bindGroup(name, key) {
  document.querySelectorAll(`[data-group="${name}"]`).forEach((btn) => {
    btn.addEventListener('click', () => {
      state[key] = btn.dataset.value;
      document.querySelectorAll(`[data-group="${name}"]`).forEach((b) => b.classList.toggle('on', b === btn));
      redraw();
    });
  });
}

bindSlot(0);
bindSlot(1);
bindSlot(2);
bindGroup('layout', 'layout');
bindGroup('look', 'look');

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });

/** Exports the cover at w x h as a PNG download. */
export function exportCover(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCoverArt(off.getContext('2d'), w, h, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved cover-${w}x${h}.png`;
  }, 'image/png');
}

document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const [w, h] = btn.dataset.export.split('x').map(Number);
    exportCover(w, h);
  });
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, state, { loadSample, redraw });
} else {
  // Default scene: both samples loaded, so the editor opens with art.
  loadSample(0, 'pier');
  loadSample(1, 'boulevard');
  redraw();
}
