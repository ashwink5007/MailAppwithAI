export type FolderId = 
  | 'inbox' 
  | 'starred' 
  | 'sent' 
  | 'drafts' 
  | 'important' 
  | 'spam' 
  | 'trash';

export type EmailLabel = 'Work' | 'Personal' | 'Urgent' | 'Finance' | 'Social' | 'Promotions';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'document' | 'spreadsheet' | 'archive';
  url?: string;
}

export interface EmailSender {
  name: string;
  email: string;
  avatar?: string;
}

export interface ThreadMessage {
  id: string;
  sender: EmailSender;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  timestamp: string;
  fullDate: string;
  body: string;
  attachments?: Attachment[];
}

export interface Email {
  id: string;
  sender: EmailSender;
  recipients: string[];
  subject: string;
  snippet: string;
  timestamp: string;
  fullDate: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: FolderId;
  labels: EmailLabel[];
  thread: ThreadMessage[];
  attachments?: Attachment[];
  needsResponse?: boolean;
}

export type EmailFilterTab = 'all' | 'unread' | 'starred' | 'important';
