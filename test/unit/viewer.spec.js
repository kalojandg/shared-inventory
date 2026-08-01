import { describe, it, expect, beforeEach } from 'vitest';
import { zoomAt, clampScale, openViewer, closeViewer } from '../../modules/viewer.js';

// Unit tests for the fullscreen map viewer (§9 maps feature). The geometry
// (zoomAt/clampScale) is pure and fully covered; the DOM/event layer is thin so
// only its observable shape (overlay created once, visible/hidden toggling,
// dblclick reset) is exercised.

describe('clampScale (pure)', () => {
  it('clamps below 1 up to 1', () => {
    expect(clampScale(0.5)).toBe(1);
  });

  it('clamps above 8 down to 8', () => {
    expect(clampScale(20)).toBe(8);
  });

  it('leaves an in-range scale untouched', () => {
    expect(clampScale(3)).toBe(3);
  });
});

describe('zoomAt (pure geometry)', () => {
  it('zooms around the cursor keeping transform-origin 0 0', () => {
    expect(zoomAt({ scale: 1, tx: 0, ty: 0 }, 2, 100, 100)).toEqual({ scale: 2, tx: -100, ty: -100 });
  });

  it('keeps the image point under the cursor fixed (invariant)', () => {
    const cases = [
      { view: { scale: 1.5, tx: 40, ty: -20 }, factor: 1.3, cx: 220, cy: 130 },
      { view: { scale: 3, tx: -100, ty: 60 }, factor: 0.7, cx: 15, cy: 400 },
      { view: { scale: 2, tx: 5, ty: 5 }, factor: 1.1, cx: 333, cy: 111 },
    ];
    for (const { view, factor, cx, cy } of cases) {
      const next = zoomAt(view, factor, cx, cy);
      // imgX = (cx - tx) / scale must be identical before and after.
      expect((cx - next.tx) / next.scale).toBeCloseTo((cx - view.tx) / view.scale, 10);
      expect((cy - next.ty) / next.scale).toBeCloseTo((cy - view.ty) / view.scale, 10);
    }
  });

  it('does not zoom out below scale 1', () => {
    const next = zoomAt({ scale: 1, tx: 0, ty: 0 }, 0.5, 50, 50);
    expect(next.scale).toBe(1);
  });

  it('a zoom in followed by the mirror zoom out returns the original view', () => {
    const start = { scale: 2, tx: 17, ty: -33 };
    const zoomed = zoomAt(start, 1.5, 120, 90);
    const back = zoomAt(zoomed, 1 / 1.5, 120, 90);
    expect(back.scale).toBeCloseTo(start.scale, 10);
    expect(back.tx).toBeCloseTo(start.tx, 10);
    expect(back.ty).toBeCloseTo(start.ty, 10);
  });
});

