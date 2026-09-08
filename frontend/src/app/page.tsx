'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { EmailProvider } from '../context/EmailContext';
import { AICopilotProvider } from '../context/AICopilotContext';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../components/auth/LoginPage';
function AppContent() {
  const { isAuthenticated, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <EmailProvider>
      <AICopilotProvider>
        <MainLayout />
      </AICopilotProvider>
    </EmailProvider>
  );
}

export default function Home() {
  return <AppContent />;
}
