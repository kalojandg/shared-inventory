// ─── MUTABLE APP STATE ──────────────────────────────────────
export const state = {
  gold: { pp: 0, gp: 0, sp: 0, cp: 0 },
  items: [],
  quests: [],
  maps: [],
  bases: [],
  editingItemIdx: null,
  editingQuestIdx: null,
  editingMapIdx: null,
  editingBaseIdx: null,
  expandedItemIdx: null,
  expandedQuestIdx: null,
  expandedMapIdx: null,
  expandedBaseIdx: null,
  saving: false,
  savingQuests: false,
  savingMaps: false,
  savingBases: false,
  currentBaseId: null,
  editingSub: null, // { kind, idx } or null
  expandedSub: { buildings: null, populace: null, production: null },
};
