'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, OAuthProvider, AuthStatus } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  statusMessage: string;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setStatus('connecting');
    setStatusMessage(`Initiating OAuth 2.0 PKCE challenge with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
    await new Promise(r => setTimeout(r, 600));

    setStatus('authorizing');
    setStatusMessage('Exchanging authorization code for secure access tokens...');
    await new Promise(r => setTimeout(r, 700));

    // Authenticated profile
    let profile: UserProfile;
    if (provider === 'google') {
      profile = {
        id: 'usr-google-1092',
        name: 'Alex Rivera',
        email: 'alex.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        tokenType: 'Bearer',
        scope: ['https://mail.google.com/', 'openid', 'profile', 'email'],
      };
    } else if (provider === 'microsoft') {
      profile = {
        id: 'usr-msft-4821',
        name: 'Alex Rivera',
        email: 'alex.rivera@outlook.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        provider: 'microsoft',
        tokenType: 'Bearer',
        scope: ['Mail.ReadWrite', 'Mail.Send', 'User.Read'],
      };
    } else {
      profile = {
        id: 'usr-gh-9912',
        name: 'Alex Rivera',
        email: 'alex@aimail.io',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        provider: 'github',
        tokenType: 'Bearer',
        scope: ['user:email', 'read:user'],
      };
    }

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
