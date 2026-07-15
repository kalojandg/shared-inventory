import {
  db, GOLD_DOC, ITEMS_DOC, QUESTS_DOC,
  doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc
} from './modules/firebase.js';
import { state } from './modules/state.js';
import { spendGold, renderGold, coinInputs, clearCoinInputs } from './modules/gold.js';
import { esc, syncMsg, initSortable } from './modules/ui.js';
import {
  renderItems, saveItems,
  openItemModal, closeItemModal, editItem, saveItem, deleteItem
} from './modules/items.js';

// ─── CONFIG ────────────────────────────────────────────────
const PLAYERS = ['Калоян', 'Игор', 'Валентин', 'Петър'];

// ─── LOCAL STATE ────────────────────────────────────────────
// Mutable app state lives in modules/state.js (state.gold/items/quests/…)

// ─── SYNC INDICATOR (moved to modules/ui.js) ────────────────

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

// ─── ITEMS (render + modal + save/delete moved to modules/items.js) ──
window.openItemModal  = openItemModal;
window.closeItemModal = closeItemModal;
window.editItem       = editItem;
window.saveItem       = saveItem;
window.deleteItem     = deleteItem;

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

// ─── FACADE RE-EXPORTS ──────────────────────────────────────
export { spendGold, renderGold, coinInputs, clearCoinInputs } from './modules/gold.js';
export { esc, syncMsg, initSortable } from './modules/ui.js';
export { renderItems, saveItems, renderQuests, saveQuests, BADGE, NEXT_STATUS };
export const getState = () => ({ gold: state.gold, items: state.items, quests: state.quests });
export function setState(s) { if (s.gold !== undefined) state.gold = s.gold; if (s.items !== undefined) state.items = s.items; if (s.quests !== undefined) state.quests = s.quests; }
