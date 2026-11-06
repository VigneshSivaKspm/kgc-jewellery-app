import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <div className={'sync-pill' + (online ? '' : ' offline')}>
          {online ? '☁️ Synced' : '⚠️ Offline — saved locally'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
        <button className="btn btn-outline btn-sm" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
