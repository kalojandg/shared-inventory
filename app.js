import {
  GOLD_DOC, ITEMS_DOC, QUESTS_DOC, MAPS_INDEX_DOC,
  onSnapshot, setDoc
} from './modules/firebase.js';
import { state } from './modules/state.js';
import { renderGold, handleGain, handleSpend } from './modules/gold.js';
import { syncMsg, initTabs, initModalBackdrops } from './modules/ui.js';
import {
  renderItems, saveItems,
  openItemModal, closeItemModal, editItem, saveItem, deleteItem
} from './modules/items.js';
import {
  renderQuests,
  openQuestModal, closeQuestModal, editQuest, saveQuest, cycleStatus, deleteQuest
} from './modules/quests.js';
import {
  renderMaps, saveMapsIndex, openMapModal, editMap, deleteMap
} from './modules/maps.js';

// ─── CONFIG ────────────────────────────────────────────────
const PLAYERS = ['Калоян', 'Игор', 'Валентин', 'Петър'];

// ─── LOCAL STATE ────────────────────────────────────────────
// Mutable app state lives in modules/state.js (state.gold/items/quests/…)

// ─── SYNC INDICATOR (moved to modules/ui.js) ────────────────

// ─── GOLD (pure logic + UI + handlers moved to modules/gold.js) ──
window.handleGain  = handleGain;
window.handleSpend = handleSpend;

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

// ─── MAPS (render + modal wiring in modules/maps.js) ─────────
window.openMapModal    = openMapModal;
window.editMap         = editMap;
window.deleteMap       = deleteMap;

// ─── TABS (wiring moved to modules/ui.js) ───────────────────
initTabs();

// Close modals on backdrop click (wiring moved to modules/ui.js)
initModalBackdrops();

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

onSnapshot(MAPS_INDEX_DOC, snap => {
  if (state.savingMaps) return;
  state.maps = snap.exists() ? (snap.data().list || []) : [];
  renderMaps();
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
export { spendGold, renderGold, coinInputs, clearCoinInputs, handleGain, handleSpend } from './modules/gold.js';
export { esc, syncMsg, initSortable } from './modules/ui.js';
export { renderItems, saveItems };
export { BADGE, NEXT_STATUS, renderQuests, saveQuests } from './modules/quests.js';
export { renderMaps, saveMapsIndex } from './modules/maps.js';
export const getState = () => ({ gold: state.gold, items: state.items, quests: state.quests, maps: state.maps });
export function setState(s) { if (s.gold !== undefined) state.gold = s.gold; if (s.items !== undefined) state.items = s.items; if (s.quests !== undefined) state.quests = s.quests; if (s.maps !== undefined) state.maps = s.maps; }
