import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

// bootApp — the contract every unit test consumes (§6).
//
// 1. loads the <body> markup of index.html WITHOUT its <script> tags
// 2. stubs globalThis.Sortable + window.confirm/alert
// 3. vi.resetModules() + __reset() the firestore mock (fresh state per boot)
// 4. imports app.js so its top-level code runs (carrier select, listeners, ...)
// 5. __emit the three docs so the app renders
// 6. returns { fs } — the firestore mock module, for calls/__emit in the test
export async function bootApp({ gold = null, items = null, quests = null } = {}) {
  // 1. index.html body markup, scripts stripped.
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = (bodyMatch ? bodyMatch[1] : '').replace(/<script[\s\S]*?<\/script>/gi, '');
  document.body.innerHTML = body;

  // 2. globals app.js relies on.
  globalThis.Sortable = class {
    constructor(el, opts) { el._sortable = this; this.opts = opts; }
    destroy() {}
  };
  window.confirm = () => true; // a test overrides this when it needs to
  window.alert = () => {};

  // 3. fresh module graph + mock state. Import the mock AFTER resetModules so it
  //    is the SAME instance app.js receives via the CDN alias (shared listeners).
  vi.resetModules();
  const fs = await import('../mocks/firebase-firestore.js');
  fs.__reset();

  // 4. run app.js top-level code (reads the DOM set above).
  await import('../../app.js');

  // 5. emit the three Firestore docs.
  fs.__emit('inventory/gold', gold);
  fs.__emit('inventory/items', items === null ? null : { list: items });
  fs.__emit('quests/items', quests === null ? null : { list: quests });

  return { fs };
}
