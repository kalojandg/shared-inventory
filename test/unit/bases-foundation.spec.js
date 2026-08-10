import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Foundation tests for the BASES feature (§10). They pin the shared contract
// every parallel lane (bases-list / bases-detail / bases-tables) builds on:
// the 2×2 tab, the full DOM markup, the data layer (state.bases + saveBases +
// the BASES_DOC snapshot with its echo guard) and the modal backdrops.
// The three modules ship as stubs here — this task only guarantees the shape.

describe('bases — tab & navigation', () => {
  it('adds a fourth "Бази" tab that activates #tab-bases on click', async () => {
    await bootApp();
    const btns = document.querySelectorAll('.tab-nav .tab-btn');
    expect(btns.length).toBe(4);

    const basesBtn = document.querySelector('.tab-btn[data-tab="bases"]');
    expect(basesBtn).not.toBeNull();
    expect(basesBtn.textContent).toBe('Бази');

    basesBtn.click();
    expect(basesBtn.classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-bases').classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-inventory').classList.contains('active')).toBe(false);
  });
});

describe('bases — DOM markup contract', () => {
  it('exposes the list table, both modals and the detail page markup', async () => {
    await bootApp();

    // List
    expect(document.getElementById('baseBody')).not.toBeNull();

    // Add-base modal
    const modal = document.getElementById('baseModal');
    expect(modal).not.toBeNull();
    expect(modal.querySelector('#bName')).not.toBeNull();
    expect(modal.querySelector('#bLocation')).not.toBeNull();

    // Detail page — hidden by default
    const detail = document.getElementById('baseDetail');
    expect(detail).not.toBeNull();
    expect(detail.classList.contains('hidden')).toBe(true);
    expect(detail.querySelector('#btnBaseBack')).not.toBeNull();
    expect(detail.querySelector('#bdName')).not.toBeNull();
    expect(detail.querySelector('#bdLocation')).not.toBeNull();
    expect(detail.querySelector('#bdHistory')).not.toBeNull();
    expect(detail.querySelector('#btnBaseSave')).not.toBeNull();

    // Three sub-tables
    expect(document.getElementById('bdBuildingsBody')).not.toBeNull();
    expect(document.getElementById('bdPopulaceBody')).not.toBeNull();
    expect(document.getElementById('bdProductionBody')).not.toBeNull();

    // Sub-item modal
    const bsModal = document.getElementById('bsModal');
    expect(bsModal).not.toBeNull();
    expect(bsModal.querySelector('#bsName')).not.toBeNull();
    expect(bsModal.querySelector('#bsDetails')).not.toBeNull();
  });
});

describe('bases — data layer', () => {
  it('an incoming bases/index snapshot populates state.bases', async () => {
    await bootApp({ bases: [
      { id: 'a', name: 'Ривъруд', location: 'Река', history: '', buildings: [], populace: [], production: [] },
      { id: 'b', name: 'Уайтрън', location: 'Хълм', history: '', buildings: [], populace: [], production: [] },
    ] });

    const mod = await import('../../app.js');
    const bases = mod.getState().bases;
    expect(bases.map(b => b.name)).toEqual(['Ривъруд', 'Уайтрън']);
  });

  it('saveBases writes the whole list to the bases/index doc', async () => {
    const { fs } = await bootApp({ bases: [{ id: 'a', name: 'A', location: '', history: '', buildings: [], populace: [], production: [] }] });
    const mod = await import('../../app.js');

    await mod.saveBases();

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('bases/index');
    expect(last.data.list).toEqual(mod.getState().bases);
  });

  it('ignores an incoming snapshot while a save is in flight (savingBases echo guard)', async () => {
    const { fs } = await bootApp({ bases: [{ id: 'a', name: 'A', location: '', history: '', buildings: [], populace: [], production: [] }] });
    const mod = await import('../../app.js');

    // saveBases() flips savingBases true, then awaits setDoc — emit during that window.
    const inFlight = mod.saveBases();
    fs.__emit('bases/index', { list: [{ id: 'z', name: 'ECHO', location: '', history: '', buildings: [], populace: [], production: [] }] });
    await inFlight;

    expect(mod.getState().bases.map(b => b.name)).not.toContain('ECHO');
    expect(mod.getState().bases.map(b => b.name)).toEqual(['A']);
  });
});

describe('bases — visibility contract (styles.css)', () => {
  // jsdom не смята CSS, а рутирането крие табовете с клас `hidden` — без
  // глобално правило детайлът „лепва" ПОД видимия списък (реален бъг от
  // първия run). Характеризацията пази правилото да не изчезне: .hidden
  // трябва да крие БЕЗУСЛОВНО (!important, за да бие .tab.active).
  it('styles.css has a global .hidden utility with display:none !important', () => {
    const css = readFileSync(resolve(process.cwd(), 'styles.css'), 'utf-8');
    expect(css).toMatch(/(^|[\s,])\.hidden\s*\{[^}]*display:\s*none\s*!important/m);
  });
});

describe('bases — modal backdrops', () => {
  it('a backdrop click closes #baseModal and #bsModal', async () => {
    await bootApp();

    const baseModal = document.getElementById('baseModal');
    baseModal.classList.add('open');
    baseModal.click(); // e.target === baseModal → close
    expect(baseModal.classList.contains('open')).toBe(false);

    const bsModal = document.getElementById('bsModal');
    bsModal.classList.add('open');
    bsModal.click();
    expect(bsModal.classList.contains('open')).toBe(false);
  });
});
