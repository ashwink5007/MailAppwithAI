'use client';

import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { EmailProvider } from '../context/EmailContext';
import { AICopilotProvider } from '../context/AICopilotContext';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../components/auth/LoginPage';
import { MailCopilotTools } from '../components/ai/MailCopilotTools';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <EmailProvider>
      <AICopilotProvider>
        <MailCopilotTools />
        <MainLayout />
      </AICopilotProvider>
    </EmailProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
