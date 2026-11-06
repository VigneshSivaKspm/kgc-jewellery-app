import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { startSync, stopSync } from '../services/firestoreSync';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // one Firestore doc per shop; using the user's uid keeps this
        // simple for a single-shop login. See README if you need
        // multiple staff logins sharing one shop's data.
        startSync(firebaseUser.uid);
      } else {
        stopSync();
      }
    });
    return unsub;
  }, []);

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    stopSync();
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
