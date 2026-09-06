'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserProfile, OAuthProvider, AuthStatus } from '../types/auth';

// Absolute backend URL — only used for the OAuth2 redirect (must leave the Next.js origin).
// All other API calls use relative paths proxied by Next.js rewrites in next.config.ts.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  statusMessage: string;
  loginWithOAuth: (provider: OAuthProvider) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [statusMessage, setStatusMessage] = useState<string>('');

  /**
   * Checks whether the user already has a valid backend session by calling
   * GET /api/user/me. If the response contains a user email, the session is
   * active and we populate the user profile without requiring a new login.
   *
   * Called on mount and after returning from the OAuth redirect.
   */
  const checkSession = useCallback(async () => {
    try {
      // Use relative URL — proxied by Next.js to http://localhost:8080/api/user/me
      const res = await fetch('/api/user/me', {
        credentials: 'include',
      });
      if (!res.ok) {
        setUser(null);
        setStatus('unauthenticated');
        return;
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
        };
        setUser(profile);
        setStatus('authenticated');
        setStatusMessage('');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch {
      // Backend unreachable — treat as unauthenticated
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  // On mount: restore session from cookie if the user was previously logged in,
  // or if they've just returned from the Google OAuth consent screen.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      // Coming back from Google OAuth redirect — clean up the URL param
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Session restoration is an external request whose result updates auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSession();
  }, [checkSession]);

  /**
   * Initiates a real Google OAuth2 flow.
   * Redirects the browser to the Spring Boot OAuth2 authorization endpoint,
   * which then redirects to Google's consent screen.
   * On success, Google sends the user back to the backend callback URL,
   * which in turn redirects to http://localhost:3000/?login=success.
   */
  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    if (provider === 'google') {
      setStatus('connecting');
      setStatusMessage('Redirecting to Google OAuth 2.0...');
      // Small delay so the UI can show the "connecting" state before navigation
      setTimeout(() => {
        // OAuth navigation intentionally leaves the Next.js origin.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
      }, 400);
    } else {
      // Microsoft and GitHub are not yet integrated — show a status message
      setStatusMessage(`${provider} OAuth coming soon.`);
    }
  }, []);

  /**
   * Logs the user out by hitting Spring Security's /logout endpoint,
   * which invalidates the server-side session and clears the cookie.
   */
  const logout = useCallback(async () => {
    try {
      // Use relative URL — proxied by Next.js to http://localhost:8080/logout
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      setStatusMessage('');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        status,
        statusMessage,
        loginWithOAuth,
        logout,
      }}
    >
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
