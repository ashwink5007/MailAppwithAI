'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { UserProfile, OAuthProvider, AuthStatus } from '../types/auth';

// Application API calls use Next.js same-origin rewrites so their session
// cookie is first-party in the browser and forwarded to Spring Boot.
const API_BASE_URL = '';

// OAuth remains a browser navigation to Spring Security's configured backend
// callback; it is not a fetch-based application API request.
const OAUTH_BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  statusMessage: string;
  googleConnected: boolean;
  mailboxMode: 'REAL_GMAIL' | 'DEMO';
  loginWithOAuth: (provider: OAuthProvider) => void;
  connectGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [googleConnected, setGoogleConnected] = useState<boolean>(false);
  const hasInitialized = useRef(false);

  // Returns true when an authenticated user was resolved, false otherwise.
  // Callers (login, OAuth return) use this to detect a failed session
  // handoff instead of silently bouncing back to the login form in a loop.
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setUser(null);
        setGoogleConnected(false);
        setStatus('unauthenticated');
        return false;
      }
      const data = await res.json();
      const userData = data?.data && data.data.email ? data.data : data;
      const userEmail = userData?.email;
      if (userData && userEmail) {
        const profile: UserProfile = {
          id: userData.id ? `usr-${userData.id}` : `usr-google-${userEmail}`,
          name: userData.name || userEmail.split('@')[0],
          email: userEmail,
          avatar: userData.picture || userData.profilePictureUrl || undefined,
          provider: 'google',
          tokenType: 'Bearer',
          scope: ['https://mail.google.com/', 'openid', 'profile', 'email'],
          googleConnected: userData.googleConnected ?? (userData.googleId != null),
          mailboxMode: (userData.mailboxMode === 'REAL_GMAIL' || userData.googleConnected || userData.googleId != null) ? 'REAL_GMAIL' : 'DEMO',
        };
        setUser(profile);
        setGoogleConnected(profile.googleConnected ?? false);
        setStatus('authenticated');
        setStatusMessage('');
        return true;
      } else {
        setUser(null);
        setGoogleConnected(false);
        setStatus('unauthenticated');
        return false;
      }
    } catch {
      setUser(null);
      setGoogleConnected(false);
      setStatus('unauthenticated');
      return false;
    }
  }, []);

  useEffect(() => {
    // React Strict Mode intentionally re-runs effects in development. Session
    // hydration must still have one source and one request per provider mount.
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const hadLoginParam = params.get('login') === 'success';
    if (hadLoginParam || params.get('logout') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    // After a Google OAuth return (?login=success) an empty session means the
    // session handoff failed — say so explicitly instead of silently looping
    // back to a blank login form. Plain anonymous visits stay message-free.
    checkSession().then((ok) => {
      if (!ok && hadLoginParam) {
        setStatusMessage('Google sign-in finished but no session was found. Please enable cookies for this site and try again.');
      }
    });
  }, [checkSession]);

  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    if (provider === 'google') {
      setStatus('connecting');
      setStatusMessage('Redirecting to Google OAuth 2.0...');
      setTimeout(() => {
        window.location.href = `${OAUTH_BACKEND_URL}/oauth2/authorization/google`;
      }, 400);
    } else {
      setStatusMessage(`${provider} OAuth coming soon.`);
    }
  }, []);

  const connectGoogle = useCallback(async () => {
    try {
      setStatus('connecting');
      setStatusMessage('Connecting Google account...');
      const res = await fetch(`${API_BASE_URL}/auth/connect-google`, {
        method: 'POST',
        credentials: 'include',
      });
      const body = await res.json();
      if (body.success && body.data?.url) {
        window.location.href = `${OAUTH_BACKEND_URL}${body.data.url}`;
      } else {
        setStatus('authenticated');
        setStatusMessage(body.message || 'Failed to start Google connection.');
      }
    } catch {
      setStatus('authenticated');
      setStatusMessage('Unable to connect to server.');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setStatus('loading');
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (body.success) {
        // Verify the session was actually established before reporting
        // success — otherwise the UI would bounce back to a blank login
        // form with no error (the login→/me→login loop).
        const established = await checkSession();
        if (!established) {
          console.warn('[auth] login accepted but session was not established (cookie rejected or missing)');
          return { success: false, message: 'Signed in, but the session was not established. Please enable cookies for this site and try again.' };
        }
        return { success: true, message: body.message };
      }
      setStatus('unauthenticated');
      return { success: false, message: body.message || 'Login failed.' };
    } catch {
      setStatus('unauthenticated');
      return { success: false, message: 'Unable to connect to server.' };
    }
  }, [checkSession]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setStatus('loading');
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, displayName }),
      });
      const body = await res.json();
      if (body.success) {
        setStatus('unauthenticated');
        return { success: true, message: body.message };
      }
      setStatus('unauthenticated');
      return { success: false, message: body.message || 'Registration failed.' };
    } catch {
      setStatus('unauthenticated');
      return { success: false, message: 'Unable to connect to server.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Backend returns 204 No Content (no cross-origin redirect) so a
      // credentialed fetch never follows a redirect chain that browsers
      // reject for Access-Control-Allow-Origin "*".
      // redirect: 'manual' is belt-and-braces: even if the backend ever
      // issued a redirect again, fetch would not follow it automatically.
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        redirect: 'manual',
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setGoogleConnected(false);
      setStatus('unauthenticated');
      setStatusMessage('');
      // Explicit client-side navigation to the logged-out state.
      // page.tsx renders <LoginPage /> whenever !isAuthenticated, so clearing
      // state is sufficient — also strip any stale query params.
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      status,
      statusMessage,
      googleConnected,
      mailboxMode: user?.mailboxMode || (googleConnected ? 'REAL_GMAIL' : 'DEMO'),
      loginWithOAuth,
      connectGoogle,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
