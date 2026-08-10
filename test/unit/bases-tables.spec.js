import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Unit tests for the BASES sub-tables (§10, lane bases-tables — task 640).
// The three sub-tables (buildings / populace / production) share ONE generic
// renderer, ONE modal (#bsModal) and a per-table accordion. The current base
// is resolved through state.currentBaseId (set by base-detail.js; set directly
// here). A `base-route` document event triggers a re-render.

const KINDS = [
  { kind: 'buildings',  body: 'bdBuildingsBody',  label: 'сграда' },
  { kind: 'populace',   body: 'bdPopulaceBody',   label: 'жител' },
  { kind: 'production', body: 'bdProductionBody', label: 'продукция' },
];

// A base with two records in every sub-array. Fresh arrays per call.
function base(over = {}) {
  return {
    id: 'a', name: 'Ривъруд', location: 'Река', history: '',
    buildings:  [{ name: 'B0', details: 'bd0' }, { name: 'B1', details: 'bd1' }],
    populace:   [{ name: 'P0', details: 'pd0' }, { name: 'P1', details: 'pd1' }],
    production: [{ name: 'R0', details: 'rd0' }, { name: 'R1', details: 'rd1' }],
    ...over,
  };
}

// boot + grab the facade module and the SHARED state instance.
async function boot(bases) {
  const { fs } = await bootApp({ bases });
  const app = await import('../../app.js');
  const { state } = await import('../../modules/state.js');
  return { fs, app, state };
}

describe('base sub-tables — rendering', () => {
  KINDS.forEach(({ kind, body }) => {
    it(`renders ${kind} rows in #${body}: name in <strong>, details in .bs-details`, async () => {
      const { state, app } = await boot([base()]);
      state.currentBaseId = 'a';
      app.renderSubTables();

      const tbody = document.getElementById(body);
      const rows = tbody.querySelectorAll('tr[data-idx]');
      expect(rows.length).toBe(2);

      const rec = base()[kind][0];
      expect(rows[0].querySelector('strong')).not.toBeNull();
      expect(rows[0].querySelector('strong').textContent).toBe(rec.name);
      expect(rows[0].querySelector('.bs-details')).not.toBeNull();
      expect(rows[0].querySelector('.bs-details').textContent).toBe(rec.details);
      expect(rows[0].querySelector('.drag-handle')).not.toBeNull();
    });

    it(`shows the "Няма записи." empty row for an empty ${kind} sub-array`, async () => {
      const { state, app } = await boot([base({ [kind]: [] })]);
      state.currentBaseId = 'a';
      app.renderSubTables();

      const empty = document.getElementById(body).querySelector('.empty');
      expect(empty).not.toBeNull();
      expect(empty.textContent).toBe('Няма записи.');
    });
  });

  it('currentBaseId = null → renderSubTables leaves all three tables empty', async () => {
    const { state, app } = await boot([base()]);
    state.currentBaseId = null;
    app.renderSubTables();

    KINDS.forEach(({ body }) => {
      expect(document.getElementById(body).innerHTML).toBe('');
    });
  });

  it('initializes Sortable (el._sortable) on all three tbodies', async () => {
    const { state, app } = await boot([base()]);
    state.currentBaseId = 'a';
    app.renderSubTables();

    KINDS.forEach(({ body }) => {
      expect(document.getElementById(body)._sortable).toBeTruthy();
    });
  });

  it('dispatching a `base-route` event re-renders the sub-tables', async () => {
    const { state } = await boot([base()]);
    state.currentBaseId = 'a'; // set WITHOUT rendering
    // boot rendered with currentBaseId null → tables are empty right now
    expect(document.getElementById('bdBuildingsBody').innerHTML).toBe('');

    document.dispatchEvent(new CustomEvent('base-route', { detail: { id: 'a' } }));

    expect(document.getElementById('bdBuildingsBody').querySelectorAll('tr[data-idx]').length).toBe(2);
  });
});

