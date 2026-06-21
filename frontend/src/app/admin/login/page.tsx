'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../../store/useStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const loginAction = useStore((state) => state.login);
  const user = useStore((state) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam === 'unauthorized') {
      setError('Operational Access Denied: Admin authorization required.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Administrator email is required');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password) {
      setError('Secret security passcode is required');
      return;
    }
    if (password.length < 6) {
      setError('Security passcode must be at least 6 characters');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // For Admin Portal, default login role is admin
      loginAction(email, 'Senior Threat Analyst', 'admin');
      setLoading(false);

      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect') || '/admin';
      router.push(redirectPath);
    }, 1000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12">
      {/* Dark Purple Glow */}
      <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-cyber-purple/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-cyber-indigo/5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel rounded-2xl p-8 border border-cyber-purple/20 bg-slate-950/80 shadow-2xl relative overflow-hidden">
          {/* Top purple stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-purple via-cyber-indigo to-pink-500" />

          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple mb-4">
              <ShieldCheck className="h-6 w-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide uppercase">Admin command center</h2>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">
              Secure authentication gateway for threat intelligence operators
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-mono">
              [ALERT] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Operator ID / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@applysafe.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple transition-colors font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Operator Access Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple transition-colors font-mono"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-indigo py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Unlock Operations</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
