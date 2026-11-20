// Fixed scenes for screenshots: ?shot=editor shows the editor with sample
// photos loaded; ?shot=cover shows the cover alone. `layout`, `look`,
// `photo`, `photo2`, `photo3`, `caption` and `subtitle` pick the scene.
// window.__shotReady is set once painted.
export async function runShot(shot, query, state, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  state.layout = query.get('layout') ?? 'collage';
  state.look = query.get('look') ?? 'sunset';
  state.title = query.get('caption') ?? 'VICE CITY';
  state.subtitle = query.get('subtitle') ?? 'A SUNSET STORY';
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  if (title) title.value = state.title;
  if (subtitle) subtitle.value = state.subtitle;
  document.querySelectorAll('[data-group="layout"]').forEach((b) => b.classList.toggle('on', b.dataset.value === state.layout));
  document.querySelectorAll('[data-group="look"]').forEach((b) => b.classList.toggle('on', b.dataset.value === state.look));
  const names = [query.get('photo') ?? 'pier', query.get('photo2') ?? 'boulevard', query.get('photo3') ?? 'pier'];
  for (let i = 0; i < 3; i++) {
    await api.loadSample(i, names[i]);
    const sel = document.getElementById(`sample${i}`);
    if (sel) sel.value = names[i];
  }
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
