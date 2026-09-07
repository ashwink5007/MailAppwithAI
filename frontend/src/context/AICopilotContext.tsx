'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIStatus, AIMessage, ActionProposal, SuggestedPrompt } from '../types/ai';
import { useEmail } from './EmailContext';
import { interpretAiCommand, AiAction } from '../services/aiService';
import { FolderId } from '../types/email';

interface AICopilotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  status: AIStatus;
  statusMessage: string;
  messages: AIMessage[];
  pendingAction: ActionProposal | null;
  suggestedPrompts: SuggestedPrompt[];
  sendMessage: (prompt: string) => Promise<void>;
  summarizeCurrentEmail: () => Promise<void>;
  draftReplyCurrentEmail: () => Promise<void>;
  findEmailsFromJohn: () => Promise<void>;
  showEmailsNeedingResponse: () => Promise<void>;
  proposeArchivePromotions: () => Promise<void>;
  confirmAction: (action: ActionProposal) => Promise<void>;
  cancelAction: () => void;
  clearChat: () => void;
}

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    timestamp: 'Just now',
    text: "Hello! I'm your AI Mail Copilot. I can navigate folders, filter emails, open compose, search, and more. Try: \"Show unread emails from this week\" or \"Compose a new email\".",
  },
];

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p-summarize',
    label: 'Summarize this email',
    promptText: 'Summarize this email thread and highlight action items.',
    requiresSelectedEmail: true,
  },
  {
    id: 'p-draft',
    label: 'Draft a reply',
    promptText: 'Draft a polite and constructive reply to this email.',
    requiresSelectedEmail: true,
  },
  {
    id: 'p-unread-week',
    label: 'Unread this week',
    promptText: 'Show unread emails from this week.',
  },
  {
    id: 'p-sent',
    label: 'Go to Sent',
    promptText: 'Go to sent emails.',
  },
  {
    id: 'p-compose',
    label: 'Compose email',
    promptText: 'Compose a new email.',
  },
];

/**
 * Builds a human-readable confirmation message after an action is executed.
 */
