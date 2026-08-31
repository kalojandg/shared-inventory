import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Unit tests for the CRAFTING SEARCH & BADGE FILTER (§11, lane crafting-search
// — task 730). The foundation (710) owns the `.craft-controls` markup; this
// spec covers modules/crafting-search.js: the wiring of #craftSearch / #craftBadge
// (they write state.craftingFilter and announce it with the document event
// `crafting-filter`) and populateBadgeOptions() (the per-table badge select —
// „rarity" has no column in the data, badgeCol plays that role, so the select is
// hidden for the tables with filterable:false).
//
// This lane NEVER calls crafting.js: the contract is state + document events, so
// the tests drive `crafting-tab` by hand exactly the way crafting.js does it.

// bootApp + the FRESH module instances (bootApp does vi.resetModules, so they
// must be imported after it). The wiring happens at module init — app.js imports
// crafting-search.js — so there is nothing to call here.
async function bootSearch() {
  await bootApp();
  const { state } = await import('../../modules/state.js');
  const { CRAFTING_TABLES } = await import('../../modules/crafting-data.js');
  return { state, CRAFTING_TABLES };
}

const search = () => document.getElementById('craftSearch');
const badge = () => document.getElementById('craftBadge');
const options = () => [...badge().options].map(o => [o.value, o.textContent]);

// crafting.js resets the filter itself before it announces the switch.
function switchTab(state, key) {
  state.craftingTab = key;
  state.craftingFilter = { q: '', badge: '' };
  document.dispatchEvent(new CustomEvent('crafting-tab', { detail: { key } }));
}

describe('crafting-search — badge options at boot', () => {
  it('animals (filterable) fills the select with „Всички" + the 5 distinct sizes', async () => {
    await bootSearch();

    expect(badge().classList.contains('hidden')).toBe(false);
    expect(options()).toEqual([
      ['', 'Всички'],
      ['Tiny', 'Tiny'],
      ['Small', 'Small'],
      ['Medium', 'Medium'],
      ['Large', 'Large'],
      ['Huge', 'Huge'],
    ]);
    expect(badge().value).toBe('');
  });
});

describe('crafting-search — controls write the filter', () => {
  it('typing in #craftSearch writes state.craftingFilter.q and dispatches `crafting-filter`', async () => {
    const { state } = await bootSearch();

    let seen = 0;
    document.addEventListener('crafting-filter', () => seen++);

    search().value = 'wolf';
    search().dispatchEvent(new Event('input'));

    expect(state.craftingFilter).toEqual({ q: 'wolf', badge: '' });
    expect(seen).toBe(1);
  });

  it('trims the typed value (no debounce — ≤90 rows)', async () => {
    const { state } = await bootSearch();

    search().value = '  wolf  ';
    search().dispatchEvent(new Event('input'));

    expect(state.craftingFilter.q).toBe('wolf');
  });

  it('picking a size writes state.craftingFilter.badge and dispatches `crafting-filter`', async () => {
    const { state } = await bootSearch();

    let seen = 0;
    document.addEventListener('crafting-filter', () => seen++);

    badge().value = 'Large';
    badge().dispatchEvent(new Event('change'));

    expect(state.craftingFilter).toEqual({ q: '', badge: 'Large' });
    expect(seen).toBe(1);
  });

  it('the two controls combine into one filter object', async () => {
    const { state } = await bootSearch();

    search().value = 'bear';
    search().dispatchEvent(new Event('input'));
    badge().value = 'Large';
    badge().dispatchEvent(new Event('change'));

    expect(state.craftingFilter).toEqual({ q: 'bear', badge: 'Large' });
  });
});

describe('crafting-search — `crafting-tab`', () => {
  it('a non-filterable table hides the select and clears the controls', async () => {
    const { state } = await bootSearch();

    search().value = 'wolf';
    search().dispatchEvent(new Event('input'));
    badge().value = 'Large';
    badge().dispatchEvent(new Event('change'));

    switchTab(state, 'ingredients'); // badgeCol null, filterable false

    expect(badge().classList.contains('hidden')).toBe(true);
    expect(badge().value).toBe('');
    expect(search().value).toBe('');
  });

  it('brewing (filterable) shows the Potion Tier values', async () => {
    const { state, CRAFTING_TABLES } = await bootSearch();
    const brewing = CRAFTING_TABLES.find(t => t.key === 'brewing');

    switchTab(state, 'brewing');

    expect(badge().classList.contains('hidden')).toBe(false);
    expect(options()).toEqual([
      ['', 'Всички'],
      ...[...new Set(brewing.rows.map(r => String(r['Potion Tier'])))].map(v => [v, v]),
    ]);
    expect(options()[1]).toEqual(['Minor / Common', 'Minor / Common']);
  });

  it('outcomes (90 rows) collapses to the 15 distinct Property values', async () => {
    const { state } = await bootSearch();

    switchTab(state, 'outcomes');

    expect(badge().classList.contains('hidden')).toBe(false);
    expect(options()).toHaveLength(16); // „Всички" + 15
    expect(options().map(([v]) => v)).toEqual([
      '', 'Vitality', 'Predator', 'Venom', 'Sensory', 'Carapace', 'Aerial',
      'Aquatic', 'Arcane', 'Necrotic', 'Radiant', 'Infernal', 'Fey', 'Psychic',
      'Elemental', 'Transformative',
    ]);
  });

  it('an info table has no badge filter either', async () => {
    const { state } = await bootSearch();

    switchTab(state, 'harvestRules'); // type 'info' — no rows at all

    expect(badge().classList.contains('hidden')).toBe(true);
    expect(options()).toEqual([]);
  });

  it('coming back to a filterable table repopulates the select', async () => {
    const { state } = await bootSearch();

    switchTab(state, 'ingredients');
    switchTab(state, 'animals');

    expect(badge().classList.contains('hidden')).toBe(false);
    expect(options()).toHaveLength(6);
  });
});
