import {
  db, GOLD_DOC, ITEMS_DOC, QUESTS_DOC,
  doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc
} from './modules/firebase.js';
import { state } from './modules/state.js';
import { spendGold, renderGold, coinInputs, clearCoinInputs } from './modules/gold.js';

// ─── CONFIG ────────────────────────────────────────────────
const PLAYERS = ['Калоян', 'Игор', 'Валентин', 'Петър'];

// ─── LOCAL STATE ────────────────────────────────────────────
// Mutable app state lives in modules/state.js (state.gold/items/quests/…)

// ─── SYNC INDICATOR ─────────────────────────────────────────
function syncMsg(msg, cls) {
  const el = document.getElementById('sync');
  el.textContent = msg;
  el.className = 'sync ' + (cls || '');
}

// ─── GOLD (pure logic + UI moved to modules/gold.js) ────────

window.handleGain = async function() {
  const amt = coinInputs();
  const next = { pp: state.gold.pp+amt.pp, gp: state.gold.gp+amt.gp, sp: state.gold.sp+amt.sp, cp: state.gold.cp+amt.cp };
  clearCoinInputs();
  state.gold = next;
  renderGold();
  syncMsg('Saving…', 'saving');
  await setDoc(GOLD_DOC, next);
  syncMsg('● Saved', 'saved');
};

window.handleSpend = async function() {
  const cost = coinInputs();
  const result = spendGold(state.gold, cost);
  const errEl = document.getElementById('goldError');
  if (!result) { errEl.classList.add('visible'); return; }
  errEl.classList.remove('visible');
  clearCoinInputs();
  state.gold = result;
  renderGold();
  syncMsg('Saving…', 'saving');
  await setDoc(GOLD_DOC, result);
  syncMsg('● Saved', 'saved');
};

// ─── POPULATE CARRIER SELECT ────────────────────────────────
PLAYERS.forEach(p => {
  const opt = document.createElement('option');
  opt.value = opt.textContent = p;
  document.getElementById('iCarrier').appendChild(opt);
});

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
window.openItemModal = function(idx = null) {
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
};
window.closeItemModal = () => document.getElementById('itemModal').classList.remove('open');
window.editItem = i => openItemModal(i);

window.saveItem = async function() {
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
};

window.deleteItem = async function(i) {
  if (!confirm(`Изтрий "${state.items[i].name}"?`)) return;
  state.items.splice(i, 1);
  renderItems();
  await saveItems();
};

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

// ─── QUESTS RENDER ──────────────────────────────────────────
const BADGE = {
  'Активен': 'badge-active', 'Изпълнен': 'badge-done',
  'Провален': 'badge-failed', 'Паузиран': 'badge-paused'
};
const NEXT_STATUS = {
  'Активен': 'Изпълнен', 'Изпълнен': 'Паузиран',
  'Паузиран': 'Активен',  'Провален': 'Активен'
};

function renderQuests() {
  const tbody = document.getElementById('questBody');
  if (!state.quests.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">Няма активни куестове.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.quests.map((q, i) => `
    <tr class="quest-row" data-idx="${i}">
      <td><span class="drag-handle">☰</span></td>
      <td>
        <strong>${esc(q.name)}</strong>
        ${q.desc ? `<div class="quest-desc">${esc(q.desc)}</div>` : ''}
      </td>
      <td>
        <span class="badge ${BADGE[q.status]||'badge-paused'}">${q.status}</span><br>
        <button class="btn-ghost btn-sm" style="margin-top:4px" onclick="cycleStatus(${i})">${NEXT_STATUS[q.status]||'Активен'} →</button>
      </td>
      <td>${esc(q.giver||'—')}</td>
      <td>${esc(q.reward||'—')}</td>
      <td><div class="quest-note-cell">${esc(q.note||'')}</div></td>
      <td><div class="tbl-actions">
        <button class="btn-ghost btn-sm" onclick="editQuest(${i})">✏</button>
        <button class="btn-danger btn-sm" onclick="deleteQuest(${i})">🗑</button>
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button, .drag-handle')) return;
      const idx = +tr.dataset.idx;
      const wasExpanded = state.expandedQuestIdx === idx;
      tbody.querySelectorAll('tr.quest-expanded').forEach(r => r.classList.remove('quest-expanded'));
      state.expandedQuestIdx = wasExpanded ? null : idx;
      if (!wasExpanded) tr.classList.add('quest-expanded');
    });
  });

  if (state.expandedQuestIdx !== null) {
    const r = tbody.querySelector(`tr[data-idx="${state.expandedQuestIdx}"]`);
    if (r) r.classList.add('quest-expanded');
  }

  initSortable('questBody', state.quests, saveQuests);
}

