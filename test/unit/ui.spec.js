import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the DND / TABS / MODALS / HELPERS regions of
// app.js (§2 DND, TABS/MODALS, HELPERS, §6). They document the CURRENT
// behaviour and run against an unmodified app.js. Each scenario boots the app
// fresh via bootApp() and asserts on the DOM + the firestore mock (fs.calls).
// The bootApp Sortable stub keeps `opts`, so the reorder scenario invokes
// opts.onEnd() by hand.

describe('ui — tabs', () => {
  it('clicking the quests tab activates it and its panel, deactivating inventory', async () => {
    await bootApp();

    const invBtn = document.querySelector('.tab-btn[data-tab="inventory"]');
    const questBtn = document.querySelector('.tab-btn[data-tab="quests"]');

    questBtn.click();

    expect(questBtn.classList.contains('active')).toBe(true);
    expect(invBtn.classList.contains('active')).toBe(false);
    expect(document.getElementById('tab-quests').classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-inventory').classList.contains('active')).toBe(false);
  });

  it('clicking back to the inventory tab restores it', async () => {
    await bootApp();

    const invBtn = document.querySelector('.tab-btn[data-tab="inventory"]');
    const questBtn = document.querySelector('.tab-btn[data-tab="quests"]');

    questBtn.click();
    invBtn.click();

    expect(invBtn.classList.contains('active')).toBe(true);
    expect(questBtn.classList.contains('active')).toBe(false);
    expect(document.getElementById('tab-inventory').classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-quests').classList.contains('active')).toBe(false);
  });
});

describe('ui — item modal', () => {
  it('openItemModal() opens it and resets fields to their defaults (§2)', async () => {
    await bootApp();

    // Dirty the fields first so the reset is observable.
    document.getElementById('iName').value    = 'stale';
    document.getElementById('iCat').value      = 'Оръжие';
    document.getElementById('iQty').value      = '9';
    document.getElementById('iWeight').value   = '9';
    document.getElementById('iValue').value    = '9';
    document.getElementById('iCarrier').value  = 'Party';
    document.getElementById('iNote').value     = 'stale note';

    window.openItemModal();

    expect(document.getElementById('itemModal').classList.contains('open')).toBe(true);
    expect(document.getElementById('iName').value).toBe('');
    expect(document.getElementById('iCat').value).toBe('Разно');
    expect(document.getElementById('iQty').value).toBe('1');
    expect(document.getElementById('iWeight').value).toBe('0');
    expect(document.getElementById('iValue').value).toBe('0');
    expect(document.getElementById('iCarrier').value).toBe('Party');
    expect(document.getElementById('iNote').value).toBe('');
  });

  it('clicking the backdrop (modal itself) closes it', async () => {
    await bootApp();
    window.openItemModal();
    const modal = document.getElementById('itemModal');

    modal.click(); // e.target === modal → close

    expect(modal.classList.contains('open')).toBe(false);
  });

  it('clicking inside the modal-card does NOT close it', async () => {
    await bootApp();
    window.openItemModal();
    const modal = document.getElementById('itemModal');

    modal.querySelector('.modal-card').click(); // e.target !== modal → stays open

    expect(modal.classList.contains('open')).toBe(true);
  });
});

describe('ui — quest modal', () => {
  it('openQuestModal() opens it and resets fields to their defaults (§2)', async () => {
    await bootApp();

    document.getElementById('qName').value   = 'stale';
    document.getElementById('qStatus').value = 'Провален';
    document.getElementById('qGiver').value  = 'stale';
    document.getElementById('qDesc').value   = 'stale';
    document.getElementById('qReward').value = 'stale';
    document.getElementById('qNote').value   = 'stale';

    window.openQuestModal();

    expect(document.getElementById('questModal').classList.contains('open')).toBe(true);
    expect(document.getElementById('qName').value).toBe('');
    expect(document.getElementById('qStatus').value).toBe('Активен');
    expect(document.getElementById('qGiver').value).toBe('');
    expect(document.getElementById('qDesc').value).toBe('');
    expect(document.getElementById('qReward').value).toBe('');
    expect(document.getElementById('qNote').value).toBe('');
  });

  it('clicking the backdrop closes it; clicking inside the modal-card does not', async () => {
    await bootApp();
    window.openQuestModal();
    const modal = document.getElementById('questModal');

    modal.querySelector('.modal-card').click();
    expect(modal.classList.contains('open')).toBe(true);

    modal.click();
    expect(modal.classList.contains('open')).toBe(false);
  });
});

describe('ui — esc helper', () => {
  it('escapes &, <, > and "', async () => {
    await bootApp();
    const app = await import('../../app.js');

    expect(app.esc('&')).toBe('&amp;');
    expect(app.esc('<')).toBe('&lt;');
    expect(app.esc('>')).toBe('&gt;');
    expect(app.esc('"')).toBe('&quot;');
    expect(app.esc('<b>a & "c"</b>')).toBe('&lt;b&gt;a &amp; &quot;c&quot;&lt;/b&gt;');
  });

  it('leaves other characters (including single quotes) untouched', async () => {
    await bootApp();
    const app = await import('../../app.js');

    expect(app.esc("hello world 123")).toBe('hello world 123');
    expect(app.esc("it's fine")).toBe("it's fine");
  });

  it('casts non-string input via String()', async () => {
    await bootApp();
    const app = await import('../../app.js');

    expect(app.esc(42)).toBe('42');
    expect(app.esc(null)).toBe('null');
    expect(app.esc(undefined)).toBe('undefined');
    expect(app.esc(true)).toBe('true');
  });
});

describe('ui — initSortable', () => {
  it('a repeated call destroys the previous instance', async () => {
    // Empty list → renderItems() returns early and never creates a Sortable,
    // so invBody starts without an _sortable instance.
    await bootApp({ items: [] });
    const app = await import('../../app.js');

    let destroyCount = 0;
    globalThis.Sortable = class {
      constructor(el, opts) { el._sortable = this; this.opts = opts; }
      destroy() { destroyCount++; }
    };

    const arr = [];
    app.initSortable('invBody', arr, () => {});
    expect(destroyCount).toBe(0); // nothing to destroy on the first call

    app.initSortable('invBody', arr, () => {});
    expect(destroyCount).toBe(1); // second call destroyed the first instance
  });

  it('onEnd reorders the array and calls saveFn (writes via setDoc)', async () => {
    const { fs } = await bootApp({ items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
    const app = await import('../../app.js');
    const before = fs.calls.setDoc.length;

    // renderItems wired the array + saveItems into the bootApp Sortable stub,
    // which kept the opts for us to drive manually.
    const sortable = document.getElementById('invBody')._sortable;
    expect(sortable).toBeTruthy();

    sortable.opts.onEnd({ oldIndex: 0, newIndex: 2 }); // move A to the end

    expect(app.getState().items.map(i => i.name)).toEqual(['B', 'C', 'A']);
    expect(fs.calls.setDoc.length).toBe(before + 1);

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('inventory/items');
    expect(last.data.list.map(i => i.name)).toEqual(['B', 'C', 'A']);
  });
});
