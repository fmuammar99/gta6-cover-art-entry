// Vice Cover Studio wiring: panels, layout, grade, caption, sizes, export.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const $ = (id) => document.getElementById(id);

const state = {
  layout: 'hero',
  grade: 'sunset',
  size: '1080x1080',
  title: 'SUNSET HEIST',
  subtitle: 'VICE CITY · SUMMER 2026',
  titlePos: 'bottom',
  titleScale: 1,
  panels: [{ img: null, zoom: 1, ox: 0, oy: 0 }, { img: null, zoom: 1, ox: 0, oy: 0 }, { img: null, zoom: 1, ox: 0, oy: 0 }, { img: null, zoom: 1, ox: 0, oy: 0 }],
};
let selected = 0;

function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state);
  syncPanelControls();
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

function syncPanelControls() {
  const p = state.panels[selected];
  $('panelName').textContent = String(selected + 1);
  $('zoom').value = p.zoom;
  $('offX').value = p.ox;
  $('offY').value = p.oy;
  document.querySelectorAll('#panelPick button').forEach((b, i) => {
    b.classList.toggle('active', i === selected);
    b.textContent = `Panel ${i + 1}${state.panels[i].img ? ' ✓' : ''}`;
  });
}

function markSeg(containerId, attr, value) {
  document.querySelectorAll(`#${containerId} [data-${attr}]`).forEach((b) => {
    b.classList.toggle('active', b.dataset[attr] === value);
  });
}

function buildPanelPick() {
  const pick = $('panelPick');
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => { selected = i; syncPanelControls(); });
    pick.appendChild(b);
  }
}

buildPanelPick();
syncPanelControls();
markSeg('layoutSeg', 'layout', state.layout);
markSeg('gradeSeg', 'grade', state.grade);
markSeg('sizeSeg', 'size', state.size);

$('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.panels[selected] = { img: await loadImage(URL.createObjectURL(file)), zoom: 1, ox: 0, oy: 0 };
  redraw();
  status.textContent = `Photo loaded into panel ${selected + 1}.`;
  e.target.value = '';
});
$('sampleA').addEventListener('click', async () => {
  state.panels[selected].img = await loadImage('samples/boulevard.jpg');
  redraw();
});
$('sampleB').addEventListener('click', async () => {
  state.panels[selected].img = await loadImage('samples/pier.jpg');
  redraw();
});
$('fillAll').addEventListener('click', () => {
  const src = state.panels[selected];
  if (!src.img) { status.textContent = 'Load a photo into this panel first.'; return; }
  state.panels = state.panels.map(() => ({ img: src.img, zoom: 1, ox: 0, oy: 0 }));
  redraw();
  status.textContent = 'Same photo in all four panels.';
});
$('zoom').addEventListener('input', (e) => { state.panels[selected].zoom = Number(e.target.value); redraw(); });
$('offX').addEventListener('input', (e) => { state.panels[selected].ox = Number(e.target.value); redraw(); });
$('offY').addEventListener('input', (e) => { state.panels[selected].oy = Number(e.target.value); redraw(); });

document.querySelectorAll('#layoutSeg [data-layout]').forEach((b) => {
  b.addEventListener('click', () => {
    state.layout = b.dataset.layout;
    markSeg('layoutSeg', 'layout', state.layout);
    redraw();
  });
});
document.querySelectorAll('#gradeSeg [data-grade]').forEach((b) => {
  b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    markSeg('gradeSeg', 'grade', state.grade);
    redraw();
  });
});
document.querySelectorAll('#sizeSeg [data-size]').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    markSeg('sizeSeg', 'size', state.size);
    redraw();
    status.textContent = `Export size ${state.size}.`;
  });
});
$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('titleSize').addEventListener('input', (e) => { state.titleScale = Number(e.target.value); redraw(); });
$('titlePos').addEventListener('change', (e) => { state.titlePos = e.target.value; redraw(); });

$('export').addEventListener('click', () => {
  const [w, h] = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${state.size}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${state.size}.png (${w} x ${h}).`;
  }, 'image/png');
});

// Drag the preview to reposition the selected panel's photo.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, ox: state.panels[selected].ox, oy: state.panels[selected].oy };
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const p = state.panels[selected];
  p.ox = Math.max(-0.5, Math.min(0.5, drag.ox + (e.clientX - drag.x) / r.width));
  p.oy = Math.max(-0.5, Math.min(0.5, drag.oy + (e.clientY - drag.y) / r.height));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; canvas.style.cursor = 'grab'; });

// Exposed for screenshots: apply a full scene, then redraw.
export function applyScene(scene) {
  if (scene.layout) state.layout = scene.layout;
  if (scene.grade) state.grade = scene.grade;
  if (scene.size) state.size = scene.size;
  if (scene.title !== undefined) { state.title = scene.title; $('title').value = scene.title; }
  if (scene.subtitle !== undefined) { state.subtitle = scene.subtitle; $('subtitle').value = scene.subtitle; }
  if (scene.titlePos) { state.titlePos = scene.titlePos; $('titlePos').value = scene.titlePos; }
  markSeg('layoutSeg', 'layout', state.layout);
  markSeg('gradeSeg', 'grade', state.grade);
  markSeg('sizeSeg', 'size', state.size);
  redraw();
}

export function setPanelImage(index, img) {
  state.panels[index] = { img, zoom: 1, ox: 0, oy: 0 };
  redraw();
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), { loadImage, applyScene, setPanelImage, state });
} else {
  redraw();
}
