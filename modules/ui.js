// ─── SYNC INDICATOR ─────────────────────────────────────────
function syncMsg(msg, cls) {
  const el = document.getElementById('sync');
  el.textContent = msg;
  el.className = 'sync ' + (cls || '');
}

// ─── ESCAPE HELPER ──────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ─── MODAL BACKDROPS ────────────────────────────────────────
function initModalBackdrops() {
  ['itemModal','questModal','mapModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) document.getElementById(id).classList.remove('open');
    });
  });
}

export { esc, syncMsg, initSortable, initTabs, initModalBackdrops };
