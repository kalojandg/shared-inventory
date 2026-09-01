import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Unit tests for the CRAFTING REFERENCE page (§11, lane crafting-ui — task 720).
// The foundation (710) owns the markup, the ⚒ icon and the router; this spec
// covers what modules/crafting.js renders INTO that markup: the chips strip, the
// name/badge list, the accordion details row, the info view and the filter.
//
// The data is static (modules/crafting-data.js) — no Firestore, no Sortable, no
// editing. The search controls belong to the parallel lane (730), so the filter
// is driven exactly the way that lane drives it: write state.craftingFilter,
// then dispatch the document event `crafting-filter`.

const hashchange = () => window.dispatchEvent(new Event('hashchange'));

// bootApp + land on #crafting, handing back the FRESH module instances
// (bootApp does vi.resetModules, so they must be imported after it).
async function bootCrafting() {
  await bootApp();
  const { state } = await import('../../modules/state.js');
  const { CRAFTING_TABLES } = await import('../../modules/crafting-data.js');
  location.hash = '#crafting';
  hashchange();
  return { state, CRAFTING_TABLES };
}

const chips = () => [...document.querySelectorAll('#craftTabs .craft-chip')];
const chipByLabel = label => chips().find(c => c.textContent === label);
const rows = () => [...document.getElementById('craftBody').querySelectorAll('tr[data-idx]')];
const tblWrap = () => document.getElementById('craftTable').closest('.tbl-wrap');

// The 730 lane never calls crafting.js — it only writes state + dispatches.
function applyFilter(state, filter) {
  state.craftingFilter = filter;
  document.dispatchEvent(new CustomEvent('crafting-filter'));
}

describe('crafting — chips', () => {
  it('renders one chip per table, animals active by default', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();

    expect(chips()).toHaveLength(CRAFTING_TABLES.length);
    expect(chips().map(c => c.textContent)).toEqual(CRAFTING_TABLES.map(t => t.label));

    const active = chips().filter(c => c.classList.contains('active'));
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe(CRAFTING_TABLES[0].label); // animals
  });

  it('a chip click switches the table and announces it with `crafting-tab`', async () => {
    const { state, CRAFTING_TABLES } = await bootCrafting();
    const brewing = CRAFTING_TABLES.find(t => t.key === 'brewing');

    const seen = [];
    document.addEventListener('crafting-tab', e => seen.push(e.detail));

    chipByLabel(brewing.label).click();

    expect(state.craftingTab).toBe('brewing');
    expect(seen).toEqual([{ key: 'brewing' }]);

    const active = chips().filter(c => c.classList.contains('active'));
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe(brewing.label);
    expect(rows()).toHaveLength(brewing.rows.length);
  });

  it('switching tables resets the filter and the expanded row', async () => {
    const { state, CRAFTING_TABLES } = await bootCrafting();

    state.craftingFilter = { q: 'rat', badge: 'Tiny' };
    state.expandedCraftIdx = 3;

    chipByLabel(CRAFTING_TABLES.find(t => t.key === 'ingredients').label).click();

    expect(state.craftingFilter).toEqual({ q: '', badge: '' });
    expect(state.expandedCraftIdx).toBeNull();
  });
});

describe('crafting — table view', () => {
  it('renders the animals table: head, 54 rows, name in <strong>, badge chip', async () => {
    await bootCrafting();

    const ths = [...document.getElementById('craftHead').querySelectorAll('th')];
    expect(ths).toHaveLength(3);
    expect(ths[0].textContent).toBe('Animal');
    expect(ths[1].textContent).toBe('Size');
    expect(ths[2].textContent).toBe('');

    expect(rows()).toHaveLength(54);

    const row0 = rows()[0];
    expect(row0.dataset.idx).toBe('0');
    expect(row0.querySelector('strong').textContent).toBe('Rat');
    expect(row0.querySelector('.craft-badge').textContent).toBe('Tiny');
    expect(row0.querySelector('.tbl-actions button').textContent).toBe('📖');
  });

  it('is a static reference: no drag handle, no edit/delete actions', async () => {
    await bootCrafting();

    const body = document.getElementById('craftBody');
    expect(body.querySelector('.drag-handle')).toBeNull();
    expect(body._sortable).toBeUndefined();
    expect(body.querySelectorAll('tr[data-idx="0"] .tbl-actions button')).toHaveLength(1);
  });

  it('renders a table without a badgeCol with a two-column head', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    const ingredients = CRAFTING_TABLES.find(t => t.key === 'ingredients');

    chipByLabel(ingredients.label).click();

    const ths = [...document.getElementById('craftHead').querySelectorAll('th')];
    expect(ths).toHaveLength(2);
    expect(ths[0].textContent).toBe('Property');
    expect(rows()[0].querySelector('.craft-badge')).toBeNull();
  });
});

