'use client';

import React from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIStatus } from '../../types/ai';

interface ActionStatusProps {
  status: AIStatus;
  message?: string;
}

export const ActionStatus: React.FC<ActionStatusProps> = ({ status, message }) => {
  if (status === 'idle') return null;

  const getStepIndex = () => {
    switch (status) {
      case 'thinking': return 0;
      case 'processing': return 1;
      case 'executing': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Thinking', key: 'thinking' },
    { label: 'Processing', key: 'processing' },
    { label: 'Executing', key: 'executing' },
    { label: 'Completed', key: 'completed' },
  ];

  const currentIdx = getStepIndex();

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-3.5 shadow-md shadow-blue-500/10 backdrop-blur-md transition-all">
      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          const isPassed = idx < currentIdx || status === 'completed';

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isPassed
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-200'
                      : isCurrent
                      ? 'bg-blue-600 text-white animate-pulse ring-2 ring-blue-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isPassed ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold hidden sm:inline ${
                    isCurrent ? 'text-blue-700' : isPassed ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Dynamic Status Bar */}
      <div className="flex items-center gap-2.5 pt-1 text-xs">
        {status === 'thinking' && (
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Sparkles className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>{message || 'Analyzing context and formulating intent...'}</span>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>{message || 'Processing message payload and action steps...'}</span>
          </div>
        )}

        {status === 'executing' && (
          <div className="flex items-center gap-2 text-sky-700 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
            <span>{message || 'Executing requested action in mailbox...'}</span>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message || 'Action completed successfully.'}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{message || 'An error occurred while executing the request.'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
