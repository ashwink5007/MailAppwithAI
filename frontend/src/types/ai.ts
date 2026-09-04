export type AIStatus = 'idle' | 'thinking' | 'processing' | 'executing' | 'completed' | 'error';

export interface ActionProposal {
  id: string;
  type: 'archive_promotions' | 'mark_read' | 'delete_emails' | 'filter_sender' | 'summarize_thread' | 'draft_reply';
  title: string;
  description: string;
  targetEmailIds: string[];
  destructive: boolean;
  executed?: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  summaryBullets?: string[];
  suggestedReply?: {
    subject: string;
    body: string;
  };
  actionProposal?: ActionProposal;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  promptText: string;
  requiresSelectedEmail?: boolean;
}
