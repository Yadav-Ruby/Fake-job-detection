'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Standard client validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Call login API asynchronously
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('redirect') || '/';

    let displayName = 'User Member';
    if (email.toLowerCase().includes('admin')) {
      displayName = 'Senior Threat Analyst';
    }

    loginAction(email, displayName, 'user')
      .then(() => {
        setLoading(false);
        router.push(redirectPath);
      })
      .catch((err) => {
        setError('Login failed. Please check backend.');
        setLoading(false);
      });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12">
      {/* Glow circles */}
      <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-cyber-blue/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-72 w-72 rounded-full bg-cyber-cyan/5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel rounded-2xl p-8 border border-cyber-indigo/10 bg-slate-950/70 shadow-2xl relative overflow-hidden">
          {/* Top aesthetic stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-purple" />

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 group justify-center mb-4">
              <Shield className="h-8 w-8 text-cyber-cyan group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-white tracking-wider">APPLYSAFE</span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Access Shield Console</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Login to scan contracts, emails, and verify companies
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., candidate@domain.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan transition-colors"
                />
              </div>
              <span className="text-[10px] text-slate-600 font-mono">
                Tip: Enter <span className="text-cyber-purple font-bold">admin@applysafe.com</span> to experience the Admin Console.
              </span>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                <button
                  type="button"
                  className="text-xs text-cyber-cyan hover:underline transition-all"
                  onClick={() => alert('Mock password reset code sent to email.')}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret passkey"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyber-cyan focus:ring-cyber-cyan"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                Remember this terminal device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan py-3 text-sm font-bold text-cyber-bg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-bg border-t-transparent" />
              ) : (
                <>
                  <span>Decrypt & Connect</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Unshielded candidate? </span>
            <Link href="/register" className="text-cyber-cyan hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
