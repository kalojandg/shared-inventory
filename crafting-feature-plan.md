# Crafting Reference Feature — Plan

## Задание (от потребителя)
- БЕЗ нов таб — една **икона за крафтинг** (избрано: **⚒**) в header реда до Export/Import.
- Иконата отваря нова „страница" с **back бутон** (по модела на base detail).
- В страницата — много референтни таблици → **вътрешни табове** (chips).
- **Търсене по име** + филтър по **rarity**.
- Таблиците имат много колони → основният списък показва само **име + rarity**, а бутон „детайли" на реда показва останалите колони **не в табличен вид** (key: value).
- Източници: `D:\Downloads\3d\DnD_Animal_Harvesting_Reference.xlsx`, `D:\Downloads\3d\DnD_Experimental_Alchemy_System.xlsx`.

## Ключови решения
1. **„Rarity" колона в данните реално НЯМА.** Най-близкото по таблици: `Size` (животни), `Potion Tier` (Brewing DC — истинското rarity), `Property` (ефекти). Затова badge/филтър колоната е **конфигурируема per таблица** (`badgeCol` + `filterable` в данните); където няма смислена — филтърът се скрива.
2. **Данните са СТАТИЧНИ** — `modules/crafting-data.js` (генериран ES модул, ~44KB, 9 таблици). Никакъв Firestore (нула reads, пази free tier). Референцията не се редактира от апа.
3. Sheet-ът „Brewing DC" са две таблици една до друга → разцепен на `brewing` + `brewResults`. „Rules & Pricing" е инфо-текст → `type: 'info'`, рендерира се като key-value списък, не таблица.
4. **Регенерация на данните**: `tools/gen-crafting-data.cjs` (изисква ad-hoc `npm i xlsx`; пътищата до xlsx са вътре). Генерираният файл не се редактира на ръка.
5. **Routing**: нов `modules/router.js` — ЕДИНСТВЕНИЯТ hashchange владетел, диспечира по ред: base-detail → crafting (последният печели за `#crafting`). Boot strip на ВСЕКИ остатъчен hash (решението от bases: F5 винаги кацат на табовете). `base-detail.js` губи собствения си hashchange/boot-strip wiring (мести се в router.js), но пази `renderRoute` export-а.

## Таблиците (генерирани)
| key | label | редове | nameCol | badgeCol | filterable |
|-----|-------|--------|---------|----------|-----------|
| animals | Животни | 54 | Animal | Size | ✓ |
| harvestRules | Правила (Harvest) | 9 (info) | — | — | — |
| ingredients | Съставки | 15 | Property | — | — |
| brewing | Brewing DC | 8 | Ingredient Value | Potion Tier | ✓ |
| brewResults | Резултат от варене | 8 | Brewing Roll | — | — |
| outcomes | Ефекти (d6) | 90 | Possible Outcome | Property | ✓ |
| hybrid | Хибриди (d6) | 6 | Dominance | d6 | — |
| failures | Провали (d12) | 12 | Failure Type | d12 | — |
| ident | Идентификация | 5 | Check | DC / Trigger | — |

## Изпълнение
Ralph swarm board: таскове **710–740**, repo `inventory`:

```
710 crafting-core  (фундамент: икона, markup, router.js рефактор, stubs, стилове)
 ├─ 720 crafting-ui      ∥  modules/crafting.js        (chips, списък, акордеон детайли, info изглед)
 └─ 730 crafting-search  ∥  modules/crafting-search.js (търсачка + badge филтър)
        └─ 740 crafting-e2e (fixture с реалния styles.css + Playwright спек; dependsOn 710+720+730)
```

Контракт между паралелните lanes: `state.craftingTab` / `state.craftingFilter` + document events **`crafting-tab`** (ui → search: смяна на таблица) и **`crafting-filter`** (search → ui: приложи филтъра). Пълният технически контракт: `shared-inventory-structure.md §11`.

Старт: `START-RALPH-SWARM.bat 2` от `D:\Downloads\monk\ralph` (2 паралелни lane-а в средата).
