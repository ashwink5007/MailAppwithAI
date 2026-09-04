'use client';

import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useAICopilot } from '../../context/AICopilotContext';

export const ChatInput: React.FC = () => {
  const { sendMessage, status, suggestedPrompts } = useAICopilot();
  const [text, setText] = useState('');

  const isBusy = status !== 'idle';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isBusy) return;
    const q = text;
    setText('');
    await sendMessage(q);
  };

  return (
    <div className="p-3 border-t border-slate-200 bg-white space-y-2.5">
      {/* Quick Prompt Pill Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {suggestedPrompts.map(prompt => (
          <button
            key={prompt.id}
            onClick={() => sendMessage(prompt.promptText)}
            disabled={isBusy}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 text-[11px] font-bold border border-blue-200 transition shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isBusy ? 'Copilot is working...' : 'Ask Copilot or type a command...'}
          disabled={isBusy}
          className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-xs pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 placeholder:text-slate-400 transition shadow-inner font-medium"
        />
        <button
          type="submit"
          disabled={!text.trim() || isBusy}
          className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition shadow-sm"
          title="Send prompt"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
