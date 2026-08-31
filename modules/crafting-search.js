// ─── CRAFTING SEARCH & BADGE FILTER (lane crafting-search — task 730) ──
// Wiring на #craftSearch (input) и #craftBadge (change): пишат
// state.craftingFilter = { q, badge } и dispatch-ват document-event
// `crafting-filter`. Слуша `crafting-tab` (от crafting.js) → чисти контролите и
// populate-ва селекта наново.
//
// НЕ вика crafting.js директно — двата модула се пишат в ПАРАЛЕЛНИ lanes и
// общуват само през state + document events (контрактът от §11).
//
// STUB — фундаментът (710) дава само формата; lane crafting-search (730)
// попълва ТОЗИ файл.

// За state.craftingTab: при filterable → опции „Всички" ('') + distinct
// badgeCol стойности по ред на поява; иначе селектът получава клас hidden.
export function populateBadgeOptions() {}
