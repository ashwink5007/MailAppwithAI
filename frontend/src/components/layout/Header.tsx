'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { useAICopilot } from '../../context/AICopilotContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { searchQuery, setSearchQuery, unreadCount, mailboxMode } = useEmail();
  const { isOpen: isAIOpen, toggleOpen: toggleAI, status: aiStatus } = useAICopilot();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30 sticky top-0 shadow-sm">
      {/* Left: Mobile Toggle & Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-2 ring-blue-100">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">AiMail</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Copilot
              </span>
              {mailboxMode === 'DEMO' && (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Intelligent Workspace</p>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, subject, keywords (or try 'John')..."
            className="w-full bg-slate-100/90 hover:bg-slate-100 text-slate-900 text-sm pl-10 pr-16 py-2 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
                ⌘K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, AI Copilot Trigger, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* AI Copilot Toggle Button */}
        <button
          onClick={toggleAI}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
            isAIOpen
              ? 'bg-blue-600 text-white shadow-blue-500/25 ring-1 ring-blue-400'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
          title="Toggle AI Copilot"
        >
          <div className="relative">
            <Sparkles className={`w-4 h-4 ${aiStatus !== 'idle' ? 'animate-spin text-amber-300' : isAIOpen ? 'text-white' : 'text-blue-600'}`} />
            {aiStatus !== 'idle' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="hidden md:inline">AI Copilot</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-mono hidden lg:inline ${
            isAIOpen ? 'bg-white/20 text-white' : 'bg-blue-200/60 text-blue-800'
          }`}>
            Ctrl+J
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] text-blue-600 cursor-pointer hover:underline font-medium">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 py-1 text-xs">
                <div className="py-2.5">
                  <p className="text-slate-800 font-semibold">New unread email from John Miller</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Quarterly Product Strategy Review</p>
                  <span className="text-[10px] text-blue-600 mt-1 inline-block font-medium">10m ago</span>
                </div>
                <div className="py-2.5">
                  <p className="text-slate-800 font-semibold">AI Copilot summary ready</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Summary for Elena Rostova&apos;s thread generated</p>
                  <span className="text-[10px] text-blue-600 mt-1 inline-block font-medium">1h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-blue-100">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Alex Rivera'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user?.email || 'alex@aimail.io'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Alex Rivera'}</p>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'alex@aimail.io'}</p>
              </div>
              <div className="py-1 text-xs text-slate-700">
                <button className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Account Settings
                </button>
                <button className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  AI Preferences
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100 text-xs">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-50 text-rose-600 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
