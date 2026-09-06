'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Email, FolderId, EmailLabel, EmailFilterTab } from '../types/email';
import {
  deleteEmail,
  getAllEmails,
  markEmailAsRead,
  sendEmail as sendEmailRequest,
  sendReply as sendReplyRequest,
} from '../services/emailService';
import { useAuth } from './AuthContext';

interface ComposeData {
  to?: string;
  subject?: string;
  body?: string;
}

interface EmailContextType {
  emails: Email[];
  activeFolder: FolderId;
  activeLabel: EmailLabel | null;
  selectedEmailId: string | null;
  selectedEmailIds: string[];
  searchQuery: string;
  filterTab: EmailFilterTab;
  isComposeOpen: boolean;
  composeData: ComposeData | null;
  // Loading / error states for backend integration
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  retryLoad: () => void;
  setActiveFolder: (folder: FolderId) => void;
  setActiveLabel: (label: EmailLabel | null) => void;
  setSelectedEmailId: (id: string | null) => void;
  toggleSelectEmail: (id: string) => void;
  selectAllEmails: (select: boolean) => void;
  setSearchQuery: (q: string) => void;
  setFilterTab: (tab: EmailFilterTab) => void;
  toggleStar: (id: string) => void;
  toggleImportant: (id: string) => void;
  toggleRead: (id: string) => void;
  markAsRead: (ids: string[]) => Promise<void>;
  markAsUnread: (ids: string[]) => void;
  archiveEmails: (ids: string[]) => void;
  deleteEmails: (ids: string[]) => Promise<void>;
  sendEmail: (data: { to: string; subject: string; body: string; cc?: string; bcc?: string }) => Promise<void>;
  sendReply: (emailId: string, text: string) => Promise<void>;
  openCompose: (initial?: ComposeData) => void;
  closeCompose: () => void;
  filteredEmails: Email[];
  selectedEmail: Email | null;
  folderCounts: Record<FolderId, number>;
  unreadCount: number;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const userEmail = user?.email || 'user@gmail.com';
  const userName = user?.name || 'User';

  const [emails, setEmails] = useState<Email[]>([]);
  const [activeFolder, setActiveFolderState] = useState<FolderId>('inbox');
  const [activeLabel, setActiveLabelState] = useState<EmailLabel | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<EmailFilterTab>('all');
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState<ComposeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState<number>(0);

