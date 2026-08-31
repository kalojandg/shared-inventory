import { state } from './state.js';
import { esc } from './ui.js';
import { CRAFTING_TABLES } from './crafting-data.js';

// ─── CRAFTING REFERENCE — PAGE (lane crafting-ui — task 720) ────
// Статична референция (harvesting + експериментална алхимия) зад ⚒ в header
// реда. БЕЗ Firestore, БЕЗ Sortable, БЕЗ редакция — данните идват от
// modules/crafting-data.js (само за четене — този файл не ги пипа).
//
// renderCraftingRoute() е самият route (router.js го вика последен, за да бие
// base-detail); renderCrafting() рисува съдържанието на страницата: chips
// лентата, списъка (име + бадж), акордеона и info изгледа.
//
// Филтърът идва от ПАРАЛЕЛНАТА lane (crafting-search, 730) и не се импортва
// оттук: тя пише state.craftingFilter и dispatch-ва `crafting-filter`, ние само
// слушаме. В обратната посока чиито chips сменят таблицата — dispatch-ваме
// `crafting-tab`. Контрактът е state + document events (§11).

// Показва/крие „страницата" според hash-а. Викa се САМО от router.js
// (dispatchRoute) и от openCrafting().
function renderCraftingRoute() {
  const page = document.getElementById('craftingPage');
  if (!page) return;

  if (location.hash === '#crafting') {
    document.querySelector('.tab-nav')?.classList.add('hidden');
    document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
    document.getElementById('baseDetail')?.classList.add('hidden');
    page.classList.remove('hidden');
    renderCrafting();
    return;
  }

  page.classList.add('hidden');
}

// Смяна на таблица: чист старт — филтърът и разгънатият ред са per таблица, а
// crafting-search слуша `crafting-tab`, за да изчисти контролите и да напълни
// селекта наново.
function selectTab(key) {
  state.craftingTab = key;
  state.craftingFilter = { q: '', badge: '' };
  state.expandedCraftIdx = null;
  document.dispatchEvent(new CustomEvent('crafting-tab', { detail: { key } }));
  renderCrafting();
}

// Акордеонът на quests/bases, но с истински детайлен ред: точно един разгънат,
// повторен клик го сгъва. Re-render (не class toggle) — детайлният <tr> се
// вгражда СЛЕД реда си, така че се строи заедно с таблицата.
function toggleRow(idx) {
  state.expandedCraftIdx = state.expandedCraftIdx === idx ? null : idx;
  renderCrafting();
}

// Разгънатият ред: всички колони ОСВЕН name/badge (те са в самия ред) като
// key: value линии — НЕ таблица (колоните са до 10 и на телефон не се събират).
// Празните стойности се пропускат, за да не увисват голи етикети.
function detailsRow(t, row, colspan) {
  const lines = t.columns
    .filter(c => c !== t.nameCol && c !== t.badgeCol)
    .map(c => [c, row[c]])
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([c, v]) => `<div><span class="craft-details-label craft-k">${esc(c)}:</span> <span class="craft-v">${esc(v)}</span></div>`)
    .join('');
  return `<tr class="craft-details-row"><td colspan="${colspan}"><div class="craft-details">${lines}</div></td></tr>`;
}

function renderCrafting() {
  const tabs = document.getElementById('craftTabs');
  if (!tabs) return;

  tabs.innerHTML = CRAFTING_TABLES.map(t =>
    `<button class="craft-chip${t.key === state.craftingTab ? ' active' : ''}" data-key="${esc(t.key)}">${esc(t.label)}</button>`
  ).join('');
  tabs.querySelectorAll('button[data-key]').forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.key));
  });

  const t = CRAFTING_TABLES.find(x => x.key === state.craftingTab);
  if (!t) return;

  const info = document.getElementById('craftInfo');
  const head = document.getElementById('craftHead');
  const body = document.getElementById('craftBody');
  const wrap = document.getElementById('craftTable')?.closest('.tbl-wrap');

  // ── type 'info': няма списък, само k/v блок ──
  if (t.type === 'info') {
    head.innerHTML = '';
    body.innerHTML = '';
    wrap?.classList.add('hidden');
    info.innerHTML = (t.entries || []).map(e =>
      `<div class="craft-info-row"><strong class="craft-k">${esc(e.k)}</strong><div class="craft-v">${esc(e.v)}</div></div>`
    ).join('');
    info.classList.remove('hidden');
    return;
  }

  // ── type 'table' ──
  info.innerHTML = '';
  info.classList.add('hidden');
  wrap?.classList.remove('hidden');

  // Име | бадж (ако таблицата има) | 📖 колоната.
  const colspan = t.badgeCol ? 3 : 2;
  head.innerHTML = `<tr><th>${esc(t.nameCol)}</th>${t.badgeCol ? `<th>${esc(t.badgeCol)}</th>` : ''}<th></th></tr>`;

  const q = (state.craftingFilter?.q || '').toLowerCase();
  const badge = state.craftingFilter?.badge || '';
  // Индексът се носи през филтъра: data-idx е РЕАЛНИЯТ индекс в t.rows, за да
  // оцелява разгънатият ред при промяна на филтъра.
  const visible = t.rows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => !q || String(row[t.nameCol]).toLowerCase().includes(q))
    .filter(({ row }) => !badge || String(row[t.badgeCol]) === badge);

  if (!visible.length) {
    body.innerHTML = `<tr><td colspan="${colspan}" class="empty">Няма съвпадения.</td></tr>`;
    return;
  }

  body.innerHTML = visible.map(({ row, idx }) => {
    const expanded = state.expandedCraftIdx === idx;
    return `
    <tr class="craft-row${expanded ? ' craft-expanded' : ''}" data-idx="${idx}">
      <td><strong>${esc(row[t.nameCol])}</strong></td>
      ${t.badgeCol ? `<td><span class="craft-badge">${esc(row[t.badgeCol])}</span></td>` : ''}
      <td><div class="tbl-actions"><button class="btn-ghost btn-sm">📖</button></div></td>
    </tr>${expanded ? detailsRow(t, row, colspan) : ''}`;
  }).join('');

  // Едно listener на ред: кликът върху 📖 бълбука до него, така бутонът и редът
  // toggle-ват едно и също (за разлика от quests, където бутоните са действия).
  body.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', () => toggleRow(+tr.dataset.idx));
  });
}

// ⚒ в header реда. Сетването на hash-а сама по себе си би стигнала (hashchange
// вика dispatchRoute), но рендерът се вика и директно — патърнът на
// openBaseDetail: в jsdom hashchange е асинхронен и ненадежден.
function openCrafting() {
  location.hash = '#crafting';
  renderCraftingRoute();
}

// ─── WIRING (once, at module init — елементите са статични в index.html) ────
// „← Назад": чистенето на hash-а е достатъчно (router-ът връща табовете), но
// рендерът се вика и директно — в jsdom hashchange е асинхронен и ненадежден
// (патърнът на btnBaseBack).
document.getElementById('btnCraftBack')?.addEventListener('click', () => {
  location.hash = '';
  renderCraftingRoute();
});

// crafting-search (730) само dispatch-ва след като е записал state.craftingFilter.
document.addEventListener('crafting-filter', () => renderCrafting());

export { renderCraftingRoute, renderCrafting, openCrafting };
