import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';
import { CRAFTING_TABLES } from '../../modules/crafting-data.js';

// Foundation tests for the CRAFTING REFERENCE feature (§11). They pin the
// shared contract the parallel lanes (crafting-ui / crafting-search) build on:
// the ⚒ header icon, the whole #craftingPage markup, the unified hash router
// (modules/router.js is the single hashchange owner: base-detail first, then
// crafting — the last one wins for '#crafting') and the shape of the static,
// committed data module. crafting.js/crafting-search.js ship as stubs here —
// only renderCraftingRoute's visibility switch is real, because it IS the
// route. The bases specs must stay green: the router refactor moved their
// hashchange listener, not their behaviour.

const hashchange = () => window.dispatchEvent(new Event('hashchange'));

describe('crafting — boot strip', () => {
  // FIRST in the file on purpose: no listener from an earlier boot can race
  // the assertion. A leftover hash NEVER restores a page (bases hotfix 2 —
  // F5 always lands on the tabs), and now that holds for '#crafting' too.
  it('a stale #crafting hash from a previous session is dropped on boot', async () => {
    location.hash = '#crafting';
    await bootApp();

    expect(location.hash).toBe('');
    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
  });
});

describe('crafting — header icon', () => {
  it('adds a ⚒ button to the header row (no new tab)', async () => {
    await bootApp();

    const btn = document.querySelector('[aria-label="Крафтинг референции"]');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('⚒');
    expect(btn.classList.contains('btn-ghost')).toBe(true);
    expect(btn.getAttribute('onclick')).toContain('openCrafting()');

    // It lives in the header row next to Install/Export/Import…
    expect(btn.parentElement.contains(document.getElementById('btnInstall'))).toBe(true);
    // …and it is NOT a fifth tab.
    expect(document.querySelectorAll('.tab-nav .tab-btn').length).toBe(4);
  });
});

describe('crafting — DOM markup contract', () => {
  it('exposes #craftingPage (hidden by default) with the full control set', async () => {
    await bootApp();

    const page = document.getElementById('craftingPage');
    expect(page).not.toBeNull();
    expect(page.classList.contains('hidden')).toBe(true);

    // The page sits AFTER the base detail — the crafting route wins over it.
    expect(document.getElementById('baseDetail').compareDocumentPosition(page)
      & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(page.querySelector('#btnCraftBack')).not.toBeNull();
    expect(page.querySelector('#craftSearch')).not.toBeNull();
    expect(page.querySelector('#craftSearch').type).toBe('search');
    expect(page.querySelector('#craftBadge')).not.toBeNull();
    expect(page.querySelector('#craftBadge').tagName).toBe('SELECT');
    expect(page.querySelector('#craftTabs')).not.toBeNull();
    expect(page.querySelector('#craftTabs').classList.contains('craft-tabs')).toBe(true);
    expect(page.querySelector('#craftTable')).not.toBeNull();
    expect(page.querySelector('#craftHead')).not.toBeNull();
    expect(page.querySelector('#craftBody')).not.toBeNull();

    const info = page.querySelector('#craftInfo');
    expect(info).not.toBeNull();
    expect(info.classList.contains('hidden')).toBe(true);
  });
});

describe('crafting — static data module', () => {
  it('ships 11 tables with the documented schema', () => {
    // 9 от първите два файла + 2 от DnD_Raw_Materials_Economy (materials, rarityRules)
    expect(CRAFTING_TABLES).toHaveLength(11);
    for (const t of CRAFTING_TABLES) {
      expect(typeof t.key).toBe('string');
      expect(typeof t.label).toBe('string');
      expect(['table', 'info']).toContain(t.type);
    }
  });

  it('animals is the default table: 54 rows, Animal/Size, filterable', () => {
    const animals = CRAFTING_TABLES.find(t => t.key === 'animals');
    expect(animals.type).toBe('table');
    expect(animals.rows).toHaveLength(54);
    expect(animals.nameCol).toBe('Animal');
    expect(animals.badgeCol).toBe('Size');
    expect(animals.filterable).toBe(true);
  });

  it('harvestRules is an info table rendered from k/v entries', () => {
    const rules = CRAFTING_TABLES.find(t => t.key === 'harvestRules');
    expect(rules.type).toBe('info');
    expect(Array.isArray(rules.entries)).toBe(true);
    expect(rules.entries.length).toBeGreaterThan(0);
    for (const e of rules.entries) {
      expect(typeof e.k).toBe('string');
      expect(typeof e.v).toBe('string');
    }
  });

  it('materials carries the raw materials economy: 120 rows, Raw Material/Rarity, filterable', () => {
    // Третият източник (DnD_Raw_Materials_Economy.xlsx). 'Rarity' е ЕДИНСТВЕНАТА
    // истинска rarity колона в цялата референция — навсякъде другаде ролята се
    // играе от Size/Potion Tier/Property.
    const materials = CRAFTING_TABLES.find(t => t.key === 'materials');
    expect(materials.type).toBe('table');
    expect(materials.rows).toHaveLength(120);
    expect(materials.nameCol).toBe('Raw Material');
    expect(materials.badgeCol).toBe('Rarity');
    expect(materials.filterable).toBe(true);
    expect(materials.columns).toContain('Category');
    expect(materials.columns).toContain('Raw Value / lb (gp)');
  });

  it('materials row 0 is Common soil / Common — the generation anchor', () => {
    // Нарочно закован: хваща разместване или пресортиране при регенерация.
    const materials = CRAFTING_TABLES.find(t => t.key === 'materials');
    expect(materials.rows[0]['Raw Material']).toBe('Common soil');
    expect(materials.rows[0].Rarity).toBe('Common');
  });

  it('rarityRules is a 6-row table with no badge filter', () => {
    const rules = CRAFTING_TABLES.find(t => t.key === 'rarityRules');
    expect(rules.type).toBe('table');
    expect(rules.rows).toHaveLength(6);
    expect(rules.nameCol).toBe('Rarity');
    expect(rules.badgeCol).toBeNull();
    expect(rules.filterable).toBe(false);
  });

  it('every type:table has its nameCol (and badgeCol, when set) among its columns', () => {
    for (const t of CRAFTING_TABLES.filter(x => x.type === 'table')) {
      expect(t.columns).toContain(t.nameCol);
      if (t.badgeCol) expect(t.columns).toContain(t.badgeCol);
      expect(t.rows.length).toBeGreaterThan(0);
    }
  });
});

describe('crafting — unified hash router', () => {
  it("'#crafting' shows the page and hides the tabs and the base detail", async () => {
    await bootApp();

    location.hash = '#crafting';
    hashchange();

    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('baseDetail').classList.contains('hidden')).toBe(true);
    document.querySelectorAll('.tab').forEach(t => {
      expect(t.classList.contains('hidden')).toBe(true);
    });
  });

  it('leaving the route brings the tabs back and hides the page', async () => {
    await bootApp();

    location.hash = '#crafting';
    hashchange();
    location.hash = '';
    hashchange();

    expect(document.getElementById('craftingPage').classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
    document.querySelectorAll('.tab').forEach(t => {
      expect(t.classList.contains('hidden')).toBe(false);
    });
  });
});

describe('crafting — openCrafting', () => {
  it('window.openCrafting routes to #crafting', async () => {
    await bootApp();
    location.hash = '';

    expect(typeof window.openCrafting).toBe('function');
    window.openCrafting();

    expect(location.hash).toBe('#crafting');
  });
});