describe('base sub-tables — modal', () => {
  KINDS.forEach(({ kind, label }) => {
    it(`openSubModal('${kind}') opens #bsModal with empty fields and the add-title`, async () => {
      const { state } = await boot([base()]);
      state.currentBaseId = 'a';
      window.openSubModal(kind);

      expect(document.getElementById('bsModal').classList.contains('open')).toBe(true);
      expect(document.getElementById('bsName').value).toBe('');
      expect(document.getElementById('bsDetails').value).toBe('');
      expect(document.getElementById('bsModalTitle').textContent).toBe('Добави ' + label);
    });
  });

  it('saveSub with an empty name → no setDoc and focus returns to #bsName', async () => {
    const { fs, state } = await boot([base()]);
    state.currentBaseId = 'a';
    window.openSubModal('buildings');
    document.getElementById('bsName').value = '   ';
    document.getElementById('bsName').blur();

    const before = fs.calls.setDoc.length;
    await window.saveSub();

    expect(fs.calls.setDoc.length).toBe(before);
    expect(document.activeElement.id).toBe('bsName');
    expect(document.getElementById('bsModal').classList.contains('open')).toBe(true);
  });

  it('saveSub (new) unshifts the record into the right sub-array of the right base', async () => {
    const { fs, state } = await boot([base({ id: 'a' }), base({ id: 'b', name: 'Уайтрън' })]);
    state.currentBaseId = 'b';
    window.openSubModal('populace');
    document.getElementById('bsName').value = 'Нов жител';
    document.getElementById('bsDetails').value = 'детайли';
    await window.saveSub();

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('bases/index');
    const b = last.data.list.find(x => x.id === 'b');
    expect(b.populace[0]).toEqual({ name: 'Нов жител', details: 'детайли' });
    // wrong base untouched
    expect(last.data.list.find(x => x.id === 'a').populace.map(r => r.name)).toEqual(['P0', 'P1']);
    expect(document.getElementById('bsModal').classList.contains('open')).toBe(false);
  });

  it('editSub prefills the modal; saveSub moves the edited record to [0], old position gone', async () => {
    const { fs, state } = await boot([base()]);
    state.currentBaseId = 'a';
    window.editSub('buildings', 1);
    expect(document.getElementById('bsName').value).toBe('B1');
    expect(document.getElementById('bsDetails').value).toBe('bd1');

    document.getElementById('bsName').value = 'B1-edited';
    await window.saveSub();

    const b = fs.calls.setDoc.at(-1).data.list.find(x => x.id === 'a');
    expect(b.buildings.length).toBe(2);
    expect(b.buildings[0].name).toBe('B1-edited');
    expect(b.buildings.map(r => r.name)).not.toContain('B1');
  });
});

describe('base sub-tables — delete', () => {
  it('deleteSub removes the record + setDoc when confirmed; does nothing when cancelled', async () => {
    const { fs, state } = await boot([base()]);
    state.currentBaseId = 'a';

    window.confirm = () => false;
    const before = fs.calls.setDoc.length;
    await window.deleteSub('production', 0);
    expect(fs.calls.setDoc.length).toBe(before);

    window.confirm = () => true;
    await window.deleteSub('production', 0); // removes R0
    const b = fs.calls.setDoc.at(-1).data.list.find(x => x.id === 'a');
    expect(b.production.map(r => r.name)).toEqual(['R1']);
  });
});

describe('base sub-tables — accordion', () => {
  it('is per sub-table: one expanded each, buildings survives a populace expand, handle click does not toggle', async () => {
    const { state, app } = await boot([base()]);
    state.currentBaseId = 'a';
    app.renderSubTables();

    const bRows = document.getElementById('bdBuildingsBody').querySelectorAll('tr[data-idx]');
    const pRows = document.getElementById('bdPopulaceBody').querySelectorAll('tr[data-idx]');

    bRows[0].click();
    expect(bRows[0].classList.contains('bs-expanded')).toBe(true);
    expect(state.expandedSub.buildings).toBe(0);

    // Expanding populace does NOT collapse buildings.
    pRows[1].click();
    expect(pRows[1].classList.contains('bs-expanded')).toBe(true);
    expect(state.expandedSub.populace).toBe(1);
    expect(bRows[0].classList.contains('bs-expanded')).toBe(true);
    expect(state.expandedSub.buildings).toBe(0);

    // Exactly one expanded within a table.
    bRows[1].click();
    expect(bRows[1].classList.contains('bs-expanded')).toBe(true);
    expect(bRows[0].classList.contains('bs-expanded')).toBe(false);
    expect(state.expandedSub.buildings).toBe(1);

    // Clicking the drag-handle does NOT toggle.
    bRows[1].querySelector('.drag-handle').click();
    expect(state.expandedSub.buildings).toBe(1);
    expect(bRows[1].classList.contains('bs-expanded')).toBe(true);

    // Clicking the same row again collapses it.
    bRows[1].click();
    expect(bRows[1].classList.contains('bs-expanded')).toBe(false);
    expect(state.expandedSub.buildings).toBe(null);
  });
});
