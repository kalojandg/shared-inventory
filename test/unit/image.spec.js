import { describe, it, expect } from 'vitest';
import {
  MAX_IMAGE_BYTES,
  needsCompression,
  fitDimensions,
  blobToDataUrl,
} from '../../modules/image.js';

// Unit tests for the pure image helpers (§9 maps feature). The canvas-based
// compressImage body is NOT tested here — jsdom has no canvas; it is exercised
// via mocking in later tasks.

describe('fitDimensions (pure geometry)', () => {
  it('scales a landscape image down to the max on its long edge', () => {
    expect(fitDimensions(4000, 2000, 1600)).toEqual({ w: 1600, h: 800 });
  });

  it('scales a portrait image down to the max on its long edge', () => {
    expect(fitDimensions(1000, 3200, 1600)).toEqual({ w: 500, h: 1600 });
  });

  it('never upscales an image already smaller than maxDim', () => {
    expect(fitDimensions(800, 600, 1600)).toEqual({ w: 800, h: 600 });
  });

  it('returns integer dimensions (Math.round)', () => {
    const { w, h } = fitDimensions(1000, 3200, 1600);
    expect(Number.isInteger(w)).toBe(true);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('defaults maxDim to 1600', () => {
    expect(fitDimensions(4000, 2000)).toEqual({ w: 1600, h: 800 });
  });
});

describe('needsCompression / MAX_IMAGE_BYTES', () => {
  it('exposes the 900000 threshold', () => {
    expect(MAX_IMAGE_BYTES).toBe(900000);
  });

  it('is false at or below the threshold', () => {
    expect(needsCompression(899000)).toBe(false);
    expect(needsCompression(900000)).toBe(false);
  });

  it('is true above the threshold', () => {
    expect(needsCompression(900001)).toBe(true);
  });
});

describe('blobToDataUrl', () => {
  it('resolves with a data: URL string', async () => {
    const url = await blobToDataUrl(new Blob(['abc']));
    expect(typeof url).toBe('string');
    expect(url.startsWith('data:')).toBe(true);
  });
});
