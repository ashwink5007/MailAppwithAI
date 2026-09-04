'use client';

import React from 'react';
import { 
  Star, 
  Paperclip, 
  Archive, 
  Trash2, 
  Mail, 
  MailOpen
} from 'lucide-react';
import { Email } from '../../types/email';
import { useEmail } from '../../context/EmailContext';

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, isSelected, onSelect }) => {
  const {
    selectedEmailIds,
    toggleSelectEmail,
    toggleStar,
    toggleRead,
    archiveEmails,
    deleteEmails,
  } = useEmail();

  const isChecked = selectedEmailIds.includes(email.id);

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Work': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Personal': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Finance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Social': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Promotions': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3.5 border-b border-slate-100 cursor-pointer transition-all duration-150 select-none ${
        isSelected
          ? 'bg-blue-50/90 border-l-4 border-l-blue-600 pl-[11px]'
          : !email.isRead
          ? 'bg-white hover:bg-slate-50 border-l-4 border-l-blue-500 pl-[11px]'
          : 'bg-white/60 hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectEmail(email.id);
          }}
          className="pt-0.5"
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {}}
            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
        </div>

        {/* Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(email.id);
          }}
          className="pt-0.5 text-slate-300 hover:text-amber-500 transition"
          title={email.isStarred ? 'Starred' : 'Star'}
        >
          <Star
            className={`w-4 h-4 ${
              email.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
            }`}
          />
        </button>

        {/* Sender and Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Unread indicator dot */}
              {!email.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              )}
              <span
                className={`text-xs truncate ${
                  !email.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                }`}
              >
                {email.sender.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[11px] ${!email.isRead ? 'font-bold text-blue-600' : 'text-slate-400'}`}>
                {email.timestamp}
              </span>
            </div>
          </div>

          {/* Subject */}
          <p
            className={`text-xs mt-1 truncate ${
              !email.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
            }`}
          >
            {email.subject}
          </p>

          {/* Snippet */}
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {email.snippet}
          </p>

          {/* Labels & Attachment Indicators */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {email.attachments && email.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                <Paperclip className="w-3 h-3 text-slate-400" />
                <span>{email.attachments.length}</span>
              </span>
            )}

            {email.labels.map(label => (
              <span
                key={label}
                className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getLabelColor(label)}`}
              >
                {label}
              </span>
            ))}

            {email.needsResponse && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                Needs Reply
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Quick Actions Overlay */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-3 hidden group-hover:flex items-center gap-1 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-lg border border-slate-200 shadow-md"
      >
        <button
          onClick={() => toggleRead(email.id)}
          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          title={email.isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {email.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => archiveEmails([email.id])}
          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Archive"
        >
          <Archive className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => deleteEmails([email.id])}
          className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
