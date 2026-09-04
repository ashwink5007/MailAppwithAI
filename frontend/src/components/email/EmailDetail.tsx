'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  Mail, 
  Star, 
  AlertCircle, 
  Reply, 
  ReplyAll, 
  Forward, 
  Paperclip, 
  Download, 
  Sparkles, 
  Send, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { useAICopilot } from '../../context/AICopilotContext';

interface EmailDetailProps {
  onBackMobile?: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ onBackMobile }) => {
  const { 
    selectedEmail, 
    toggleStar, 
    toggleImportant, 
    toggleRead, 
    archiveEmails, 
    deleteEmails,
    sendReply,
    openCompose
  } = useEmail();

  const { draftReplyCurrentEmail, summarizeCurrentEmail } = useAICopilot();

  const [replyText, setReplyText] = useState('');
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  if (!selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center h-full">
        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
          <Mail className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Select an email to view</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Choose a conversation from the list to read the full thread, view attachments, or ask AI Copilot to summarize.
        </p>
      </div>
    );
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendReply(selectedEmail.id, replyText);
    setReplyText('');
    setIsReplyOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 min-w-0 overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-1.5">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Back to list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => archiveEmails([selectedEmail.id])}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteEmails([selectedEmail.id])}
            className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleRead(selectedEmail.id)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title={selectedEmail.isRead ? 'Mark unread' : 'Mark read'}
          >
            <Mail className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          <button
            onClick={() => toggleStar(selectedEmail.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-500 transition"
            title={selectedEmail.isStarred ? 'Starred' : 'Star'}
          >
            <Star
              className={`w-4 h-4 ${
                selectedEmail.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>
          <button
            onClick={() => toggleImportant(selectedEmail.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 transition"
            title={selectedEmail.isImportant ? 'Important' : 'Mark important'}
          >
            <AlertCircle
              className={`w-4 h-4 ${
                selectedEmail.isImportant ? 'text-amber-600 fill-amber-500/20' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* AI Quick Actions on Thread */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => summarizeCurrentEmail()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Summarize</span>
          </button>
          <button
            onClick={() => draftReplyCurrentEmail()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Draft Reply</span>
          </button>
        </div>
      </div>

      {/* Main Thread Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Thread Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {selectedEmail.labels.map(label => (
              <span
                key={label}
                className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold"
              >
                {label}
              </span>
            ))}
            {selectedEmail.needsResponse && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                Action Required
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {selectedEmail.subject}
          </h1>
        </div>

        {/* Conversation Thread Messages */}
        <div className="space-y-4">
          {selectedEmail.thread.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:border-slate-300 transition"
            >
              {/* Message Sender Header */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {msg.sender.avatar ? (
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-100">
                      {msg.sender.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{msg.sender.name}</span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">&lt;{msg.sender.email}&gt;</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        TLS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      To: {msg.recipients.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">{msg.fullDate}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="pt-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                {msg.body}
              </div>

              {/* Attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attachments ({msg.attachments.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.attachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            {att.type === 'pdf' ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600">
                              {att.name}
                            </p>
                            <span className="text-[10px] text-slate-500">{att.size}</span>
                          </div>
                        </div>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons: Reply, Reply All, Forward */}
        {!isReplyOpen ? (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsReplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
            <button
              onClick={() => setIsReplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 shadow-xs transition"
            >
              <ReplyAll className="w-4 h-4" />
              <span>Reply All</span>
            </button>
            <button
              onClick={() => {
                openCompose({
                  subject: `Fwd: ${selectedEmail.subject}`,
                  body: `\n\n---------- Forwarded message ---------\nFrom: ${selectedEmail.sender.name} <${selectedEmail.sender.email}>\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.thread[0]?.body || ''}`,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 shadow-xs transition"
            >
              <Forward className="w-4 h-4" />
              <span>Forward</span>
            </button>
          </div>
        ) : (
          /* Inline Quick Reply Box */
          <form
            onSubmit={handleSendReply}
            className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Reply className="w-4 h-4 text-blue-600" />
                <span>Replying to {selectedEmail.sender.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  openCompose({
                    to: selectedEmail.sender.email,
                    subject: `Re: ${selectedEmail.subject}`,
                    body: replyText,
                  });
                  setIsReplyOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Pop out to full compose"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply or click AI Copilot above to generate a draft..."
              className="w-full bg-slate-50 text-slate-900 text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y"
              autoFocus
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => draftReplyCurrentEmail()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Draft Assist</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplyOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
