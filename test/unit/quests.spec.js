import { describe, it, expect } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Characterization tests for the QUESTS region of app.js (§2 QUESTS, §4, §6).
// They document CURRENT behaviour and must pass against an UNCHANGED app.js.
// bootApp() renders quests via the 'quests/items' __emit; fs.calls captures Firestore writes.

describe('quests — render', () => {
  it('empty list shows the empty-state row', async () => {
    await bootApp({ quests: [] });
    const tbody = document.getElementById('questBody');
    expect(tbody.textContent).toContain('Няма активни куестове.');
    expect(tbody.querySelector('tr[data-idx]')).toBeNull();
  });

  it('renders name, giver and reward for a quest', async () => {
    await bootApp({ quests: [{ name: 'Убий дракона', status: 'Активен', giver: 'Кралят', reward: '500 GP' }] });
    const row = document.getElementById('questBody').querySelector('tr[data-idx="0"]');
    expect(row.querySelector('strong').textContent).toBe('Убий дракона');
    expect(row.textContent).toContain('Кралят');
    expect(row.textContent).toContain('500 GP');
  });

  it('falls back to — for missing giver and reward', async () => {
    await bootApp({ quests: [{ name: 'Q', status: 'Активен' }] });
    const cells = document.getElementById('questBody').querySelectorAll('tr[data-idx="0"] td');
    // columns: handle | name/desc | status | giver | reward | note | actions
    expect(cells[3].textContent).toBe('—');
    expect(cells[4].textContent).toBe('—');
  });

  it('shows the description only when present', async () => {
    await bootApp({ quests: [{ name: 'A', status: 'Активен', desc: 'Намери меча' }, { name: 'B', status: 'Активен' }] });
    const rows = document.getElementById('questBody');
    expect(rows.querySelector('tr[data-idx="0"] .quest-desc')).not.toBeNull();
    expect(rows.querySelector('tr[data-idx="0"] .quest-desc').textContent).toBe('Намери меча');
    expect(rows.querySelector('tr[data-idx="1"] .quest-desc')).toBeNull();
  });

  it('applies the BADGE class matching each status', async () => {
    await bootApp({ quests: [
      { name: 'a', status: 'Активен' },
      { name: 'b', status: 'Изпълнен' },
      { name: 'c', status: 'Провален' },
      { name: 'd', status: 'Паузиран' },
    ] });
    const tbody = document.getElementById('questBody');
    const badgeAt = i => tbody.querySelector(`tr[data-idx="${i}"] .badge`);
    expect(badgeAt(0).classList.contains('badge-active')).toBe(true);
    expect(badgeAt(1).classList.contains('badge-done')).toBe(true);
    expect(badgeAt(2).classList.contains('badge-failed')).toBe(true);
    expect(badgeAt(3).classList.contains('badge-paused')).toBe(true);
  });

  it('escapes quest name to prevent raw markup injection', async () => {
    await bootApp({ quests: [{ name: '<script>x</script>', status: 'Активен' }] });
    const html = document.getElementById('questBody').innerHTML;
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('quests — NEXT_STATUS map & cycleStatus', () => {
  it('NEXT_STATUS cycles Активен→Изпълнен→Паузиран→Активен and Провален→Активен', async () => {
    await bootApp();
    const mod = await import('../../app.js');
    expect(mod.NEXT_STATUS).toEqual({
      'Активен': 'Изпълнен',
      'Изпълнен': 'Паузиран',
      'Паузиран': 'Активен',
      'Провален': 'Активен',
    });
  });

  it('cycleStatus advances the status, moves the quest to the top and writes to quests/items', async () => {
    const { fs } = await bootApp({ quests: [
      { name: 'first', status: 'Активен' },
      { name: 'second', status: 'Провален' },
    ] });

    await window.cycleStatus(1);

    const mod = await import('../../app.js');
    const quests = mod.getState().quests;
    expect(quests[0]).toEqual({ name: 'second', status: 'Активен' });
    expect(quests[1]).toEqual({ name: 'first', status: 'Активен' });

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('quests/items');
    expect(last.data.list[0]).toEqual({ name: 'second', status: 'Активен' });
  });
});

describe('quests — save / edit / delete', () => {
  it('saveQuest adds a new quest at the top and writes to quests/items', async () => {
    const { fs } = await bootApp({ quests: [{ name: 'Old', status: 'Активен' }] });

    window.openQuestModal();
    document.getElementById('qName').value = 'New';
    document.getElementById('qGiver').value = 'NPC';
    await window.saveQuest();

    const mod = await import('../../app.js');
    const quests = mod.getState().quests;
    expect(quests[0].name).toBe('New');
    expect(quests[0].giver).toBe('NPC');
    expect(quests[1].name).toBe('Old');

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('quests/items');
    expect(last.data.list[0].name).toBe('New');
  });

  it('saveQuest with an empty name does not save', async () => {
    const { fs } = await bootApp({ quests: [{ name: 'Old', status: 'Активен' }] });
    const before = fs.calls.setDoc.length;

    window.openQuestModal();
    document.getElementById('qName').value = '   ';
    await window.saveQuest();

    expect(fs.calls.setDoc.length).toBe(before);
    const mod = await import('../../app.js');
    expect(mod.getState().quests.length).toBe(1);
  });

  it('editing a quest removes the old entry and puts the edited one on top', async () => {
    const { fs } = await bootApp({ quests: [
      { name: 'A', status: 'Активен' },
      { name: 'B', status: 'Активен' },
    ] });

    window.openQuestModal(1); // edit B
    document.getElementById('qName').value = 'B-edited';
    await window.saveQuest();

    const mod = await import('../../app.js');
    const quests = mod.getState().quests;
    expect(quests.length).toBe(2);
    expect(quests[0].name).toBe('B-edited');
    expect(quests[1].name).toBe('A');
    expect(fs.calls.setDoc[fs.calls.setDoc.length - 1].token).toBe('quests/items');
  });

  it('deleteQuest removes the quest and writes when confirmed', async () => {
    const { fs } = await bootApp({ quests: [
      { name: 'A', status: 'Активен' },
      { name: 'B', status: 'Активен' },
    ] });
    window.confirm = () => true;

    await window.deleteQuest(0);

    const mod = await import('../../app.js');
    const quests = mod.getState().quests;
    expect(quests.length).toBe(1);
    expect(quests[0].name).toBe('B');
    expect(fs.calls.setDoc[fs.calls.setDoc.length - 1].token).toBe('quests/items');
  });

  it('deleteQuest does nothing when the confirm is cancelled', async () => {
    const { fs } = await bootApp({ quests: [{ name: 'A', status: 'Активен' }] });
    window.confirm = () => false;
    const before = fs.calls.setDoc.length;

    await window.deleteQuest(0);

    expect(fs.calls.setDoc.length).toBe(before);
    const mod = await import('../../app.js');
    expect(mod.getState().quests.length).toBe(1);
  });

  it('ignores an incoming snapshot while a save is in flight (savingQuests echo guard)', async () => {
    const { fs } = await bootApp({ quests: [{ name: 'A', status: 'Активен' }] });

    // cycleStatus() starts a save; while it awaits setDoc, savingQuests is true.
    const inFlight = window.cycleStatus(0);
    fs.__emit('quests/items', { list: [{ name: 'ECHO', status: 'Активен' }] });
    await inFlight;

    const mod = await import('../../app.js');
    const quests = mod.getState().quests;
    expect(quests.map(q => q.name)).not.toContain('ECHO');
    expect(quests[0]).toEqual({ name: 'A', status: 'Изпълнен' });
  });
});

describe('quests — accordion', () => {
  it('clicking a row expands it, clicking again collapses it', async () => {
    await bootApp({ quests: [{ name: 'A', status: 'Активен' }, { name: 'B', status: 'Активен' }] });
    const row0 = document.getElementById('questBody').querySelector('tr[data-idx="0"]');

    row0.click();
    expect(row0.classList.contains('quest-expanded')).toBe(true);

    row0.click();
    expect(row0.classList.contains('quest-expanded')).toBe(false);
  });

  it('only one row is expanded at a time', async () => {
    await bootApp({ quests: [{ name: 'A', status: 'Активен' }, { name: 'B', status: 'Активен' }] });
    const tbody = document.getElementById('questBody');
    const row0 = tbody.querySelector('tr[data-idx="0"]');
    const row1 = tbody.querySelector('tr[data-idx="1"]');

    row0.click();
    row1.click();

    expect(row0.classList.contains('quest-expanded')).toBe(false);
    expect(row1.classList.contains('quest-expanded')).toBe(true);
  });

  it('clicking the drag-handle does not toggle the accordion', async () => {
    await bootApp({ quests: [{ name: 'A', status: 'Активен' }] });
    const row0 = document.getElementById('questBody').querySelector('tr[data-idx="0"]');

    row0.querySelector('.drag-handle').click(); // click bubbles to the row listener, which ignores handles

    expect(row0.classList.contains('quest-expanded')).toBe(false);
  });

  it('expanded state survives a re-render', async () => {
    await bootApp({ quests: [{ name: 'A', status: 'Активен' }, { name: 'B', status: 'Активен' }] });
    const tbody = document.getElementById('questBody');
    tbody.querySelector('tr[data-idx="0"]').click();

    const mod = await import('../../app.js');
    mod.renderQuests();

    expect(tbody.querySelector('tr[data-idx="0"]').classList.contains('quest-expanded')).toBe(true);
  });
});
