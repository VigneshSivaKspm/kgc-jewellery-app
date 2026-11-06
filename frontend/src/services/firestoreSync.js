import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { localDB, ALL_COLLECTIONS } from './localDB';

// Everything for one shop lives under a single Firestore document:
//   shops/{shopId}
// with each collection (items, bills, customers, ...) as a field on that
// document. That's enough for a single-shop app and keeps reads/writes to
// one round trip; if you later run multiple shops from one login, switch
// this to a subcollection per shop instead.

let unsubscribe = null;
let pushTimer = null;

function shopDocRef(shopId) {
  return doc(db, 'shops', shopId);
}

/**
 * Call once after login. Starts:
 *  - a live listener that pulls remote changes into localDB (so a second
 *    device's edits show up here), and
 *  - a local-change listener that pushes localDB into Firestore, debounced,
 *    whenever you're online.
 */
export function startSync(shopId) {
  stopSync();

  unsubscribe = onSnapshot(shopDocRef(shopId), (snap) => {
    if (!snap.exists()) return;
    const remote = snap.data();
    // Only pull in remote data — never fight with what the user is
    // actively typing locally. A simple last-write-wins model:
    const remoteData = { settings: remote.settings, ...remote.collections };
    if (remoteData && remote.updatedAt) {
      localDB.importAll(remoteData);
    }
  }, (err) => {
    console.warn('Firestore sync (pull) unavailable, staying offline:', err.message);
  });

  window.addEventListener('kgc:change', schedulePush);
  window.addEventListener('online', () => pushNow(shopId));

  // push once on startup so a brand-new device seeds the cloud copy
  pushNow(shopId);

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushNow(shopId), 1500);
  }
}

export function stopSync() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  clearTimeout(pushTimer);
  window.removeEventListener('kgc:change', () => {});
}

async function pushNow(shopId) {
  if (!navigator.onLine) return;
  try {
    const all = localDB.exportAll();
    const { settings, ...collections } = all;
    await setDoc(
      shopDocRef(shopId),
      { settings, collections, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore sync (push) failed, will retry when back online:', err.message);
  }
}

export { ALL_COLLECTIONS };
