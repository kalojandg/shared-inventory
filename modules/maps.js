import { state } from './state.js';
import { MAPS_INDEX_DOC, setDoc } from './firebase.js';
import { esc, syncMsg, initSortable } from './ui.js';

// ─── MAPS RENDER ────────────────────────────────────────────
// The table shows ONLY the two descriptions (short + details) with an
// ellipsis — the images live in separate maps/<id> docs and are NOT pulled
// when listing (the tablet is on a mobile connection). Accordion mirrors the
// quest pattern: exactly one expanded row, clicks on a button/.drag-handle do
// not toggle, and the expanded row survives a re-render via state.expandedMapIdx.
function renderMaps() {
  const tbody = document.getElementById('mapBody');
  if (!state.maps.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Няма качени карти.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.maps.map((m, i) => `
    <tr class="map-row" data-idx="${i}">
      <td><span class="drag-handle">☰</span></td>
      <td><strong class="map-short">${esc(m.shortDesc)}</strong></td>
      <td><div class="map-details">${esc(m.details || '')}</div></td>
      <td><div class="tbl-actions">
        <button class="btn-ghost btn-sm" onclick="editMap(${i})">✏</button>
        <button class="btn-danger btn-sm" onclick="deleteMap(${i})">🗑</button>
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button, .drag-handle')) return;
      const idx = +tr.dataset.idx;
      const wasExpanded = state.expandedMapIdx === idx;
      tbody.querySelectorAll('tr.map-expanded').forEach(r => r.classList.remove('map-expanded'));
      state.expandedMapIdx = wasExpanded ? null : idx;
      if (!wasExpanded) tr.classList.add('map-expanded');
    });
  });

  if (state.expandedMapIdx !== null) {
    const r = tbody.querySelector(`tr[data-idx="${state.expandedMapIdx}"]`);
    if (r) r.classList.add('map-expanded');
  }

  initSortable('mapBody', state.maps, saveMapsIndex);
}

// ─── MAPS INDEX PERSISTENCE ─────────────────────────────────
// Writes only the metadata list (order = display order). savingMaps guards the
// snapshot echo, exactly like saveQuests.
async function saveMapsIndex() {
  state.savingMaps = true;
  syncMsg('Saving…', 'saving');
  try {
    await setDoc(MAPS_INDEX_DOC, { list: state.maps });
    syncMsg('● Saved', 'saved');
  } finally {
    state.savingMaps = false;
  }
}

// ─── MAP MODAL ──────────────────────────────────────────────
// Minimal stubs for this task; the real dialog (file upload / paste /
// Firestore persistence) lands in task 430.
function openMapModal(idx = null) {}
function editMap(i) { openMapModal(i); }
function deleteMap(i) {}

export { renderMaps, saveMapsIndex, openMapModal, editMap, deleteMap };
