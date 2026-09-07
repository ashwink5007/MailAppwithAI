import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NebulaMail Terms of Service",
  description: "Terms of Service for NebulaMail.",
};

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: September 7, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using NebulaMail (the &quot;Service&quot;), you
              agree to be bound by these Terms of Service. If you do not
              agree to these terms, do not use the Service.
            </p>
          </section>

          {/* 2. Description of NebulaMail */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Description of NebulaMail
            </h2>
            <p className="text-slate-600 leading-relaxed">
              NebulaMail is an AI-powered email client that allows you to
              connect your Gmail account, view and organize emails, compose
              and send messages, and use an AI Copilot to assist with
              email-related tasks. The Service provides a web-based
              interface for managing your Gmail account through the Google
              Gmail API.
            </p>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Eligibility
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You must be at least 13 years of age to use NebulaMail. By
              using the Service, you represent and warrant that you meet
              this age requirement and have the legal capacity to enter
              into these terms.
            </p>
          </section>

          {/* 4. Google/Gmail Account Authorization */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Google/Gmail Account Authorization
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              To use NebulaMail, you must authorize the application to
              access your Google account via OAuth 2.0. This authorization
              grants NebulaMail the following permissions:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Read your Google profile information (name, email, photo)</li>
              <li>Read your Gmail messages and labels</li>
              <li>Send Gmail messages on your behalf</li>
              <li>Modify Gmail message labels (mark as read, apply labels, trash)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              You control which permissions you grant. You may revoke
              NebulaMail&apos;s access to your Google account at any time
              through your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Account Permissions
              </a>{" "}
              page. Revoking access will immediately prevent NebulaMail
              from accessing your Gmail data.
            </p>
          </section>

          {/* 5. User Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. User Responsibilities
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Maintaining the security of your Google account</li>
              <li>All actions taken through NebulaMail, including sending emails</li>
              <li>Reviewing all emails before they are sent</li>
              <li>Ensuring your use complies with applicable laws and regulations</li>
              <li>Not sharing your NebulaMail session with others</li>
            </ul>
          </section>

          {/* 6. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Acceptable Use
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to use NebulaMail only for its intended purpose:
              managing your personal email. You may not use the Service for
              any unlawful or prohibited purpose.
            </p>
          </section>

          {/* 7. Prohibited Activities */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Prohibited Activities
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Use the Service to send spam, phishing, or other unsolicited messages</li>
              <li>Attempt to gain unauthorized access to the Service or its infrastructure</li>
              <li>Interfere with or disrupt the Service or its servers</li>
              <li>Use the Service to violate any laws or third-party rights</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use automated tools to access the Service in a manner that exceeds normal usage</li>
              <li>Use the AI Copilot to generate harmful, abusive, or illegal content</li>
            </ul>
          </section>

          {/* 8. Email Content Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Email Content Responsibility
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You are solely responsible for the content of emails you send,
              reply to, or draft through NebulaMail. NebulaMail provides
              the interface and tools, but you authorize all email actions.
              NebulaMail does not review, approve, or take responsibility
              for any email content you send through the Service.
            </p>
          </section>

          {/* 9. AI-Generated Content Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. AI-Generated Content Disclaimer
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The AI Copilot feature uses Google&apos;s Gemini API to generate
              email drafts, summaries, classifications, and other suggestions.
              Please note:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>
                AI-generated content may be inaccurate, incomplete, or
                inappropriate. Always review AI-generated content before
                using it.
              </li>
              <li>
                NebulaMail should not be treated as a human decision-maker.
                The AI Copilot is a tool that assists with email management,
                not a substitute for your own judgment.
              </li>
              <li>
                You are responsible for reviewing and approving all
                AI-generated email drafts before they are sent.
              </li>
              <li>
                AI-generated content does not represent the views or opinions
                of NebulaMail.
              </li>
            </ul>
          </section>

          {/* 10. Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              10. Third-Party Services
            </h2>
            <p className="text-slate-600 leading-relaxed">
              NebulaMail relies on third-party services including Google
              APIs, Google Gemini, Supabase, Railway, and Vercel. Your use
              of these services through NebulaMail is subject to their
              respective terms of service and privacy policies. We are not
              responsible for the practices of these third-party providers.
            </p>
          </section>

          {/* 11. Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              11. Service Availability
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We do not guarantee that NebulaMail will be available at all
              times. The Service may be interrupted for maintenance, updates,
              or due to factors beyond our control, including third-party
              service outages. We are not liable for any downtime or
              disruption to the Service.
            </p>
          </section>

          {/* 12. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              12. Intellectual Property
            </h2>
            <p className="text-slate-600 leading-relaxed">
              NebulaMail and its original content, features, and functionality
              are owned by NebulaMail and are protected by copyright,
              trademark, and other intellectual property laws. You may not
              copy, modify, distribute, sell, or lease any part of the
              Service without our written permission.
            </p>
          </section>

          {/* 13. User Content */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              13. User Content
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You retain all rights to your email content. NebulaMail does
              not claim ownership of any emails, messages, or data that
              pass through the Service. Your email content remains your
              property and is subject to your Google account terms.
            </p>
          </section>

          {/* 14. Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              14. Privacy
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              , which describes how we collect, use, and share information.
              By using NebulaMail, you consent to the data practices
              described in the Privacy Policy.
            </p>
          </section>

          {/* 15. Security and Account Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              15. Security and Account Responsibility
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              session and for all activities that occur under your session.
              You agree to notify us immediately of any unauthorized use of
              your session or any other breach of security.
            </p>
          </section>

          {/* 16. Suspension and Termination */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              16. Suspension and Termination
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to suspend or terminate your access to
              the Service at any time, with or without cause, and with or
              without notice. Upon termination, your right to use the
              Service ceases immediately. You may also terminate your use
              of the Service by logging out and revoking Google access.
            </p>
          </section>

          {/* 17. Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              17. Disclaimer of Warranties
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether
              express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular
              purpose, and non-infringement. We do not warrant that the
              Service will be uninterrupted, error-free, or secure.
            </p>
          </section>

          {/* 18. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              18. Limitation of Liability
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, NebulaMail shall not
              be liable for any indirect, incidental, special, consequential,
              or punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use
              of the Service.
            </p>
          </section>

          {/* 19. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              19. Indemnification
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless NebulaMail
              from any claims, losses, damages, liabilities, costs, and
              expenses (including reasonable attorneys&apos; fees) arising
              out of or in any way connected with your use of the Service,
              your violation of these terms, or your violation of any rights
              of a third party.
            </p>
          </section>

          {/* 20. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              20. Changes to Terms
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any
              time. We will notify you of any changes by posting the new
              terms on this page and updating the &quot;Last updated&quot;
              date. Your continued use of the Service after any changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          {/* 21. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              21. Governing Law
            </h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance
              with the laws of the State of California, USA, without
              regard to its conflict of law provisions.
            </p>
          </section>

          {/* 22. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              22. Contact Information
            </h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about these Terms of Service, please
              contact us at:{" "}
              <a
                href="mailto:tylerdurdan969@gmail.com"
                className="text-blue-600 hover:underline"
              >
                tylerdurdan969@gmail.com
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
