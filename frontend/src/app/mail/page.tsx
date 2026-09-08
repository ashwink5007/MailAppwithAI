'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { EmailProvider } from '../../context/EmailContext';
import { AICopilotProvider } from '../../context/AICopilotContext';
import { MainLayout } from '../../components/layout/MainLayout';

export default function MailPage() {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [router, status]);

  if (status !== 'authenticated' || !isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading mailbox...</p>
      </div>
    );
  }

  return (
    <EmailProvider>
      <AICopilotProvider>
        <MainLayout />
      </AICopilotProvider>
    </EmailProvider>
  );
}
