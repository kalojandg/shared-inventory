// Generates modules/crafting-data.js for shared-inventory from the three xlsx
// reference files. Run once at board-authoring time; agents consume the JS.
const XLSX = require('xlsx');
const fs = require('fs');

const readSheet = (wb, name) => {
  let rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  rows = rows.map(r => { while (r.length && String(r[r.length - 1]).trim() === '') r.pop(); return r; })
             .filter(r => r.length);
  return rows;
};

const objRows = (rows, cols, from = 0) =>
  rows.slice(1).map(r => {
    const o = {};
    cols.forEach((c, i) => { o[c] = r[from + i] === undefined ? '' : r[from + i]; });
    return o;
  }).filter(o => String(o[cols[0]]).trim() !== '');

const wbA = XLSX.readFile('D:/Downloads/3d/DnD_Animal_Harvesting_Reference.xlsx');
const wbB = XLSX.readFile('D:/Downloads/3d/DnD_Experimental_Alchemy_System.xlsx');
const wbC = XLSX.readFile('D:/Downloads/3d/DnD_Raw_Materials_Economy.xlsx');

const tables = [];

// ── Animal Harvesting ──
{
  const rows = readSheet(wbA, 'Animal Harvesting');
  const cols = rows[0].map(String);
  tables.push({
    key: 'animals', label: 'Животни', group: 'Harvesting', type: 'table',
    nameCol: 'Animal', badgeCol: 'Size', filterable: true,
    columns: cols, rows: objRows(rows, cols),
  });
}

// ── Rules & Pricing → info entries ──
{
  const rows = readSheet(wbA, 'Rules & Pricing');
  tables.push({
    key: 'harvestRules', label: 'Правила (Harvest)', group: 'Harvesting', type: 'info',
    entries: rows.filter(r => r.length >= 2).map(r => ({ k: String(r[0]), v: String(r[1]) })),
  });
}

// ── Ingredient Properties ──
{
  const rows = readSheet(wbB, 'Ingredient Properties');
  const cols = rows[0].map(String);
  tables.push({
    key: 'ingredients', label: 'Съставки', group: 'Алхимия', type: 'table',
    nameCol: 'Property', badgeCol: null, filterable: false,
    columns: cols, rows: objRows(rows, cols),
  });
}

// ── Brewing DC: two side-by-side tables in one sheet (cols 0-2 and 4-5) ──
{
  const rows = readSheet(wbB, 'Brewing DC');
  const colsL = ['Ingredient Value', 'Potion Tier', 'Base DC'];
  tables.push({
    key: 'brewing', label: 'Brewing DC', group: 'Алхимия', type: 'table',
    nameCol: 'Ingredient Value', badgeCol: 'Potion Tier', filterable: true,
    columns: colsL, rows: objRows(rows, colsL),
  });
  const colsR = ['Brewing Roll', 'Result'];
  tables.push({
    key: 'brewResults', label: 'Резултат от варене', group: 'Алхимия', type: 'table',
    nameCol: 'Brewing Roll', badgeCol: null, filterable: false,
    columns: colsR, rows: objRows(rows, colsR, 4),
  });
}

// ── Potion Outcomes ──
{
  const rows = readSheet(wbB, 'Potion Outcomes');
  const cols = rows[0].map(String);
  tables.push({
    key: 'outcomes', label: 'Ефекти (d6)', group: 'Алхимия', type: 'table',
    nameCol: 'Possible Outcome', badgeCol: 'Property', filterable: true,
    columns: cols, rows: objRows(rows, cols),
  });
}

// ── Hybrid Effects / Failures / Identification ──
for (const [sheet, key, label, nameCol, badgeCol] of [
  ['Hybrid Effects', 'hybrid', 'Хибриди (d6)', 'Dominance', 'd6'],
  ['Failures', 'failures', 'Провали (d12)', 'Failure Type', 'd12'],
  ['Identification', 'ident', 'Идентификация', 'Check', 'DC / Trigger'],
]) {
  const rows = readSheet(wbB, sheet);
  const cols = rows[0].map(String);
  tables.push({
    key, label, group: 'Алхимия', type: 'table',
    nameCol, badgeCol, filterable: false,
    columns: cols, rows: objRows(rows, cols),
  });
}

// ── Raw Materials Economy (третия файл): Rarity е ИСТИНСКАТА rarity колона ──
{
  const rows = readSheet(wbC, 'Raw Materials');
  const cols = rows[0].map(String);
  tables.push({
    key: 'materials', label: 'Суровини', group: 'Икономика', type: 'table',
    nameCol: 'Raw Material', badgeCol: 'Rarity', filterable: true,
    columns: cols, rows: objRows(rows, cols),
  });
}
{
  const rows = readSheet(wbC, 'Rarity & Rules');
  const cols = rows[0].map(String);
  tables.push({
    key: 'rarityRules', label: 'Рядкост (правила)', group: 'Икономика', type: 'table',
    nameCol: 'Rarity', badgeCol: null, filterable: false,
    columns: cols, rows: objRows(rows, cols),
  });
}

const banner = `// ─── CRAFTING REFERENCE DATA (generated — do not edit by hand) ─────────────
// Източник: DnD_Animal_Harvesting_Reference.xlsx + DnD_Experimental_Alchemy_System.xlsx + DnD_Raw_Materials_Economy.xlsx
// Регенерира се със scratchpad скрипта gen-crafting-data.js (виж crafting-feature-plan.md).
// Схема per таблица: { key, label, group, type: 'table'|'info',
//   nameCol (главната колона в списъка), badgeCol (втората колона/бадж или null),
//   filterable (има ли dropdown филтър по badgeCol), columns (пълният ред за
//   детайлния изглед), rows: [ { col: value } ] } — info таблиците имат entries: [{k, v}].

export const CRAFTING_TABLES = `;

fs.writeFileSync('D:/Downloads/monk/shared-inventory/modules/crafting-data.js',
  banner + JSON.stringify(tables, null, 2) + ';\n');

for (const t of tables) {
  console.log(t.key.padEnd(14), (t.type === 'info' ? t.entries.length + ' entries' : t.rows.length + ' rows').padEnd(12), t.label);
}
console.log('bytes:', fs.statSync('D:/Downloads/monk/shared-inventory/modules/crafting-data.js').size);
