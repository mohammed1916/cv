import { trackEvent } from '../analytics/client';
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, googleSignIn, accessCall, backendEnabled } from "./firebase";
import { createAccountCache } from './accountCache';
import { BETA_FREE_ACCESS, hasProAccess } from "./policy";

const accountCache = createAccountCache({
  load: async uid => {
    if (auth.currentUser?.uid !== uid) throw new Error('Account changed');
    const account = await accessCall('accountStatus');
    if (auth.currentUser?.uid !== uid) throw new Error('Account changed');
    return account;
  },
  storage: () => window.localStorage,
});

export function useAccess() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [accountReady, setAccountReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(
    () =>
      onAuthStateChanged(auth, (next) => {
        setUser(next);
        setAccount(null);
        setAccountReady(!next);
        setReady(true);
      }),
    [],
  );
  const refresh = useCallback(async (force = true) => {
    if (BETA_FREE_ACCESS || !user || !backendEnabled) return;
    try {
      const next = await accountCache.get(user.uid, { force: force !== false });
      if (auth.currentUser?.uid === user.uid) {
        setAccount(next);
        setError("");
      }
    } catch {
      if (auth.currentUser?.uid === user.uid) setError("Could not verify account access. Please retry.");
    } finally {
      if (auth.currentUser?.uid === user.uid) setAccountReady(true);
    }
  }, [user]);
  useEffect(() => {
    if (BETA_FREE_ACCESS) return;
    const first = setTimeout(() => refresh(false), 0);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(clock);
    };
  }, [refresh]);
  const login = async () => {
    setError("");
    setBusy(true);
    try {
      await googleSignIn();
      trackEvent('login', { method: 'google' });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user")
        setError(
          err.code === "auth/configuration-not-found"
            ? "Sign-in is unavailable because Firebase Authentication has not been configured yet."
            : err.code === "auth/unauthorized-domain"
              ? "Sign-in is not enabled for this website address. Please contact the site owner."
              : err.code === "auth/operation-not-allowed"
                ? "Google sign-in is being enabled. Please try again later."
                : err.code === "auth/popup-blocked"
                  ? "Allow the sign-in popup, then try again."
                  : "Google sign-in could not complete. Please try again.",
        );
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    try {
      const uid = auth.currentUser?.uid;
      await signOut(auth);
      if (uid) accountCache.clear(uid);
      setAccount(null);
    } catch {
      setError("Could not sign out. Please retry.");
    }
  };
  const startTrial = async () => {
    if (BETA_FREE_ACCESS) return;
    if (!user) { await login(); return; }
    setBusy(true);
    setError('');
    try {
      const next = await accessCall('startProTrial');
      if (auth.currentUser?.uid === user.uid) { accountCache.put(user.uid, next); setAccount(next); }
    } catch {
      setError('Could not start your free trial. Please retry.');
    } finally {
      setBusy(false);
    }
  };
  const debugPro =
    import.meta.env.DEV && import.meta.env.VITE_DEBUG_PRO === "true";

  const realPro = Boolean(
    account?.pro && (account.complimentary || !account.expiresAt || account.expiresAt > now),
  );
  const pro = hasProAccess({ user, realPro, debugPro });

  return {
    user,
    account,
    pro,
    debugPro,
    ready,
    accountReady: accountReady || BETA_FREE_ACCESS || debugPro,
    error,
    setError,
    busy,
    login,
    logout,
    refresh,
    startTrial,
  };
}
