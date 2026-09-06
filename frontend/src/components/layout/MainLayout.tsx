'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { EmailList } from '../email/EmailList';
import { EmailDetail } from '../email/EmailDetail';
import { AssistantPanel } from '../ai/AssistantPanel';
import { ComposeEmail } from '../email/ComposeEmail';
import { useAICopilot } from '../../context/AICopilotContext';

export const MainLayout: React.FC = () => {
  const { isOpen: isAIOpen, setIsOpen: setIsAIOpen } = useAICopilot();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const handleSelectEmailMobile = () => {
    setMobileView('detail');
  };

  const handleBackToMobileList = () => {
    setMobileView('list');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-none font-sans">
      {/* Top Application Header */}
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />
            <div className="relative w-64 max-w-[80vw] h-full bg-white z-50 shadow-2xl">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Center Workspace (List + Detail) */}
        <main className="flex-1 flex min-w-0 h-full overflow-hidden bg-white">
          {/* Desktop & Tablet View: List and Detail Side by Side */}
          <div className="hidden md:flex flex-1 min-w-0 h-full">
            <div className="w-[360px] lg:w-[400px] shrink-0 h-full border-r border-slate-200">
              <EmailList />
            </div>
            <div className="flex-1 min-w-0 h-full">
              <EmailDetail />
            </div>
          </div>

          {/* Mobile View: Single Pane Drilldown */}
          <div className="flex-1 flex md:hidden h-full">
            {mobileView === 'list' ? (
              <div className="w-full h-full">
                <EmailList onSelectEmailMobile={handleSelectEmailMobile} />
              </div>
            ) : (
              <div className="w-full h-full">
                <EmailDetail onBackMobile={handleBackToMobileList} />
              </div>
            )}
          </div>
        </main>

        {/* Desktop AI Copilot Panel */}
        <div className="hidden xl:flex h-full border-l border-slate-200">
          <AssistantPanel />
        </div>

        {/* Tablet / Mobile AI Copilot Drawer Overlay */}
        {isAIOpen && (
          <div className="fixed inset-0 z-40 flex justify-end xl:hidden">
            <div
              onClick={() => setIsAIOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            />
            <div className="relative w-full max-w-md h-full bg-white z-50 shadow-2xl">
              <AssistantPanel />
            </div>
          </div>
        )}
      </div>

      {/* Floating Compose Modal */}
      <ComposeEmail />
    </div>
  );
};
