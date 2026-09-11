import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleSignIn, accessCall, backendEnabled } from './firebase';

export function useAccess() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => onAuthStateChanged(auth, (next) => {
    setUser(next); setAccount(null); setReady(true);
  }), []);
  const refresh = useCallback(async () => {
    if (!user || !backendEnabled) return;
    try {
      const next = await accessCall('accountStatus');
      if (auth.currentUser?.uid === user.uid) { setAccount(next); setError(''); }
    } catch { setError('Could not verify account access. Please retry.'); }
  }, [user]);
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, 60000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearTimeout(first); clearInterval(id); clearInterval(clock); };
  }, [refresh]);
  const login = async () => {
    setError(''); setBusy(true);
    try { await googleSignIn(); }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(
        err.code === 'auth/configuration-not-found' ? 'Sign-in is unavailable because Firebase Authentication has not been configured yet.' :
        err.code === 'auth/unauthorized-domain' ? 'Sign-in is not enabled for this website address. Please contact the site owner.' :
        err.code === 'auth/operation-not-allowed' ? 'Google sign-in is being enabled. Please try again later.' :
        err.code === 'auth/popup-blocked' ? 'Allow the sign-in popup, then try again.' :
        'Google sign-in could not complete. Please try again.');
    } finally { setBusy(false); }
  };
  const logout = async () => {
    try { await signOut(auth); setAccount(null); }
    catch { setError('Could not sign out. Please retry.'); }
  };
  return { user, account, pro: Boolean(account?.pro && account.expiresAt > now), ready, error, setError, busy, login, logout, refresh };
}
