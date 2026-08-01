# Maps Tab — Feature Spec (одобрено, разписано за Ralph)

**Статус:** решено на 2026-08-01, разбито на ralph board (`D:\Downloads\monk\ralph\tasks.json`, lane `maps`, таскове 410–450, серийни → 1 агент). Ако не се хареса на масата — маха се целият таб, нищо друго не зависи от него.

## Какво

Нов таб „Maps" в shared-inventory: ДМ-ът качва карти (скрийншоти) от лаптоп/браузър, партито ги гледа на Android таблет/телефон.

## Решения (взети)

- **Съхранение: вариант 1 — компресия client-side + base64 в Firestore.**
  - Компресията е **само при нужда**: праг `MAX_IMAGE_BYTES = 900000` върху data URL дължината (base64 надува ~33%, Firestore дава 1MiB/док) — под прага оригиналът се пази без загуба на качество; над него: canvas resize до ~1600px / JPEG ~0.72 → ако пак е над лимита, втори опит (1200px / 0.6) → ако пак, ясна грешка в диалога.
  - Колекция `maps`, **разделени метаданни и снимки**: `maps/index` = `{list: [{id, shortDesc, details, createdAt}]}` (ред = ред на показване, като другите табове), `maps/<uuid>` = `{image: dataURL}` — по един док на карта. Така snapshot-ът на таблицата не тегли снимки (таблетът е на мобилна връзка), а 1MB/док лимитът важи само per снимка.
  - Снимката се зарежда **лениво** с `getDoc` чак при отваряне за едит/преглед.
  - Без Firebase Storage (иска Blaze/карта — отпада).
- **Качване, два входа в един диалог:**
  - `<input type="file">` (ъплоуд на файл)
  - **Ctrl+V** — `paste` event → `clipboardData.items` → image blob. Същият pipeline след това.
- **Две задължителни описания:**
  - `shortDesc` (кратко): „тази карта е за зоната на изток, в джунглата"
  - `details` (дълъг текст, textarea): „тук е селището на дървесните елфи… фасилити… яда-яда"
  - И двете required при запис.
- **Таблица:** показва само описанията с елипсис — същият патерн като items/quests табовете. Снимката НЕ се показва в реда.
- **Едит диалог:** вижда се картата (thumbnail/preview); клик → fullscreen overlay със зуум:
  - таблет: pinch-zoom + pan (pointer events, `touch-action: none`)
  - лаптоп: колелце за зуум, двоен клик reset
  - без библиотека, или panzoom (~4KB) ако ръчното стане досадно.

## Известен компромис

Зуумът е върху компресираната версия — много дребен текст върху картата може да омекне. Прието.

## Firestore схема (колекция `maps`)

```
maps/index    →  { list: [ { id: uuid, shortDesc: string, details: string, createdAt: ISO string } ] }
maps/<uuid>   →  { image: string }   // base64 data URL (compressed)
```

## Допълнения (след първия run — таскове 460, 470)

- **Статичен линк към картата на света** — над бутона „+ Добави карта“, външен `<a target="_blank" rel="noopener">` към
  `https://totalwarwarhammer.fandom.com/wiki/Map:Immortal_Empires_Factions` (пълната Immortal Empires карта). Чист markup, без JS.
- **Превю бутон 🔍 на всеки ред** — отваря САМО снимката във fullscreen viewer-а (ленив `getDoc`, без кеш), без да минава през едит диалога. Пести място в таблицата и клик.
- **Лупички ➕/➖ във viewer-а** — видими zoom бутони (долу-център, едри touch таргети): на таблета wheel няма, а pinch не е очевиден за всички; центърът на зуума е средата на екрана, клампът [1,8] идва от `zoomAt`.

## Ръчна стъпка ПРЕДИ първия запис (собственика, не агент)

Firestore е schema-less — доковете `maps/index` и `maps/<uuid>` се създават сами при първия запис, нищо не се мигрира. НО: провери в **Firebase Console → Firestore → Rules**, че записът в колекция `maps` е позволен. Ако правилата whitelist-ват само `inventory` и `quests`, добави аналогично правило за `match /maps/{doc}` — иначе save-ът от приложението ще бъде отказан (permission-denied). 2 минути работа, агентите нямат достъп до конзолата.

## Бележки за имплементация

- TDD: първо тестове (vitest за validate/геометрия логиката, playwright fixture spec за акордеона), модулно — нови `modules/maps.js`, `modules/image.js`, `modules/viewer.js`, не в app.js.
- Realtime sync през `onSnapshot` върху `maps/index`, като другите табове; echo guard с `savingMaps` флаг.
- Export/import bundle-ът НЕ включва картите (снимките биха издули JSON-а) — извън обхват.
- Пълните контракти за агентите: `shared-inventory-structure.md §9` (ralph reference) + board-а в `ralph/tasks.json`.
