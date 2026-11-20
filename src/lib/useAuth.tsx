'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { clientAuth } from '@/lib/firebaseClient';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Returns Authorization header. Falls back to demo mode when user is null. */
  getAuthHeader: () => Promise<Record<string, string>>;
  /** Signs the user out */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    // Demo mode fallback — server accepts test-token-* in test env,
    // in production this call will return 401 and the UI will redirect to login.
    return { Authorization: 'Bearer test-token-demo' };
  }, [user]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(clientAuth);
    } catch {
      // Ignored if auth not initialized or offline
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, getAuthHeader, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
