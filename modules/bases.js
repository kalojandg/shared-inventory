import { state } from './state.js';
import { BASES_DOC, setDoc } from './firebase.js';
import { esc, syncMsg, initSortable } from './ui.js';

// ─── BASES LIST (lane bases-list — task 620) ────────────────
// The list mirrors the quests accordion pattern (§10): one row per base with
// name + location, a 📖 detail button (routing lives in base-detail.js, wired
// as window.openBaseDetail by the foundation) and a 🗑 delete button. Editing
// a base happens on the detail page, so the list has no ✏ button.
function renderBases() {
  const tbody = document.getElementById('baseBody');
  if (!state.bases.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Няма добавени бази.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.bases.map((b, i) => `
    <tr class="base-row" data-idx="${i}">
      <td><span class="drag-handle">☰</span></td>
      <td><strong>${esc(b.name)}</strong></td>
      <td><div class="base-location">${esc(b.location || '')}</div></td>
      <td><div class="tbl-actions">
        <button class="btn-ghost btn-sm" onclick="openBaseDetail(${i})">📖</button>
        <button class="btn-danger btn-sm" onclick="deleteBase(${i})">🗑</button>
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button, .drag-handle')) return;
      const idx = +tr.dataset.idx;
      const wasExpanded = state.expandedBaseIdx === idx;
      tbody.querySelectorAll('tr.base-expanded').forEach(r => r.classList.remove('base-expanded'));
      state.expandedBaseIdx = wasExpanded ? null : idx;
      if (!wasExpanded) tr.classList.add('base-expanded');
    });
  });

  if (state.expandedBaseIdx !== null) {
    const r = tbody.querySelector(`tr[data-idx="${state.expandedBaseIdx}"]`);
    if (r) r.classList.add('base-expanded');
  }

  initSortable('baseBody', state.bases, saveBases);
}

// ─── ADD-BASE MODAL ─────────────────────────────────────────
// The list only ever creates new bases (idx stays null); editing is on the
// detail page. Keep the idx param for signature parity with the app's modals.
function openBaseModal(idx = null) {
  state.editingBaseIdx = idx;
  document.getElementById('baseModalTitle').textContent = 'Добави база';
  document.getElementById('bName').value = '';
  document.getElementById('bLocation').value = '';
  document.getElementById('baseModal').classList.add('open');
  document.getElementById('bName').focus();
}

function closeBaseModal() { document.getElementById('baseModal').classList.remove('open'); }

async function saveBase() {
  const name = document.getElementById('bName').value.trim();
  if (!name) { document.getElementById('bName').focus(); return; }
  const base = {
    id: crypto.randomUUID(),
    name,
    location: document.getElementById('bLocation').value.trim(),
    history: '',
    buildings: [],
    populace: [],
    production: [],
  };
  state.bases.unshift(base);
  closeBaseModal();
  renderBases();
  await saveBases();
}

async function deleteBase(i) {
  if (!confirm(`Изтрий база "${state.bases[i].name}"?`)) return;
  state.bases.splice(i, 1);
  renderBases();
  await saveBases();
}

// ─── BASES PERSISTENCE (real from the foundation) ───────────
// One doc holds the whole list (§10). savingBases guards the snapshot echo,
// exactly like saveQuests. base-detail.js and base-tables.js import this.
async function saveBases() {
  state.savingBases = true;
  syncMsg('Saving…', 'saving');
  try {
    await setDoc(BASES_DOC, { list: state.bases });
    syncMsg('● Saved', 'saved');
  } finally {
    state.savingBases = false;
  }
}

export { renderBases, openBaseModal, closeBaseModal, saveBase, deleteBase, saveBases };
