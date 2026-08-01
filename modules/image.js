// ─── IMAGE HELPERS (maps feature, §9) ───────────────────────
// Client-side image tooling for the Maps tab. Compression is only applied
// WHEN NEEDED — the threshold is on the base64 data URL length (base64 inflates
// by ~33% and Firestore caps a doc at 1MiB). The consumer (task 430) decides
// WHEN to compress; this module only provides the tools.

// data URL length above which a map image must be compressed before saving.
export const MAX_IMAGE_BYTES = 900000;

// True when a data URL is too large to store in a single Firestore doc.
export function needsCompression(dataUrlLength) {
  return dataUrlLength > MAX_IMAGE_BYTES;
}

// Read a Blob as a base64 data URL (works in jsdom via FileReader).
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Pure geometry: fit (w, h) inside a maxDim square, preserving aspect ratio.
// Never upscales — an image already within maxDim is returned unchanged.
export function fitDimensions(w, h, maxDim = 1600) {
  const longEdge = Math.max(w, h);
  if (longEdge <= maxDim) return { w, h };
  const scale = maxDim / longEdge;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

// Thin canvas wrapper — resize a blob and re-encode as a JPEG data URL.
// jsdom has no canvas, so this body is exercised only via mocking downstream;
// there is intentionally no unit test for it here.
export async function compressImage(blob, { maxDim = 1600, quality = 0.72 } = {}) {
  let bitmap;
  if (typeof createImageBitmap === 'function') {
    bitmap = await createImageBitmap(blob);
  } else {
    bitmap = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }
  const { w, h } = fitDimensions(bitmap.width, bitmap.height, maxDim);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
