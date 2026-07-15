import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the ITEMS region of app.js (§2 ITEMS, §4, §6).
// They document the CURRENT behaviour and run against an unmodified app.js.
// Every scenario boots the app fresh via bootApp() and asserts on the DOM +
// the firestore mock's recorded calls (fs.calls).

// Fill the item modal fields the way the UI would before saveItem().
function fillItemModal({ name = '', cat, qty, weight, value, carrier, note } = {}) {
  document.getElementById('iName').value = name;
  if (cat !== undefined)     document.getElementById('iCat').value = cat;
  if (qty !== undefined)     document.getElementById('iQty').value = qty;
  if (weight !== undefined)  document.getElementById('iWeight').value = weight;
  if (value !== undefined)   document.getElementById('iValue').value = value;
  if (carrier !== undefined) document.getElementById('iCarrier').value = carrier;
  if (note !== undefined)    document.getElementById('iNote').value = note;
}

describe('items — renderItems', () => {
  it('empty list → empty state row and blank footer', async () => {
    await bootApp({ items: [] });

    const invBody = document.getElementById('invBody');
    expect(invBody.textContent).toContain('Инвентарът е празен.');
    expect(invBody.querySelector('tr[data-idx]')).toBeNull();
    expect(document.getElementById('invFooter').textContent).toBe('');
  });

  it('renders a row with name/qty/weight/value/carrier', async () => {
    await bootApp({
      items: [{ name: 'Меч', cat: 'Оръжие', qty: 2, weight: 3, value: 15, carrier: 'Игор', note: 'остър' }],
    });

    const row = document.getElementById('invBody').querySelector('tr[data-idx="0"]');
    expect(row).not.toBeNull();
    const text = row.textContent;
    expect(text).toContain('Меч');
    expect(text).toContain('2');       // qty
    expect(text).toContain('3 lb');    // weight
    expect(text).toContain('15 gp');   // value
    expect(text).toContain('Игор');    // carrier
  });

  it('carrier defaults to "Party" when missing', async () => {
    await bootApp({ items: [{ name: 'Въже' }] });

    const row = document.getElementById('invBody').querySelector('tr[data-idx="0"]');
    expect(row.textContent).toContain('Party');
  });

  it('footer sums weight*qty (toFixed 1) and value*qty (toFixed 2)', async () => {
    await bootApp({
      items: [
        { name: 'A', weight: 1.5, value: 2, qty: 2 }, // 3.0 lb, 4.00 gp
        { name: 'B' },                                // missing → weight 0, qty defaults 1 → 0
      ],
    });

    // A: 1.5*2 = 3.0 lb, 2*2 = 4.00 gp ; B contributes nothing.
    expect(document.getElementById('invFooter').textContent)
      .toBe('Общо: 3.0 lb  |  4.00 gp');
  });

  it('esc() escapes markup in name/note — no raw tag is injected', async () => {
    await bootApp({ items: [{ name: '<script>alert(1)</script>', note: '"quoted"' }] });

    const invBody = document.getElementById('invBody');
    // No real <script> element was created from the item name.
    expect(invBody.querySelector('script')).toBeNull();
    // The angle brackets were escaped.
    expect(invBody.innerHTML).toContain('&lt;script&gt;');
    expect(invBody.innerHTML).not.toContain('<script>alert(1)');
  });
});

