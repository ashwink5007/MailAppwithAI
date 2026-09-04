'use client';

import React from 'react';
import { 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  AlertCircle, 
  Trash2, 
  ShieldAlert, 
  Plus, 
  Tag, 
  HardDrive, 
  Settings, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { FolderId, EmailLabel } from '../../types/email';

interface SidebarProps {
  onCloseMobile?: () => void;
}

interface FolderItem {
  id: FolderId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const FOLDERS: FolderItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'important', label: 'Important', icon: AlertCircle },
  { id: 'spam', label: 'Spam', icon: ShieldAlert },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const LABELS: { name: EmailLabel; color: string; bg: string }[] = [
  { name: 'Work', color: 'text-blue-600', bg: 'bg-blue-500' },
  { name: 'Personal', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { name: 'Urgent', color: 'text-rose-600', bg: 'bg-rose-500' },
  { name: 'Finance', color: 'text-amber-600', bg: 'bg-amber-500' },
  { name: 'Social', color: 'text-sky-600', bg: 'bg-sky-500' },
  { name: 'Promotions', color: 'text-purple-600', bg: 'bg-purple-500' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { 
    activeFolder, 
    setActiveFolder, 
    activeLabel, 
    setActiveLabel, 
    folderCounts, 
    openCompose 
  } = useEmail();

  const handleFolderClick = (id: FolderId) => {
    setActiveFolder(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLabelClick = (label: EmailLabel) => {
    if (activeLabel === label) {
      setActiveLabel(null);
    } else {
      setActiveLabel(label);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-60 h-full bg-slate-50/90 border-r border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={() => {
            openCompose();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full group flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>Compose</span>
        </button>
      </div>

      {/* Folders Navigation */}
      <div className="px-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Mailboxes
        </div>
        {FOLDERS.map(folder => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.id && !activeLabel;
          const count = folderCounts[folder.id];

          return (
            <button
              key={folder.id}
              onClick={() => handleFolderClick(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{folder.label}</span>
              </div>
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Labels / Categories */}
      <div className="px-3 mt-6 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Labels</span>
          <Tag className="w-3 h-3 text-slate-400" />
        </div>
        {LABELS.map(label => {
          const isSelected = activeLabel === label.name;

          return (
            <button
              key={label.name}
              onClick={() => handleLabelClick(label.name)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${label.bg}`} />
                <span>{label.name}</span>
              </div>
              {isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          );
        })}
      </div>

      {/* Storage and System Status */}
      <div className="mt-auto p-4 border-t border-slate-200 space-y-3 bg-white/60">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Storage
            </span>
            <span className="font-bold text-slate-700">1.4 GB / 15 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[12%]" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <button className="flex items-center gap-1.5 hover:text-slate-900 transition">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-slate-900 transition">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
