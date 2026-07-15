import { state } from './state.js';
import { ITEMS_DOC, setDoc } from './firebase.js';
import { esc, syncMsg, initSortable } from './ui.js';

// ─── ITEMS RENDER ───────────────────────────────────────────
function renderItems() {
  const tbody = document.getElementById('invBody');
  if (!state.items.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">Инвентарът е празен.</td></tr>`;
    document.getElementById('invFooter').textContent = '';
    return;
  }
  tbody.innerHTML = state.items.map((it, i) => `
    <tr class="item-row" data-idx="${i}">
      <td><span class="drag-handle">☰</span></td>
      <td><strong>${esc(it.name)}</strong><br><small style="color:var(--muted)">${esc(it.cat||'')}</small></td>
      <td>${it.qty ?? 1}</td>
      <td>${it.weight ?? 0} lb</td>
      <td>${it.value ?? 0} gp</td>
      <td>${esc(it.carrier||'Party')}</td>
      <td><div class="item-note-cell">${esc(it.note||'')}</div></td>
      <td><div class="tbl-actions">
        <button class="btn-ghost btn-sm" onclick="editItem(${i})">✏</button>
        <button class="btn-danger btn-sm" onclick="deleteItem(${i})">🗑</button>
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button, .drag-handle')) return;
      const idx = +tr.dataset.idx;
      const wasExpanded = state.expandedItemIdx === idx;
      tbody.querySelectorAll('tr.item-expanded').forEach(r => r.classList.remove('item-expanded'));
      state.expandedItemIdx = wasExpanded ? null : idx;
      if (!wasExpanded) tr.classList.add('item-expanded');
    });
  });

  if (state.expandedItemIdx !== null) {
    const r = tbody.querySelector(`tr[data-idx="${state.expandedItemIdx}"]`);
    if (r) r.classList.add('item-expanded');
  }

  const totalW = state.items.reduce((s, it) => s + (+it.weight||0)*(+it.qty||1), 0);
  const totalV = state.items.reduce((s, it) => s + (+it.value||0)*(+it.qty||1), 0);
  document.getElementById('invFooter').textContent =
    `Общо: ${totalW.toFixed(1)} lb  |  ${totalV.toFixed(2)} gp`;

  initSortable('invBody', state.items, saveItems);
}

// ─── ITEM MODAL ─────────────────────────────────────────────
function openItemModal(idx = null) {
  state.editingItemIdx = idx;
  const it = idx !== null ? state.items[idx] : null;
  document.getElementById('itemModalTitle').textContent = it ? 'Редактирай предмет' : 'Добави предмет';
  document.getElementById('iName').value    = it?.name    || '';
  document.getElementById('iCat').value     = it?.cat     || 'Разно';
  document.getElementById('iQty').value     = it?.qty     ?? 1;
  document.getElementById('iWeight').value  = it?.weight  ?? 0;
  document.getElementById('iValue').value   = it?.value   ?? 0;
  document.getElementById('iCarrier').value = it?.carrier || 'Party';
  document.getElementById('iNote').value    = it?.note    || '';
  document.getElementById('itemModal').classList.add('open');
  document.getElementById('iName').focus();
}
function closeItemModal() { document.getElementById('itemModal').classList.remove('open'); }
function editItem(i) { openItemModal(i); }

async function saveItem() {
  const name = document.getElementById('iName').value.trim();
  if (!name) { document.getElementById('iName').focus(); return; }
  const item = {
    name,
    cat:     document.getElementById('iCat').value,
    qty:     +document.getElementById('iQty').value   || 1,
    weight:  +document.getElementById('iWeight').value|| 0,
    value:   +document.getElementById('iValue').value || 0,
    carrier: document.getElementById('iCarrier').value,
    note:    document.getElementById('iNote').value.trim(),
  };
  if (state.editingItemIdx !== null) state.items.splice(state.editingItemIdx, 1);
  state.items.unshift(item);
  closeItemModal();
  renderItems();
  await saveItems();
}

async function deleteItem(i) {
  if (!confirm(`Изтрий "${state.items[i].name}"?`)) return;
  state.items.splice(i, 1);
  renderItems();
  await saveItems();
}

async function saveItems() {
  state.saving = true;
  syncMsg('Saving…', 'saving');
  try {
    await setDoc(ITEMS_DOC, { list: state.items });
    syncMsg('● Saved', 'saved');
  } finally {
    state.saving = false;
  }
}

export { renderItems, openItemModal, closeItemModal, editItem, saveItem, deleteItem, saveItems };
