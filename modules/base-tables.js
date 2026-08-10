import { state } from './state.js';
import { esc, initSortable } from './ui.js';
import { saveBases } from './bases.js';

// ─── BASE SUB-TABLES (lane bases-tables — task 640) ─────────
// The three sub-tables (buildings / populace / production) share ONE generic
// renderer, ONE modal (#bsModal) and a per-table accordion. The current base
// is resolved through state.currentBaseId (set by base-detail.js) — NEVER by
// index, since unshift-ordering keeps moving records around. A `base-route`
// document event (dispatched by base-detail.js on every route change) triggers
// a re-render, so the two modules stay decoupled.

// kind → tbody id (the shared markup lives in index.html #baseDetail).
const BODY = {
  buildings:  'bdBuildingsBody',
  populace:   'bdPopulaceBody',
  production: 'bdProductionBody',
};
// kind → singular Bulgarian noun for the modal title.
const LABEL = {
  buildings:  'сграда',
  populace:   'жител',
  production: 'продукция',
};

// The current base, ALWAYS by id (null when there is no active route).
function currentBase() {
  if (state.currentBaseId == null) return null;
  return state.bases.find(b => b.id === state.currentBaseId) || null;
}

// ─── RENDER ─────────────────────────────────────────────────
function renderSubTable(kind) {
  const tbody = document.getElementById(BODY[kind]);
  if (!tbody) return;

  const base = currentBase();
  if (!base) { tbody.innerHTML = ''; return; }

  const arr = base[kind] || [];
  if (!arr.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Няма записи.</td></tr>`;
    return;
  }

  tbody.innerHTML = arr.map((r, i) => `
    <tr data-idx="${i}">
      <td><span class="drag-handle">☰</span></td>
      <td><strong>${esc(r.name)}</strong></td>
      <td><div class="bs-details">${esc(r.details || '')}</div></td>
      <td><div class="tbl-actions">
        <button class="btn-ghost btn-sm" onclick="editSub('${kind}', ${i})">✏</button>
        <button class="btn-danger btn-sm" onclick="deleteSub('${kind}', ${i})">🗑</button>
      </div></td>
    </tr>`).join('');

  // Accordion — exactly one expanded row PER sub-table (state.expandedSub[kind]).
  // A click on a button or the drag-handle must NOT toggle.
  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button, .drag-handle')) return;
      const idx = +tr.dataset.idx;
      const wasExpanded = state.expandedSub[kind] === idx;
      tbody.querySelectorAll('tr.bs-expanded').forEach(r => r.classList.remove('bs-expanded'));
      state.expandedSub[kind] = wasExpanded ? null : idx;
      if (!wasExpanded) tr.classList.add('bs-expanded');
    });
  });

  if (state.expandedSub[kind] !== null) {
    const r = tbody.querySelector(`tr[data-idx="${state.expandedSub[kind]}"]`);
    if (r) r.classList.add('bs-expanded');
  }

  initSortable(BODY[kind], arr, saveBases);
}

function renderSubTables() {
  renderSubTable('buildings');
  renderSubTable('populace');
  renderSubTable('production');
}

// ─── SUB MODAL ──────────────────────────────────────────────
function openSubModal(kind, idx = null) {
  state.editingSub = { kind, idx };
  const base = currentBase();
  const rec = (idx !== null && base) ? base[kind][idx] : null;
  document.getElementById('bsModalTitle').textContent =
    (rec ? 'Редактирай ' : 'Добави ') + LABEL[kind];
  document.getElementById('bsName').value    = rec?.name    || '';
  document.getElementById('bsDetails').value = rec?.details || '';
  document.getElementById('bsModal').classList.add('open');
  document.getElementById('bsName').focus();
}

function closeSubModal() { document.getElementById('bsModal').classList.remove('open'); }

function editSub(kind, i) { openSubModal(kind, i); }

async function saveSub() {
  if (!state.editingSub) return;
  const { kind, idx } = state.editingSub;
  const base = currentBase();
  if (!base) return;

  const name = document.getElementById('bsName').value.trim();
  if (!name) { document.getElementById('bsName').focus(); return; }

  const rec = { name, details: document.getElementById('bsDetails').value.trim() };
  if (idx !== null) base[kind].splice(idx, 1); // edit → drop the old position
  base[kind].unshift(rec);                     // new/edited record goes on top
  closeSubModal();
  renderSubTable(kind);
  await saveBases();
}

async function deleteSub(kind, i) {
  const base = currentBase();
  if (!base) return;
  if (!confirm(`Изтрий „${base[kind][i].name}"?`)) return;
  base[kind].splice(i, 1);
  renderSubTable(kind);
  await saveBases();
}

// The detail lane owns state.currentBaseId + the route; we only react to it.
document.addEventListener('base-route', renderSubTables);

export { renderSubTables, openSubModal, closeSubModal, editSub, saveSub, deleteSub };
