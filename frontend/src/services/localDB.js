// Offline-first data layer. Every page reads/writes through here.
// It always works with zero internet (same behaviour as your old app),
// and firestoreSync.js mirrors it to Firebase whenever you're online.

const PREFIX = 'kgc_';

const COLLECTIONS = [
  'items', 'bills', 'customers', 'expenses',
  'purchases', 'banks', 'users', 'orders',
];

const DEFAULT_SETTINGS = {
  shopname: 'Kanchana Gold Covering',
  brand: 'KGC Fashion Jewellery',
  addr: '',
  phone: '',
  gst: '',
  email: '',
  city: '',
  desc: 'One stop destination for fashion jewellery',
  prefix: 'KGC-',
  footer: 'Thank you for shopping with us! Goods once sold will not be returned.',
  gstrate: '3',
  owner: '',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('kgc:change', { detail: { key } }));
}

export const localDB = {
  get(collection) {
    return read(collection, []);
  },
  set(collection, records) {
    write(collection, records);
  },
  add(collection, record) {
    const list = read(collection, []);
    const withId = { id: record.id || crypto.randomUUID(), ...record, updatedAt: Date.now() };
    list.push(withId);
    write(collection, list);
    return withId;
  },
  update(collection, id, patch) {
    const list = read(collection, []);
    const next = list.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r));
    write(collection, next);
  },
  remove(collection, id) {
    const list = read(collection, []);
    write(collection, list.filter((r) => r.id !== id));
  },

  getSettings() {
    return read('settings', DEFAULT_SETTINGS);
  },
  setSettings(patch) {
    const merged = { ...read('settings', DEFAULT_SETTINGS), ...patch };
    write('settings', merged);
    return merged;
  },

  // Every collection + settings, bundled — used by Google Drive backup
  // and by Firestore sync.
  exportAll() {
    const data = { settings: read('settings', DEFAULT_SETTINGS) };
    for (const c of COLLECTIONS) data[c] = read(c, []);
    data._exportedAt = new Date().toISOString();
    return data;
  },
  importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
    if (data.settings) write('settings', data.settings);
    for (const c of COLLECTIONS) {
      if (Array.isArray(data[c])) write(c, data[c]);
    }
  },

  clearAll() {
    for (const c of COLLECTIONS) localStorage.removeItem(PREFIX + c);
    localStorage.removeItem(PREFIX + 'settings');
  },
};

export const ALL_COLLECTIONS = COLLECTIONS;