// ─── QUEST MODAL ─────────────────────────────────────────────
window.openQuestModal = function(idx = null) {
  state.editingQuestIdx = idx;
  const q = idx !== null ? state.quests[idx] : null;
  document.getElementById('questModalTitle').textContent = q ? 'Редактирай куест' : 'Добави куест';
  document.getElementById('qName').value   = q?.name   || '';
  document.getElementById('qStatus').value = q?.status || 'Активен';
  document.getElementById('qGiver').value  = q?.giver  || '';
  document.getElementById('qDesc').value   = q?.desc   || '';
  document.getElementById('qReward').value = q?.reward || '';
  document.getElementById('qNote').value   = q?.note   || '';
  document.getElementById('questModal').classList.add('open');
  document.getElementById('qName').focus();
};
window.closeQuestModal = () => document.getElementById('questModal').classList.remove('open');
window.editQuest = i => openQuestModal(i);

window.saveQuest = async function() {
  const name = document.getElementById('qName').value.trim();
  if (!name) { document.getElementById('qName').focus(); return; }
  const q = {
    name,
    status: document.getElementById('qStatus').value,
    giver:  document.getElementById('qGiver').value.trim(),
    desc:   document.getElementById('qDesc').value.trim(),
    reward: document.getElementById('qReward').value.trim(),
    note:   document.getElementById('qNote').value.trim(),
  };
  if (state.editingQuestIdx !== null) state.quests.splice(state.editingQuestIdx, 1);
  state.quests.unshift(q);
  closeQuestModal();
  renderQuests();
  await saveQuests();
};

window.cycleStatus = async function(i) {
  const q = state.quests.splice(i, 1)[0];
  q.status = NEXT_STATUS[q.status] || 'Активен';
  state.quests.unshift(q);
  renderQuests();
  await saveQuests();
};

window.deleteQuest = async function(i) {
  if (!confirm(`Изтрий куест "${state.quests[i].name}"?`)) return;
  state.quests.splice(i, 1);
  renderQuests();
  await saveQuests();
};

async function saveQuests() {
  state.savingQuests = true;
  syncMsg('Saving…', 'saving');
  try {
    await setDoc(QUESTS_DOC, { list: state.quests });
    syncMsg('● Saved', 'saved');
  } finally {
    state.savingQuests = false;
  }
}

// ─── DRAG & DROP ────────────────────────────────────────────
function initSortable(tbodyId, arr, saveFn) {
  const el = document.getElementById(tbodyId);
  if (el._sortable) el._sortable.destroy();
  el._sortable = new Sortable(el, {
    handle: '.drag-handle',
    animation: 150,
    onEnd(evt) {
      const moved = arr.splice(evt.oldIndex, 1)[0];
      arr.splice(evt.newIndex, 0, moved);
      saveFn();
    }
  });
}

// ─── TABS ───────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// Close modals on backdrop click
['itemModal','questModal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target.id === id) document.getElementById(id).classList.remove('open');
  });
});

// ─── ESCAPE HELPER ──────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── REAL-TIME LISTENERS ────────────────────────────────────
onSnapshot(GOLD_DOC, snap => {
  state.gold = snap.exists() ? snap.data() : { pp:0, gp:0, sp:0, cp:0 };
  renderGold();
});

onSnapshot(ITEMS_DOC, snap => {
  if (state.saving) return;
  state.items = snap.exists() ? (snap.data().list || []) : [];
  renderItems();
});

onSnapshot(QUESTS_DOC, snap => {
  if (state.savingQuests) return;
  state.quests = snap.exists() ? (snap.data().list || []) : [];
  renderQuests();
  document.getElementById('syncStatus').textContent = 'Live sync ✓';
  syncMsg('● live', 'saved');
  window.__appReady = true;
});

// Export / Import
window.exportData = function () {
  const bundle = { version: 1, exportedAt: new Date().toISOString(), gold: state.gold, items: state.items, quests: state.quests };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `shared-inventory-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

window.importData = async function (e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const bundle = JSON.parse(text);
    if (!confirm(`Импортиране ще презапише текущите данни. Продължи?`)) return;
    if (bundle.gold)   await setDoc(GOLD_DOC,   bundle.gold);
    if (bundle.items)  await setDoc(ITEMS_DOC,  { list: bundle.items });
    if (bundle.quests) await setDoc(QUESTS_DOC, { list: bundle.quests });
    syncMsg('● Imported', 'saved');
  } catch {
    alert('Грешен файл — не е валиден JSON от този апп.');
  }
  e.target.value = '';
};

// PWA install button
let deferredPrompt = null;
const btnInstall = document.getElementById('btnInstall');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.classList.remove('hidden');
});
btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  btnInstall.classList.add('hidden');
});
window.addEventListener('appinstalled', () => btnInstall.classList.add('hidden'));

export { spendGold, renderGold, coinInputs, clearCoinInputs } from './modules/gold.js';
export { renderItems, renderQuests, saveItems, saveQuests, initSortable, esc, syncMsg, BADGE, NEXT_STATUS };
export const getState = () => ({ gold: state.gold, items: state.items, quests: state.quests });
export function setState(s) { if (s.gold !== undefined) state.gold = s.gold; if (s.items !== undefined) state.items = s.items; if (s.quests !== undefined) state.quests = s.quests; }
