// Vice Cover Studio renderer: draws a multi-panel GTA-style poster cover.
// State: { layout: 'hero'|'grid'|'full', grade: 'sunset'|'neon'|'palm'|'gold'|'noir',
//   title, subtitle, titlePos: 'top'|'bottom', titleScale,
//   panels: [{ img, zoom, ox, oy }] } — up to 4 panels, each cropped/positioned.
// All art is drawn in code (gradients, sun, palm silhouettes, lettering); no
// Rockstar logo, artwork or font is used anywhere.

export const GRADES = {
  sunset: { sky: ['#ff9a3d', '#ff5e62', '#c026d3'], tint: 'rgba(255, 94, 98, 0.22)', glow: '#ffd166', dark: '#2b1038' },
  neon: { sky: ['#00e5ff', '#7b2ff7', '#ff2fb3'], tint: 'rgba(123, 47, 247, 0.28)', glow: '#00e5ff', dark: '#0d0221' },
  palm: { sky: ['#2dd4bf', '#0ea5e9', '#1e3a8a'], tint: 'rgba(45, 212, 191, 0.20)', glow: '#fde68a', dark: '#062a2a' },
  gold: { sky: ['#fde68a', '#f59e0b', '#b45309'], tint: 'rgba(245, 158, 11, 0.25)', glow: '#fff7cc', dark: '#3a2503' },
  noir: { sky: ['#e5e7eb', '#6b7280', '#111827'], tint: 'rgba(17, 24, 39, 0.30)', glow: '#f8fafc', dark: '#0a0a0a' },
};

/** Panel rectangles for a layout inside a W x H cover. Gutters are white, poster style. */
export function panelRects(layout, w, h) {
  const g = Math.max(6, Math.round(Math.min(w, h) * 0.012)); // white gutter
  const frame = Math.max(10, Math.round(Math.min(w, h) * 0.02)); // white frame
  const x0 = frame, y0 = frame, x1 = w - frame, y1 = h - frame;
  const iw = x1 - x0, ih = y1 - y0;
  if (layout === 'full') return [{ x: x0, y: y0, w: iw, h: ih }];
  if (layout === 'grid') {
    const hw = (iw - g) / 2, hh = (ih - g) / 2;
    return [
      { x: x0, y: y0, w: hw, h: hh },
      { x: x0 + hw + g, y: y0, w: hw, h: hh },
      { x: x0, y: y0 + hh + g, w: hw, h: hh },
      { x: x0 + hw + g, y: y0 + hh + g, w: hw, h: hh },
    ];
  }
  // hero: one big panel left/top, three small ones stacked beside/below it.
  if (w >= h) { // landscape: hero left, three stacked right
    const heroW = iw * 0.62, sideW = iw - heroW - g, sh = (ih - 2 * g) / 3;
    return [
      { x: x0, y: y0, w: heroW, h: ih },
      { x: x0 + heroW + g, y: y0, w: sideW, h: sh },
      { x: x0 + heroW + g, y: y0 + sh + g, w: sideW, h: sh },
      { x: x0 + heroW + g, y: y0 + 2 * (sh + g), w: sideW, h: sh },
    ];
  }
  const heroH = ih * 0.62, sideH = ih - heroH - g, sw = (iw - 2 * g) / 3;
  return [
    { x: x0, y: y0, w: iw, h: heroH },
    { x: x0, y: y0 + heroH + g, w: sw, h: sideH },
    { x: x0 + sw + g, y: y0 + heroH + g, w: sw, h: sideH },
    { x: x0 + 2 * (sw + g), y: y0 + heroH + g, w: sw, h: sideH },
  ];
}

/** Draws one photo cover-fit into a rect, with zoom and offset (-0.5..0.5). */
function drawPhoto(ctx, img, rect, zoom, ox, oy) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale, ph = img.naturalHeight * scale;
  const cx = rect.x + (rect.w - pw) / 2 + ox * rect.w;
  const cy = rect.y + (rect.h - ph) / 2 + oy * rect.h;
  ctx.drawImage(img, cx, cy, pw, ph);
  ctx.restore();
}

/** Placeholder art for an empty panel: gradient sky, sun, sea and palm silhouettes. */
function drawPlaceholder(ctx, rect, grade, label) {
  const g = GRADES[grade] ?? GRADES.sunset;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const sky = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  sky.addColorStop(0, g.sky[0]);
  sky.addColorStop(0.55, g.sky[1]);
  sky.addColorStop(1, g.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // Sun with slats (retro sunset).
  const cx = rect.x + rect.w * 0.5, cy = rect.y + rect.h * 0.42, r = Math.min(rect.w, rect.h) * 0.26;
  ctx.fillStyle = g.glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.sky[1];
  for (let i = 0; i < 3; i++) {
    const sy = cy + r * (0.05 + i * 0.28);
    ctx.fillRect(cx - r, sy, r * 2, r * 0.09);
  }
  // Sea.
  ctx.fillStyle = g.dark;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(rect.x, rect.y + rect.h * 0.72, rect.w, rect.h * 0.28);
  ctx.globalAlpha = 1;
  // Palm silhouette, left edge.
  drawPalm(ctx, rect.x + rect.w * 0.12, rect.y + rect.h * 0.74, Math.min(rect.w, rect.h) * 0.30, g.dark);
  // Panel label.
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(14, rect.w * 0.045)}px 'Arial Black', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 8;
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h * 0.92);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.6, x + s * 0.22, y - s * 0.95);
  ctx.stroke();
  const tx = x + s * 0.22, ty = y - s * 0.95;
  for (let i = 0; i < 6; i++) {
    const a = (-0.15 - i * 0.32) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * s * 0.45, ty + Math.sin(a) * s * 0.3, tx + Math.cos(a) * s * 0.62, ty + Math.sin(a) * s * 0.55 + s * 0.18);
    ctx.quadraticCurveTo(tx + Math.cos(a) * s * 0.3, ty + Math.sin(a) * s * 0.3, tx, ty);
    ctx.fill();
  }
  ctx.restore();
}

