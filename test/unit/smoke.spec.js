import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

describe('smoke', () => {
  it('boots with no data: gold shows 0 and both tables show their empty state', async () => {
    await bootApp();

    expect(document.getElementById('dispGP').textContent).toBe('0');
    expect(document.getElementById('invBody').textContent).toContain('Инвентарът е празен.');
    expect(document.getElementById('questBody').textContent).toContain('Няма активни куестове.');
  });

  it('renders an item row when given one item', async () => {
    await bootApp({ items: [{ name: 'Меч' }] });

    const invBody = document.getElementById('invBody');
    expect(invBody.querySelector('tr[data-idx="0"]')).not.toBeNull();
    expect(invBody.textContent).toContain('Меч');
  });

  it('app.js exports spendGold, getState and setState', async () => {
    await bootApp();
    const mod = await import('../../app.js');

    expect(typeof mod.spendGold).toBe('function');
    expect(typeof mod.getState).toBe('function');
    expect(typeof mod.setState).toBe('function');
  });
});
