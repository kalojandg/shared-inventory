// Mock for firebase-firestore.js CDN module (§5 contract).
//
// - doc(db, col, id)  → string token `${col}/${id}`
// - setDoc/updateDoc/deleteDoc  → recorded in `calls`, resolve
// - setDoc ALSO writes into an in-memory store; getDoc reads from it
// - getDoc(token)               → { exists(), data() } from the store
// - __setDocData(token, data)   → seed the store WITHOUT recording a call
// - onSnapshot(token, cb)       → registers cb, returns unsubscribe
// - __emit(token, data)         → invokes registered cbs with a snap
// - __reset()                   → clears calls + listeners + store
//
// NEVER talks to a real Firestore — the app is in production (§3).

export const calls = { setDoc: [], updateDoc: [], deleteDoc: [] };

const listeners = [];
const store = new Map();

export function getFirestore(app) {
  return {};
}

export function doc(db, col, id) {
  return `${col}/${id}`;
}

// app.js imports `collection`; it must exist or the ES named import throws.
export function collection(db, name) {
  return name;
}

export function setDoc(token, data) {
  calls.setDoc.push({ token, data });
  store.set(token, data);
  return Promise.resolve();
}

export function updateDoc(token, data) {
  calls.updateDoc.push({ token, data });
  return Promise.resolve();
}

export function deleteDoc(token) {
  calls.deleteDoc.push({ token });
  return Promise.resolve();
}

export function getDoc(token) {
  return Promise.resolve({
    exists: () => store.has(token),
    data: () => store.get(token),
  });
}

// Seed the store directly, WITHOUT recording a setDoc call (test setup).
export function __setDocData(token, data) {
  store.set(token, data);
}

export function onSnapshot(token, cb) {
  const entry = { token, cb };
  listeners.push(entry);
  return function unsubscribe() {
    const i = listeners.indexOf(entry);
    if (i !== -1) listeners.splice(i, 1);
  };
}

// Fire the registered callbacks for `token` with a Firestore-like snapshot.
// data === null → exists() is false (missing doc).
export function __emit(token, data) {
  listeners
    .filter(l => l.token === token)
    .forEach(l => l.cb({ exists: () => data !== null, data: () => data }));
}

export function __reset() {
  calls.setDoc.length = 0;
  calls.updateDoc.length = 0;
  calls.deleteDoc.length = 0;
  listeners.length = 0;
  store.clear();
}
