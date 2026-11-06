import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { localDB } from '../services/localDB';
import { connectGoogleDrive, isDriveConnected, backupToDrive, restoreFromDrive, disconnectDrive } from '../services/googleDrive';

export default function Settings() {
  const [settings, setSettings] = useState(localDB.getSettings());
  const [driveConnected, setDriveConnected] = useState(isDriveConnected());
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    window.addEventListener('online', () => setStatus(''));
  }, []);

  function saveSettings(e) {
    e.preventDefault();
    localDB.setSettings(settings);
    setStatus('Shop details saved.');
  }

  async function handleConnect() {
    setBusy(true);
    setStatus('');
    try {
      await connectGoogleDrive();
      setDriveConnected(true);
      setStatus('Google Drive connected.');
    } catch (err) {
      setStatus('Could not connect: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleBackup() {
    setBusy(true);
    setStatus('');
    try {
      await backupToDrive(localDB.exportAll());
      setStatus('Backup saved to Google Drive ✓');
    } catch (err) {
      setStatus('Backup failed: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    if (!confirm('This replaces your current local data with the Google Drive backup. Continue?')) return;
    setBusy(true);
    setStatus('');
    try {
      const data = await restoreFromDrive();
      if (!data) {
        setStatus('No backup found in Google Drive yet — click "Backup now" first.');
      } else {
        localDB.importAll(data);
        setStatus('Restored from Google Drive ✓');
      }
    } catch (err) {
      setStatus('Restore failed: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleDisconnect() {
    disconnectDrive();
    setDriveConnected(false);
    setStatus('Google Drive disconnected.');
  }

  return (
    <>
      <Topbar title="Settings" />
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        <form className="card" onSubmit={saveSettings}>
          <div className="table-title" style={{ marginBottom: 14 }}>🏬 Shop details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['shopname', 'Shop name'], ['brand', 'Brand'], ['addr', 'Address'],
              ['phone', 'Phone'], ['email', 'Email'], ['gst', 'GST number'],
              ['prefix', 'Bill number prefix'],
            ].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input className="form-input" value={settings[key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-gold" type="submit" style={{ justifyContent: 'center' }}>Save details</button>
          </div>
        </form>

        <div className="card">
          <div className="table-title" style={{ marginBottom: 14 }}>☁️ Google Drive backup</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
            Keep a personal copy of all your shop data in your own Google
            Drive. This is separate from cross-device sync, which already
            happens automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!driveConnected ? (
              <button className="btn btn-gold" onClick={handleConnect} disabled={busy}>
                🔗 Connect Google Drive
              </button>
            ) : (
              <>
                <button className="btn btn-gold" onClick={handleBackup} disabled={busy}>⬆️ Backup now</button>
                <button className="btn btn-outline" onClick={handleRestore} disabled={busy}>⬇️ Restore from backup</button>
                <button className="btn btn-outline" onClick={handleDisconnect} disabled={busy}>Disconnect</button>
              </>
            )}
            {status && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{status}</div>}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="table-title" style={{ marginBottom: 10 }}>⚠️ Danger zone</div>
          <button
            className="btn btn-danger"
            onClick={() => { if (confirm('Delete ALL local data? This cannot be undone.')) { localDB.clearAll(); location.reload(); } }}
          >
            Clear all local data
          </button>
        </div>
      </div>
    </>
  );
}
