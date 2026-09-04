# MailAppwithAI — Intelligent Email Client with Integrated AI Copilot

Nebula web app for hiring task.

AiMail is an AI-native, responsive email client built with Next.js 16 (Turbopack), React 19, TypeScript, and Tailwind CSS. It features autonomous AI workflows, an OAuth 2.0 authentication gateway, and a bright blue SaaS design system.

---

## Key Features

- **OAuth 2.0 Authentication Gateway**: Secure authentication with Google, Microsoft 365, GitHub OAuth 2.0, and Enterprise Single Sign-On (SSO).
- **Responsive Workspace**:
  - **Desktop**: 4-pane layout (Sidebar | Email List | Email Detail | AI Copilot).
  - **Tablet**: Adaptive layout with collapsible drawers.
  - **Mobile**: Native single-pane drill-down with touch navigation.
- **Core Email Client**:
  - Folders: Inbox, Starred, Sent, Drafts, Important, Spam, Trash.
  - Custom category labels: Work, Personal, Urgent, Finance, Social, Promotions.
  - Multi-selection with bulk actions (Mark Read/Unread, Archive, Delete).
  - Full conversation thread reader with attachment previews.
  - Docked / floating Compose window with rich formatting toolbar.
- **Integrated AI Copilot**:
  - Context-aware assistance recognizing the currently selected email or active folder.
  - Multi-step status progression (**Thinking $\to$ Processing $\to$ Executing $\to$ Completed**).
  - One-click smart workflows:
    - *"Summarize this email"* (structured bullet-point takeaways).
    - *"Draft a reply"* (tailored response with 1-click insertion into the reply box).
    - *"Find unread emails from John"* (live filter application).
    - *"Show emails that need my response"* (action item prioritization).
    - *"Archive promotional emails"* (safe batch execution with confirmation dialog).

---

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm or pnpm

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
