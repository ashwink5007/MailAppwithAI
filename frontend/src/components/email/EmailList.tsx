'use client';

import React from 'react';
import { Mail, Search } from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { EmailFilters } from './EmailFilters';
import { EmailCard } from './EmailCard';

interface EmailListProps {
  onSelectEmailMobile?: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({ onSelectEmailMobile }) => {
  const { filteredEmails, selectedEmailId, setSelectedEmailId, searchQuery, setSearchQuery } = useEmail();

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
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
        {filteredEmails.length > 0 ? (
          filteredEmails.map(email => (
            <EmailCard
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onSelect={() => handleSelectEmail(email.id)}
            />
          ))
        ) : (
          /* Empty State */
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
