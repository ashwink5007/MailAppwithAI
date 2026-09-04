'use client';

import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
import { ActionProposal } from '../../types/ai';

interface ActionConfirmationProps {
  proposal: ActionProposal;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionConfirmation: React.FC<ActionConfirmationProps> = ({
  proposal,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Confirmation Required
          </h4>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{proposal.title}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {proposal.description}
          </p>
          <div className="text-[11px] text-amber-700 mt-2 font-bold">
            Affected items: {proposal.targetEmailIds.length} conversation(s)
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-amber-100/50 transition"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Confirm & Execute</span>
        </button>
      </div>
    </div>
  );
};
