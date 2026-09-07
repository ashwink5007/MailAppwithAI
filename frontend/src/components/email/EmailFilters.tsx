'use client';

import React from 'react';
import { 
  CheckSquare, 
  Square, 
  MinusSquare, 
  MailOpen, 
  Mail, 
  Archive, 
  Trash2
} from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { EmailFilterTab } from '../../types/email';

export const EmailFilters: React.FC = () => {
  const {
    activeFolder,
    activeLabel,
    filterTab,
    setFilterTab,
    filteredEmails,
    selectedEmailIds,
    selectAllEmails,
    markAsRead,
    markAsUnread,
    archiveEmails,
    deleteEmails,
  } = useEmail();

  const isAllSelected = filteredEmails.length > 0 && selectedEmailIds.length === filteredEmails.length;
  const isPartiallySelected = selectedEmailIds.length > 0 && !isAllSelected;

  const handleSelectAllToggle = () => {
    if (isAllSelected || isPartiallySelected) {
      selectAllEmails(false);
    } else {
      selectAllEmails(true);
    }
  };

  const titleText = activeLabel ? `Label: ${activeLabel}` : activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1);

  return (
    <div className="border-b border-slate-200 bg-slate-50/80 px-3 sm:px-4 py-2.5 flex flex-col gap-2 min-w-0">
      {/* Top row: Folder name & count */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">{titleText}</h2>
          <span className="text-xs text-slate-500 font-semibold shrink-0">({filteredEmails.length})</span>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-medium overflow-x-auto no-scrollbar max-w-full shrink-0">
          {(['all', 'unread', 'starred', 'important'] as EmailFilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-2.5 py-1.5 sm:py-1 rounded-lg capitalize transition-all whitespace-nowrap ${
                filterTab === tab
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Multi-selection & Batch Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap min-h-[30px] pt-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Select all toggle button */}
          <button
            onClick={handleSelectAllToggle}
            className="p-1 rounded text-slate-500 hover:text-slate-900 transition"
            title={isAllSelected ? 'Deselect all' : 'Select all'}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : isPartiallySelected ? (
              <MinusSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {selectedEmailIds.length > 0 ? (
            <div className="flex items-center gap-1 sm:gap-2 text-xs flex-wrap min-w-0">
              <span className="font-bold text-blue-600">{selectedEmailIds.length} selected</span>
              <div className="h-3 w-[1px] bg-slate-200 mx-1" />
              <button
                onClick={() => markAsRead(selectedEmailIds)}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition font-medium"
                title="Mark as read"
              >
                <MailOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>
              <button
                onClick={() => markAsUnread(selectedEmailIds)}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition font-medium"
                title="Mark as unread"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark Unread</span>
              </button>
              <button
                onClick={() => archiveEmails(selectedEmailIds)}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition font-medium"
                title="Archive"
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Archive</span>
              </button>
              <button
                onClick={() => deleteEmails(selectedEmailIds)}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition font-medium"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Select conversations for batch actions</span>
          )}
        </div>
      </div>
    </div>
  );
};
