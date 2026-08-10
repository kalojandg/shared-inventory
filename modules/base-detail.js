import { state } from './state.js';
import { saveBases } from './bases.js';

// ─── BASE DETAIL ROUTING (lane bases-detail — task 630) ─────
// Hash routing (#base/<id>) + the editable name/location/history fields live
// here. #base/<id> shows the detail page for that base; an empty/other hash
// shows the tabs. renderRoute() is the single transition point — it runs on
// `hashchange` and on every bases snapshot. The fields are (re)populated ONLY
// when the route id actually changes, so an incoming snapshot never clobbers
// what the DM types. A leftover hash from a previous session is dropped at
// module init — reload and tab navigation always land on the LIST, never the
// detail (user decision: the detail is reachable only via 📖).

// The base id whose fields are currently mirrored into the form. Kept in a
// module var so a same-route re-render (a snapshot echo) leaves the inputs be.
let lastRenderedId = null;

function parseHash() {
  const m = (location.hash || '').match(/^#base\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Restore the tab view (mirror of what initTabs does on a click).
function activateBasesTab() {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="bases"]')?.classList.add('active');
  document.getElementById('tab-bases')?.classList.add('active');
}

function renderRoute() {
  const id = parseHash();
  const detail = document.getElementById('baseDetail');
  const base = id ? state.bases.find(b => b.id === id) : null;

  // ── Detail route for a known base ──
  if (id && base) {
    document.querySelector('.tab-nav')?.classList.add('hidden');
    document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
    detail.classList.remove('hidden');
    state.currentBaseId = id;
    if (lastRenderedId !== id) {
      lastRenderedId = id;
      document.getElementById('bdName').value    = base.name    || '';
      document.getElementById('bdLocation').value = base.location || '';
      document.getElementById('bdHistory').value  = base.history  || '';
      document.dispatchEvent(new CustomEvent('base-route', { detail: { id } }));
    }
    return;
  }

  // ── Unknown/deleted id (e.g. removed from another device mid-view):
  //    drop the hash silently and fall back to the tabs. ──
  if (id && !base) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  // ── Tab view (empty/cleared hash). Only run the leave-detail transition
  //    when we were actually showing a detail — a plain load with an empty
  //    hash must not steal the active tab from another tab. ──
  const wasOpen = lastRenderedId !== null || !detail.classList.contains('hidden');
  detail.classList.add('hidden');
  document.querySelector('.tab-nav')?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('hidden'));
  if (wasOpen) {
    activateBasesTab();
    document.dispatchEvent(new CustomEvent('base-route', { detail: { id: null } }));
  }
  state.currentBaseId = null;
  lastRenderedId = null;
}

// Row action 📖 → route to the detail. The hashchange listener (or the caller
// in jsdom, where hashchange is unreliable) drives renderRoute().
function openBaseDetail(i) {
  const base = state.bases[i];
  if (!base) return;
  location.hash = '#base/' + base.id;
  renderRoute();
}

// Save the edited fields. The anchor is the id, so the detail STAYS open; the
// edited base is spliced out and unshifted to the top (the saveQuest pattern).
async function saveBaseDetail() {
  const base = state.bases.find(b => b.id === state.currentBaseId);
  if (!base) return;
  const name = document.getElementById('bdName').value.trim();
  if (!name) { document.getElementById('bdName').focus(); return; }
  base.name     = name;
  base.location = document.getElementById('bdLocation').value.trim();
  base.history  = document.getElementById('bdHistory').value.trim();
  const idx = state.bases.indexOf(base);
  if (idx > 0) { state.bases.splice(idx, 1); state.bases.unshift(base); }
  await saveBases();
}

// ─── WIRING (once, at module init — the elements are static in index.html) ──
// F5 / fresh load with a leftover #base/<id> hash must NOT reopen the detail:
// the app always boots into the tab view. replaceState (not location.hash='')
// avoids an extra history entry and a spurious hashchange.
if (parseHash() !== null) {
  history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('hashchange', renderRoute);
document.getElementById('btnBaseBack')?.addEventListener('click', () => {
  location.hash = '';
  renderRoute();
});
document.getElementById('btnBaseSave')?.addEventListener('click', saveBaseDetail);

export { renderRoute, openBaseDetail, saveBaseDetail };
