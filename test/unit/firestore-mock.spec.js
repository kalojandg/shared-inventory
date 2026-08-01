import { describe, it, expect, beforeEach } from 'vitest';
import {
  setDoc,
  getDoc,
  calls,
  __setDocData,
  __reset,
} from '../mocks/firebase-firestore.js';

// Guards the ADDITIVE store extension of the firestore mock (§5/§9). The
// existing behavior toward the old specs is unchanged — an unseeded token
// still reads exists:false.

describe('firestore mock store', () => {
  beforeEach(() => __reset());

  it('setDoc writes to a store getDoc can read back', async () => {
    await setDoc('maps/abc', { image: 'x' });
    const snap = await getDoc('maps/abc');
    expect(snap.exists()).toBe(true);
    expect(snap.data().image).toBe('x');
  });

  it('getDoc for an unseeded token reports exists:false', async () => {
    const snap = await getDoc('maps/missing');
    expect(snap.exists()).toBe(false);
    expect(snap.data()).toBeUndefined();
  });

  it('__setDocData seeds the store without recording a setDoc call', async () => {
    __setDocData('maps/seeded', { image: 'y' });
    const snap = await getDoc('maps/seeded');
    expect(snap.exists()).toBe(true);
    expect(snap.data().image).toBe('y');
    expect(calls.setDoc.length).toBe(0);
  });

  it('__reset clears the store', async () => {
    __setDocData('maps/seeded', { image: 'y' });
    __reset();
    const snap = await getDoc('maps/seeded');
    expect(snap.exists()).toBe(false);
  });
});
