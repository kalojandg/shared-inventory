import {
  GOLD_DOC, ITEMS_DOC, QUESTS_DOC, MAPS_INDEX_DOC, BASES_DOC,
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
  renderMaps, saveMapsIndex,
  openMapModal, closeMapModal, editMap, saveMap, deleteMap, previewMap, handleMapFile
} from './modules/maps.js';
import {
  renderBases, saveBases,
  openBaseModal, closeBaseModal, saveBase, deleteBase
} from './modules/bases.js';
import {
  renderRoute, openBaseDetail, saveBaseDetail
} from './modules/base-detail.js';
import {
  renderSubTables,
  openSubModal, closeSubModal, editSub, saveSub, deleteSub
} from './modules/base-tables.js';
import { renderCrafting, renderCraftingRoute, openCrafting } from './modules/crafting.js';
import { populateBadgeOptions } from './modules/crafting-search.js';
// Hash router (§11): SELF-INITIALIZING on import — it strips a leftover hash and
// registers the app's ONE `hashchange` listener, which dispatches
// renderRoute() (base detail) and then renderCraftingRoute(). Nothing to call
// here; the import IS the wiring.
import './modules/router.js';

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
window.closeMapModal   = closeMapModal;
window.editMap         = editMap;
window.saveMap         = saveMap;
window.deleteMap       = deleteMap;
window.previewMap      = previewMap;
window.handleMapFile   = handleMapFile;

// ─── BASES (list in modules/bases.js, routing in base-detail.js, ──
//     sub-tables in base-tables.js) ─────────────────────────────
window.openBaseModal   = openBaseModal;
window.closeBaseModal  = closeBaseModal;
window.saveBase        = saveBase;
window.deleteBase      = deleteBase;
window.openBaseDetail  = openBaseDetail;
window.openSubModal    = openSubModal;
window.closeSubModal   = closeSubModal;
window.editSub         = editSub;
window.saveSub         = saveSub;
window.deleteSub       = deleteSub;

// ─── CRAFTING REFERENCE (⚒ в header реда — страница, не таб) ──
//     Статични данни (modules/crafting-data.js) — никакъв Firestore wiring.
window.openCrafting    = openCrafting;

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

onSnapshot(BASES_DOC, snap => {
  if (state.savingBases) return;
  state.bases = snap.exists() ? (snap.data().list || []) : [];
  renderBases();
  renderRoute();     // deep-link support — data arrives after the DOM
  renderSubTables(); // reflect the current base's sub-tables
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
export { renderMaps, saveMapsIndex, previewMap } from './modules/maps.js';
export { zoomAt, clampScale, openViewer, closeViewer } from './modules/viewer.js';
export { renderBases, saveBases } from './modules/bases.js';
export { renderRoute, openBaseDetail, saveBaseDetail } from './modules/base-detail.js';
export { renderSubTables } from './modules/base-tables.js';
export { renderCrafting, renderCraftingRoute, openCrafting };
export { populateBadgeOptions };
export const getState = () => ({ gold: state.gold, items: state.items, quests: state.quests, maps: state.maps, bases: state.bases });
export function setState(s) { if (s.gold !== undefined) state.gold = s.gold; if (s.items !== undefined) state.items = s.items; if (s.quests !== undefined) state.quests = s.quests; if (s.maps !== undefined) state.maps = s.maps; if (s.bases !== undefined) state.bases = s.bases; }
