/**
 * Optional server-side helpers. Nothing here is required for the app to
 * work — Firestore + the frontend already handle everything. Deploy this
 * only if you want a server-side safety net.
 *
 * Deploy with:  firebase deploy --only functions
 */
require('dotenv').config();
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: process.env.FIREBASE_PROJECT_ID,
});

// Keeps a dated, server-side snapshot of each shop's data every time it
// changes — a safety net independent of the user's own Google Drive
// backup, in case a device is lost before it ever gets a chance to sync.
exports.snapshotShopOnWrite = onDocumentWritten('shops/{shopId}', async (event) => {
  const after = event.data?.after?.data();
  if (!after) return; // document deleted
  const { shopId } = event.params;
  await admin.firestore()
    .collection('shops').doc(shopId)
    .collection('snapshots').doc(new Date().toISOString())
    .set(after);
});

// Trims snapshots older than 30 days so this doesn't grow forever.
exports.cleanupOldSnapshots = onSchedule('every 24 hours', async () => {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const shops = await admin.firestore().collection('shops').listDocuments();
  for (const shop of shops) {
    const snaps = await shop.collection('snapshots').get();
    for (const snap of snaps.docs) {
      if (new Date(snap.id).getTime() < cutoff) await snap.ref.delete();
    }
  }
});
