import { renderRoute } from './base-detail.js';
import { renderCraftingRoute } from './crafting.js';

// ─── UNIFIED HASH ROUTER (§11, lane crafting-core — task 710) ───
// The app has two hash-driven "pages" (#base/<id> and #crafting) living in two
// modules. This file is the SINGLE hashchange owner — base-detail.js no longer
// listens on its own — so the order of the two renderers is explicit instead of
// depending on which module happened to register first:
//
//   renderRoute()         → owns '#base/<id>' and the tab view (everything else)
//   renderCraftingRoute() → owns '#crafting', runs LAST and therefore WINS:
//                           it hides whatever renderRoute just showed.
//
// The module SELF-INITIALIZES on import (boot strip + listener below) — app.js
// only has to `import './modules/router.js'`, mirroring how base-detail.js used
// to wire itself up.

export function dispatchRoute() {
  renderRoute();
  renderCraftingRoute();
}

// ─── BOOT STRIP ─────────────────────────────────────────────
// F5 / a fresh load ALWAYS lands on the tabs — a leftover hash never restores a
// page (the bases hotfix decision, now generalised to EVERY hash, '#crafting'
// included). replaceState (not location.hash = '') avoids both an extra history
// entry and a spurious hashchange.
if (location.hash) {
  history.replaceState(null, '', location.pathname + location.search);
}

window.addEventListener('hashchange', dispatchRoute);
