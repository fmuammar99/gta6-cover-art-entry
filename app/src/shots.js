// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the exported cover alone, drawn by the app itself.
// Query params: photo (sample for hero panel), photo2 (sample for panel 2),
// layout, grade, size, title, subtitle, titlePos. window.__shotReady is set once painted.
export async function runShot(shot, query, api) {
  const { loadImage, applyScene, setPanelImage } = api;
  applyScene({
    layout: query.get('layout') ?? 'hero',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
    title: query.get('title') ?? query.get('caption') ?? 'SUNSET HEIST',
    subtitle: query.get('subtitle') ?? 'VICE CITY · SUMMER 2026',
    titlePos: query.get('titlePos') ?? 'bottom',
  });
  const hero = await loadImage(`samples/${query.get('photo') ?? 'pier'}.jpg`);
  const second = await loadImage(`samples/${query.get('photo2') ?? 'boulevard'}.jpg`);
  setPanelImage(0, hero);
  setPanelImage(1, second);
  setPanelImage(2, hero);
  setPanelImage(3, second);
  if (shot === 'cover') document.body.classList.add('shot-cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
