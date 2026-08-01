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
    // the whole file, mirroring production (created once, reused).
    closeViewer();
  });

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

  it('clicking the backdrop (overlay itself) hides it', () => {
    openViewer('data:image/png;base64,AAAA');
    const overlay = document.getElementById('mapViewer');
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true })); // target === overlay
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