function describeExecutedAction(action: AiAction): string {
  switch (action.type) {
    case 'NAVIGATE': {
      const view = String(action.payload?.view || '').toLowerCase();
      return `Navigated to your ${view} folder.`;
    }
    case 'OPEN_COMPOSE':
      return 'Compose window opened. Ready for you to write.';
    case 'FILL_COMPOSE': {
      const to = action.payload?.to ? `to ${action.payload.to}` : '';
      const subject = action.payload?.subject ? `, subject: "${action.payload.subject}"` : '';
      return `Compose window opened${to ? ' ' + to : ''}${subject}. Review and send when ready.`;
    }
    case 'FILTER_EMAILS': {
      const parts: string[] = [];
      if (action.payload?.unread === true || action.payload?.isUnread === true) parts.push('unread');
      if (action.payload?.sender) parts.push(`from "${action.payload.sender}"`);
      if (action.payload?.keyword) parts.push(`containing "${action.payload.keyword}"`);
      if (action.payload?.dateRange) parts.push(`in range: ${String(action.payload.dateRange).replace(/_/g, ' ').toLowerCase()}`);
      return parts.length > 0
        ? `Inbox filtered — showing emails ${parts.join(', ')}.`
        : 'Inbox filter applied.';
    }
    case 'SEARCH_EMAILS': {
      const q = action.payload?.query || action.payload?.keyword || '';
      return q ? `Searching for "${q}"…` : 'Search applied.';
    }
    case 'OPEN_EMAIL':
      return 'Opening the email for you.';
    case 'PREPARE_REPLY':
      return 'Compose window opened with reply context. Complete and send when ready.';
    case 'MARK_READ':
      return 'Marked email as read.';
    case 'MARK_UNREAD':
      return 'Marked email as unread.';
    case 'STAR_EMAIL':
      return 'Starred email.';
    case 'UNSTAR_EMAIL':
      return 'Unstarred email.';
    case 'MOVE_EMAIL': {
      const folder = String(action.payload?.folder || 'archive');
      return `Moved email to ${folder}.`;
    }
    case 'DELETE_EMAIL':
      return 'Email moved to trash.';
    case 'SUMMARIZE_EMAIL':
      return 'Here is a summary of the selected conversation:';
    case 'UNKNOWN': {
      const reason = action.payload?.reason ? String(action.payload.reason) : '';
      return reason
        ? reason
        : "I wasn't sure what you meant. Could you rephrase? Try commands like \"show unread\", \"go to sent\", or \"compose email\".";
    }
    default:
      return 'Action received.';
  }
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [status, setStatus] = useState<AIStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [pendingAction, setPendingAction] = useState<ActionProposal | null>(null);

  const {
    selectedEmail,
    activeFolder,
    activeLabel,
    filterTab,
    emails,
    filteredEmails,
    mailboxMode,
    setActiveFolder,
    setSearchQuery,
    setFilterTab,
    setAiDateRange,
    openCompose,
    setSelectedEmailId,
    markAsRead,
    markAsUnread,
    toggleStar,
    deleteEmails,
    archiveEmails,
  } = useEmail();

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setStatus('idle');
    setStatusMessage('');
    setPendingAction(null);
  }, []);

  /**
   * Executes the action returned by the backend Gemini AI,
   * updating React state directly (NO DOM automation).
   */
  const executeAction = useCallback(async (action: AiAction) => {
    switch (action.type) {
      case 'NAVIGATE': {
        const view = String(action.payload?.view || 'INBOX').toLowerCase();
        const folderMap: Record<string, FolderId> = {
          inbox: 'inbox',
          sent: 'sent',
          compose: 'inbox',
          drafts: 'drafts',
          spam: 'spam',
          trash: 'trash',
          starred: 'starred',
          important: 'important',
        };
        const folder = folderMap[view] || 'inbox';
        setActiveFolder(folder);
        if (view === 'compose') {
          setTimeout(() => openCompose(), 50);
        }
        break;
      }

      case 'OPEN_COMPOSE':
        openCompose();
        break;

      case 'FILL_COMPOSE': {
        const p = action.payload || {};
        openCompose({
          to: typeof p.to === 'string' ? p.to : undefined,
          subject: typeof p.subject === 'string' ? p.subject : undefined,
          body: typeof p.body === 'string' ? p.body : undefined,
        });
        break;
      }

      case 'FILTER_EMAILS': {
        const p = action.payload || {};
        const unread = p.unread === true || p.isUnread === true;
        const sender = typeof p.sender === 'string' ? p.sender : '';
        const keyword = typeof p.keyword === 'string' ? p.keyword : '';
        const dateRange = typeof p.dateRange === 'string' ? p.dateRange : null;

        setActiveFolder('inbox');
        setFilterTab(unread ? 'unread' : 'all');
        setSearchQuery(sender || keyword);
        setAiDateRange(dateRange);
        break;
      }

      case 'SEARCH_EMAILS': {
        const p = action.payload || {};
        const query = typeof p.query === 'string' ? p.query
          : typeof p.keyword === 'string' ? p.keyword
          : typeof p.sender === 'string' ? p.sender : '';
        setSearchQuery(query);
        break;
      }

      case 'OPEN_EMAIL': {
        const p = action.payload || {};
        const emailId = typeof p.emailId === 'string' ? p.emailId : null;
        if (emailId) {
          setSelectedEmailId(emailId);
        } else if (p.sender || p.keyword) {
          const query = String(p.sender || p.keyword || '').toLowerCase();
          const match = emails.find(e =>
            e.sender.name.toLowerCase().includes(query) ||
            e.sender.email.toLowerCase().includes(query) ||
            e.subject.toLowerCase().includes(query)
          );
          if (match) setSelectedEmailId(match.id);
        }
        break;
      }

      case 'PREPARE_REPLY': {
        if (selectedEmail) {
          openCompose({
            to: selectedEmail.sender.email,
            subject: selectedEmail.subject.startsWith('Re:')
              ? selectedEmail.subject
              : `Re: ${selectedEmail.subject}`,
          });
        }
        break;
      }

      case 'MARK_READ': {
        const targetId = typeof action.payload?.emailId === 'string' ? action.payload.emailId : selectedEmail?.id;
        if (targetId) await markAsRead([targetId]);
        break;
      }

      case 'MARK_UNREAD': {
        const targetId = typeof action.payload?.emailId === 'string' ? action.payload.emailId : selectedEmail?.id;
        if (targetId) await markAsUnread([targetId]);
        break;
      }

      case 'STAR_EMAIL':
      case 'UNSTAR_EMAIL': {
        const targetId = typeof action.payload?.emailId === 'string' ? action.payload.emailId : selectedEmail?.id;
        if (targetId) await toggleStar(targetId);
        break;
      }

      case 'MOVE_EMAIL': {
        const targetId = typeof action.payload?.emailId === 'string' ? action.payload.emailId : selectedEmail?.id;
        const targetFolder = String(action.payload?.folder || 'archive').toLowerCase();
        if (targetId) {
          if (targetFolder === 'trash') {
            await deleteEmails([targetId]);
          } else {
            archiveEmails([targetId]);
          }
        }
        break;
      }

      case 'DELETE_EMAIL': {
        const targetId = typeof action.payload?.emailId === 'string' ? action.payload.emailId : selectedEmail?.id;
        if (targetId) {
          await deleteEmails([targetId]);
        }
        break;
      }

      case 'SUMMARIZE_EMAIL':
      case 'UNKNOWN':
      default:
        break;
    }
  }, [
    setActiveFolder, openCompose, setFilterTab, setSearchQuery,
    setAiDateRange, setSelectedEmailId, emails, selectedEmail,
    markAsRead, markAsUnread, toggleStar, deleteEmails, archiveEmails,
  ]);

  const executeBackendCommand = useCallback(async (userText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp,
      text: userText,
    }]);
    setStatus('thinking');
    setStatusMessage('Analyzing your request…');

    try {
      const currentView = selectedEmail ? 'EMAIL_DETAIL' : activeFolder.toUpperCase();
      const firstInbox = emails.find(e => e.folder === 'inbox') || emails[0] || null;

      setStatusMessage('Sending to AI Copilot…');
      const result = await interpretAiCommand(
        userText,
        currentView,
        selectedEmail,
        {
          activeFolder,
          activeLabel,
          filterTab,
        },
        {
          latestEmail: firstInbox,
          visibleEmails: filteredEmails,
          mailboxMode,
        }
      );

      setStatus('executing');
      setStatusMessage('Applying action…');

      // Execute the action through React state (NO DOM automation)
      await executeAction(result.action);

      setStatus('completed');
      setStatusMessage('Done.');

      let summaryBullets: string[] | undefined = undefined;
      if (result.action.type === 'SUMMARIZE_EMAIL' && selectedEmail) {
        summaryBullets = [
          `Topic: ${selectedEmail.subject}`,
          `Sender: ${selectedEmail.sender.name} (${selectedEmail.sender.email})`,
          `Key point: ${selectedEmail.snippet}`,
          selectedEmail.needsResponse ? 'Action item: Response requested.' : 'Action item: Informational only, no reply needed.',
        ];
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: describeExecutedAction(result.action),
        summaryBullets,
      }]);
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to reach AI Copilot.';
      setStatusMessage(errorMessage);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `I couldn't process that request. ${errorMessage}`,
      }]);
    } finally {
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 2000);
    }
  }, [activeFolder, activeLabel, filterTab, selectedEmail, emails, filteredEmails, mailboxMode, executeAction]);

  const summarizeCurrentEmail = useCallback(() =>
    executeBackendCommand('Summarize this email thread and highlight action items.'),
    [executeBackendCommand]);
  const draftReplyCurrentEmail = useCallback(() =>
    executeBackendCommand('Draft a reply to this email.'),
    [executeBackendCommand]);
  const findEmailsFromJohn = useCallback(() =>
    executeBackendCommand('Find unread emails from John.'),
    [executeBackendCommand]);
  const showEmailsNeedingResponse = useCallback(() =>
    executeBackendCommand('Show emails that need my response.'),
    [executeBackendCommand]);
  const proposeArchivePromotions = useCallback(() =>
    executeBackendCommand('Show promotional and marketing emails.'),
    [executeBackendCommand]);

  const confirmAction = useCallback(async (action: ActionProposal) => {
    setStatus('completed');
    setStatusMessage('Action confirmed.');
    setPendingAction(null);
    if (action.type === 'delete_emails') {
      await deleteEmails(action.targetEmailIds);
    } else if (action.type === 'mark_read') {
      await markAsRead(action.targetEmailIds);
    }
    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Confirmed and executed **${action.title}**.`,
      },
    ]);
    setTimeout(() => setStatus('idle'), 2000);
  }, [deleteEmails, markAsRead]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Action cancelled. No changes were made to your mailbox.',
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt) await executeBackendCommand(trimmedPrompt);
  }, [executeBackendCommand]);

  return (
    <AICopilotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        status,
        statusMessage,
        messages,
        pendingAction,
        suggestedPrompts: SUGGESTED_PROMPTS,
        sendMessage,
        summarizeCurrentEmail,
        draftReplyCurrentEmail,
        findEmailsFromJohn,
        showEmailsNeedingResponse,
        proposeArchivePromotions,
        confirmAction,
        cancelAction,
        clearChat,
      }}
    >
      {children}
    </AICopilotContext.Provider>
  );
};

export const useAICopilot = () => {
  const context = useContext(AICopilotContext);
  if (!context) {
    throw new Error('useAICopilot must be used within an AICopilotProvider');
  }
  return context;
};
