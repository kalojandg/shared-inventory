import { state } from './state.js';
import { BASES_DOC, setDoc } from './firebase.js';
import { syncMsg } from './ui.js';

// ─── BASES LIST (lane bases-list — task 620) ────────────────
// The list rendering, add-modal and delete live here. This foundation task
// ships them as no-op stubs with the EXACT export signatures the wiring in
// app.js expects; task 620 fills the bodies without changing the shape.
function renderBases() {}
function openBaseModal() {}
function closeBaseModal() {}
function saveBase() {}
function deleteBase() {}

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