describe('items — saveItem', () => {
  it('adds a new item at the top (unshift) and writes inventory/items', async () => {
    const { fs } = await bootApp({ items: [{ name: 'Стар' }] });
    await import('../../app.js');

    window.openItemModal();               // new item → editingItemIdx = null
    fillItemModal({ name: 'Нов', qty: 3, weight: 2, value: 5, carrier: 'Party' });
    await window.saveItem();

    const rows = document.getElementById('invBody').querySelectorAll('tr[data-idx]');
    expect(rows[0].textContent).toContain('Нов'); // newest on top
    expect(rows[1].textContent).toContain('Стар');

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('inventory/items');
    expect(last.data.list.map(i => i.name)).toEqual(['Нов', 'Стар']);
  });

  it('empty name → does not save and does not write', async () => {
    const { fs } = await bootApp({ items: [{ name: 'Стар' }] });
    await import('../../app.js');
    const before = fs.calls.setDoc.length;

    window.openItemModal();
    fillItemModal({ name: '   ' }); // whitespace only
    await window.saveItem();

    expect(fs.calls.setDoc.length).toBe(before); // nothing written
    const rows = document.getElementById('invBody').querySelectorAll('tr[data-idx]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Стар');
  });

  it('editing an item removes the old entry and puts the edited one on top', async () => {
    const { fs } = await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });
    await import('../../app.js');

    window.openItemModal(1); // edit B (index 1)
    fillItemModal({ name: 'B2' });
    await window.saveItem();

    const rows = document.getElementById('invBody').querySelectorAll('tr[data-idx]');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('B2'); // edited, moved to top
    expect(rows[1].textContent).toContain('A');

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.data.list.map(i => i.name)).toEqual(['B2', 'A']);
  });
});

describe('items — deleteItem', () => {
  it('confirm=true → removes item and writes inventory/items', async () => {
    const { fs } = await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });
    await import('../../app.js');
    window.confirm = () => true;

    await window.deleteItem(0);

    const rows = document.getElementById('invBody').querySelectorAll('tr[data-idx]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('B');

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('inventory/items');
    expect(last.data.list.map(i => i.name)).toEqual(['B']);
  });

  it('confirm=false → nothing changes and nothing is written', async () => {
    const { fs } = await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });
    await import('../../app.js');
    const before = fs.calls.setDoc.length;
    window.confirm = () => false;

    await window.deleteItem(0);

    const rows = document.getElementById('invBody').querySelectorAll('tr[data-idx]');
    expect(rows.length).toBe(2);
    expect(fs.calls.setDoc.length).toBe(before);
  });
});

describe('items — snapshot echo guard (§4)', () => {
  it('an inventory/items snapshot arriving while a save is in-flight is ignored', async () => {
    const { fs } = await bootApp({ items: [{ name: 'A' }] });
    const app = await import('../../app.js');

    // saveItems() sets `saving = true` synchronously before awaiting setDoc.
    const inflight = app.saveItems();
    // Echo of our own write (or any snapshot) must NOT overwrite local state.
    fs.__emit('inventory/items', { list: [{ name: 'HACKED' }] });
    await inflight;

    expect(app.getState().items.map(i => i.name)).toEqual(['A']);
  });
});

describe('items — accordion', () => {
  it('clicking a row toggles item-expanded; a second click removes it', async () => {
    await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });

    const row0 = document.getElementById('invBody').querySelector('tr[data-idx="0"]');
    row0.click();
    expect(row0.classList.contains('item-expanded')).toBe(true);

    row0.click();
    expect(row0.classList.contains('item-expanded')).toBe(false);
  });

  it('expanding another row leaves only that one expanded', async () => {
    await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });

    const invBody = document.getElementById('invBody');
    const row0 = invBody.querySelector('tr[data-idx="0"]');
    const row1 = invBody.querySelector('tr[data-idx="1"]');

    row0.click();
    row1.click();

    expect(row0.classList.contains('item-expanded')).toBe(false);
    expect(row1.classList.contains('item-expanded')).toBe(true);
  });

  it('clicking the drag-handle does not toggle expansion', async () => {
    await bootApp({ items: [{ name: 'A' }] });

    const row0 = document.getElementById('invBody').querySelector('tr[data-idx="0"]');
    row0.querySelector('.drag-handle').click();

    expect(row0.classList.contains('item-expanded')).toBe(false);
  });

  it('expanded state survives a re-render', async () => {
    await bootApp({ items: [{ name: 'A' }, { name: 'B' }] });
    const app = await import('../../app.js');

    document.getElementById('invBody').querySelector('tr[data-idx="0"]').click();
    app.renderItems(); // re-render

    const row0 = document.getElementById('invBody').querySelector('tr[data-idx="0"]');
    expect(row0.classList.contains('item-expanded')).toBe(true);
  });
});
