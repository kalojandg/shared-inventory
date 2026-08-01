import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the MAPS region (§9). bootApp() renders maps via
// the 'maps/index' __emit (new `maps` param). The table shows ONLY the two
// descriptions — no image is pulled when listing. Accordion mirrors quests.

describe('maps — render', () => {
  it('renders one row per map with shortDesc in <strong> and details in .map-details', async () => {
    await bootApp({ maps: [
      { id: 'a', shortDesc: 'Зоната на изток', details: 'В джунглата зад реката' },
      { id: 'b', shortDesc: 'Селището', details: 'Дървесните елфи' },
    ] });
    const tbody = document.getElementById('mapBody');
    const rows = tbody.querySelectorAll('tr[data-idx]');
    expect(rows.length).toBe(2);

    const row0 = tbody.querySelector('tr[data-idx="0"]');
    expect(row0.querySelector('strong').textContent).toBe('Зоната на изток');
    expect(row0.querySelector('.map-details').textContent).toBe('В джунглата зад реката');
  });

  it('shows the empty-state row when there are no maps', async () => {
    await bootApp({ maps: [] });
    const tbody = document.getElementById('mapBody');
    expect(tbody.querySelector('tr[data-idx]')).toBeNull();
    const empty = tbody.querySelector('tr td.empty');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('Няма качени карти.');
  });

  it('escapes shortDesc so raw markup does not become a real element', async () => {
    await bootApp({ maps: [{ id: 'a', shortDesc: '<img>', details: 'x' }] });
    const row = document.getElementById('mapBody').querySelector('tr[data-idx="0"]');
    expect(row.querySelector('img')).toBeNull();
    expect(row.innerHTML).toContain('&lt;img&gt;');
  });
});

describe('maps — accordion', () => {
  const twoMaps = [
    { id: 'a', shortDesc: 'A', details: 'da' },
    { id: 'b', shortDesc: 'B', details: 'db' },
  ];

  it('clicking a row expands it, clicking again collapses it', async () => {
    await bootApp({ maps: twoMaps });
    const row1 = document.getElementById('mapBody').querySelector('tr[data-idx="1"]');

    row1.click();
    expect(row1.classList.contains('map-expanded')).toBe(true);

    row1.click();
    expect(row1.classList.contains('map-expanded')).toBe(false);
  });

  it('only one row is expanded at a time', async () => {
    await bootApp({ maps: twoMaps });
    const tbody = document.getElementById('mapBody');
    const row0 = tbody.querySelector('tr[data-idx="0"]');
    const row1 = tbody.querySelector('tr[data-idx="1"]');

    row1.click();
    row0.click();

    expect(row1.classList.contains('map-expanded')).toBe(false);
    expect(row0.classList.contains('map-expanded')).toBe(true);
  });

  it('clicking a button in the row does not toggle the accordion', async () => {
    await bootApp({ maps: twoMaps });
    const row0 = document.getElementById('mapBody').querySelector('tr[data-idx="0"]');
    const btn = row0.querySelector('.tbl-actions button');
    // The row-click listener guards with closest('button, .drag-handle'); we only
    // assert that guard here. jsdom compiles the inline onclick in its own realm
    // (globals like editMap don't resolve there), so drop it before clicking —
    // the click still bubbles to the row listener with a <button> as target.
    btn.removeAttribute('onclick');

    btn.click();

    expect(row0.classList.contains('map-expanded')).toBe(false);
  });

  it('expanded state survives a re-render', async () => {
    await bootApp({ maps: twoMaps });
    const tbody = document.getElementById('mapBody');
    tbody.querySelector('tr[data-idx="0"]').click();

    const mod = await import('../../app.js');
    mod.renderMaps();

    expect(tbody.querySelector('tr[data-idx="0"]').classList.contains('map-expanded')).toBe(true);
  });
});

describe('maps — static world map link', () => {
  const WORLD_URL = 'https://totalwarwarhammer.fandom.com/wiki/Map:Immortal_Empires_Factions';

  it('renders a static external link to the full world map', async () => {
    await bootApp({ maps: [] });
    const link = document.querySelector('#tab-maps a.map-world-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe(WORLD_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('places the world map link before the .controls add button in DOM order', async () => {
    await bootApp({ maps: [] });
    const link = document.querySelector('#tab-maps a.map-world-link');
    const controls = document.querySelector('#tab-maps .controls');
    const pos = link.compareDocumentPosition(controls);
    expect(pos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('maps — per-row preview button', () => {
  const twoMaps = [
    { id: 'a', shortDesc: 'A', details: 'da' },
    { id: 'b', shortDesc: 'B', details: 'db' },
  ];

  it('renders a 🔍 preview button first in .tbl-actions, before ✏', async () => {
    await bootApp({ maps: twoMaps });
    const row0 = document.getElementById('mapBody').querySelector('tr[data-idx="0"]');
    const btns = row0.querySelectorAll('.tbl-actions button');
    expect(btns[0].textContent).toBe('🔍');
    expect(btns[1].textContent).toBe('✏');
  });

  it('clicking the 🔍 button does not toggle the accordion', async () => {
    await bootApp({ maps: twoMaps });
    const row0 = document.getElementById('mapBody').querySelector('tr[data-idx="0"]');
    const btn = row0.querySelector('.tbl-actions button'); // the 🔍 button
    // Inline onclick can't resolve globals in jsdom's realm — drop it; the click
    // still bubbles to the row listener with a <button> as target (the guard).
    btn.removeAttribute('onclick');

    btn.click();

    expect(row0.classList.contains('map-expanded')).toBe(false);
  });
});

describe('maps — previewMap (lazy image, no modal)', () => {
  it('opens the fullscreen viewer with the freshly fetched image', async () => {
    const { fs } = await bootApp({ maps: [{ id: 'a', shortDesc: 'A', details: 'da' }] });
    fs.__setDocData('maps/a', { image: 'data:image/png;base64,AAA' });

    await window.previewMap(0);

    const overlay = document.getElementById('mapViewer');
    expect(overlay).toBeTruthy();
    expect(overlay.style.display).toBe('flex');
    expect(overlay.querySelector('img').getAttribute('src')).toBe('data:image/png;base64,AAA');
    // does NOT open the edit modal
    expect(document.getElementById('mapModal').classList.contains('open')).toBe(false);
  });

  it('does not open the viewer when the map has no image doc', async () => {
    await bootApp({ maps: [{ id: 'a', shortDesc: 'A', details: 'da' }] });

    await window.previewMap(0);

    expect(document.getElementById('mapViewer')).toBeNull();
    expect(document.getElementById('sync').textContent).toContain('Няма снимка');
  });
});

describe('maps — snapshot echo guard', () => {
  it('ignores an incoming maps/index snapshot while savingMaps is true', async () => {
    const { fs } = await bootApp({ maps: [{ id: 'a', shortDesc: 'A', details: 'da' }] });
    const { state } = await import('../../modules/state.js');

    state.savingMaps = true;
    fs.__emit('maps/index', { list: [{ id: 'z', shortDesc: 'ECHO', details: 'x' }] });

    const tbody = document.getElementById('mapBody');
    expect(tbody.textContent).not.toContain('ECHO');
    expect(tbody.textContent).toContain('A');
  });
});
