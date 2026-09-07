import { api } from './api';
import { Email } from '../types/email';

export type AiActionType =
  | 'OPEN_COMPOSE'
  | 'FILL_COMPOSE'
  | 'SEARCH_EMAILS'
  | 'FILTER_EMAILS'
  | 'OPEN_EMAIL'
  | 'PREPARE_REPLY'
  | 'NAVIGATE'
  | 'MARK_READ'
  | 'MARK_UNREAD'
  | 'STAR_EMAIL'
  | 'UNSTAR_EMAIL'
  | 'MOVE_EMAIL'
  | 'DELETE_EMAIL'
  | 'SUMMARIZE_EMAIL'
  | 'UNKNOWN';

export interface AiAction {
  type: AiActionType;
  payload: Record<string, unknown>;
}

export interface AiCommandResponse {
  action: AiAction;
}

function buildSelectedEmailContext(email: Email | null) {
  if (!email) return null;

  return {
    id: email.id,
    from: email.sender?.email || '',
    to: email.recipients?.[0] || '',
    subject: email.subject || '',
    snippet: email.snippet || '',
  };
}

function buildEmailSummary(email: Email | null) {
  if (!email) return null;

  return {
    id: email.id,
    from: email.sender?.name || email.sender?.email || '',
    subject: email.subject || '',
    snippet: email.snippet || '',
    timestamp: email.timestamp || '',
  };
}

export async function interpretAiCommand(
  message: string,
  currentView: string,
  selectedEmail: Email | null,
  activeFilters: Record<string, unknown> = {},
  options: {
    latestEmail?: Email | null;
    visibleEmails?: Email[];
    mailboxMode?: string;
  } = {},
): Promise<AiCommandResponse> {
  const visibleSummaries = (options.visibleEmails || [])
    .slice(0, 10)
    .map(e => buildEmailSummary(e))
    .filter(Boolean);

  const response = await api.post<AiCommandResponse>('/api/ai/command', {
    message,
    context: {
      currentView,
      selectedEmail: buildSelectedEmailContext(selectedEmail),
      latestEmail: buildEmailSummary(options.latestEmail || null),
      visibleEmails: visibleSummaries,
      mailboxMode: options.mailboxMode || 'REAL_GMAIL',
      activeFilters,
    },
  });

  return response.data;
}