describe('crafting — accordion', () => {
  it('a row click expands it with a details row of the remaining columns', async () => {
    const { state } = await bootCrafting();

    rows()[0].click();

    expect(state.expandedCraftIdx).toBe(0);
    const row0 = rows()[0];
    expect(row0.classList.contains('craft-expanded')).toBe(true);

    const details = row0.nextElementSibling;
    expect(details.classList.contains('craft-details-row')).toBe(true);
    expect(details.querySelector('.craft-details')).not.toBeNull();

    const text = details.textContent;
    expect(text).toContain('Harvest DC');
    expect(text).toContain('5');
    expect(text).toContain('Mostly worthless except in bulk/alchemy.');
    // nameCol/badgeCol stay in the main row — they are not repeated here.
    expect(text).not.toContain('Animal');
    expect(text).not.toContain('Size');
    // key: value lines, NOT a nested table (user requirement).
    expect(details.querySelector('table')).toBeNull();
    expect(details.querySelectorAll('.craft-details-label').length).toBeGreaterThan(0);
  });

  it('clicking the same row again collapses it', async () => {
    const { state } = await bootCrafting();

    rows()[0].click();
    rows()[0].click();

    expect(state.expandedCraftIdx).toBeNull();
    expect(document.querySelector('#craftBody tr.craft-expanded')).toBeNull();
    expect(document.querySelector('#craftBody .craft-details-row')).toBeNull();
  });

  it('the 📖 button toggles the very same row', async () => {
    const { state } = await bootCrafting();

    rows()[1].querySelector('.tbl-actions button').click();
    expect(state.expandedCraftIdx).toBe(1);
    expect(rows()[1].classList.contains('craft-expanded')).toBe(true);

    rows()[1].querySelector('.tbl-actions button').click();
    expect(state.expandedCraftIdx).toBeNull();
    expect(document.querySelector('#craftBody .craft-details-row')).toBeNull();
  });

  it('expands exactly one row at a time', async () => {
    const { state } = await bootCrafting();

    rows()[0].click();
    rows()[2].click();

    expect(state.expandedCraftIdx).toBe(2);
    expect(document.querySelectorAll('#craftBody tr.craft-expanded')).toHaveLength(1);
    expect(document.querySelectorAll('#craftBody .craft-details-row')).toHaveLength(1);
    expect(rows()[2].classList.contains('craft-expanded')).toBe(true);
  });

  it('skips empty values in the details block', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    // The shipped data has no blanks, so pin the rule on a row that does. The
    // module registry is reset by the next bootApp, so this stays local.
    const animals = CRAFTING_TABLES.find(t => t.key === 'animals');
    animals.rows.push({
      Animal: 'Тестово животно', Size: 'Tiny', 'Harvest DC': 7, Notes: '',
    });
    const idx = animals.rows.length - 1;

    location.hash = '#crafting';
    hashchange();
    const row = document.querySelector(`#craftBody tr[data-idx="${idx}"]`);
    row.click();

    const text = document.querySelector('#craftBody .craft-details-row').textContent;
    expect(text).toContain('Harvest DC');
    expect(text).not.toContain('Notes');
  });

  it('keeps the REAL row index while filtered, so the expansion survives', async () => {
    const { state, CRAFTING_TABLES } = await bootCrafting();
    const animals = CRAFTING_TABLES.find(t => t.key === 'animals');
    const realIdx = animals.rows.findIndex(r => r.Animal === 'Venomous Snake');

    applyFilter(state, { q: '', badge: 'Tiny' });
    const snake = rows().find(r => r.querySelector('strong').textContent === 'Venomous Snake');
    expect(snake.dataset.idx).toBe(String(realIdx));

    snake.click();
    expect(state.expandedCraftIdx).toBe(realIdx);
    expect(document.querySelector(`#craftBody tr[data-idx="${realIdx}"]`)
      .classList.contains('craft-expanded')).toBe(true);
  });
});

describe('crafting — filter', () => {
  it('filters by name (case-insensitive substring on nameCol)', async () => {
    const { state } = await bootCrafting();

    applyFilter(state, { q: 'rat', badge: '' });

    expect(rows().map(r => r.querySelector('strong').textContent)).toEqual(['Rat']);
  });

  it('filters by badge (exact match on badgeCol)', async () => {
    const { state } = await bootCrafting();

    applyFilter(state, { q: '', badge: 'Tiny' });

    const names = rows().map(r => r.querySelector('strong').textContent);
    expect(names).toEqual(['Rat', 'Rabbit / Hare', 'Venomous Snake']);
    rows().forEach(r => expect(r.querySelector('.craft-badge').textContent).toBe('Tiny'));
  });

  it('shows the empty-state row when nothing matches', async () => {
    const { state } = await bootCrafting();

    applyFilter(state, { q: 'zzz', badge: '' });

    const body = document.getElementById('craftBody');
    expect(body.querySelector('tr[data-idx]')).toBeNull();
    expect(body.querySelector('td.empty')).not.toBeNull();
    expect(body.textContent).toContain('Няма съвпадения.');
  });
});

