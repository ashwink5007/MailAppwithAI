'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  RotateCcw, 
  Bot, 
  User, 
  Check, 
  Copy, 
  CornerDownRight, 
  FileCheck2,
  MailCheck
} from 'lucide-react';
import { useAICopilot } from '../../context/AICopilotContext';
import { useEmail } from '../../context/EmailContext';
import { ActionStatus } from './ActionStatus';
import { ActionConfirmation } from './ActionConfirmation';
import { ChatInput } from './ChatInput';

export const AssistantPanel: React.FC = () => {
  const { 
    isOpen, 
    toggleOpen, 
    status, 
    statusMessage, 
    messages, 
    confirmAction, 
    cancelAction, 
    clearChat 
  } = useAICopilot();

  const { selectedEmail, openCompose } = useEmail();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  if (!isOpen) return null;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertIntoCompose = (reply: { subject: string; body: string }) => {
    openCompose({
      to: selectedEmail?.sender.email,
      subject: reply.subject,
      body: reply.body,
    });
  };

  return (
    <aside className="w-full h-full bg-slate-50/90 border-l border-slate-200 flex flex-col shrink-0 z-20 shadow-xl backdrop-blur-xl min-w-0">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">AI Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
              {selectedEmail ? `Reading: ${selectedEmail.subject}` : 'Inbox Overview'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleOpen}
            className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition"
            title="Collapse Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      {selectedEmail && (
        <div className="px-3.5 py-2 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-blue-700 min-w-0 font-bold">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <span className="truncate">Context: {selectedEmail.sender.name}</span>
          </div>
          <span className="text-slate-400 shrink-0 text-[10px] font-medium">{selectedEmail.timestamp}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender tag & avatar */}
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
              {msg.sender === 'user' ? (
                <>
                  <span className="font-semibold text-slate-600">You</span>
                  <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[9px] text-slate-700">
                    <User className="w-2.5 h-2.5" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-bold text-blue-600">Copilot</span>
                </>
              )}
              <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-3.5 text-xs max-w-[92%] leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/20 font-medium'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm font-normal'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Summary Bullets Card */}
              {msg.summaryBullets && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {msg.summaryBullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                        <span className="text-blue-600 mt-0.5 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Reply Card */}
              {msg.suggestedReply && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-blue-100">
                    <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                      <MailCheck className="w-3.5 h-3.5 text-blue-600" />
                      Generated Draft
                    </span>
                    <button
                      onClick={() => handleCopyText(msg.id, msg.suggestedReply!.body)}
                      className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-800 font-mono bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap break-words">
                    {msg.suggestedReply.body}
                  </div>
                  <button
                    onClick={() => handleInsertIntoCompose(msg.suggestedReply!)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Insert into Compose Window</span>
                  </button>
                </div>
              )}

              {/* Action Proposal Confirmation in Message */}
              {msg.actionProposal && !msg.actionProposal.executed && (
                <div className="mt-3">
                  <ActionConfirmation
                    proposal={msg.actionProposal}
                    onConfirm={() => confirmAction(msg.actionProposal!)}
                    onCancel={cancelAction}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic Status Progress Card */}
        {status !== 'idle' && (
          <div className="pt-1">
            <ActionStatus status={status} message={statusMessage} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Copilot Chat Input with suggested prompt buttons */}
      <ChatInput />
    </aside>
  );
};
