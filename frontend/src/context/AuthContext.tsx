'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserProfile, OAuthProvider, AuthStatus } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  statusMessage: string;
  loginWithOAuth: (provider: OAuthProvider, customEmail?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const loginWithOAuth = useCallback(async (provider: OAuthProvider, customEmail?: string) => {
    setStatus('connecting');
    const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
    setStatusMessage(`Connecting to ${providerLabel} OAuth 2.0 service...`);
    await new Promise(r => setTimeout(r, 600));

    setStatus('authorizing');
    setStatusMessage('Exchanging authorization code for OAuth 2.0 access token...');
    await new Promise(r => setTimeout(r, 700));

    // Resolve email & name
    let email = customEmail?.trim();
    if (!email) {
      if (provider === 'google') email = 'user@gmail.com';
      else if (provider === 'microsoft') email = 'user@outlook.com';
      else email = 'user@github.com';
    }

    const usernamePart = email.split('@')[0];
    const formattedName = usernamePart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'User';

    const profile: UserProfile = {
      id: `usr-${provider}-${Date.now()}`,
      name: formattedName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=2563eb&textColor=ffffff`,
      provider: provider,
      tokenType: 'Bearer',
      scope: provider === 'google' 
        ? ['https://mail.google.com/', 'openid', 'profile', 'email']
        : ['Mail.ReadWrite', 'openid', 'profile', 'email'],
    };

    setUser(profile);
    setStatus('authenticated');
    setStatusMessage('');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
    setStatusMessage('');
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
