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
    from: email.sender.email,
    to: email.recipients[0] || '',
    subject: email.subject,
    snippet: email.snippet,
  };
}

export async function interpretAiCommand(
  message: string,
  currentView: string,
  selectedEmail: Email | null,
  activeFilters: Record<string, unknown> = {},
): Promise<AiCommandResponse> {
  const response = await api.post<AiCommandResponse>('/api/ai/command', {
    message,
    context: {
      currentView,
      selectedEmail: buildSelectedEmailContext(selectedEmail),
      activeFilters,
    },
  });

  return response.data;
}