describe('viewer overlay (DOM)', () => {
  beforeEach(() => {
    // Reset the DOM between cases; the module keeps its single overlay across
    // the whole file, mirroring production (created once, reused). Reopening
    // also clears any active magnifier mode.
    closeViewer();
  });

  // A "tap": pointerdown + pointerup on the same spot. The viewer must decide
  // close/zoom from POINTER events — after setPointerCapture the browser
  // retargets the derived click to the overlay, so click targets lie.
  const tap = (el, x = 0, y = 0) => {
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: x, clientY: y }));
    el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: x, clientY: y }));
  };

  const scaleOf = (img) => parseFloat(img.style.transform.match(/scale\(([^)]+)\)/)[1]);

  it('openViewer inserts #mapViewer, shows it and sets the image src', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    expect(overlay).toBeTruthy();
    expect(overlay.style.display).toBe('flex');
    const img = overlay.querySelector('img');
    expect(img.getAttribute('src')).toBe('data:image/png;base64,AAAA');
  });

  it('a repeated openViewer does not duplicate the overlay', () => {
    openViewer('data:image/png;base64,AAAA');
    openViewer('data:image/png;base64,BBBB');
    expect(document.querySelectorAll('#mapViewer').length).toBe(1);
  });

  it('closeViewer hides the overlay', () => {
    openViewer('data:image/png;base64,AAAA');
    closeViewer();
    expect(document.getElementById('mapViewer').style.display).toBe('none');
  });

  it('an Escape keydown hides the overlay', () => {
    openViewer('data:image/png;base64,AAAA');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('mapViewer').style.display).toBe('none');
  });

  it('a tap on the backdrop (no magnifier active) hides it', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    tap(overlay);
    expect(overlay.style.display).toBe('none');
  });

  it('a tap on the image does NOT close the viewer', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    tap(overlay.querySelector('img'), 40, 40);
    expect(overlay.style.display).toBe('flex');
  });

  it('a drag on the backdrop (pan) does not close the viewer', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    overlay.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
    overlay.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 60, clientY: 60 }));
    overlay.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 60, clientY: 60 }));
    expect(overlay.style.display).toBe('flex');
  });

  it('REGRESSION: a retargeted click on the overlay (pointer capture) must not close it', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    // This is what the browser dispatches after setPointerCapture — target is
    // the overlay even though the user pressed a button or the image.
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(overlay.style.display).toBe('flex');
  });

  it('exposes visible +/- magnifier buttons in the overlay', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    expect(overlay.querySelector('.viewer-zoom-in')).toBeTruthy();
    expect(overlay.querySelector('.viewer-zoom-out')).toBeTruthy();
  });

  it('the magnifier buttons toggle and are mutually exclusive', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    const zin = overlay.querySelector('.viewer-zoom-in');
    const zout = overlay.querySelector('.viewer-zoom-out');

    zin.click();
    expect(zin.classList.contains('active')).toBe(true);
    expect(zout.classList.contains('active')).toBe(false);

    zout.click();
    expect(zin.classList.contains('active')).toBe(false);
    expect(zout.classList.contains('active')).toBe(true);

    zout.click(); // toggle off
    expect(zout.classList.contains('active')).toBe(false);
  });

  it('with 🔍+ active, a tap zooms in anchored at the tapped point', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    const img = overlay.querySelector('img');

    overlay.querySelector('.viewer-zoom-in').click();
    tap(img, 100, 100);

    expect(scaleOf(img)).toBeCloseTo(1.4, 10);
    // zoomAt(scale 1 → 1.4, cx=cy=100): tx = 100 - 100 * 1.4 = -40.
    expect(img.style.transform).toContain('translate(-40px, -40px)');
    expect(overlay.style.display).toBe('flex'); // и НЕ се затваря
  });

  it('with 🔍+ active, a tap on the backdrop zooms instead of closing', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');

    overlay.querySelector('.viewer-zoom-in').click();
    tap(overlay, 50, 50);

    expect(overlay.style.display).toBe('flex');
    expect(scaleOf(overlay.querySelector('img'))).toBeGreaterThan(1);
  });

  it('with 🔍− active at scale 1 a tap stays clamped at 1', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    const img = overlay.querySelector('img');

    overlay.querySelector('.viewer-zoom-out').click();
    tap(img, 30, 30);
    expect(scaleOf(img)).toBe(1);
  });

  it('repeated 🔍+ taps never exceed scale 8', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    const img = overlay.querySelector('img');

    overlay.querySelector('.viewer-zoom-in').click();
    for (let i = 0; i < 20; i++) tap(img, 10, 10);
    expect(scaleOf(img)).toBe(8);
  });

  it('reopening the viewer clears the magnifier mode', () => {
    openViewer('data:image/png;base64,AAAA');
    let overlay = document.getElementById('mapViewer');
    overlay.querySelector('.viewer-zoom-in').click();
    closeViewer();

    openViewer('data:image/png;base64,BBBB');
    overlay = document.getElementById('mapViewer');
    expect(overlay.querySelector('.viewer-zoom-in').classList.contains('active')).toBe(false);
    tap(overlay); // без активна лупичка backdrop тапът пак затваря
    expect(overlay.style.display).toBe('none');
  });

  it('double-click resets the transform to scale 1', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    const img = overlay.querySelector('img');
    // Zoom in first via the wheel so the reset is observable.
    overlay.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: 100, clientY: 100 }));
    expect(img.style.transform).not.toBe('translate(0px, 0px) scale(1)');
    overlay.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(img.style.transform).toBe('translate(0px, 0px) scale(1)');
  });
});
