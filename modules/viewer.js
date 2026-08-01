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
let overlay = null;
let viewerImg = null;
let view = { scale: 1, tx: 0, ty: 0 };
const pointers = new Map(); // pointerId → { x, y } (overlay-relative)

function applyTransform() {
  viewerImg.style.transform = `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`;
}

function resetView() {
  view = { scale: 1, tx: 0, ty: 0 };
  applyTransform();
}

// Zoom towards the centre of the overlay (the +/- buttons — a laptop has the
// wheel but a tablet does not, and pinch is not obvious to everyone). In jsdom
// getBoundingClientRect is 0×0 → centre is (0,0), which the transform still
// honours; clampScale inside zoomAt keeps min/max clicks from moving the scale.
function zoomButton(factor) {
  const r = overlay.getBoundingClientRect();
  view = zoomAt(view, factor, r.width / 2, r.height / 2);
  applyTransform();
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
  pointers.set(e.pointerId, relPoint(e));
  if (typeof overlay.setPointerCapture === 'function') {
    try { overlay.setPointerCapture(e.pointerId); } catch { /* jsdom / detached */ }
  }
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return;
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

  // Big touch-friendly +/- zoom buttons, bottom-centre. stopPropagation so a
  // click on them never reaches the backdrop-close listener on the overlay.
  const zoomBar = document.createElement('div');
  zoomBar.className = 'viewer-zoom-bar';
  const zoomOut = document.createElement('button');
  zoomOut.className = 'viewer-zoom viewer-zoom-out';
  zoomOut.textContent = '➖';
  zoomOut.setAttribute('aria-label', 'Отдалечи');
  zoomOut.addEventListener('click', e => { e.stopPropagation(); zoomButton(1 / 1.4); });
  const zoomIn = document.createElement('button');
  zoomIn.className = 'viewer-zoom viewer-zoom-in';
  zoomIn.textContent = '➕';
  zoomIn.setAttribute('aria-label', 'Приближи');
  zoomIn.addEventListener('click', e => { e.stopPropagation(); zoomButton(1.4); });
  zoomBar.appendChild(zoomOut);
  zoomBar.appendChild(zoomIn);
  overlay.appendChild(zoomBar);

  // Click on the backdrop (overlay itself, not the image or button) closes.
  overlay.addEventListener('click', e => { if (e.target === overlay) closeViewer(); });
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

// Open the overlay on `src`, resetting zoom/pan. Reuses the single overlay.
export function openViewer(src) {
  if (!src) return;
  ensureOverlay();
  viewerImg.src = src;
  resetView();
  overlay.style.display = 'flex';
  document.addEventListener('keydown', onKeydown);
}

export function closeViewer() {
  if (!overlay) return;
  overlay.style.display = 'none';
  pointers.clear();
  document.removeEventListener('keydown', onKeydown);
}
