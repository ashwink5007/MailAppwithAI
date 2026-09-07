import { Email } from '../types/email';

export function generateUserEmails(userEmail: string, userName: string): Email[] {
  const firstName = userName.split(' ')[0] || 'User';

  return [
    {
      id: 'email-gmail-welcome',
      sender: {
        name: 'Google Community Team',
        email: 'googlecommunityteam-noreply@google.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      recipients: [userEmail],
      subject: `Welcome to your connected Gmail account, ${firstName}!`,
      snippet: `Hi ${firstName}, your Gmail address (${userEmail}) is now securely connected to AiMail Copilot with OAuth 2.0 PKCE...`,
      timestamp: '10:45 AM',
      fullDate: 'Today at 10:45 AM',
      isRead: false,
      isStarred: true,
      isImportant: true,
      folder: 'inbox',
      labels: ['Work', 'Urgent'],
      needsResponse: false,
      attachments: [
        {
          id: 'att-gmail-guide',
          name: 'Gmail_OAuth2_Security_Whitepaper.pdf',
          size: '1.8 MB',
          type: 'pdf',
        },
      ],
      thread: [
        {
          id: 'msg-gmail-1',
          sender: {
            name: 'Google Community Team',
            email: 'googlecommunityteam-noreply@google.com',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          },
          recipients: [userEmail],
          timestamp: '10:45 AM',
          fullDate: 'Today, 10:45 AM',
          body: `Hi ${firstName},\n\nWelcome to your new Gmail workspace on AiMail!\n\nYour Google account (${userEmail}) was successfully verified via OAuth 2.0. You now have access to real-time email synchronization, smart thread summarization, and AI Copilot drafting.\n\nHere are 3 tips to get the most out of your mailbox:\n1. Click "AI Copilot" in the top bar to inspect conversations or summarize threads.\n2. Use the quick prompt pills to draft automated replies.\n3. Organize your mail with custom colored labels.\n\nHappy emailing!\nThe Google Community Team`,
          attachments: [
            {
              id: 'att-gmail-guide',
              name: 'Gmail_OAuth2_Security_Whitepaper.pdf',
              size: '1.8 MB',
              type: 'pdf',
            },
          ],
        },
      ],
    },
    {
      id: 'email-google-security',
      sender: {
        name: 'Google Account Security',
        email: 'no-reply@accounts.google.com',
      },
      recipients: [userEmail],
      subject: `Security alert for ${userEmail}: AiMail was granted access`,
      snippet: `Your Google Account ${userEmail} was accessed by AiMail Copilot via OAuth 2.0. If this was you, no action is needed...`,
      timestamp: '10:44 AM',
      fullDate: 'Today at 10:44 AM',
      isRead: false,
      isStarred: false,
      isImportant: true,
      folder: 'inbox',
      labels: ['Finance', 'Urgent'],
      needsResponse: false,
      thread: [
        {
          id: 'msg-sec-1',
          sender: {
            name: 'Google Account Security',
            email: 'no-reply@accounts.google.com',
          },
          recipients: [userEmail],
          timestamp: '10:44 AM',
          fullDate: 'Today, 10:44 AM',
          body: `Security alert for: ${userEmail}\n\nAiMail was granted access to your Google Account:\n- Client ID: 89410294-aimail.apps.googleusercontent.com\n- Access Type: OAuth 2.0 PKCE with SSL TLS 1.3\n- Scopes: https://mail.google.com/, userinfo.email, userinfo.profile\n\nIf you authorized this application, your account is safe and you can start using AiMail right away.`,
        },
      ],
    },
    {
      id: 'email-team-project',
      sender: {
        name: 'Sarah Connor',
        email: 'sarah.connor@nebula.io',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      recipients: [userEmail],
      subject: `Nebula Q3 Roadmap & Deliverables Review for ${firstName}`,
      snippet: `Hey ${firstName}, I've uploaded the deliverables for the hiring task and frontend project. Let me know when you can review...`,
      timestamp: '09:30 AM',
      fullDate: 'Today at 09:30 AM',
      isRead: false,
      isStarred: true,
      isImportant: true,
      folder: 'inbox',
      labels: ['Work'],
      needsResponse: true,
      attachments: [
        {
          id: 'att-roadmap',
          name: 'Nebula_Frontend_Milestones.pdf',
          size: '2.4 MB',
          type: 'pdf',
        },
        {
          id: 'att-preview',
          name: 'Architecture_Diagram.png',
          size: '890 KB',
          type: 'image',
        },
      ],
      thread: [
        {
          id: 'msg-team-1',
          sender: {
            name: 'Sarah Connor',
            email: 'sarah.connor@nebula.io',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          },
          recipients: [userEmail],
          timestamp: '09:30 AM',
          fullDate: 'Today, 09:30 AM',
          body: `Hi ${firstName},\n\nI'm sharing the updated specifications for our frontend workspace. The bright blue theme and OAuth 2.0 authentication flow look crisp and responsive!\n\nCould you review the attached PDF and confirm if we're ready to deploy to production this afternoon?\n\nBest,\nSarah`,
          attachments: [
            {
              id: 'att-roadmap',
              name: 'Nebula_Frontend_Milestones.pdf',
              size: '2.4 MB',
              type: 'pdf',
            },
          ],
        },
      ],
    },
    {
      id: 'email-cloud-digest',
      sender: {
        name: 'GitHub Notifications',
        email: 'notifications@github.com',
      },
      recipients: [userEmail],
      subject: `[GitHub] user/project: Successful push to main`,
      snippet: `Your latest commit d16112e was successfully verified and deployed to main branch...`,
      timestamp: 'Yesterday',
      fullDate: 'Yesterday at 11:15 PM',
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: 'inbox',
      labels: ['Work'],
      needsResponse: false,
      thread: [
        {
          id: 'msg-gh-1',
          sender: {
            name: 'GitHub Notifications',
            email: 'notifications@github.com',
          },
          recipients: [userEmail],
          timestamp: 'Yesterday',
          fullDate: 'Yesterday, 11:15 PM',
          body: `Hi ${firstName},\n\nGitHub Actions report:\n- Repository: https://github.com/user/project\n- Branch: main\n- Status: Build & Lint passing (100% test coverage)\n\nAll workflows completed with exit code 0.`,
        },
      ],
    },
    {
      id: 'email-sent-sync',
      sender: {
        name: userName,
        email: userEmail,
      },
      recipients: ['sarah.connor@nebula.io'],
      subject: `Re: Project onboarding and OAuth integration`,
      snippet: `Thanks Sarah, I have successfully authenticated my Google account and tested the AI Copilot features...`,
      timestamp: 'Oct 28',
      fullDate: 'Oct 28 at 02:10 PM',
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: 'sent',
      labels: ['Work'],
      needsResponse: false,
      thread: [
        {
          id: 'msg-sent-1',
          sender: {
            name: userName,
            email: userEmail,
          },
          recipients: ['sarah.connor@nebula.io'],
          timestamp: 'Oct 28',
          fullDate: 'Oct 28, 02:10 PM',
          body: `Hi Sarah,\n\nI have successfully configured the OAuth 2.0 login gateway and verified synchronization with my Gmail account (${userEmail}). Everything is working smoothly!\n\nBest regards,\n${userName}`,
        },
      ],
    },
    {
      id: 'email-draft-sync',
      sender: {
        name: userName,
        email: userEmail,
      },
      recipients: ['team@aimail.io'],
      subject: `[Draft] Notes on Next.js Turbopack performance improvements`,
      snippet: `Draft note: Turbopack compilation latency reduced to 724ms on local build...`,
      timestamp: 'Oct 27',
      fullDate: 'Oct 27 at 05:00 PM',
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: 'drafts',
      labels: ['Personal'],
      needsResponse: false,
      thread: [
        {
          id: 'msg-draft-1',
          sender: {
            name: userName,
            email: userEmail,
          },
          recipients: ['team@aimail.io'],
          timestamp: 'Oct 27',
          fullDate: 'Oct 27, 05:00 PM',
          body: `Performance notes saved by ${userEmail}.\n\n- Zero cold start overhead\n- Instant re-rendering with React 19`,
        },
      ],
    },
  ];
}
