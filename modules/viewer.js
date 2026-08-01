// ─── FULLSCREEN MAP VIEWER ──────────────────────────────────
// The map preview opens fullscreen for the party (mostly an Android
// tablet/phone) — so pinch zoom is mandatory. Everything runs on POINTER
// EVENTS (one code path for mouse and fingers) plus wheel zoom for the laptop.
//
// Testability rule: all geometry is PURE functions with unit tests; the
// DOM/event layer below is thin. The overlay (#mapViewer) is created ONCE on
// the first openViewer and reused (display toggle).

const MIN_SCALE = 1;
const MAX_SCALE = 8;

// Clamp a scale into the allowed [1, 8] range.
export function clampScale(s) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

// Zoom the view by `factor` around the (cx, cy) overlay-relative point, keeping
// the image point under the cursor fixed. transform-origin is 0 0, so a screen
// point maps to image space as imgX = (cx - tx) / scale; requiring imgX to be
// unchanged before/after the zoom gives tx' = cx - (cx - tx) * k.
export function zoomAt(view, factor, cx, cy) {
  const scale = clampScale(view.scale * factor);
  const k = scale / view.scale;
  return {
    scale,
    tx: cx - (cx - view.tx) * k,
    ty: cy - (cy - view.ty) * k,
  };
}

// ─── DOM / EVENT LAYER (thin) ───────────────────────────────
// ⚠ Не разчитай на 'click' върху overlay-а: след setPointerCapture браузърът
// ПРЕНАСОЧВА производния click към capture елемента, така че всеки клик
// (снимка, лупичка) пристига с target === overlay. Затова tap/close/zoom
// решенията се взимат ИЗЦЯЛО от pointer събитията: pointerdown помни къде и
// върху какво е започнал жестът, pointerup без движение = tap.
const ZOOM_STEP = 1.4;
const TAP_SLOP = 8; // px — повече движение = drag (pan), не tap

let overlay = null;
let viewerImg = null;
let zoomInBtn = null;
let zoomOutBtn = null;
let view = { scale: 1, tx: 0, ty: 0 };
let zoomMode = null; // null | 'in' | 'out' — активната „лупичка“
let gesture = null;  // { target, x, y, moved } — текущият single-pointer жест
const pointers = new Map(); // pointerId → { x, y } (overlay-relative)

function applyTransform() {
  viewerImg.style.transform = `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`;
}

function resetView() {
  view = { scale: 1, tx: 0, ty: 0 };
  applyTransform();
}

// The +/- buttons are magnifier TOGGLES: arm a mode, then tap the exact spot
// on the map to zoom there (wheel/pinch/dblclick keep working regardless).
function setZoomMode(mode) {
  zoomMode = zoomMode === mode ? null : mode;
  zoomInBtn.classList.toggle('active', zoomMode === 'in');
  zoomOutBtn.classList.toggle('active', zoomMode === 'out');
  overlay.style.cursor = zoomMode === 'in' ? 'zoom-in' : zoomMode === 'out' ? 'zoom-out' : '';
}

function clearZoomMode() {
  if (overlay && zoomMode) setZoomMode(zoomMode); // toggle off
}

function relPoint(e) {
  const r = overlay.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

function onKeydown(e) {
  if (e.key === 'Escape') closeViewer();
}

function onWheel(e) {
  e.preventDefault();
  const { x, y } = relPoint(e);
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
  view = zoomAt(view, factor, x, y);
  applyTransform();
}

function onPointerDown(e) {
  // Бутоните (✕, лупичките) си имат собствени click handler-и — без capture
  // върху тях, иначе click-ът им се пренасочва към overlay-а и се губи.
  if (e.target.closest && e.target.closest('button')) return;
  pointers.set(e.pointerId, relPoint(e));
  if (pointers.size === 1) {
    gesture = { target: e.target, x: e.clientX, y: e.clientY, moved: false };
  } else if (gesture) {
    gesture.moved = true; // втори пръст → pinch, никога tap
  }
  if (typeof overlay.setPointerCapture === 'function') {
    try { overlay.setPointerCapture(e.pointerId); } catch { /* jsdom / detached */ }
  }
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return;
  if (gesture && !gesture.moved &&
      Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > TAP_SLOP) {
    gesture.moved = true;
  }
  const cur = relPoint(e);
  if (pointers.size === 1) {
    // Single pointer → pan.
    const prev = pointers.get(e.pointerId);
    view = { scale: view.scale, tx: view.tx + (cur.x - prev.x), ty: view.ty + (cur.y - prev.y) };
    pointers.set(e.pointerId, cur);
    applyTransform();
  } else if (pointers.size === 2) {
    // Two pointers → pinch zoom around their midpoint.
    const prev = pointers.get(e.pointerId);
    const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)[1];
    const oldDist = dist(prev, other);
    const newDist = dist(cur, other);
    pointers.set(e.pointerId, cur);
    if (oldDist > 0) {
      const c = mid(cur, other);
      view = zoomAt(view, newDist / oldDist, c.x, c.y);
      applyTransform();
    }
  }
}

