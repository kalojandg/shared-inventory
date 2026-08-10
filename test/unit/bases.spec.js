import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Unit tests for the BASES LIST region (§10, lane bases-list — task 620).
// modules/quests.js is the reference pattern. bootApp() renders the list via the
// 'bases/index' __emit; fs.calls captures Firestore writes. openBaseDetail is a
// global wired by the foundation (610) — the list only produces the onclick.

const mkBase = (over = {}) => ({
  id: over.id ?? 'x', name: 'A', location: '', history: '',
  buildings: [], populace: [], production: [], ...over,
});

describe('bases — render', () => {
  it('renders one row per base with name and location', async () => {
    await bootApp({ bases: [
      mkBase({ id: 'a', name: 'Ривъруд', location: 'Река' }),
      mkBase({ id: 'b', name: 'Уайтрън', location: 'Хълм' }),
    ] });
    const tbody = document.getElementById('baseBody');
    expect(tbody.querySelectorAll('tr[data-idx]').length).toBe(2);

    const row0 = tbody.querySelector('tr[data-idx="0"]');
    expect(row0.querySelector('strong').textContent).toBe('Ривъруд');
    expect(row0.querySelector('.base-location').textContent).toBe('Река');
  });

  it('shows the empty-state row when there are no bases', async () => {
    await bootApp({ bases: [] });
    const tbody = document.getElementById('baseBody');
    expect(tbody.textContent).toContain('Няма добавени бази.');
    expect(tbody.querySelector('tr[data-idx]')).toBeNull();
    expect(tbody.querySelector('td.empty')).not.toBeNull();
  });

  it('escapes the base name to prevent raw markup injection', async () => {
    await bootApp({ bases: [mkBase({ name: '<img>' })] });
    const html = document.getElementById('baseBody').innerHTML;
    expect(html).not.toContain('<img>');
    expect(html).toContain('&lt;img&gt;');
  });

  it('renders the 📖 detail button before the 🗑 delete button', async () => {
    await bootApp({ bases: [mkBase()] });
    const buttons = document.getElementById('baseBody')
      .querySelectorAll('tr[data-idx="0"] .tbl-actions button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('📖');
    expect(buttons[1].textContent).toBe('🗑');
  });

  it('wires an initSortable instance on #baseBody after render', async () => {
    await bootApp({ bases: [mkBase()] });
    expect(document.getElementById('baseBody')._sortable).toBeDefined();
  });
});

describe('bases — accordion', () => {
  it('clicking a row expands it, clicking again collapses it', async () => {
    await bootApp({ bases: [mkBase({ id: 'a' }), mkBase({ id: 'b' })] });
    const row0 = document.getElementById('baseBody').querySelector('tr[data-idx="0"]');

    row0.click();
    expect(row0.classList.contains('base-expanded')).toBe(true);

    row0.click();
    expect(row0.classList.contains('base-expanded')).toBe(false);
  });

  it('only one row is expanded at a time', async () => {
    await bootApp({ bases: [mkBase({ id: 'a' }), mkBase({ id: 'b' })] });
    const tbody = document.getElementById('baseBody');
    const row0 = tbody.querySelector('tr[data-idx="0"]');
    const row1 = tbody.querySelector('tr[data-idx="1"]');

    row0.click();
    row1.click();

    expect(row0.classList.contains('base-expanded')).toBe(false);
    expect(row1.classList.contains('base-expanded')).toBe(true);
  });

  it('clicking a button in the row does not toggle the accordion', async () => {
    await bootApp({ bases: [mkBase()] });
    const row0 = document.getElementById('baseBody').querySelector('tr[data-idx="0"]');

    // The row's accordion listener bails on any button target (closest('button')).
    // Drop the inline onclick first — jsdom does not resolve window-expando globals
    // from content attributes, and this test targets the row guard, not the handler.
    const btn = row0.querySelector('.tbl-actions button');
    btn.removeAttribute('onclick');
    btn.click();

    expect(row0.classList.contains('base-expanded')).toBe(false);
  });

  it('expanded state survives a re-render', async () => {
    await bootApp({ bases: [mkBase({ id: 'a' }), mkBase({ id: 'b' })] });
    const tbody = document.getElementById('baseBody');
    tbody.querySelector('tr[data-idx="0"]').click();

    const mod = await import('../../app.js');
    mod.renderBases();

    expect(tbody.querySelector('tr[data-idx="0"]').classList.contains('base-expanded')).toBe(true);
  });
});

describe('bases — add modal', () => {
  it('openBaseModal() opens #baseModal with empty fields', async () => {
    await bootApp({ bases: [mkBase({ name: 'Existing' })] });
    window.openBaseModal();

    const modal = document.getElementById('baseModal');
    expect(modal.classList.contains('open')).toBe(true);
    expect(document.getElementById('bName').value).toBe('');
    expect(document.getElementById('bLocation').value).toBe('');
  });

  it('saveBase with an empty name does not write and focuses #bName', async () => {
    const { fs } = await bootApp({ bases: [] });
    const before = fs.calls.setDoc.length;

    window.openBaseModal();
    document.getElementById('bName').value = '   ';
    await window.saveBase();

    expect(fs.calls.setDoc.length).toBe(before);
    expect(document.activeElement.id).toBe('bName');
  });

  it('a successful saveBase unshifts a full base object and writes to bases/index', async () => {
    const { fs } = await bootApp({ bases: [] });

    window.openBaseModal();
    document.getElementById('bName').value = 'Ривъруд';
    document.getElementById('bLocation').value = 'Река';
    await window.saveBase();

    const mod = await import('../../app.js');
    const bases = mod.getState().bases;
    expect(bases.length).toBe(1);
    const b = bases[0];
    expect(typeof b.id).toBe('string');
    expect(b.id.length).toBeGreaterThan(0);
    expect(b.name).toBe('Ривъруд');
    expect(b.location).toBe('Река');
    expect(b.history).toBe('');
    expect(b.buildings).toEqual([]);
    expect(b.populace).toEqual([]);
    expect(b.production).toEqual([]);

    expect(document.getElementById('baseModal').classList.contains('open')).toBe(false);

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('bases/index');
    expect(last.data.list[0].name).toBe('Ривъруд');
  });

  it('a second new base is unshifted to the top of the list', async () => {
    await bootApp({ bases: [] });

    window.openBaseModal();
    document.getElementById('bName').value = 'First';
    await window.saveBase();

    window.openBaseModal();
    document.getElementById('bName').value = 'Second';
    await window.saveBase();

    const mod = await import('../../app.js');
    const bases = mod.getState().bases;
    expect(bases.map(b => b.name)).toEqual(['Second', 'First']);
  });
});

describe('bases — delete', () => {
  it('deleteBase removes the base and writes when confirmed', async () => {
    const { fs } = await bootApp({ bases: [
      mkBase({ id: 'a', name: 'A' }),
      mkBase({ id: 'b', name: 'B' }),
    ] });
    window.confirm = () => true;

    await window.deleteBase(0);

    const mod = await import('../../app.js');
    const bases = mod.getState().bases;
    expect(bases.length).toBe(1);
    expect(bases[0].name).toBe('B');
    expect(fs.calls.setDoc[fs.calls.setDoc.length - 1].token).toBe('bases/index');
  });

  it('deleteBase does nothing when the confirm is cancelled', async () => {
    const { fs } = await bootApp({ bases: [mkBase({ name: 'A' })] });
    window.confirm = () => false;
    const before = fs.calls.setDoc.length;

    await window.deleteBase(0);

    expect(fs.calls.setDoc.length).toBe(before);
    const mod = await import('../../app.js');
    expect(mod.getState().bases.length).toBe(1);
  });
});
