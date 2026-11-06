// Backs up your shop data as a JSON file in a folder in the user's OWN
// Google Drive. Uses Google Identity Services (loaded from a CDN script,
// no extra npm package needed) + the Drive REST API directly via fetch.
//
// Setup: Google Cloud Console → enable "Google Drive API" → Credentials →
// create an OAuth Client ID (Web application) → paste it below.

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'kgc-jewellery-backup.json';

let tokenClient = null;
let accessToken = null;

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Google sign-in script'));
    document.head.appendChild(script);
  });
}

export async function connectGoogleDrive() {
  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error));
        accessToken = resp.access_token;
        sessionStorage.setItem('kgc_drive_token', accessToken);
        resolve(accessToken);
      },
    });
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  });
}

export function isDriveConnected() {
  return !!(accessToken || sessionStorage.getItem('kgc_drive_token'));
}

function token() {
  return accessToken || sessionStorage.getItem('kgc_drive_token');
}

async function findBackupFile() {
  const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)`,
    { headers: { Authorization: `Bearer ${token()}` } }
  );
  if (!res.ok) throw new Error('Google Drive lookup failed');
  const json = await res.json();
  return json.files?.[0] || null;
}

/** Uploads the given JS object as the backup JSON, creating or updating the file. */
export async function backupToDrive(data) {
  if (!token()) throw new Error('Connect Google Drive first');
  const existing = await findBackupFile();
  const boundary = 'kgc_backup_boundary';
  const metadata = { name: BACKUP_FILENAME, mimeType: 'application/json' };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    `${JSON.stringify(data, null, 2)}\r\n` +
    `--${boundary}--`;

  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const res = await fetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error('Backup upload to Google Drive failed');
  return res.json();
}

/** Downloads and parses the backup JSON from Drive, or returns null if none exists. */
export async function restoreFromDrive() {
  if (!token()) throw new Error('Connect Google Drive first');
  const existing = await findBackupFile();
  if (!existing) return null;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`,
    { headers: { Authorization: `Bearer ${token()}` } }
  );
  if (!res.ok) throw new Error('Could not download backup from Google Drive');
  return res.json();
}

export function disconnectDrive() {
  const t = token();
  accessToken = null;
  sessionStorage.removeItem('kgc_drive_token');
  if (t && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(t, () => {});
  }
}
