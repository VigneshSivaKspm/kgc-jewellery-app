import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import JewelArt from '../components/JewelArt';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter both email/username and password.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <JewelArt className="login-jewel-art" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-crest">KGC</div>
        <div className="login-title">KGC Fashion Jewellery</div>
        <div className="login-sub">Shop Manager · Sign in</div>

        <div className="login-divider" />

        <div className="login-form">
          <div>
            <label htmlFor="login-email">Email / Username</label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kgcjewellery.com"
            />
          </div>
          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : '🔓 Sign in'}
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-footnote">
          First time here? Create the admin account in{' '}
          <strong>Firebase Console → Authentication → Users</strong>, then
          sign in with that email and password.
        </div>
      </form>

      <div className="login-brandline">Gold · Silver · Fashion Jewellery</div>
    </div>
  );
}

function readableAuthError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return '❌ Invalid email or password.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (code.includes('network-request-failed')) {
    return 'No internet connection — check your network and try again.';
  }
  return err?.message || 'Could not sign in. Please try again.';
}
