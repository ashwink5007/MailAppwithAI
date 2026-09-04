export type OAuthProvider = 'google' | 'microsoft' | 'github';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: OAuthProvider;
  tokenType: string;
  scope: string[];
}

export type AuthStatus = 'unauthenticated' | 'connecting' | 'authorizing' | 'authenticated';
