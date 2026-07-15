import { describe, it, expect, beforeEach } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the GOLD treasury region of app.js (§2 GOLD, §4, §6).
// They document the CURRENT behavior and must pass against an UNCHANGED app.js.

// Boot the app (fresh module graph + DOM) and return both the firestore mock
// and the live app module (re-import is the same post-resetModules instance).
async function boot(opts) {
  const { fs } = await bootApp(opts);
  const app = await import('../../app.js');
  return { fs, app };
}

function setInputs({ pp = '', gp = '', sp = '', cp = '' }) {
  document.getElementById('inPP').value = pp;
  document.getElementById('inGP').value = gp;
  document.getElementById('inSP').value = sp;
  document.getElementById('inCP').value = cp;
}

describe('spendGold (pure borrow-down function)', () => {
  let spendGold;
  beforeEach(async () => {
    const { app } = await boot();
    spendGold = app.spendGold;
  });

  it('subtracts an exact amount without any borrow', () => {
    expect(spendGold({ pp: 1, gp: 2, sp: 3, cp: 4 }, { pp: 0, gp: 1, sp: 1, cp: 1 }))
      .toEqual({ pp: 1, gp: 1, sp: 2, cp: 3 });
  });

  it('borrows a copper from silver (cp←sp)', () => {
    expect(spendGold({ pp: 0, gp: 0, sp: 1, cp: 0 }, { cp: 1 }))
      .toEqual({ pp: 0, gp: 0, sp: 0, cp: 9 });
  });

  it('borrows a silver from gold (sp←gp)', () => {
    expect(spendGold({ pp: 0, gp: 1, sp: 0, cp: 0 }, { sp: 1 }))
      .toEqual({ pp: 0, gp: 0, sp: 9, cp: 0 });
  });

  it('borrows a gold from platinum (gp←pp)', () => {
    expect(spendGold({ pp: 1, gp: 0, sp: 0, cp: 0 }, { gp: 1 }))
      .toEqual({ pp: 0, gp: 9, sp: 0, cp: 0 });
  });

  it('chains the borrow down the whole ladder (pay 1cp with only 1pp)', () => {
    expect(spendGold({ pp: 1, gp: 0, sp: 0, cp: 0 }, { cp: 1 }))
      .toEqual({ pp: 0, gp: 9, sp: 9, cp: 9 });
  });

  it('returns null when the cost exceeds the purse', () => {
    expect(spendGold({ pp: 0, gp: 0, sp: 0, cp: 5 }, { cp: 6 })).toBeNull();
  });

  it('floors fractional costs in the affordability guard (toCp uses Math.floor)', () => {
    // 10.9 floors to 10 → affordable; 11 is over → null.
    expect(spendGold({ pp: 0, gp: 0, sp: 0, cp: 10 }, { cp: 10.9 })).not.toBeNull();
    expect(spendGold({ pp: 0, gp: 0, sp: 0, cp: 10 }, { cp: 11 })).toBeNull();
  });

  it('returns the purse unchanged for a zero cost', () => {
    expect(spendGold({ pp: 1, gp: 2, sp: 3, cp: 4 }, {}))
      .toEqual({ pp: 1, gp: 2, sp: 3, cp: 4 });
  });

  it('treats missing cost fields as 0', () => {
    expect(spendGold({ pp: 0, gp: 2, sp: 0, cp: 0 }, { gp: 1 }))
      .toEqual({ pp: 0, gp: 1, sp: 0, cp: 0 });
  });
});

describe('renderGold (DOM display)', () => {
  it('shows the gold values in #dispPP/GP/SP/CP', async () => {
    await boot({ gold: { pp: 1, gp: 2, sp: 3, cp: 4 } });
    expect(document.getElementById('dispPP').textContent).toBe('1');
    expect(document.getElementById('dispGP').textContent).toBe('2');
    expect(document.getElementById('dispSP').textContent).toBe('3');
    expect(document.getElementById('dispCP').textContent).toBe('4');
  });
});

describe('coinInputs (input clamping)', () => {
  it('clamps negatives to 0, floors floats and reads empty as 0', async () => {
    const { app } = await boot();
    setInputs({ pp: '-5', gp: '2.9', sp: '', cp: '3' });
    expect(app.coinInputs()).toEqual({ pp: 0, gp: 2, sp: 0, cp: 3 });
  });
});

describe('window.handleGain', () => {
  it('adds inputs to gold, clears the inputs and writes inventory/gold', async () => {
    const { fs } = await boot({ gold: { pp: 1, gp: 2, sp: 3, cp: 4 } });
    setInputs({ pp: '1', gp: '1', sp: '1', cp: '1' });

    await window.handleGain();

    const last = fs.calls.setDoc.at(-1);
    expect(last.token).toBe('inventory/gold');
    expect(last.data).toEqual({ pp: 2, gp: 3, sp: 4, cp: 5 });

    expect(document.getElementById('inPP').value).toBe('');
    expect(document.getElementById('inCP').value).toBe('');
  });
});

describe('window.handleSpend', () => {
  it('writes the borrow-down result and keeps #goldError hidden on success', async () => {
    const { fs } = await boot({ gold: { pp: 0, gp: 0, sp: 0, cp: 10 } });
    setInputs({ cp: '3' });

    await window.handleSpend();

    const last = fs.calls.setDoc.at(-1);
    expect(last.token).toBe('inventory/gold');
    expect(last.data).toEqual({ pp: 0, gp: 0, sp: 0, cp: 7 });
    expect(document.getElementById('goldError').classList.contains('visible')).toBe(false);
    expect(document.getElementById('dispCP').textContent).toBe('7');
  });

  it('shows #goldError, leaves gold untouched and does not write on shortfall', async () => {
    const { fs } = await boot({ gold: { pp: 0, gp: 0, sp: 0, cp: 5 } });
    setInputs({ cp: '10' });

    await window.handleSpend();

    expect(document.getElementById('goldError').classList.contains('visible')).toBe(true);
    expect(document.getElementById('dispCP').textContent).toBe('5');
    expect(fs.calls.setDoc.length).toBe(0);
  });

  it('removes the visible error class on a later successful spend', async () => {
    const { fs } = await boot({ gold: { pp: 0, gp: 0, sp: 0, cp: 5 } });

    setInputs({ cp: '10' });
    await window.handleSpend();
    expect(document.getElementById('goldError').classList.contains('visible')).toBe(true);

    setInputs({ cp: '3' });
    await window.handleSpend();

    expect(document.getElementById('goldError').classList.contains('visible')).toBe(false);
    const last = fs.calls.setDoc.at(-1);
    expect(last.token).toBe('inventory/gold');
    expect(last.data).toEqual({ pp: 0, gp: 0, sp: 0, cp: 2 });
  });
});