// The raw materials economy (third xlsx source) ships as two more data-driven
// tables — the UI renders them for free. These pin that: `materials` is the only
// table whose badgeCol is a REAL rarity column, and `rarityRules` is the
// unfilterable companion. Expectations are derived from the data itself, so a
// regeneration that adds rows does not have to touch this spec.
describe('crafting — raw materials economy', () => {
  it('the materials chip renders the 120-row Raw Material / Rarity table', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    const materials = CRAFTING_TABLES.find(t => t.key === 'materials');

    chipByLabel(materials.label).click();

    const ths = [...document.getElementById('craftHead').querySelectorAll('th')];
    expect(ths).toHaveLength(3);
    expect(ths[0].textContent).toBe('Raw Material');
    expect(ths[1].textContent).toBe('Rarity');

    expect(rows()).toHaveLength(120);

    const row0 = rows()[0];
    expect(row0.dataset.idx).toBe('0');
    expect(row0.querySelector('strong').textContent).toBe('Common soil');
    expect(row0.querySelector('.craft-badge').textContent).toBe('Common');
  });

  it('a materials row expands to the economy columns, without name/badge', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    const materials = CRAFTING_TABLES.find(t => t.key === 'materials');
    const row0 = materials.rows[0];

    chipByLabel(materials.label).click();
    rows()[0].click();

    const details = document.querySelector('#craftBody .craft-details-row');
    const text = details.textContent;
    expect(text).toContain('Category');
    expect(text).toContain(row0.Category);
    expect(text).toContain('Typical Refined Product / Notes');
    expect(text).toContain(row0['Typical Refined Product / Notes']);
    // nameCol/badgeCol stay in the main row — they are not repeated here.
    expect(text).not.toContain('Raw Material');
    expect(text).not.toContain('Rarity');
  });

  it("the badge filter is an EXACT match: 'Rare' never pulls in 'Very Rare'", async () => {
    const { state, CRAFTING_TABLES } = await bootCrafting();
    const materials = CRAFTING_TABLES.find(t => t.key === 'materials');
    const expected = materials.rows.filter(r => r.Rarity === 'Rare').map(r => r['Raw Material']);
    // The trap only exists because both values live in the data.
    expect(expected.length).toBeGreaterThan(0);
    expect(materials.rows.some(r => r.Rarity === 'Very Rare')).toBe(true);

    chipByLabel(materials.label).click();
    applyFilter(state, { q: '', badge: 'Rare' });

    expect(rows().map(r => r.querySelector('strong').textContent)).toEqual(expected);
    rows().forEach(r => expect(r.querySelector('.craft-badge').textContent).toBe('Rare'));
  });

  it('rarityRules renders 6 rows with a two-column head (no badge)', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    const rules = CRAFTING_TABLES.find(t => t.key === 'rarityRules');

    chipByLabel(rules.label).click();

    const ths = [...document.getElementById('craftHead').querySelectorAll('th')];
    expect(ths).toHaveLength(2);
    expect(ths[0].textContent).toBe('Rarity');
    expect(rows()).toHaveLength(6);
    expect(rows()[0].querySelector('.craft-badge')).toBeNull();
  });
});

describe('crafting — info view', () => {
  it('an info table renders k/v rows and hides the table', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();
    const rules = CRAFTING_TABLES.find(t => t.key === 'harvestRules');

    chipByLabel(rules.label).click();

    const info = document.getElementById('craftInfo');
    expect(info.classList.contains('hidden')).toBe(false);
    expect(info.querySelectorAll('.craft-info-row')).toHaveLength(rules.entries.length);
    expect(info.querySelector('.craft-info-row strong').textContent).toBe(rules.entries[0].k);
    expect(info.textContent).toContain(rules.entries[0].v);
    expect(tblWrap().classList.contains('hidden')).toBe(true);
  });

  it('switching back to a table view restores the table and hides the info block', async () => {
    const { CRAFTING_TABLES } = await bootCrafting();

    chipByLabel(CRAFTING_TABLES.find(t => t.key === 'harvestRules').label).click();
    chipByLabel(CRAFTING_TABLES.find(t => t.key === 'animals').label).click();

    expect(document.getElementById('craftInfo').classList.contains('hidden')).toBe(true);
    expect(tblWrap().classList.contains('hidden')).toBe(false);
    expect(rows()).toHaveLength(54);
  });
});

describe('crafting — route', () => {
  it('leaving #crafting hides the page', async () => {
    await bootCrafting();
    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(false);

    location.hash = '';
    hashchange();

    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(true);
  });

  it('btnCraftBack clears the hash and leaves the page', async () => {
    await bootCrafting();

    document.getElementById('btnCraftBack').click();

    expect(location.hash).toBe('');
    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(true);

    // Bringing the tabs back is base-detail.renderRoute's job — the router
    // calls it on the hashchange the click produced (async in jsdom).
    hashchange();
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
  });
});
