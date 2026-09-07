import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NebulaMail Privacy Policy",
  description: "Privacy Policy for NebulaMail, an AI-powered email application.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm">
              N
            </span>
            NebulaMail
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            Back to app
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: September 7, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Introduction
            </h2>
            <p className="text-slate-600 leading-relaxed">
              This Privacy Policy describes how NebulaMail (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
              information when you use our AI-powered email application
              (the &quot;Service&quot;). By using NebulaMail, you agree to the
              collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* 2. Who We Are */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Who We Are
            </h2>
            <p className="text-slate-600 leading-relaxed">
              NebulaMail is an AI-powered email client that allows you to
              connect your Gmail account, view and organize emails,
              compose and send messages, and use an AI Copilot to assist
              with email-related tasks. The Service is operated as a
              personal project and is not a registered business entity.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Contact:{" "}
              <a
                href="mailto:[REPLACE WITH YOUR SUPPORT EMAIL]"
                className="text-blue-600 hover:underline"
              >
                [REPLACE WITH YOUR SUPPORT EMAIL]
              </a>
            </p>
          </section>

          {/* 3. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Information We Collect
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We collect the following types of information:
            </p>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Account Information
            </h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Google account identifier</li>
              <li>Email address</li>
              <li>Display name</li>
              <li>Profile picture URL</li>
            </ul>
            <h3 className="text-lg font-medium text-slate-800 mb-2 mt-4">
              Usage Information
            </h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>AI Copilot commands you type (processed in real time)</li>
              <li>Application interaction patterns within a session</li>
            </ul>
          </section>

          {/* 4. Google Account Information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Google Account Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              When you sign in with Google OAuth 2.0, we request access to
              your Google profile information. This includes your name,
              email address, and profile picture. This information is used
              solely to create and maintain your NebulaMail account.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              We store the following Google account data in our database:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4 mt-2">
              <li>Google account identifier (used to identify your account)</li>
              <li>Email address (used as your account identifier)</li>
              <li>Display name (shown in the application interface)</li>
              <li>Profile picture URL (shown in the application interface)</li>
            </ul>
          </section>

          {/* 5. Gmail Data We Access */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Gmail Data We Access
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              NebulaMail requests the following Gmail permissions:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                <strong>Read emails</strong> — to display your inbox, search
                messages, and view email content within the application
              </li>
              <li>
                <strong>Send emails</strong> — to compose and send new messages
                and replies on your behalf
              </li>
              <li>
                <strong>Modify emails</strong> — to mark messages as read,
                apply labels, and move messages to trash when you request
                these actions
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              <strong>Gmail data is fetched in real time from Google&apos;s
              servers and is not stored in our database.</strong> Every time
              you view your inbox or open an email, NebulaMail retrieves the
              data directly from the Gmail API and displays it to you. Email
              content, headers, and metadata are not persisted on our servers
              after the request completes.
            </p>
          </section>

          {/* 6. How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. How We Use Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Provide, operate, and maintain the NebulaMail application</li>
              <li>Authenticate you via Google OAuth 2.0</li>
              <li>Display your Gmail inbox and email content</li>
              <li>Send and manage emails on your behalf through the Gmail API</li>
              <li>Process your AI Copilot commands to assist with email tasks</li>
              <li>Improve and troubleshoot the Service</li>
            </ul>
          </section>

          {/* 7. AI/Gemini Processing */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. AI/Gemini Processing
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              NebulaMail uses Google&apos;s Gemini API to power the AI Copilot
              feature. When you send a command to the AI Copilot, the following
              information is sent to Google&apos;s Gemini API for processing:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>The text of your AI command (up to 2,000 characters)</li>
              <li>
                Limited context about the email you are currently viewing:
                message ID, sender address, recipient address, subject line,
                and a short snippet
              </li>
              <li>The current view state of the application</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              <strong>We do not send full email body content to the Gemini
              API.</strong> Only the selected email&apos;s subject, sender,
              recipient, and a brief snippet are included for context.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              AI processing is used solely to interpret your command and
              return a structured action (such as &quot;open compose&quot; or
              &quot;search emails&quot;). AI responses are not stored after
              the action is executed.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Because AI commands are processed by Google&apos;s Gemini API,
              you should avoid submitting highly confidential or sensitive
              information in your AI prompts that you do not want processed
              by a third-party service.
            </p>
          </section>

          {/* 8. How Google User Data Is Used */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. How Google User Data Is Used
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Google user data (including Gmail data) is accessed and used
              exclusively to provide the email functionality you request.
              Specifically:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4 mt-2">
              <li>
                Your Google profile information is used to identify your
                account and display your identity within NebulaMail
              </li>
              <li>
                Gmail data is accessed in real time to display your inbox,
                allow you to read emails, and perform actions you request
                (sending, replying, labeling, trashing)
              </li>
              <li>
                Limited email context (subject, sender, snippet) is sent to
                the Gemini API to enable the AI Copilot to understand your
                email-related commands
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not use Google user data for advertising, profiling,
              marketing, or any purpose other than providing the Service.
            </p>
          </section>

          {/* 9. How Google User Data Is Shared */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. How Google User Data Is Shared
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We share Google user data only with the following service
              providers as necessary to operate the Service:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                <strong>Google APIs (OAuth, Gmail)</strong> — for
                authentication and email functionality
              </li>
              <li>
                <strong>Google Gemini API</strong> — to process AI Copilot
                commands (limited email context only)
              </li>
              <li>
                <strong>Supabase PostgreSQL</strong> — for storing your
                account information (Google ID, email, name, profile
                picture URL)
              </li>
              <li>
                <strong>Railway</strong> — backend hosting provider
              </li>
              <li>
                <strong>Vercel</strong> — frontend hosting provider
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not sell, rent, or trade your personal information. We
              do not share Google user data with any third parties for
              advertising or marketing purposes.
            </p>
          </section>

          {/* 10. Data Storage and Retention */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              10. Data Storage and Retention
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong>What we store:</strong>
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                Account data (Google ID, email, name, profile picture URL)
                is stored in our PostgreSQL database for as long as your
                account exists
              </li>
              <li>
                OAuth session data (JSESSIONID) is stored in server memory
                and is automatically invalidated when you log out or when
                the server restarts
              </li>
              <li>
                OAuth access and refresh tokens are held in server memory
                only during your active session and are not persisted to
                disk or database
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3 mb-3">
              <strong>What we do not store:</strong>
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Gmail message content or metadata</li>
              <li>Email bodies, attachments, or headers</li>
              <li>AI Copilot conversation history</li>
              <li>OAuth access or refresh tokens in the database</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Note: We do not currently implement automatic data retention
              policies or scheduled deletion of account data. Account data
              is retained until a deletion mechanism is implemented.
            </p>
          </section>

          {/* 11. Cookies and Sessions */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              11. Cookies and Sessions
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              NebulaMail uses a single session cookie:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                <strong>JSESSIONID</strong> — A server-side session identifier
                used to maintain your authenticated state. This cookie is
                marked as Secure (HTTPS only), HttpOnly (not accessible via
                JavaScript), and SameSite=None (required for cross-origin
                communication between the frontend and backend).
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not use analytics cookies, advertising cookies, tracking
              cookies, or any third-party cookies. The JSESSIONID cookie is
              strictly necessary for the Service to function and is deleted
              when you log out.
            </p>
          </section>

          {/* 12. Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              12. Data Security
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We implement the following security measures:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>All communication is encrypted via HTTPS/TLS</li>
              <li>Authentication is handled through Google OAuth 2.0</li>
              <li>Session cookies are marked Secure and HttpOnly</li>
              <li>API keys and credentials are stored server-side only and are never exposed to the browser</li>
              <li>Backend API endpoints require authentication</li>
              <li>Database access is restricted to the backend server</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              While we take reasonable precautions, no method of electronic
              transmission or storage is 100% secure. We cannot guarantee
              absolute security of your data.
            </p>
          </section>

          {/* 13. User Controls and Revoking Google Access */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              13. User Controls and Revoking Google Access
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You have the following controls:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                <strong>Log out</strong> — Logging out of NebulaMail invalidates
                your session and clears the session cookie from your browser.
              </li>
              <li>
                <strong>Revoke Google access</strong> — You can revoke
                NebulaMail&apos;s access to your Google account at any time
                by visiting{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Account Permissions
                </a>{" "}
                and removing NebulaMail from the list of authorized
                applications.
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Note: Revoking Google access will immediately prevent
              NebulaMail from accessing your Gmail data. Your existing
              NebulaMail account data (name, email, profile picture) will
              remain stored until a data deletion mechanism is implemented.
            </p>
          </section>

          {/* 14. Data Deletion */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              14. Data Deletion
            </h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Data deletion is not currently implemented.</strong> We
              do not yet provide a mechanism for users to request deletion of
              their account data. If you require deletion of your data,
              please contact us at{" "}
              <a
                href="mailto:[REPLACE WITH YOUR SUPPORT EMAIL]"
                className="text-blue-600 hover:underline"
              >
                [REPLACE WITH YOUR SUPPORT EMAIL]
              </a>{" "}
              and we will process your request.
            </p>
          </section>

          {/* 15. Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              15. Third-Party Services
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              NebulaMail integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                <strong>Google OAuth 2.0</strong> — Authentication. Governed
                by Google&apos;s{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Gmail API</strong> — Email access and management.
                Governed by Google&apos;s API{" "}
                <a
                  href="https://developers.google.com/gmail/api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </a>
                .
              </li>
              <li>
                <strong>Google Gemini API</strong> — AI processing. Governed
                by Google&apos;s{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Supabase</strong> — PostgreSQL database hosting.
              </li>
              <li>
                <strong>Railway</strong> — Backend hosting.
              </li>
              <li>
                <strong>Vercel</strong> — Frontend hosting.
              </li>
            </ul>
          </section>

          {/* 16. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              16. Children&apos;s Privacy
            </h2>
            <p className="text-slate-600 leading-relaxed">
              NebulaMail is not intended for use by children under the age
              of 13. We do not knowingly collect personal information from
              children. If you believe a child has provided us with personal
              information, please contact us and we will take steps to
              delete such information.
            </p>
          </section>

          {/* 17. International Data Processing */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              17. International Data Processing
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your information may be processed in countries other than your
              own. Our backend is hosted on Railway, and our database is
              hosted by Supabase. Google APIs process data according to
              Google&apos;s data processing terms. By using NebulaMail, you
              consent to the transfer of your information to these
              jurisdictions.
            </p>
          </section>

          {/* 18. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              18. Changes to This Privacy Policy
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last updated&quot; date. Your
              continued use of NebulaMail after any changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* 19. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              19. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this Privacy Policy, please
              contact us at:{" "}
              <a
                href="mailto:[REPLACE WITH YOUR SUPPORT EMAIL]"
                className="text-blue-600 hover:underline"
              >
                [REPLACE WITH YOUR SUPPORT EMAIL]
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <p>&copy; 2026 NebulaMail. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
