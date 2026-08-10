# shared-inventory

Vanilla-JS PWA за споделен DnD инвентар, злато и куестове на партито. Данните
се синхронизират в реално време през Firebase/Firestore. Няма bundler — всичко
е native ES modules, зареждани директно от браузъра.

## Structure

```
index.html          — markup + PWA meta; зарежда app.js като <script type="module">
styles.css          — извлечените стилове
app.js              — тънък оркестратор (facade)
modules/            — приложната логика, разделена по област
  firebase.js       — firebaseConfig, init, db, GOLD_DOC/ITEMS_DOC/QUESTS_DOC,
                      re-export на ползваните firestore функции (CDN import)
  state.js          — споделеният mutable state (gold, items, quests, maps, bases, editing/expanded флагове)
  gold.js           — spendGold, renderGold, coinInputs, clearCoinInputs, handleGain, handleSpend
  items.js          — renderItems, item modal, saveItem, deleteItem, saveItems
  quests.js         — BADGE, NEXT_STATUS, renderQuests, quest modal, saveQuest, cycleStatus, deleteQuest, saveQuests
  maps.js           — renderMaps, map modal (file upload + Ctrl+V paste), saveMap, deleteMap, saveMapsIndex, previewMap (🔍 ред → viewer)
  image.js          — MAX_IMAGE_BYTES, needsCompression, blobToDataUrl, fitDimensions, compressImage (client-side)
  viewer.js         — fullscreen map viewer: clampScale/zoomAt (чиста геометрия) + pointer pan/pinch + wheel zoom + ➕/➖ лупички (магнифайър-тоглове)
  bases.js          — renderBases, base modal (+ Добави база), saveBase, deleteBase, saveBases (един док за целия списък)
  base-detail.js    — hash routing (#base/<id>), детайлът с редактируеми име/локация/история (renderRoute, openBaseDetail, saveBaseDetail)
  base-tables.js    — под-таблиците сгради/население/продукция: renderSubTables + общ под-модал (openSubModal/saveSub/deleteSub)
  ui.js             — syncMsg, esc, initSortable, tabs + modal backdrop wiring
sw.js               — service worker
manifest.json       — PWA manifest
```

`app.js` държи само оркестрацията: `window.*` assignment-ите за inline onclick
handler-ите, populate на carrier select-а, петте `onSnapshot` listener-а
(gold, items, quests, maps, bases), export/import и PWA install бутона. Накрая
re-export-ва публичното API на модулите, за да остане стабилна фасада за unit
тестовете.

Табът „Карти" (`tab-maps`) държи метаданните на картите в `maps/index`, а всяка
снимка — в собствен `maps/<id>` документ (1 MB/док лимит; индексът не тегли
снимки при листване). Снимките се компресират client-side само при нужда (над
~900 KB data URL). Над бутона за добавяне стои статичен линк към пълната карта
на света (Immortal Empires), а всеки ред има 🔍 бутон, който отваря снимката
директно във fullscreen viewer-а (с ➕/➖ zoom бутони за таблета). Bundle-ът за
export/import (v1) НЕ включва картите.

Табът „Бази" (`tab-bases`) държи селищата на партито в **един** документ
`bases/index` (`{ list: [...] }` — 1 read на snapshot). Списъкът дава име +
локация; 📖 бутон отваря детайлната „страница" през hash routing (`#base/<id>`)
с редактируеми име/локация/история и три под-таблици — сгради, население и
продукция (общ под-модал име + детайли). Всяка таблица е акордеон с drag-подредба
като останалите. Табовете стоят 2×2 на всякакъв екран. Bundle-ът за export/import
НЕ включва базите (както и картите).

### CDN imports (умишлено)

Firebase и SortableJS се зареждат от CDN директно в `index.html` / `modules/firebase.js`.
Това е съзнателно решение — проектът няма build стъпка и не се bundle-ва. Unit
тестовете подменят CDN URL-ите с локални мокове през `resolve.alias` във `vitest.config.js`.

## Tests

```
npm run test:unit   # Vitest — характеризационни unit тестове (jsdom + firebase мокове)
npm test            # Playwright e2e срещу fixture страници
```

Unit тестовете зареждат `app.js` през `test/helpers/dom.js` (`bootApp`), който
монтира markup-а от `index.html`, стъбва `Sortable`/`confirm`/`alert` и подава
данни през фейкнатите Firestore snapshot-и (`test/mocks/`). E2e тестовете и
техните fixtures живеят в `test/e2e/` и `test/fixtures/`.
