// Draws GTA-style multi-panel cover art: a sunset/neon sky drawn in code,
// palm-tree silhouettes, angled photo panels, and big condensed title
// lettering. All art is drawn with the canvas 2D API; no copied artwork.

export const LOOKS = {
  sunset: {
    sky: ['#2b1055', '#ff7e5f', '#feb47b'], sun: '#ffd76e', glow: 'rgba(255, 180, 80, 0.55)',
    frame: '#fff7e6', title: '#ffffff', accent: '#ff5e62', scrim: 'rgba(43, 16, 85, 0.62)', palm: '#1d0b2e',
    photoFilter: 'saturate(1.1)',
  },
  neon: {
    sky: ['#0b1035', '#7b2ff7', '#ff2fb3'], sun: '#00e5ff', glow: 'rgba(0, 229, 255, 0.5)',
    frame: '#00e5ff', title: '#ffffff', accent: '#ff2fb3', scrim: 'rgba(11, 16, 53, 0.6)', palm: '#05081f',
    photoFilter: 'saturate(1.25) contrast(1.05)',
  },
  noir: {
    sky: ['#0d0d0d', '#4a4a4a', '#9a9a9a'], sun: '#f2f2f2', glow: 'rgba(255, 255, 255, 0.35)',
    frame: '#f5f5f5', title: '#ffffff', accent: '#c9c9c9', scrim: 'rgba(0, 0, 0, 0.65)', palm: '#000000',
    photoFilter: 'grayscale(1) contrast(1.15)',
  },
};

/** Draws one palm silhouette: a leaning trunk and seven drooping fronds. */
export function drawPalm(ctx, x, y, s, lean, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  const topX = x + lean * s;
  const topY = y - s;
  ctx.lineWidth = Math.max(2, s * 0.055);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.3, y - s * 0.55, topX, topY);
  ctx.stroke();
  ctx.lineWidth = Math.max(1.5, s * 0.028);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = s * (0.42 + (i % 2) * 0.1);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + s * 0.12;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.5, topY - s * 0.16, ex, ey);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX - s * 0.03, topY + s * 0.02, s * 0.035, 0, Math.PI * 2);
  ctx.arc(topX + s * 0.04, topY + s * 0.03, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Paints the sky: vertical gradient, glowing sun, and palm silhouettes. */
export function drawSky(ctx, w, h, look, region) {
  const { x, y, rw, rh } = region;
  const g = ctx.createLinearGradient(x, y, x, y + rh);
  g.addColorStop(0, look.sky[0]);
  g.addColorStop(0.55, look.sky[1]);
  g.addColorStop(1, look.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, rw, rh);
  const sunR = Math.min(rw, rh) * 0.16;
  const sx = x + rw * 0.5;
  const sy = y + rh * 0.42;
  const glow = ctx.createRadialGradient(sx, sy, sunR * 0.2, sx, sy, sunR * 2.6);
  glow.addColorStop(0, look.glow);
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, rw, rh);
  ctx.fillStyle = look.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
  ctx.fill();
  const base = y + rh;
  drawPalm(ctx, x + rw * 0.06, base, rh * 0.34, 0.18, look.palm);
  drawPalm(ctx, x + rw * 0.94, base, rh * 0.28, -0.22, look.palm);
  drawPalm(ctx, x + rw * 0.82, base, rh * 0.18, 0.12, look.palm);
}

/** Draws `img` to cover the rect, with zoom and pan offsets (-0.5..0.5). */
export function drawPhotoCover(ctx, img, x, y, w, h, zoom, ox, oy) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * s;
  const ph = img.naturalHeight * s;
  ctx.drawImage(img, x + (w - pw) / 2 + ox * w * 0.4, y + (h - ph) / 2 + oy * h * 0.4, pw, ph);
}

function panel(ctx, path, photo, look, frame) {
  ctx.save();
  ctx.beginPath();
  path();
  ctx.clip();
  if (photo && photo.img) {
    ctx.filter = look.photoFilter ?? 'none';
    drawPhotoCover(ctx, photo.img, ...panelRect, photo.zoom, photo.ox, photo.oy);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = look.sky[0];
    ctx.fillRect(...panelRect);
  }
  ctx.restore();
  if (frame) {
    ctx.save();
    ctx.beginPath();
    path();
    ctx.lineWidth = frame;
    ctx.strokeStyle = look.frame;
    ctx.stroke();
    ctx.restore();
  }
}

// `panelRect` is set by drawCoverArt before each panel() call; it is the
// panel's bounding box, used to size the photo inside the clip.
let panelRect = [0, 0, 0, 0];

