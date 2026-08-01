import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the MAP MODAL (§9, task 430): file upload,
// clipboard paste, required descriptions, conditional compression and the
// split Firestore persistence (one maps/<id> doc per image + a maps/index doc).
//
// compressImage is the ONLY part mocked — with a PARTIAL mock so blobToDataUrl /
// needsCompression / MAX_IMAGE_BYTES stay real (FileReader works in jsdom). We
// test WHETHER and WHEN compressImage is called, not the compression itself.
vi.mock('../../modules/image.js', async (importOriginal) => ({
  ...(await importOriginal()),
  compressImage: vi.fn(async () => 'data:image/jpeg;base64,FAKE'),
}));

// A blob small enough that its base64 data URL stays under MAX_IMAGE_BYTES.
const smallBlob = () => new Blob(['x'.repeat(1000)], { type: 'image/png' });
// A blob whose base64 data URL blows past MAX_IMAGE_BYTES (needs compression).
const bigBlob = () => new Blob(['x'.repeat(1200000)], { type: 'image/png' });

async function image() {
  return await import('../../modules/image.js');
}
async function maps() {
  return await import('../../modules/maps.js');
}

// The mocked compressImage is a single persistent vi.fn (it survives
// vi.resetModules), so reset its calls + default impl before every test.
beforeEach(async () => {
  const img = await image();
  img.compressImage.mockReset();
  img.compressImage.mockResolvedValue('data:image/jpeg;base64,FAKE');
});

function fillMapModal({ shortDesc = '', details = '' } = {}) {
  document.getElementById('mShort').value = shortDesc;
  document.getElementById('mDetails').value = details;
}

describe('maps modal — open', () => {
  it('openMapModal() opens #mapModal (class open) with empty fields', async () => {
    await bootApp({ maps: [] });
    window.openMapModal();

    expect(document.getElementById('mapModal').classList.contains('open')).toBe(true);
    expect(document.getElementById('mShort').value).toBe('');
    expect(document.getElementById('mDetails').value).toBe('');
  });
});

describe('maps modal — validation', () => {
  it('missing shortDesc → no setDoc and focus moves to #mShort', async () => {
    const { fs } = await bootApp({ maps: [] });
    window.openMapModal();
    fillMapModal({ shortDesc: '', details: 'детайли' });

    await window.saveMap();

    expect(fs.calls.setDoc.length).toBe(0);
    expect(document.activeElement).toBe(document.getElementById('mShort'));
  });

  it('missing details → no setDoc and focus moves to #mDetails', async () => {
    const { fs } = await bootApp({ maps: [] });
    window.openMapModal();
    fillMapModal({ shortDesc: 'кратко', details: '' });

    await window.saveMap();

    expect(fs.calls.setDoc.length).toBe(0);
    expect(document.activeElement).toBe(document.getElementById('mDetails'));
  });

  it('new map without an image → blocked and #mMapError becomes visible', async () => {
    const { fs } = await bootApp({ maps: [] });
    window.openMapModal();
    fillMapModal({ shortDesc: 'кратко', details: 'детайли' });

    await window.saveMap();

    expect(fs.calls.setDoc.length).toBe(0);
    expect(document.getElementById('mMapError').classList.contains('visible')).toBe(true);
  });
});

describe('maps modal — image pipeline (compress only when needed)', () => {
  it('small image → compressImage NOT called, preview keeps the original data URL', async () => {
    await bootApp({ maps: [] });
    const img = await image();
    const blob = smallBlob();
    const original = await img.blobToDataUrl(blob);

    window.openMapModal();
    await window.handleMapFile({ target: { files: [blob] } });

    expect(img.compressImage).not.toHaveBeenCalled();
    expect(document.getElementById('mPreview').src).toBe(original);
  });

  it('large image → compressImage called once, preview is the compressed data URL', async () => {
    await bootApp({ maps: [] });
    const img = await image();

    window.openMapModal();
    await window.handleMapFile({ target: { files: [bigBlob()] } });

    expect(img.compressImage).toHaveBeenCalledTimes(1);
    expect(document.getElementById('mPreview').src).toBe('data:image/jpeg;base64,FAKE');
  });

  it('large image still over the limit after compression → #mMapError visible, save blocked', async () => {
    const { fs } = await bootApp({ maps: [] });
    const img = await image();
    // Both compression attempts return a data URL that is STILL over the limit.
    img.compressImage.mockResolvedValue('data:image/jpeg;base64,' + 'A'.repeat(1000000));

    window.openMapModal();
    await window.handleMapFile({ target: { files: [bigBlob()] } });

    expect(img.compressImage).toHaveBeenCalledTimes(2); // 1600px then 1200px
    expect(document.getElementById('mMapError').classList.contains('visible')).toBe(true);

    fillMapModal({ shortDesc: 'кратко', details: 'детайли' });
    await window.saveMap();
    expect(fs.calls.setDoc.length).toBe(0); // no image → blocked
  });
});

