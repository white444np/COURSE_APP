import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const initialHasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const [userState, setUserState] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(initialHasToken);
  const [initialized, setInitialized] = useState(false);

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    if (typeof window !== 'undefined') {
      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser));
      } else {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return null;
    }

    setLoading(true);
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
    setInitialized(true);
  }, [setUser]);

  useEffect(() => {
    if (initialHasToken) {
      refresh().catch(() => {});
    } else {
      setUser(null);
      setInitialized(true);
    }
  }, [initialHasToken, refresh, setUser]);

  const value = useMemo(() => ({
    user: userState,
    setUser,
    loading,
    initialized,
    isAuthenticated: Boolean(userState),
    refresh,
    logout,
  }), [userState, loading, initialized, refresh, logout, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