function onPointerUp(e) {
  pointers.delete(e.pointerId);
  if (typeof overlay.releasePointerCapture === 'function') {
    try { overlay.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }
  if (pointers.size) return; // изчакай целия жест (pinch)
  const g = gesture;
  gesture = null;
  if (!g || g.moved || e.type === 'pointercancel') return;
  // Истински tap: с активна лупичка → зуум точно там; иначе tap върху голия
  // фон затваря (tap върху снимката не прави нищо).
  if (zoomMode) {
    const { x, y } = relPoint(e);
    view = zoomAt(view, zoomMode === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP, x, y);
    applyTransform();
  } else if (g.target === overlay) {
    closeViewer();
  }
}

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'mapViewer';
  overlay.style.display = 'none';

  viewerImg = document.createElement('img');
  viewerImg.alt = 'Карта';
  overlay.appendChild(viewerImg);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'viewer-close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Затвори');
  closeBtn.addEventListener('click', closeViewer);
  overlay.appendChild(closeBtn);

  // Big touch-friendly magnifier TOGGLES, bottom-centre: arm 🔍+/🔍−, then tap
  // the exact spot on the map to zoom there.
  const zoomBar = document.createElement('div');
  zoomBar.className = 'viewer-zoom-bar';
  zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'viewer-zoom viewer-zoom-out';
  zoomOutBtn.textContent = '➖';
  zoomOutBtn.setAttribute('aria-label', 'Лупа: отдалечаване');
  zoomOutBtn.addEventListener('click', () => setZoomMode('out'));
  zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'viewer-zoom viewer-zoom-in';
  zoomInBtn.textContent = '➕';
  zoomInBtn.setAttribute('aria-label', 'Лупа: приближаване');
  zoomInBtn.addEventListener('click', () => setZoomMode('in'));
  zoomBar.appendChild(zoomOutBtn);
  zoomBar.appendChild(zoomInBtn);
  overlay.appendChild(zoomBar);

  // ⚠ НЯМА click listener за затваряне — заради pointer capture click-ът лъже
  // за target-а си (виж горния коментар); затварянето е в onPointerUp.
  // Double-click resets the view.
  overlay.addEventListener('dblclick', resetView);
  // Wheel zoom towards the cursor (preventDefault so the page doesn't scroll).
  overlay.addEventListener('wheel', onWheel, { passive: false });
  // Pointer pan + pinch.
  overlay.addEventListener('pointerdown', onPointerDown);
  overlay.addEventListener('pointermove', onPointerMove);
  overlay.addEventListener('pointerup', onPointerUp);
  overlay.addEventListener('pointercancel', onPointerUp);

  document.body.appendChild(overlay);
}

// Open the overlay on `src`, resetting zoom/pan and any armed magnifier.
// Reuses the single overlay.
export function openViewer(src) {
  if (!src) return;
  ensureOverlay();
  viewerImg.src = src;
  resetView();
  clearZoomMode();
  overlay.style.display = 'flex';
  document.addEventListener('keydown', onKeydown);
}

export function closeViewer() {
  if (!overlay) return;
  overlay.style.display = 'none';
  pointers.clear();
  gesture = null;
  document.removeEventListener('keydown', onKeydown);
}
