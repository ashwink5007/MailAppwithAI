export type OAuthProvider = 'google' | 'microsoft' | 'github';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: OAuthProvider;
  tokenType: string;
  scope: string[];
  googleConnected?: boolean;
}

export type AuthStatus = 'unauthenticated' | 'loading' | 'connecting' | 'authorizing' | 'authenticated';
