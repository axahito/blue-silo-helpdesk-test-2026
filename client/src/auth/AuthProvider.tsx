import React, { createContext, useContext, useEffect, useState } from 'react';
import { publicApi } from '../api/axios';
import { User, AuthContextValue } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // on mount, check if user is still authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await publicApi.get('/auth/me');
        setUser({ username: res.data.username, role: res.data.role });
      } catch (err) {
        // not authenticated or session expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function login(username: string, password: string) {
    try {
      await publicApi.post('/auth/login', { username, password });
      // fetch user info from /auth/me
      const res = await publicApi.get('/auth/me');
      setUser({ username: res.data.username, role: res.data.role });
    } catch (err: any) {
      // bubble error to caller
      throw err;
    }
  }

  function logout() {
    publicApi.post('/auth/logout').catch(() => {});
    setUser(null);
  }

  async function seed(username: string, password: string, role = 'L1') {
    try {
      await publicApi.post('/auth/seed', { username, password, role });
    } catch (err: any) {
      throw err;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, seed }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
