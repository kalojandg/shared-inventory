import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, doc, collection,
  onSnapshot, setDoc, updateDoc, deleteDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ─── CONFIG ────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA7LEfwfDloLW5fa-8dH0nZfRc7NFVttvY",
  authDomain: "shared-inventory-762de.firebaseapp.com",
  projectId: "shared-inventory-762de",
  storageBucket: "shared-inventory-762de.firebasestorage.app",
  messagingSenderId: "248785005685",
  appId: "1:248785005685:web:96316ba956406bb1779c3c"
};

// ─── INIT ───────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const GOLD_DOC  = doc(db, 'inventory', 'gold');
const ITEMS_DOC = doc(db, 'inventory', 'items');
const QUESTS_DOC = doc(db, 'quests', 'items');

// ─── MAPS (§9) — index doc holds metadata; one doc per image ─
const MAPS_INDEX_DOC = doc(db, 'maps', 'index');
function mapImageDoc(id) { return doc(db, 'maps', id); }

// ─── BASES (§10) — a single doc holds the whole list (1 read/snapshot) ─
const BASES_DOC = doc(db, 'bases', 'index');

export { db, GOLD_DOC, ITEMS_DOC, QUESTS_DOC, MAPS_INDEX_DOC, mapImageDoc, BASES_DOC };
export { doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc };
