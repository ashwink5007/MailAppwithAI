'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Email, FolderId, EmailLabel, EmailFilterTab } from '../types/email';
import { generateUserEmails } from '../data/mockEmails';
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
  markAsRead: (ids: string[]) => void;
  markAsUnread: (ids: string[]) => void;
  archiveEmails: (ids: string[]) => void;
  deleteEmails: (ids: string[]) => void;
  sendEmail: (data: { to: string; subject: string; body: string; cc?: string; bcc?: string }) => void;
  sendReply: (emailId: string, text: string) => void;
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

  const userEmail = user?.email || 'xyz@gmail.com';
  const userName = user?.name || 'User';

  const [emails, setEmails] = useState<Email[]>(() => generateUserEmails(userEmail, userName));
  const [activeFolder, setActiveFolderState] = useState<FolderId>('inbox');
  const [activeLabel, setActiveLabelState] = useState<EmailLabel | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<EmailFilterTab>('all');
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState<ComposeData | null>(null);

  // Sync emails whenever authenticated user changes
  useEffect(() => {
    const initial = generateUserEmails(userEmail, userName);
    setEmails(initial);
    setSelectedEmailId(initial[0]?.id || null);
  }, [userEmail, userName]);

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

  const markAsRead = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(email => 
      ids.includes(email.id) ? { ...email, isRead: true } : email
    ));
  }, []);

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

  const deleteEmails = useCallback((ids: string[]) => {
    setEmails(prev => prev.map(email => 
      ids.includes(email.id) ? { ...email, folder: 'trash' } : email
    ));
    setSelectedEmailIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  const sendEmail = useCallback((data: { to: string; subject: string; body: string; cc?: string; bcc?: string }) => {
    const newEmail: Email = {
      id: `email-${Date.now()}`,
      sender: {
        name: userName,
        email: userEmail,
      },
      recipients: [data.to],
      subject: data.subject || '(no subject)',
      snippet: data.body.slice(0, 100) || 'Sent message',
      timestamp: 'Just now',
      fullDate: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: 'sent',
      labels: ['Work'],
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: {
            name: userName,
            email: userEmail,
          },
          recipients: [data.to],
          cc: data.cc ? [data.cc] : undefined,
          bcc: data.bcc ? [data.bcc] : undefined,
          timestamp: 'Just now',
          fullDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          body: data.body,
        },
      ],
    };

    setEmails(prev => [newEmail, ...prev]);
    setIsComposeOpen(false);
    setComposeData(null);
  }, [userEmail, userName]);

  const sendReply = useCallback((emailId: string, text: string) => {
    setEmails(prev => prev.map(email => {
      if (email.id !== emailId) return email;
      const newMsg = {
        id: `msg-reply-${Date.now()}`,
        sender: {
          name: userName,
          email: userEmail,
        },
        recipients: [email.sender.email],
        timestamp: 'Just now',
        fullDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
      };
      return {
        ...email,
        thread: [...email.thread, newMsg],
        snippet: text.slice(0, 80),
        timestamp: 'Just now',
      };
    }));
  }, [userEmail, userName]);

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
