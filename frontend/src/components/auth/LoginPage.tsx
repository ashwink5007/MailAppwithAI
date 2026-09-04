'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Mail, 
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OAuthProvider } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const { loginWithOAuth, status, statusMessage } = useAuth();
  const [emailInput, setEmailInput] = useState('xyz@gmail.com');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleModalEmail, setGoogleModalEmail] = useState('xyz@gmail.com');

  const isAuthenticating = status === 'connecting' || status === 'authorizing';

  const handleOAuthClick = (provider: OAuthProvider) => {
    if (isAuthenticating) return;
    if (provider === 'google') {
      setShowGoogleModal(true);
    } else {
      loginWithOAuth(provider, emailInput);
    }
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleModalEmail.trim() || isAuthenticating) return;
    setShowGoogleModal(false);
    loginWithOAuth('google', googleModalEmail.trim());
  };

  const handleDirectEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || isAuthenticating) return;
    loginWithOAuth('google', emailInput.trim());
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-100/70 flex flex-col justify-between text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Background Glow */}
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
          <span className="hidden sm:inline">Google OAuth 2.0 PKCE Protected</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/10 relative">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-4 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to AiMail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Authenticate via OAuth 2.0 to access your real Gmail mailbox and AI Copilot.
            </p>
          </div>

          {/* Quick Email Input for Custom Gmail login */}
          <form onSubmit={handleDirectEmailSubmit} className="mb-5 space-y-2">
            <label className="block text-xs font-bold text-slate-700 text-left">
              Gmail / Google Account Address:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setGoogleModalEmail(e.target.value);
                }}
                placeholder="xyz@gmail.com"
                required
                disabled={isAuthenticating}
                className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition font-medium"
              />
            </div>
          </form>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Continue with Google */}
            <button
              onClick={() => handleOAuthClick('google')}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-800 font-bold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google ({emailInput || 'xyz@gmail.com'})</span>
            </button>

            {/* Microsoft OAuth */}
            <button
              onClick={() => handleOAuthClick('microsoft')}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 font-semibold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Sign in with Microsoft 365</span>
            </button>

            {/* GitHub OAuth */}
            <button
              onClick={() => handleOAuthClick('github')}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Sign in with GitHub</span>
            </button>
          </div>

          {/* OAuth Handshake Overlay Modal */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-center z-20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Google OAuth 2.0</h3>
              <p className="text-xs text-slate-600 mt-1 font-semibold">{googleModalEmail || emailInput}</p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">{statusMessage}</p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Google OAuth Account Picker / Consent Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span className="text-sm font-bold text-slate-800">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose or enter your Gmail account:
                </label>
                <input
                  type="email"
                  value={googleModalEmail}
                  onChange={(e) => setGoogleModalEmail(e.target.value)}
                  placeholder="xyz@gmail.com"
                  required
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                  autoFocus
                />
              </div>

              {/* Quick sample account chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick select account:</span>
                <div className="flex flex-wrap gap-2">
                  {['xyz@gmail.com', 'ashwin@gmail.com', 'developer@gmail.com'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGoogleModalEmail(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        googleModalEmail === preset
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-blue-800">Permissions requested by AiMail:</p>
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Read, compose, send, and manage messages in your Gmail
                </p>
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  View profile information and primary email address
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Authorize & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 z-10 gap-2 border-t border-blue-50">
        <div>
          © 2026 AiMail Inc. OAuth 2.0 Security Specification RFC 6749.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
