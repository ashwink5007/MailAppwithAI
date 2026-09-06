'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Send, 
  Paperclip, 
  Sparkles, 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Link2
} from 'lucide-react';
import { useEmail } from '../../context/EmailContext';
import { useAuth } from '../../context/AuthContext';

export const ComposeEmail: React.FC = () => {
  const { isComposeOpen, closeCompose, composeData, sendEmail } = useEmail();
  const { user } = useAuth();

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Compose data is supplied by the context when opening a forwarded/replied message.
  useEffect(() => {
    if (composeData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (composeData.to) setTo(composeData.to);
      if (composeData.subject) setSubject(composeData.subject);
      if (composeData.body) setBody(composeData.body);
    }
  }, [composeData]);

  if (!isComposeOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    if (!to.trim()) {
      alert('Please specify at least one recipient.');
      return;
    }

    setIsSending(true);
    try {
      await sendEmail({
        to,
        cc: showCc ? cc : undefined,
        bcc: showBcc ? bcc : undefined,
        subject,
        body,
      });

      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setAttachedFiles([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachDummy = () => {
    setAttachedFiles(prev => [...prev, `Project_Brief_${prev.length + 1}.pdf`]);
  };

  const handleAIDraftAssist = () => {
    setBody(prev => 
      prev 
        ? `${prev}\n\n[AI enhanced]: Let me know if the proposed schedule works for your calendar.` 
        : `Hi there,\n\nI am writing to share the updated project deliverables and schedule.\n\nPlease review the attached specifications and let me know if you have any questions before our sync.\n\nBest regards,\nAlex`
    );
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-200 shadow-2xl flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden ${
        isMaximized
          ? 'inset-4 md:inset-10'
          : isMinimized
          ? 'bottom-0 right-4 md:right-8 w-80 h-14'
          : 'bottom-0 right-4 md:right-8 w-full max-w-lg md:max-w-xl h-[540px]'
      }`}
    >
      {/* Compose Header Bar */}
      <div className="h-12 bg-slate-50 px-4 flex items-center justify-between border-b border-slate-200 select-none cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">New Message</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:text-slate-900 rounded hover:bg-slate-200 transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {!isMinimized && (
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:text-slate-900 rounded hover:bg-slate-200 transition"
              title={isMaximized ? 'Restore size' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={closeCompose}
            className="p-1 hover:text-rose-600 rounded hover:bg-slate-200 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      {!isMinimized && (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-white">
          {/* From Field */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 text-xs bg-slate-50/50">
            <span className="text-slate-400 w-12 font-medium">From:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {user?.email || 'user@gmail.com'}
            </span>
          </div>

          {/* To Field */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-400 w-12 font-medium">To:</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              required
            />
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-blue-600 transition"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-blue-600 transition"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-center px-4 py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-400 w-12 font-medium">Cc:</span>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="flex items-center px-4 py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-400 w-12 font-medium">Bcc:</span>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="hidden@example.com"
                className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-400 w-12 font-medium">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
            />
          </div>

          {/* Formatting Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-slate-500 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="Insert Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleAttachDummy}
                className="p-1 rounded hover:text-slate-900 hover:bg-slate-200"
                title="Attach file"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Assistant Button inside editor */}
            <button
              type="button"
              onClick={handleAIDraftAssist}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>AI Draft</span>
            </button>
          </div>

          {/* Attached files pills */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50">
              {attachedFiles.map((file, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-[11px] border border-slate-200 shadow-2xs font-medium"
                >
                  <Paperclip className="w-3 h-3 text-slate-400" />
                  {file}
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Message Textarea */}
          <div className="flex-1 p-4 min-h-[140px]">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              className="w-full h-full bg-transparent text-slate-800 text-sm focus:outline-none resize-none placeholder:text-slate-400 leading-relaxed font-normal"
            />
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 ring-1 ring-blue-400 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>

              <button
                type="button"
                onClick={handleAttachDummy}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
                title="Add attachment"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={closeCompose}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition"
              title="Discard draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
