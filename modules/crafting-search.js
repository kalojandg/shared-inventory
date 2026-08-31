import { state } from './state.js';
import { esc } from './ui.js';
import { CRAFTING_TABLES } from './crafting-data.js';

// ─── CRAFTING SEARCH & BADGE FILTER (lane crafting-search — task 730) ──
// Wiring на #craftSearch (input) и #craftBadge (change): пишат
// state.craftingFilter = { q, badge } и dispatch-ват document-event
// `crafting-filter`. Слуша `crafting-tab` (от crafting.js) → чисти контролите и
// populate-ва селекта наново.
//
// НЕ вика crafting.js директно — двата модула се пишат в ПАРАЛЕЛНИ lanes и
// общуват само през state + document events (контрактът от §11).

// Данните нямат „rarity" колона — ролята ѝ играе badgeCol (Size за животните,
// Potion Tier за brewing, Property за ефектите), затова опциите са per таблица:
// при filterable → „Всички" ('') + distinct badgeCol стойности по РЕД НА ПОЯВА;
// иначе селектът се изпразва (value става '') и получава клас hidden.
export function populateBadgeOptions() {
  const sel = document.getElementById('craftBadge');
  if (!sel) return;

  const t = CRAFTING_TABLES.find(x => x.key === state.craftingTab);
  if (!t || t.type !== 'table' || !t.filterable) {
    sel.innerHTML = '';
    sel.classList.add('hidden');
    return;
  }

  const values = [...new Set(t.rows.map(r => String(r[t.badgeCol])))];
  sel.innerHTML = `<option value="">Всички</option>` + values
    .map(v => `<option value="${esc(v)}">${esc(v)}</option>`)
    .join('');
  sel.classList.remove('hidden');
}

// Едно четене на двете контроли → един филтър обект. БЕЗ debounce: таблиците са
// ≤90 реда и рендерът е синхронен.
function applyFilter() {
  const q = document.getElementById('craftSearch')?.value.trim() || '';
  const badge = document.getElementById('craftBadge')?.value || '';
  state.craftingFilter = { q, badge };
  document.dispatchEvent(new CustomEvent('crafting-filter'));
}

// ─── WIRING (once, at module init — елементите са статични в index.html) ────
document.getElementById('craftSearch')?.addEventListener('input', applyFilter);
document.getElementById('craftBadge')?.addEventListener('change', applyFilter);

// Смяна на таблица: чист старт за контролите. state.craftingFilter вече е
// нулиран от crafting.js — не го пипаме втори път оттук.
document.addEventListener('crafting-tab', () => {
  const input = document.getElementById('craftSearch');
  if (input) input.value = '';
  populateBadgeOptions();
});

// Дефолтният таб (animals) е filterable — селектът трябва да е пълен още преди
// първото отваряне на страницата.
populateBadgeOptions();
