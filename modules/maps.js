import { state } from './state.js';
import { MAPS_INDEX_DOC, mapImageDoc, setDoc, deleteDoc, getDoc } from './firebase.js';
import { esc, syncMsg, initSortable } from './ui.js';
import { blobToDataUrl, needsCompression, compressImage } from './image.js';

// The image (data URL) staged in the modal, awaiting save. null → unchanged.
let pendingImage = null;

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
// Two inputs feed one pipeline: a <input type="file"> and Ctrl+V paste. Both
// descriptions are required. The image is stored in its OWN maps/<id> doc
// (1MB/doc limit) while the metadata rides in maps/index.
function showMapError(msg) {
  const el = document.getElementById('mMapError');
  el.textContent = msg;
  el.classList.add('visible');
}
function clearMapError() {
  const el = document.getElementById('mMapError');
  el.textContent = '';
  el.classList.remove('visible');
}
function showPreview(dataUrl) {
  const img = document.getElementById('mPreview');
  img.src = dataUrl;
  img.classList.remove('hidden');
}

// blob (file or paste) → data URL, compressing ONLY when it exceeds the limit.
// A second, more aggressive pass follows; if that is still too big it is an
// error and pendingImage stays null (save blocked).
async function processImageBlob(blob) {
  clearMapError();
  let dataUrl = await blobToDataUrl(blob);
  if (needsCompression(dataUrl.length)) {
    dataUrl = await compressImage(blob);
    if (needsCompression(dataUrl.length)) {
      dataUrl = await compressImage(blob, { maxDim: 1200, quality: 0.6 });
      if (needsCompression(dataUrl.length)) {
        pendingImage = null;
        showMapError('Снимката е твърде голяма и след компресия.');
        return;
      }
    }
  }
  pendingImage = dataUrl;
  showPreview(dataUrl);
}

async function handleMapFile(e) {
  const blob = e.target.files && e.target.files[0];
  if (!blob) return;
  await processImageBlob(blob);
}

// Active only while the modal is open (paste is a document-level listener).
async function handleMapPaste(e) {
  if (!document.getElementById('mapModal').classList.contains('open')) return;
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  const imgItem = [...items].find(it => it.type && it.type.startsWith('image/'));
  if (!imgItem) return;
  const blob = imgItem.getAsFile();
  if (!blob) return;
  if (typeof e.preventDefault === 'function') e.preventDefault();
  await processImageBlob(blob);
}

async function openMapModal(idx = null) {
  state.editingMapIdx = idx;
  pendingImage = null;
  clearMapError();
  const m = idx !== null ? state.maps[idx] : null;
  document.getElementById('mapModalTitle').textContent = m ? 'Редактирай карта' : 'Добави карта';
  document.getElementById('mShort').value   = m?.shortDesc || '';
  document.getElementById('mDetails').value = m?.details   || '';
  document.getElementById('mFile').value = '';
  const img = document.getElementById('mPreview');
  img.src = '';
  img.classList.add('hidden');
  document.getElementById('mapModal').classList.add('open');
  document.getElementById('mShort').focus();
  // Edit: load the image lazily (it is NOT in the index snapshot).
  if (m) {
    img.alt = 'Зареждане…';
    const snap = await getDoc(mapImageDoc(m.id));
    img.alt = 'Преглед на картата';
    if (snap.exists() && snap.data() && snap.data().image) {
      img.src = snap.data().image;
      img.classList.remove('hidden');
    }
  }
}
function closeMapModal() { document.getElementById('mapModal').classList.remove('open'); }
function editMap(i) { return openMapModal(i); }

async function saveMap() {
  const shortDesc = document.getElementById('mShort').value.trim();
  const details   = document.getElementById('mDetails').value.trim();
  clearMapError();
  if (!shortDesc) { document.getElementById('mShort').focus(); return; }
  if (!details)   { document.getElementById('mDetails').focus(); return; }
  const editing  = state.editingMapIdx !== null;
  const existing = editing ? state.maps[state.editingMapIdx] : null;
  if (!editing && !pendingImage) {
    showMapError('Добави снимка на картата.');
    return;
  }
  const id = existing ? existing.id : crypto.randomUUID();
  // The image doc is written only when a new/changed image is staged.
  if (pendingImage) await setDoc(mapImageDoc(id), { image: pendingImage });
  const meta = {
    id,
    shortDesc,
    details,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  if (editing) state.maps.splice(state.editingMapIdx, 1);
  state.maps.unshift(meta); // edited/new map goes to the top
  state.editingMapIdx = null;
  pendingImage = null;
  closeMapModal();
  renderMaps();
  await saveMapsIndex();
}

async function deleteMap(i) {
  const m = state.maps[i];
  if (!confirm(`Изтрий картата "${m.shortDesc}"?`)) return;
  await deleteDoc(mapImageDoc(m.id));
  state.maps.splice(i, 1);
  renderMaps();
  await saveMapsIndex();
}

// Ctrl+V anywhere pastes into the open modal (guarded inside the handler).
document.addEventListener('paste', handleMapPaste);

export {
  renderMaps, saveMapsIndex,
  openMapModal, closeMapModal, editMap, saveMap, deleteMap,
  handleMapFile, handleMapPaste,
};
