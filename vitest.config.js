import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Map the two Firebase CDN imports used by app.js to local mocks (§5).
// app.js keeps its byte-identical CDN import URLs; vitest intercepts them here,
// NOT by rewriting the imports.
const CDN_APP = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
const CDN_FIRESTORE = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/unit/**/*.spec.js'],
  },
  resolve: {
    alias: [
      { find: CDN_APP, replacement: fileURLToPath(new URL('./test/mocks/firebase-app.js', import.meta.url)) },
      { find: CDN_FIRESTORE, replacement: fileURLToPath(new URL('./test/mocks/firebase-firestore.js', import.meta.url)) },
    ],
  },
});