describe('maps modal — clipboard paste', () => {
  const pasteEvent = (blob) => ({
    clipboardData: { items: [{ type: 'image/png', getAsFile: () => blob }] },
    preventDefault() {},
  });

  it('paste while the modal is open runs the same pipeline', async () => {
    await bootApp({ maps: [] });
    const img = await image();
    const blob = smallBlob();
    const original = await img.blobToDataUrl(blob);

    window.openMapModal();
    await (await maps()).handleMapPaste(pasteEvent(blob));

    expect(document.getElementById('mPreview').src).toBe(original);
  });

  it('paste while the modal is closed is ignored', async () => {
    await bootApp({ maps: [] });
    // modal not opened
    await (await maps()).handleMapPaste(pasteEvent(bigBlob()));

    const img = await image();
    expect(img.compressImage).not.toHaveBeenCalled();
    expect(document.getElementById('mPreview').src === '' ||
           document.getElementById('mPreview').src.endsWith('/')).toBe(true);
  });
});

describe('maps modal — save', () => {
  it('successful save writes the image doc and the index, then closes the modal', async () => {
    const { fs } = await bootApp({ maps: [] });

    window.openMapModal();
    fillMapModal({ shortDesc: 'Зоната на изток', details: 'В джунглата' });
    await window.handleMapFile({ target: { files: [bigBlob()] } }); // → compressImage → FAKE
    await window.saveMap();

    const imageCall = fs.calls.setDoc.find(c => /^maps\/(?!index$)/.test(c.token));
    expect(imageCall).toBeTruthy();
    expect(imageCall.data.image).toBe('data:image/jpeg;base64,FAKE');

    const indexCall = fs.calls.setDoc.find(c => c.token === 'maps/index');
    expect(indexCall).toBeTruthy();
    const first = indexCall.data.list[0];
    expect(first.shortDesc).toBe('Зоната на изток');
    expect(first.details).toBe('В джунглата');
    expect(typeof first.id).toBe('string');
    expect(typeof first.createdAt).toBe('string');
    // the image doc and the index entry share the same id
    expect(imageCall.token).toBe('maps/' + first.id);

    expect(document.getElementById('mapModal').classList.contains('open')).toBe(false);
  });

  it('editing without a new image → only the index doc is written and the edit moves to the top', async () => {
    const { fs } = await bootApp({ maps: [
      { id: 'id-a', shortDesc: 'A', details: 'da', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'id-b', shortDesc: 'B', details: 'db', createdAt: '2026-01-02T00:00:00.000Z' },
    ] });
    fs.__setDocData('maps/id-b', { image: 'data:image/png;base64,ORIG' });

    await window.editMap(1); // edit B
    fillMapModal({ shortDesc: 'B2', details: 'db2' });
    await window.saveMap();

    // no maps/<id> image doc write — only the index
    expect(fs.calls.setDoc.length).toBe(1);
    expect(fs.calls.setDoc[0].token).toBe('maps/index');
    expect(fs.calls.setDoc[0].data.list.map(m => m.shortDesc)).toEqual(['B2', 'A']);
    expect(fs.calls.setDoc[0].data.list[0].id).toBe('id-b'); // id preserved
  });
});

describe('maps modal — delete', () => {
  it('confirm=true → deletes the image doc and rewrites the index', async () => {
    const { fs } = await bootApp({ maps: [
      { id: 'id-a', shortDesc: 'A', details: 'da', createdAt: '2026-01-01T00:00:00.000Z' },
    ] });
    window.confirm = () => true;

    await window.deleteMap(0);

    expect(fs.calls.deleteDoc.map(c => c.token)).toContain('maps/id-a');
    const indexCall = fs.calls.setDoc.find(c => c.token === 'maps/index');
    expect(indexCall.data.list).toEqual([]);
  });

  it('confirm=false → nothing is written', async () => {
    const { fs } = await bootApp({ maps: [
      { id: 'id-a', shortDesc: 'A', details: 'da', createdAt: '2026-01-01T00:00:00.000Z' },
    ] });
    window.confirm = () => false;

    await window.deleteMap(0);

    expect(fs.calls.deleteDoc.length).toBe(0);
    expect(fs.calls.setDoc.length).toBe(0);
  });
});
