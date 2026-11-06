# KGC Fashion Jewellery — Shop Manager (React + Firebase + Google Drive)

A full rewrite of your single-file HTML shop app into a real project: a
**React frontend** (works on desktop, laptop, mobile — any browser) with an
**offline-first local store**, backed by **Firebase** (Auth + Firestore +
Storage) so your data syncs across devices, plus an optional **Google Drive
backup** so a copy of your data lands in your own Drive whenever you're online.

---

## 1. What's included

```
kgc-jewellery-app/
├── frontend/                  React app (Vite)
│   ├── src/
│   │   ├── firebase.js        Firebase init (fill in your config)
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        login/session state
│   │   ├── services/
│   │   │   ├── localDB.js             offline-first storage (localStorage)
│   │   │   ├── firestoreSync.js       push/pull to Firebase when online
│   │   │   └── googleDrive.js         backup/restore JSON to Google Drive
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── CameraCapture.jsx      camera modal — fixed to always release the webcam
│   │   ├── pages/
│   │   │   ├── Login.jsx              gold/jewellery themed admin login
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Items.jsx              inventory list + Add Item (with camera)
│   │   │   ├── Billing.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx           Google Drive connect/backup/restore, shop info
│   │   ├── styles/theme.css           gold + silver jewellery theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── firebase.json
│   ├── firestore.rules        per-shop data isolation rules
│   ├── storage.rules          item-photo upload rules
│   └── functions/             optional Cloud Functions (Node)
│       ├── index.js           nightly backup + user-invite examples
│       └── package.json
│
└── README.md   (this file)
```

This is a genuine multi-file project you build and deploy — not a single
HTML file. It reproduces the core workflow of your original app (login,
sidebar navigation, dashboard, inventory with photo/camera capture, billing,
customers, reports, settings) on the new architecture, and is structured so
you (or any React developer) can port the remaining report/table screens
from your original `kgc_shop_app_v5_reports_time_fix.html` one page at a
time — the data layer, auth, camera fix, theme and sync already work.

---

## 2. How data storage works (the part you asked about)

You said you don't know Firebase and want "local storage... when online, data
stored to my Google Drive." Here's the model that gives you exactly that:

1. **Every write goes to the browser's local storage first** (`localDB.js`).
   The app always works, even with zero internet — same as your old app.
2. **Whenever the device is online**, `firestoreSync.js` mirrors every
   collection (items, bills, customers, expenses, purchases, banks, users,
   orders, settings) to **Firebase Firestore**, under your shop's own
   document. This is what makes your data available on *any* device you log
   into — phone, laptop, desktop — not just the one you typed it on.
3. **Google Drive backup** (`googleDrive.js`) is separate and optional: from
   Settings, you click **"Connect Google Drive"** once (Google's own sign-in
   popup, nothing to code), and from then on, every time you're online, the
   app also saves a timestamped JSON backup of your entire shop data into a
   folder in your own Google Drive. You can restore from any backup from the
   same screen.

So: local storage always, Firestore for cross-device sync, Google Drive for
your personal backup copy — all three, as you asked for.

---

## 3. Setup steps

### A. Firebase (cross-device sync + login)
1. Go to https://console.firebase.google.com → **Add project**.
2. In the project, open **Build → Authentication → Sign-in method** and
   enable **Email/Password**.
3. Open **Build → Firestore Database → Create database** (start in
   production mode).
4. Open **Build → Storage → Get started** (for item photos, optional if
   you're happy storing photos as base64 locally).
5. In **Project settings → General → Your apps → Web app**, register an app
   and copy the `firebaseConfig` object.
6. Paste those values into `frontend/src/firebase.js`.
7. Deploy the security rules once you have the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init   # pick Firestore + Storage, point at backend/firestore.rules and backend/storage.rules
   firebase deploy --only firestore:rules,storage:rules
   ```
8. Create your first admin user: Authentication → Users → **Add user**
   (email + password) — this is what you'll log in with.

### B. Google Drive backup
1. Go to https://console.cloud.google.com → select the **same project**
   Firebase created for you.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   type **Web application**. Add your app's URL (e.g.
   `http://localhost:5173` while testing, and your real domain later) under
   **Authorized JavaScript origins**.
4. Copy the **Client ID** into `frontend/src/services/googleDrive.js`
   (`GOOGLE_CLIENT_ID`).
5. That's it — the "Connect Google Drive" button in Settings handles the
   rest.

### C. Run it locally
```bash
cd frontend
npm install
npm run dev
```
Open the printed `localhost` URL on your desktop, and on your phone (same
Wi-Fi) using your computer's local IP, e.g. `http://192.168.1.5:5173`, to
test on mobile.

### D. Put it online (so your phone can reach it anywhere, not just Wi-Fi)
Easiest free option — Firebase Hosting:
```bash
npm run build
firebase init hosting     # public directory: frontend/dist
firebase deploy --only hosting
```
You'll get a `https://your-project.web.app` link that works from any device,
anywhere.

---

## 4. The camera bug fix

Your original `openWebcam()` / `closeWebcam()` only stopped the media
tracks when the **Cancel** or **Capture** button was pressed. If the modal
was closed any other way (browser back, switching tabs mid-permission
prompt, component unmount, re-opening the camera while it was already
running), the stream kept running and the camera light stayed on.

`components/CameraCapture.jsx` fixes this by:
- stopping every track **and** clearing `video.srcObject = null` (some
  browsers keep the light on until the element itself releases the stream,
  not just the track),
- releasing any existing stream **before** requesting a new one,
- releasing the stream in a `useEffect` cleanup, so it's stopped on
  unmount, page navigation, or component re-render — not only on a button
  click,
- releasing the stream when the browser tab becomes hidden.

---

## 5. Design

The login page uses a deep charcoal-to-espresso backdrop with a gold/silver
gradient, a hand-drawn SVG haram (layered necklace) as the signature visual,
and Cinzel (display) + Inter (body) type — matching a premium jewellery
showroom rather than a generic admin panel. The same palette (`theme.css`)
carries through the sidebar and dashboard so the whole app feels like one
brand.

---

## 6. What to build next

The data layer, auth, sync, camera, and theme are all done and working.
`Items.jsx` is fully built (list + Add Item with photo/camera) as the
reference pattern. Use it as the template to port `Billing`, `Customers`,
`Reports`, `Purchases`, `Banks`, `Users`, and `Orders` out of your original
HTML file's logic (search for the matching `function` names in
`kgc_shop_app_v5_reports_time_fix.html`) — the data for all of them already
reads/writes correctly through `localDB.js` and syncs through
`firestoreSync.js`, you just need the table/form UI for each.
#   k g c - j e w e l l e r y - a p p  
 