/** Grade wash + vignette over the whole cover. */
function gradeWash(ctx, w, h, grade) {
  const g = GRADES[grade] ?? GRADES.sunset;
  const tint = ctx.createLinearGradient(0, 0, 0, h);
  tint.addColorStop(0, 'rgba(255,255,255,0)');
  tint.addColorStop(1, g.tint);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

/** Bold poster lettering with outline, shadow and a subtitle pill. */
function drawCaption(ctx, w, h, state) {
  const g = GRADES[state.grade] ?? GRADES.sunset;
  const title = (state.title ?? '').trim().toUpperCase();
  const sub = (state.subtitle ?? '').trim().toUpperCase();
  const scale = state.titleScale ?? 1;
  const atTop = state.titlePos === 'top';
  const bandH = h * 0.24;
  const bandY = atTop ? 0 : h - bandH;
  // Scrim so lettering reads on any photo.
  const scrim = ctx.createLinearGradient(0, bandY, 0, atTop ? bandH : h);
  if (atTop) {
    scrim.addColorStop(0, 'rgba(10,5,20,0.72)');
    scrim.addColorStop(1, 'rgba(10,5,20,0)');
  } else {
    scrim.addColorStop(0, 'rgba(10,5,20,0)');
    scrim.addColorStop(1, 'rgba(10,5,20,0.78)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, w, bandH);
  if (!title && !sub) return;
  const cx = w / 2;
  const baseY = atTop ? h * 0.155 : h - h * 0.055;
  let titleH = 0;
  if (title) {
    let size = Math.min(w * 0.115, h * 0.105) * scale;
    ctx.font = `${size}px 'Arial Black', Arial, sans-serif`;
    while (ctx.measureText(title).width > w * 0.92 && size > 16) {
      size -= 2;
      ctx.font = `${size}px 'Arial Black', Arial, sans-serif`;
    }
    titleH = size;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.14);
    ctx.strokeStyle = '#111827';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(title, cx, baseY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, cx, baseY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Neon underline accent.
    const tw = ctx.measureText(title).width;
    ctx.fillStyle = g.glow;
    const uy = atTop ? baseY + size * 0.22 : baseY + size * 0.16;
    ctx.fillRect(cx - tw / 2, uy, tw, Math.max(4, size * 0.07));
  }
  if (sub) {
    const size = Math.max(16, Math.min(w * 0.028, h * 0.026));
    ctx.font = `bold ${size}px Arial, sans-serif`;
    const tw = ctx.measureText(sub).width;
    const padX = size * 0.9, padY = size * 0.55;
    // Sit clear of the title block: above it at the bottom, below it at the top.
    const sy = atTop ? baseY + titleH + size * 1.6 : baseY - titleH - size * 0.9;
    ctx.fillStyle = 'rgba(10,5,20,0.66)';
    const bx = cx - tw / 2 - padX, by = sy - size - padY * 0.4;
    roundRect(ctx, bx, by, tw + padX * 2, size + padY * 1.4, size * 0.6);
    ctx.fill();
    ctx.fillStyle = g.glow;
    ctx.textAlign = 'center';
    ctx.fillText(sub, cx, sy + size * 0.32);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the whole cover onto `canvas` at its own pixel size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  const labels = ['ADD PHOTO 1', 'ADD PHOTO 2', 'ADD PHOTO 3', 'ADD PHOTO 4'];
  rects.forEach((rect, i) => {
    const p = state.panels[i];
    if (p && p.img) drawPhoto(ctx, p.img, rect, p.zoom || 1, p.ox || 0, p.oy || 0);
    else drawPlaceholder(ctx, rect, state.grade, labels[i]);
  });
  gradeWash(ctx, w, h, state.grade);
  drawCaption(ctx, w, h, state);
  // Small maker tag, top-right: original branding, never a Rockstar mark.
  const tagSize = Math.max(14, Math.min(w * 0.02, h * 0.018));
  ctx.font = `bold ${tagSize}px Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText('★ VICE COVER STUDIO', w - w * 0.02, h * 0.035);
  ctx.shadowBlur = 0;
  return rects;
}

/** Export sizes offered by the app. */
export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};
