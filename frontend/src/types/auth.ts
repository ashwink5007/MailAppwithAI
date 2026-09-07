export type OAuthProvider = 'google' | 'microsoft' | 'github';

export type MailboxMode = 'REAL_GMAIL' | 'DEMO';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: OAuthProvider;
  tokenType: string;
  scope: string[];
  googleConnected?: boolean;
  mailboxMode?: MailboxMode;
}

export type AuthStatus = 'unauthenticated' | 'loading' | 'connecting' | 'authorizing' | 'authenticated';