  // Load emails from the backend whenever the user is authenticated
  useEffect(() => {
    let cancelled = false;

    async function loadEmails() {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
      try {
        const data = await getAllEmails();
        if (!cancelled) {
          setEmails(data);
          // Select the first inbox email by default
          const firstInbox = data.find(e => e.folder === 'inbox');
          setSelectedEmailId(firstInbox?.id || data[0]?.id || null);
        }
      } catch (err) {
        if (!cancelled) {
          setIsError(true);
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'Unable to load emails. Please check if the backend is running.'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (user) {
      loadEmails();
    } else {
      // Clear mailbox state when the authenticated user changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmails([]);
      setIsLoading(false);
    }

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userName, retryCounter]);

  const retryLoad = useCallback(() => {
    setRetryCounter(prev => prev + 1);
  }, []);

  const setActiveFolder = useCallback((folder: FolderId) => {
    setActiveFolderState(folder);
    setActiveLabelState(null);
    setSelectedEmailIds([]);
  }, []);

  const setActiveLabel = useCallback((label: EmailLabel | null) => {
    setActiveLabelState(label);
    if (label) {
      setSelectedEmailIds([]);
    }
  }, []);

  const toggleSelectEmail = useCallback((id: string) => {
    setSelectedEmailIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const toggleStar = useCallback((id: string) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    ));
  }, []);

  const toggleImportant = useCallback((id: string) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, isImportant: !email.isImportant } : email
    ));
  }, []);

  const toggleRead = useCallback((id: string) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, isRead: !email.isRead } : email
    ));
  }, []);

  const markAsRead = useCallback(async (ids: string[]) => {
    const unreadIds = emails.filter(email => ids.includes(email.id) && !email.isRead).map(email => email.id);
    await Promise.all(unreadIds.map(id => markEmailAsRead(id)));
    setEmails(prev => prev.map(email =>
      unreadIds.includes(email.id) ? { ...email, isRead: true } : email
    ));
  }, [emails]);

  const markAsUnread = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(email => 
      ids.includes(email.id) ? { ...email, isRead: false } : email
    ));
  }, []);

  const archiveEmails = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(email => 
      ids.includes(email.id) ? { ...email, folder: 'trash' } : email
    ));
    setSelectedEmailIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  const deleteEmails = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteEmail(id)));
    setEmails(prev => prev.filter(email => !ids.includes(email.id)));
    setSelectedEmailIds(prev => prev.filter(id => !ids.includes(id)));
    setSelectedEmailId(current => ids.includes(current || '') ? null : current);
  }, []);

  const sendEmail = useCallback(async (data: { to: string; subject: string; body: string; cc?: string; bcc?: string }) => {
    await sendEmailRequest(data);
    const refreshedEmails = await getAllEmails();
    setEmails(refreshedEmails);
    setIsComposeOpen(false);
    setComposeData(null);
  }, []);

  const sendReply = useCallback(async (emailId: string, text: string) => {
    await sendReplyRequest(emailId, text);
    const refreshedEmails = await getAllEmails();
    setEmails(refreshedEmails);
  }, []);

  const openCompose = useCallback((initial?: ComposeData) => {
    setComposeData(initial || null);
    setIsComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsComposeOpen(false);
    setComposeData(null);
  }, []);

  // Filtered emails logic
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Label filter
      if (activeLabel) {
        if (!email.labels.includes(activeLabel)) return false;
      } else {
        // Folder filter
        if (activeFolder === 'starred') {
          if (!email.isStarred) return false;
        } else if (activeFolder === 'important') {
          if (!email.isImportant) return false;
        } else {
          if (email.folder !== activeFolder) return false;
        }
      }

      // Filter tab
      if (filterTab === 'unread' && email.isRead) return false;
      if (filterTab === 'starred' && !email.isStarred) return false;
      if (filterTab === 'important' && !email.isImportant) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSender = email.sender.name.toLowerCase().includes(q) || email.sender.email.toLowerCase().includes(q);
        const matchSubject = email.subject.toLowerCase().includes(q);
        const matchSnippet = email.snippet.toLowerCase().includes(q);
        return matchSender || matchSubject || matchSnippet;
      }

      return true;
    });
  }, [emails, activeFolder, activeLabel, filterTab, searchQuery]);

  const selectAllEmails = useCallback((select: boolean) => {
    if (select) {
      setSelectedEmailIds(filteredEmails.map(e => e.id));
    } else {
      setSelectedEmailIds([]);
    }
  }, [filteredEmails]);

  const selectedEmail = useMemo(() => {
    return emails.find(e => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const folderCounts = useMemo(() => {
    const counts: Record<FolderId, number> = {
      inbox: emails.filter(e => e.folder === 'inbox' && !e.isRead).length,
      starred: emails.filter(e => e.isStarred).length,
      sent: emails.filter(e => e.folder === 'sent').length,
      drafts: emails.filter(e => e.folder === 'drafts').length,
      important: emails.filter(e => e.isImportant).length,
      spam: emails.filter(e => e.folder === 'spam').length,
      trash: emails.filter(e => e.folder === 'trash').length,
    };
    return counts;
  }, [emails]);

  const unreadCount = folderCounts.inbox;

  return (
    <EmailContext.Provider
      value={{
        emails,
        activeFolder,
        activeLabel,
        selectedEmailId,
        selectedEmailIds,
        searchQuery,
        filterTab,
        isComposeOpen,
        composeData,
        isLoading,
        isError,
        errorMessage,
        retryLoad,
        setActiveFolder,
        setActiveLabel,
        setSelectedEmailId,
        toggleSelectEmail,
        selectAllEmails,
        setSearchQuery,
        setFilterTab,
        toggleStar,
        toggleImportant,
        toggleRead,
        markAsRead,
        markAsUnread,
        archiveEmails,
        deleteEmails,
        sendEmail,
        sendReply,
        openCompose,
        closeCompose,
        filteredEmails,
        selectedEmail,
        folderCounts,
        unreadCount,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
