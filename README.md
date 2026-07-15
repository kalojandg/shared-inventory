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
  state.js          — споделеният mutable state (gold, items, quests, editing/expanded флагове)
  gold.js           — spendGold, renderGold, coinInputs, clearCoinInputs, handleGain, handleSpend
  items.js          — renderItems, item modal, saveItem, deleteItem, saveItems
  quests.js         — BADGE, NEXT_STATUS, renderQuests, quest modal, saveQuest, cycleStatus, deleteQuest, saveQuests
  ui.js             — syncMsg, esc, initSortable, tabs + modal backdrop wiring
sw.js               — service worker
manifest.json       — PWA manifest
```

`app.js` държи само оркестрацията: `window.*` assignment-ите за inline onclick
handler-ите, populate на carrier select-а, трите `onSnapshot` listener-а,
export/import и PWA install бутона. Накрая re-export-ва публичното API на
модулите, за да остане стабилна фасада за unit тестовете.

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