/** Draws the three panels of the diagonal collage layout, under a sky band. */
function drawCollage(ctx, w, h, look, photos) {
  const frame = Math.max(3, w * 0.006);
  const gap = w * 0.012;
  const top = h * 0.17;
  const ph = h - top;
  drawSky(ctx, w, h, look, { x: 0, y: 0, rw: w, rh: top });
  panelRect = [0, top, w * 0.63, ph];
  panel(ctx, () => {
    ctx.moveTo(0, top); ctx.lineTo(w * 0.62, top); ctx.lineTo(w * 0.54, h); ctx.lineTo(0, h); ctx.closePath();
  }, photos[0], look, frame);
  panelRect = [w * 0.62, top, w * 0.38, ph * 0.52];
  panel(ctx, () => {
    ctx.moveTo(w * 0.62 + gap, top); ctx.lineTo(w, top); ctx.lineTo(w, top + ph * 0.5); ctx.lineTo(w * 0.55, top + ph * 0.47); ctx.closePath();
  }, photos[1], look, frame);
  panelRect = [w * 0.55, top + ph * 0.5, w * 0.45, ph * 0.5];
  panel(ctx, () => {
    ctx.moveTo(w * 0.55 + gap, top + ph * 0.5 + gap); ctx.lineTo(w, top + ph * 0.52); ctx.lineTo(w, h); ctx.lineTo(w * 0.54, h); ctx.closePath();
  }, photos[2] ?? photos[0], look, frame);
}

/** Draws the single hero layout: one photo full-bleed under a sky band. */
function drawHero(ctx, w, h, look, photos) {
  const photo = photos[0];
  panelRect = [0, 0, w, h];
  panel(ctx, () => ctx.rect(0, 0, w, h), photo, look, 0);
  drawSky(ctx, w, h, look, { x: 0, y: 0, rw: w, rh: h * 0.3 });
  drawPalm(ctx, w * 0.08, h * 0.3, h * 0.12, 0.2, look.palm);
  drawPalm(ctx, w * 0.93, h * 0.3, h * 0.1, -0.2, look.palm);
}

/** Draws the triptych: three vertical panels, the middle one raised. */
function drawTriptych(ctx, w, h, look, photos) {
  const frame = Math.max(3, w * 0.006);
  const gap = w * 0.014;
  const pw = (w - gap * 2) / 3;
  const lifts = [h * 0.05, 0, h * 0.05];
  for (let i = 0; i < 3; i++) {
    const x = i * (pw + gap);
    panelRect = [x, lifts[i], pw, h - lifts[i]];
    panel(ctx, () => ctx.rect(x, lifts[i], pw, h - lifts[i]), photos[i] ?? photos[i % 2], look, frame);
  }
}

/** Draws the title and subtitle over the bottom scrim. */
function drawTitles(ctx, w, h, look, title, subtitle) {
  const scrimH = h * 0.26;
  const g = ctx.createLinearGradient(0, h - scrimH, 0, h);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, look.scrim);
  ctx.fillStyle = g;
  ctx.fillRect(0, h - scrimH, w, scrimH);
  const text = (title || '').trim().toUpperCase();
  if (text) {
    let size = h * 0.115;
    const setFont = () => { ctx.font = `900 ${size}px 'Arial Narrow', Impact, 'Helvetica Neue', sans-serif`; };
    setFont();
    while (ctx.measureText(text).width > w * 0.92 && size > 16) { size -= 2; setFont(); }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.shadowColor = look.accent;
    ctx.shadowBlur = size * 0.28;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeText(text, w / 2, h - h * 0.115);
    ctx.fillStyle = look.title;
    ctx.fillText(text, w / 2, h - h * 0.115);
    ctx.shadowBlur = 0;
  }
  const sub = (subtitle || '').trim().toUpperCase();
  if (sub) {
    const size = Math.max(12, h * 0.032);
    ctx.font = `700 ${size}px 'Arial Narrow', Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = look.accent;
    try { ctx.letterSpacing = `${size * 0.35}px`; } catch { /* older canvas: no letterSpacing */ }
    ctx.fillText(sub, w / 2, h - h * 0.045);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
}

/**
 * Draws the whole cover onto `ctx` at size w x h.
 * `state` is { layout, look, title, subtitle, photos: [{img, zoom, ox, oy}] }.
 */
export function drawCoverArt(ctx, w, h, state) {
  const look = LOOKS[state.look] ?? LOOKS.sunset;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = look.sky[0];
  ctx.fillRect(0, 0, w, h);
  if (state.layout === 'hero') drawHero(ctx, w, h, look, state.photos);
  else if (state.layout === 'triptych') drawTriptych(ctx, w, h, look, state.photos);
  else drawCollage(ctx, w, h, look, state.photos);
  drawTitles(ctx, w, h, look, state.title, state.subtitle);
  ctx.restore();
}
