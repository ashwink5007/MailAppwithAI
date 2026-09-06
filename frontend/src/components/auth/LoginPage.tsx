'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  Mail,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginWithOAuth, status, statusMessage } = useAuth();

  const isConnecting = status === 'connecting';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-100/70 flex flex-col justify-between text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">AiMail</span>
            <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Copilot 2.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Google OAuth 2.0 Protected</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/10 relative">

          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-5 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to AiMail
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Connect your real Gmail account with Google OAuth 2.0.<br />
              Your emails load directly from Google — no mock data.
            </p>
          </div>

          {/* Permissions summary */}
          <div className="mb-6 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
            <p className="text-xs font-bold text-blue-800 mb-1">Permissions AiMail will request:</p>
            {[
              'Read, compose and send Gmail messages',
              'View your Gmail account labels and folders',
              'View your Google profile name and photo',
            ].map((perm) => (
              <p key={perm} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                {perm}
              </p>
            ))}
          </div>

          {/* Sign in with Google button */}
          <button
            id="google-signin-btn"
            onClick={() => loginWithOAuth('google')}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-bold text-sm shadow-md shadow-slate-200/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>
              {isConnecting ? 'Redirecting to Google…' : 'Continue with Google'}
            </span>
            {!isConnecting && <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />}
          </button>

          {statusMessage && (
            <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">{statusMessage}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[11px] text-slate-400 font-medium">Other providers</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Microsoft & GitHub — coming soon */}
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled
              title="Microsoft 365 OAuth — coming soon"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-semibold text-xs shadow-sm cursor-not-allowed opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft 365</span>
            </button>

            <button
              disabled
              title="GitHub OAuth — coming soon"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-slate-500 font-semibold text-xs shadow-sm cursor-not-allowed opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-4">
            Microsoft 365 and GitHub providers coming in a future sprint.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 z-10 gap-2 border-t border-blue-50">
        <div>© 2026 AiMail Inc. · OAuth 2.0 Security Specification RFC 6749</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
