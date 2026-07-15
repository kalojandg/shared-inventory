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
import {
  renderQuests,
  openQuestModal, closeQuestModal, editQuest, saveQuest, cycleStatus, deleteQuest
} from './modules/quests.js';

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

// ─── QUESTS (render + modal + save/cycle/delete moved to modules/quests.js) ──
window.openQuestModal  = openQuestModal;
window.closeQuestModal = closeQuestModal;
window.editQuest       = editQuest;
window.saveQuest       = saveQuest;
window.cycleStatus     = cycleStatus;
window.deleteQuest     = deleteQuest;

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
export { renderItems, saveItems };
export { BADGE, NEXT_STATUS, renderQuests, saveQuests } from './modules/quests.js';
export const getState = () => ({ gold: state.gold, items: state.items, quests: state.quests });
export function setState(s) { if (s.gold !== undefined) state.gold = s.gold; if (s.items !== undefined) state.items = s.items; if (s.quests !== undefined) state.quests = s.quests; }
