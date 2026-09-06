'use client';

import React from 'react';
import { z } from 'zod';
import { useFrontendTool } from '@copilotkit/react-core/v2';
import { useEmail } from '../../context/EmailContext';
import { FolderId } from '../../types/email';

/**
 * Registers CopilotKit frontend tools that control the mail UI
 * through existing React state (no DOM automation).
 *
 * These tools are invoked by the CopilotKit agent when it determines
 * the user wants to perform an email action.
 */
export const MailCopilotTools: React.FC = () => {
  const {
    setActiveFolder,
    setSearchQuery,
    setFilterTab,
    setAiDateRange,
    openCompose,
    setSelectedEmailId,
    emails,
    selectedEmail,
  } = useEmail();

  useFrontendTool({
    name: 'navigate_mail_view',
    description:
      'Navigate to a mail folder. Valid views: inbox, sent, drafts, starred, important, spam, trash.',
    parameters: z.object({
      view: z
        .string()
        .describe(
          'The folder to navigate to: inbox, sent, drafts, starred, important, spam, trash',
        ),
    }),
    handler: async ({ view }) => {
      const folderMap: Record<string, FolderId> = {
        inbox: 'inbox',
        sent: 'sent',
        drafts: 'drafts',
        starred: 'starred',
        important: 'important',
        spam: 'spam',
        trash: 'trash',
      };
      const folder = folderMap[view.toLowerCase()] || 'inbox';
      setActiveFolder(folder);
      return `Navigated to ${folder}.`;
    },
  });

  useFrontendTool({
    name: 'open_compose',
    description: 'Open the compose email window for writing a new email.',
    parameters: z.object({}),
    handler: async () => {
      openCompose();
      return 'Compose window opened.';
    },
  });

  useFrontendTool({
    name: 'fill_compose',
    description:
      'Open the compose email window pre-filled with recipient, subject, and body.',
    parameters: z.object({
      to: z.string().optional().describe('Recipient email address or name'),
      subject: z.string().optional().describe('Email subject line'),
      body: z.string().optional().describe('Email body text'),
    }),
    handler: async ({ to, subject, body }) => {
      openCompose({
        to: to || undefined,
        subject: subject || undefined,
        body: body || undefined,
      });
      return `Compose window opened${to ? ` for ${to}` : ''}.`;
    },
  });

  useFrontendTool({
    name: 'filter_emails',
    description:
      'Filter emails in the inbox by unread status, sender, keyword, or date range.',
    parameters: z.object({
      unread: z.boolean().optional().describe('Filter for unread emails only'),
      sender: z.string().optional().describe('Filter by sender name or email'),
      keyword: z.string().optional().describe('Filter by keyword in subject or body'),
      dateRange: z
        .string()
        .optional()
        .describe(
          'Date range filter: TODAY, YESTERDAY, LAST_7_DAYS, LAST_10_DAYS, THIS_WEEK, LAST_WEEK, THIS_MONTH',
        ),
    }),
    handler: async ({ unread, sender, keyword, dateRange }) => {
      setActiveFolder('inbox');
      setFilterTab(unread ? 'unread' : 'all');
      setSearchQuery(sender || keyword || '');
      setAiDateRange(dateRange || null);
      const parts: string[] = [];
      if (unread) parts.push('unread');
      if (sender) parts.push(`from "${sender}"`);
      if (keyword) parts.push(`containing "${keyword}"`);
      if (dateRange) parts.push(`in range: ${dateRange.replace(/_/g, ' ').toLowerCase()}`);
      return parts.length > 0
        ? `Filtered inbox — showing ${parts.join(', ')}.`
        : 'Filter applied.';
    },
  });

  useFrontendTool({
    name: 'search_emails',
    description: 'Search emails by a query string (matches sender, subject, snippet).',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    handler: async ({ query }) => {
      setSearchQuery(query);
      return `Searching for "${query}".`;
    },
  });

  useFrontendTool({
    name: 'open_email',
    description:
      'Open a specific email by ID, or by fuzzy matching sender name/email or subject keyword.',
    parameters: z.object({
      emailId: z.string().optional().describe('The email ID to open'),
      sender: z.string().optional().describe('Sender name or email to match'),
      keyword: z.string().optional().describe('Subject keyword to match'),
    }),
    handler: async ({ emailId, sender, keyword }) => {
      if (emailId) {
        setSelectedEmailId(emailId);
        return 'Email opened.';
      }
      const query = (sender || keyword || '').toLowerCase();
      if (!query) return 'No match criteria provided.';
      const match = emails.find(
        (e) =>
          e.sender.name.toLowerCase().includes(query) ||
          e.sender.email.toLowerCase().includes(query) ||
          e.subject.toLowerCase().includes(query),
      );
      if (match) {
        setSelectedEmailId(match.id);
        return `Opened email: "${match.subject}" from ${match.sender.name}.`;
      }
      return `No email found matching "${query}".`;
    },
  });

  useFrontendTool({
    name: 'prepare_reply',
    description:
      'Open a reply compose window for the currently selected email. Returns an error if no email is selected.',
    parameters: z.object({}),
    handler: async () => {
      if (!selectedEmail) {
        return 'No email is currently selected. Please open an email first.';
      }
      openCompose({
        to: selectedEmail.sender.email,
        subject: selectedEmail.subject.startsWith('Re:')
          ? selectedEmail.subject
          : `Re: ${selectedEmail.subject}`,
      });
      return `Reply compose window opened for ${selectedEmail.sender.name}.`;
    },
  });

  return null;
};
