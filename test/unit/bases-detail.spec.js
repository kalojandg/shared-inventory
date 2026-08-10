import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootApp } from '../helpers/dom.js';

// Detail-page hash routing for the BASES feature (§10, lane bases-detail).
// #base/<id> = the detail page; empty/other = the tabs. renderRoute() drives
// the transition, populates bdName/bdLocation/bdHistory ONLY on route change
// (an incoming snapshot must not clobber what the DM is typing), dispatches the
// document `base-route` event and keeps state.currentBaseId in sync. Saving
// splices+unshifts the edited base to the top (the saveQuest pattern) yet keeps
// the detail open (the anchor is the id, not the index).

const mkBases = () => ([
  { id: 'a', name: 'Ривъруд', location: 'На брега на реката', history: 'Основан отдавна', buildings: [], populace: [], production: [] },
  { id: 'b', name: 'Уайтрън', location: 'На хълма', history: '', buildings: [], populace: [], production: [] },
]);

async function boot(opts) {
  const { fs } = await bootApp(opts);
  const app = await import('../../app.js');
  const { state } = await import('../../modules/state.js');
  return { fs, app, state };
}

describe('bases — detail routing', () => {
  beforeEach(() => { location.hash = ''; });

  it('openBaseDetail sets #base/<id> and renderRoute shows the detail with populated fields', async () => {
    const bases = mkBases();
    const { app, state } = await boot({ bases });

    let routed;
    const h = e => { routed = e.detail; };
    document.addEventListener('base-route', h);

    app.openBaseDetail(0);
    expect(location.hash).toBe('#base/' + bases[0].id);

    app.renderRoute();

    const detail = document.getElementById('baseDetail');
    expect(detail.classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('bdName').value).toBe(bases[0].name);
    expect(document.getElementById('bdLocation').value).toBe(bases[0].location);
    expect(document.getElementById('bdHistory').value).toBe(bases[0].history);
    expect(state.currentBaseId).toBe(bases[0].id);
    expect(routed).toEqual({ id: bases[0].id });

    document.removeEventListener('base-route', h);
  });

  it('the back button returns to the tabs with the bases tab active', async () => {
    const { app, state } = await boot({ bases: mkBases() });
    app.openBaseDetail(0);
    app.renderRoute();

    let routed;
    const h = e => { routed = e.detail; };
    document.addEventListener('base-route', h);

    document.getElementById('btnBaseBack').click();

    expect(location.hash).not.toMatch(/#base\//);
    expect(document.getElementById('baseDetail').classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.tab-btn[data-tab="bases"]').classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-bases').classList.contains('active')).toBe(true);
    expect(state.currentBaseId).toBeNull();
    expect(routed).toEqual({ id: null });

    document.removeEventListener('base-route', h);
  });

  it('an unknown id in the hash falls back to the tabs and clears the hash', async () => {
    const { app } = await boot({ bases: mkBases() });

    location.hash = '#base/does-not-exist';
    app.renderRoute();

    expect(document.getElementById('baseDetail').classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
    expect(location.hash).toBe('');
  });

  it('saveBaseDetail moves the edited base to the top and persists, detail stays open', async () => {
    const { fs, app } = await boot({ bases: mkBases() });
    app.openBaseDetail(1); // edit base 'b'
    app.renderRoute();

    document.getElementById('bdName').value = 'Уайтрън-2';
    document.getElementById('bdLocation').value = 'Ново място';
    document.getElementById('bdHistory').value = 'Нова история';

    await app.saveBaseDetail();

    const last = fs.calls.setDoc[fs.calls.setDoc.length - 1];
    expect(last.token).toBe('bases/index');
    expect(last.data.list[0].id).toBe('b');
    expect(last.data.list[0].name).toBe('Уайтрън-2');
    expect(last.data.list[0].location).toBe('Ново място');
    expect(last.data.list[0].history).toBe('Нова история');
    expect(document.getElementById('baseDetail').classList.contains('hidden')).toBe(false);
  });

  it('saveBaseDetail confirms on the button itself: Запазване… → ✓ Записано → Запази', async () => {
    vi.useFakeTimers();
    try {
      const { app } = await boot({ bases: mkBases() });
      app.openBaseDetail(0);
      app.renderRoute();

      const btn = document.getElementById('btnBaseSave');
      const inFlight = app.saveBaseDetail();

      // Докато записът е in-flight: бутонът е заключен и го казва.
      expect(btn.disabled).toBe(true);
      expect(btn.textContent).toBe('Запазване…');

      await inFlight;

      // Потвърждението е върху бутона (без toast) и е зелено.
      expect(btn.disabled).toBe(false);
      expect(btn.textContent).toBe('✓ Записано');
      expect(btn.classList.contains('btn-saved')).toBe(true);

      // След ~1.6s се връща в изходно състояние.
      vi.advanceTimersByTime(1700);
      expect(btn.textContent).toBe('Запази');
      expect(btn.classList.contains('btn-saved')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('saveBaseDetail with an empty name does not persist and focuses #bdName', async () => {
    const { fs, app } = await boot({ bases: mkBases() });
    app.openBaseDetail(0);
    app.renderRoute();

    const before = fs.calls.setDoc.length;
    document.getElementById('bdName').value = '   ';
    await app.saveBaseDetail();

    expect(fs.calls.setDoc.length).toBe(before);
    expect(document.activeElement).toBe(document.getElementById('bdName'));
  });

  it('a stale #base hash from a previous session is dropped on boot — the app lands on the tabs', async () => {
    location.hash = '#base/b';
    await boot({ bases: mkBases() });

    expect(location.hash).toBe('');
    expect(document.getElementById('baseDetail').classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.tab-nav').classList.contains('hidden')).toBe(false);
  });

  it('an incoming snapshot while the detail is open does not overwrite typed input', async () => {
    const { fs, app } = await boot({ bases: mkBases() });
    app.openBaseDetail(0);
    app.renderRoute();

    const nameEl = document.getElementById('bdName');
    nameEl.value = 'Полу-написано име';

    fs.__emit('bases/index', { list: mkBases() });

    expect(nameEl.value).toBe('Полу-написано име');
  });
});
