import { describe, it, expect, vi, afterEach } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the LISTENERS and EXPORT/IMPORT regions of app.js
// (§2 LISTENERS + EXPORT/IMPORT, §4, §5, §6).
// They document the CURRENT behaviour and run against an unmodified app.js.
// Snapshot behaviour is driven through the mock's __emit; exportData/importData
// are exercised through the window.* handlers the HTML wires up.

// Build the event importData receives from the <input type="file"> onchange.
// e.target.files[0].text() resolves the JSON; e.target.value is cleared after.
function importEvent(jsonString) {
  const file = { text: () => Promise.resolve(jsonString) };
  return { target: { files: [file], value: 'C:\\fakepath\\bundle.json' } };
}

describe('sync — gold listener (onSnapshot GOLD_DOC)', () => {
  it('missing doc (__emit null) → all coins show 0', async () => {
    const { fs } = await bootApp();
    fs.__emit('inventory/gold', null);

    expect(document.getElementById('dispPP').textContent).toBe('0');
    expect(document.getElementById('dispGP').textContent).toBe('0');
    expect(document.getElementById('dispSP').textContent).toBe('0');
    expect(document.getElementById('dispCP').textContent).toBe('0');
  });

  it('doc with data → renderGold shows the values', async () => {
    const { fs } = await bootApp();
    fs.__emit('inventory/gold', { pp: 1, gp: 2, sp: 3, cp: 4 });

    expect(document.getElementById('dispPP').textContent).toBe('1');
    expect(document.getElementById('dispGP').textContent).toBe('2');
    expect(document.getElementById('dispSP').textContent).toBe('3');
    expect(document.getElementById('dispCP').textContent).toBe('4');
  });
});

describe('sync — items/quests listeners', () => {
  it('items __emit null → empty state row', async () => {
    const { fs } = await bootApp();
    fs.__emit('inventory/items', null);

    const invBody = document.getElementById('invBody');
    expect(invBody.textContent).toContain('Инвентарът е празен.');
    expect(invBody.querySelector('tr[data-idx]')).toBeNull();
  });

  it('quests __emit null → empty state row', async () => {
    const { fs } = await bootApp();
    fs.__emit('quests/items', null);

    const questBody = document.getElementById('questBody');
    expect(questBody.textContent).toContain('Няма активни куестове.');
    expect(questBody.querySelector('tr[data-idx]')).toBeNull();
  });

  it('quests __emit → #syncStatus becomes "Live sync ✓" and window.__appReady === true', async () => {
    const { fs } = await bootApp();
    // reset the flag so we observe the transition the listener drives
    window.__appReady = false;
    document.getElementById('syncStatus').textContent = 'Connecting…';

    fs.__emit('quests/items', { list: [{ name: 'Куест', status: 'Активен' }] });

    expect(document.getElementById('syncStatus').textContent).toBe('Live sync ✓');
    expect(window.__appReady).toBe(true);
  });
});

describe('sync — exportData bundle', () => {
  let origCreate, origRevoke;
  let capturedBlob, downloadName, revoked;

  afterEach(() => {
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
    vi.restoreAllMocks();
  });

  function stubDownload() {
    capturedBlob = undefined;
    downloadName = undefined;
    revoked = false;
    origCreate = URL.createObjectURL;
    origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob) => { capturedBlob = blob; return 'blob:mock-url'; };
    URL.revokeObjectURL = () => { revoked = true; };
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadName = this.download;
    });
  }

  it('bundle is {version:1, exportedAt ISO string, gold, items, quests}', async () => {
    await bootApp({
      gold: { pp: 1, gp: 2, sp: 3, cp: 4 },
      items: [{ name: 'Меч' }],
      quests: [{ name: 'Куест', status: 'Активен' }],
    });
    stubDownload();

    window.exportData();

    const text = await capturedBlob.text();
    const bundle = JSON.parse(text);
    expect(bundle.version).toBe(1);
    expect(typeof bundle.exportedAt).toBe('string');
    expect(bundle.exportedAt).toBe(new Date(bundle.exportedAt).toISOString());
    expect(bundle.gold).toEqual({ pp: 1, gp: 2, sp: 3, cp: 4 });
    expect(bundle.items).toEqual([{ name: 'Меч' }]);
    expect(bundle.quests).toEqual([{ name: 'Куест', status: 'Активен' }]);
  });

  it('download filename starts with "shared-inventory-"', async () => {
    await bootApp();
    stubDownload();

    window.exportData();

    expect(downloadName).toMatch(/^shared-inventory-/);
    expect(revoked).toBe(true);
  });
});

describe('sync — importData flow', () => {
  afterEach(() => vi.restoreAllMocks());

  it('valid bundle + confirm=true → setDoc for gold, items ({list}), quests ({list})', async () => {
    const { fs } = await bootApp();
    window.confirm = () => true;

    const bundle = {
      version: 1,
      gold: { pp: 1, gp: 0, sp: 0, cp: 0 },
      items: [{ name: 'Меч' }],
      quests: [{ name: 'Куест' }],
    };
    await window.importData(importEvent(JSON.stringify(bundle)));

    const tokens = fs.calls.setDoc.map(c => c.token);
    expect(tokens).toContain('inventory/gold');
    expect(tokens).toContain('inventory/items');
    expect(tokens).toContain('quests/items');
    expect(fs.calls.setDoc.length).toBe(3);

    const gold = fs.calls.setDoc.find(c => c.token === 'inventory/gold');
    expect(gold.data).toEqual({ pp: 1, gp: 0, sp: 0, cp: 0 });
    const its = fs.calls.setDoc.find(c => c.token === 'inventory/items');
    expect(its.data).toEqual({ list: [{ name: 'Меч' }] });
    const qs = fs.calls.setDoc.find(c => c.token === 'quests/items');
    expect(qs.data).toEqual({ list: [{ name: 'Куест' }] });
  });

  it('bundle with only items → exactly one setDoc (inventory/items)', async () => {
    const { fs } = await bootApp();
    window.confirm = () => true;

    await window.importData(importEvent(JSON.stringify({ items: [{ name: 'Щит' }] })));

    expect(fs.calls.setDoc.length).toBe(1);
    expect(fs.calls.setDoc[0].token).toBe('inventory/items');
    expect(fs.calls.setDoc[0].data).toEqual({ list: [{ name: 'Щит' }] });
  });

  it('confirm=false → zero setDoc', async () => {
    const { fs } = await bootApp();
    window.confirm = () => false;

    await window.importData(importEvent(JSON.stringify({ gold: { pp: 5, gp: 0, sp: 0, cp: 0 } })));

    expect(fs.calls.setDoc.length).toBe(0);
  });

  it('invalid JSON → alert, zero setDoc', async () => {
    const { fs } = await bootApp();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    window.confirm = () => true;

    await window.importData(importEvent('{ not valid json'));

    expect(alertSpy).toHaveBeenCalled();
    expect(fs.calls.setDoc.length).toBe(0);
  });

  it('file input value is cleared after each attempt', async () => {
    await bootApp();
    window.confirm = () => true;

    const okEvent = importEvent(JSON.stringify({ items: [{ name: 'A' }] }));
    await window.importData(okEvent);
    expect(okEvent.target.value).toBe('');

    const badEvent = importEvent('{ broken');
    await window.importData(badEvent);
    expect(badEvent.target.value).toBe('');
  });
});
