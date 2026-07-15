import { state } from './state.js';
import { QUESTS_DOC, setDoc } from './firebase.js';
import { esc, syncMsg, initSortable } from './ui.js';

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
function openQuestModal(idx = null) {
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
}
function closeQuestModal() { document.getElementById('questModal').classList.remove('open'); }
function editQuest(i) { openQuestModal(i); }

async function saveQuest() {
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
}

async function cycleStatus(i) {
  const q = state.quests.splice(i, 1)[0];
  q.status = NEXT_STATUS[q.status] || 'Активен';
  state.quests.unshift(q);
  renderQuests();
  await saveQuests();
}

async function deleteQuest(i) {
  if (!confirm(`Изтрий куест "${state.quests[i].name}"?`)) return;
  state.quests.splice(i, 1);
  renderQuests();
  await saveQuests();
}

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

export { BADGE, NEXT_STATUS, renderQuests, openQuestModal, closeQuestModal, editQuest, saveQuest, cycleStatus, deleteQuest, saveQuests };
