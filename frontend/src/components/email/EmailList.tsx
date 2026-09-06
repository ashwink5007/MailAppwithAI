'use client';

import React from 'react';
import { Mail, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { EmailFilters } from './EmailFilters';
import { EmailCard } from './EmailCard';

interface EmailListProps {
  onSelectEmailMobile?: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({ onSelectEmailMobile }) => {
  const {
    filteredEmails,
    selectedEmailId,
    setSelectedEmailId,
    markAsRead,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    errorMessage,
    retryLoad,
  } = useEmail();

  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);
    const email = filteredEmails.find(item => item.id === id);
    if (email && !email.isRead) {
      try {
        await markAsRead([id]);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to mark email as read.');
      }
    }
    if (onSelectEmailMobile) {
      onSelectEmailMobile();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-200 min-w-0">
      {/* Top Filter and Actions Bar */}
      <EmailFilters />

      {/* Email List Scrollable Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Loading emails...</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Fetching your mailbox from the backend.
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3 shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Unable to load emails</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {errorMessage || 'Please check if the backend is running on port 8080.'}
            </p>
            <button
              onClick={retryLoad}
              className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Email List */}
        {!isLoading && !isError && filteredEmails.length > 0 && (
          filteredEmails.map(email => (
            <EmailCard
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onSelect={() => handleSelectEmail(email.id)}
            />
          ))
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredEmails.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 shadow-sm">
              {searchQuery ? <Search className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
            </div>
            <h3 className="text-sm font-bold text-slate-800">No emails found</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {searchQuery
                ? `No emails matched "${searchQuery}". Try clearing your search query.`
                : 'This mailbox is currently clean and empty.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Clear Search Query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
