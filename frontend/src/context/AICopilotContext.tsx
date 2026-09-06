'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIStatus, AIMessage, ActionProposal, SuggestedPrompt } from '../types/ai';
import { useEmail } from './EmailContext';

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
    text: "Hello Alex! I am your AI Copilot. I can summarize complex threads, draft thoughtful replies, categorize tasks, and execute bulk inbox operations.",
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
    id: 'p-john',
    label: 'Find unread from John',
    promptText: 'Find unread emails from John Miller.',
  },
  {
    id: 'p-action-needed',
    label: 'Emails needing response',
    promptText: 'Show emails that need my response.',
  },
  {
    id: 'p-archive-promo',
    label: 'Archive promotions',
    promptText: 'Archive all promotional and marketing emails.',
  },
];

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [status, setStatus] = useState<AIStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [pendingAction, setPendingAction] = useState<ActionProposal | null>(null);

  const {
    selectedEmail,
    emails,
    setSearchQuery,
    setFilterTab,
    archiveEmails,
    setActiveFolder,
    openCompose,
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

  const runWithPhases = async (
    userText: string,
    steps: { thinking: string; processing: string; executing?: string },
    generateResponse: () => AIMessage
  ) => {
    // Add user message
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText,
    };
    setMessages(prev => [...prev, userMsg]);

    // 1. Thinking
    setStatus('thinking');
    setStatusMessage(steps.thinking);
    await new Promise(r => setTimeout(r, 650));

    // 2. Processing
    setStatus('processing');
    setStatusMessage(steps.processing);
    await new Promise(r => setTimeout(r, 750));

    // 3. Executing (if present)
    if (steps.executing) {
      setStatus('executing');
      setStatusMessage(steps.executing);
      await new Promise(r => setTimeout(r, 600));
    }

    // 4. Completed
    setStatus('completed');
    setStatusMessage('Done!');
    const aiResponse = generateResponse();
    setMessages(prev => [...prev, aiResponse]);

    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 1800);
  };

  const summarizeCurrentEmail = useCallback(async () => {
    if (!selectedEmail) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'Please select an email first so I can analyze its content.',
        },
      ]);
      return;
    }

    await runWithPhases(
      `Summarize: "${selectedEmail.subject}"`,
      {
        thinking: 'Parsing email thread and sender context...',
        processing: 'Extracting key takeaways, dates, and deliverables...',
      },
      () => ({
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Here is a structured executive summary for **${selectedEmail.subject}**:`,
        summaryBullets: [
          `**Sender**: ${selectedEmail.sender.name} (${selectedEmail.sender.email})`,
          `**Core Topic**: Discussion on milestone timelines, architecture deliverables, and budget approval.`,
          `**Key Takeaways**: Security audit cleared cloud migration, liberating $45k for front-end optimizations.`,
          `**Action Required**: Feedback requested by tomorrow afternoon before executive presentation.`,
        ],
      })
    );
  }, [selectedEmail]);

  const draftReplyCurrentEmail = useCallback(async () => {
    if (!selectedEmail) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'Please select an email thread first to generate a contextual draft.',
        },
      ]);
      return;
    }

    const replySubject = selectedEmail.subject.startsWith('Re:')
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject}`;

    const replyBody = `Hi ${selectedEmail.sender.name.split(' ')[0]},\n\nThank you for the detailed update and the attachments. I've reviewed the points and everything looks aligned with our Q3 commitments.\n\nThe cloud sandbox migration approval is fantastic news. Let's proceed with the vendor onboarding and I will share final slide notes tomorrow morning.\n\nBest regards,\nAlex`;

    await runWithPhases(
      `Draft reply to ${selectedEmail.sender.name}`,
      {
        thinking: 'Analyzing tone and previous messages in thread...',
        processing: 'Formulating professional, constructive response...',
      },
      () => ({
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I've prepared a draft reply tailored to **${selectedEmail.sender.name}**:`,
        suggestedReply: {
          subject: replySubject,
          body: replyBody,
        },
      })
    );
  }, [selectedEmail]);

  const findEmailsFromJohn = useCallback(async () => {
    await runWithPhases(
      'Find unread emails from John',
      {
        thinking: 'Scanning contacts and index for "John"...',
        processing: 'Filtering active unread messages...',
        executing: 'Applying search view to mail client...',
      },
      () => {
        setSearchQuery('John');
        setFilterTab('unread');
        setActiveFolder('inbox');
        const count = emails.filter(
          e => e.sender.name.toLowerCase().includes('john') && !e.isRead
        ).length;

        return {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Found **${count} unread email(s)** from John Miller. I have filtered your inbox view to display them.`,
        };
      }
    );
  }, [emails, setSearchQuery, setFilterTab, setActiveFolder]);

  const showEmailsNeedingResponse = useCallback(async () => {
    await runWithPhases(
      'Show emails that need my response',
      {
        thinking: 'Analyzing intent and pending questions across all threads...',
        processing: 'Ranking high-priority inbound requests...',
        executing: 'Updating workspace filters...',
      },
      () => {
        const needy = emails.filter(e => e.needsResponse);
        setFilterTab('important');
        return {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Identified **${needy.length} email(s)** requiring your urgent attention or response. Switched filter to **Important** view.`,
        };
      }
    );
  }, [emails, setFilterTab]);

  const proposeArchivePromotions = useCallback(async () => {
    const promoEmails = emails.filter(e => e.labels.includes('Promotions') && e.folder !== 'trash');

    if (promoEmails.length === 0) {
      await runWithPhases(
        'Archive promotional emails',
        {
          thinking: 'Scanning folders for promotional tags...',
          processing: 'Zero promotional emails found.',
        },
        () => ({
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Great news! There are currently no promotional emails in your inbox.',
        })
      );
      return;
    }

    const proposal: ActionProposal = {
      id: `action-${Date.now()}`,
      type: 'archive_promotions',
      title: `Archive ${promoEmails.length} Promotional Emails`,
      description: `This will move ${promoEmails.length} marketing and newsletter emails into Trash. You can recover them anytime within 30 days.`,
      targetEmailIds: promoEmails.map(e => e.id),
      destructive: true,
    };

    setPendingAction(proposal);

    await runWithPhases(
      'Archive promotional emails',
      {
        thinking: 'Detecting marketing emails and newsletters...',
        processing: 'Preparing batch archive action...',
      },
      () => ({
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I identified **${promoEmails.length} promotional email(s)**. Because this modifies your inbox, please confirm below:`,
        actionProposal: proposal,
      })
    );
  }, [emails]);

  const confirmAction = useCallback(async (action: ActionProposal) => {
    setStatus('executing');
    setStatusMessage(`Executing: ${action.title}...`);
    await new Promise(r => setTimeout(r, 900));

    if (action.type === 'archive_promotions') {
      archiveEmails(action.targetEmailIds);
    }

    setStatus('completed');
    setStatusMessage('Action executed successfully!');
    setPendingAction(null);

    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Successfully executed: **${action.title}**. Your inbox has been updated.`,
      },
    ]);

    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 2000);
  }, [archiveEmails]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Action was cancelled. No changes were made to your mailbox.',
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    const p = prompt.trim().toLowerCase();
    if (!p) return;

    if (p.includes('summariz')) {
      await summarizeCurrentEmail();
    } else if (p.includes('draft') || p.includes('reply')) {
      await draftReplyCurrentEmail();
    } else if (p.includes('john')) {
      await findEmailsFromJohn();
    } else if (p.includes('need') || p.includes('response')) {
      await showEmailsNeedingResponse();
    } else if (p.includes('promo') || p.includes('archive')) {
      await proposeArchivePromotions();
    } else if (p.includes('compose') || p.includes('write')) {
      openCompose({ subject: 'AI Generated Draft', body: 'Draft generated based on your prompt.' });
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'Opened a new compose window with a draft template for you.',
        },
      ]);
    } else {
      await runWithPhases(
        prompt,
        {
          thinking: 'Analyzing instruction and mail database...',
          processing: 'Formulating assistance response...',
        },
        () => ({
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `I've processed your request: "${prompt}". You can also click the quick prompt pills above to summarize emails, draft replies, or filter by sender.`,
        })
      );
    }
  }, [
    summarizeCurrentEmail,
    draftReplyCurrentEmail,
    findEmailsFromJohn,
    showEmailsNeedingResponse,
    proposeArchivePromotions,
    openCompose,
  ]);

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
