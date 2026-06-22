'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useStore((state) => state.login);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const searchParams = new URLSearchParams(window.location.search);
    const role = searchParams.get('role');
    const errorParam = searchParams.get('error');
    if (role === 'admin') {
      setIsAdmin(true);
    }
    if (errorParam === 'unauthorized') {
      setError('Operational Access Denied: Admin authorization required.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Standard client validation
    if (!email) {
      setError(isAdmin ? 'Operator ID / Email is required' : 'Email is required');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password) {
      setError(isAdmin ? 'Secret security passcode is required' : 'Password is required');
      return;
    }
    if (password.length < 6) {
      setError(
        isAdmin
          ? 'Security passcode must be at least 6 characters'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    setLoading(true);

    // Call login API asynchronously
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('redirect') || (isAdmin ? '/admin' : '/');

    let displayName = 'User Member';
    if (email.toLowerCase().includes('admin')) {
      displayName = 'Senior Threat Analyst';
    }

    loginAction(email, isAdmin ? 'Senior Threat Analyst' : displayName, isAdmin ? 'admin' : 'user', password, false)
      .then(() => {
        setLoading(false);
        router.push(redirectPath);
      })
      .catch((err) => {
        setError(
          err?.message ||
            (isAdmin
              ? 'Access Denied: Invalid credentials or authorization failed.'
              : 'Login failed. Please check backend.')
        );
        setLoading(false);
      });
  };

  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-cyber-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs tracking-wider animate-pulse">LOADING TERMINAL SECURE CONSOLE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12 transition-colors duration-500">
      {/* Glow circles */}
      {isAdmin ? (
        <>
          <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-cyber-purple/5 blur-3xl pointer-events-none transition-all duration-500" />
          <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-cyber-indigo/5 blur-3xl pointer-events-none transition-all duration-500" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-cyber-blue/5 blur-3xl pointer-events-none transition-all duration-500" />
          <div className="absolute bottom-1/4 right-1/3 h-72 w-72 rounded-full bg-cyber-cyan/5 blur-3xl pointer-events-none transition-all duration-500" />
        </>
      )}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div
          className={`glass-panel rounded-2xl p-8 border transition-all duration-500 relative overflow-hidden ${
            isAdmin
              ? 'border-cyber-purple/20 bg-slate-950/80 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
              : 'border-cyber-indigo/10 bg-slate-950/70 shadow-2xl'
          }`}
        >
          {/* Top aesthetic stripe */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-500 ${
              isAdmin
                ? 'from-cyber-purple via-cyber-indigo to-pink-500'
                : 'from-cyber-blue via-cyber-cyan to-cyber-purple'
            }`}
          />

          {/* Dynamic Header */}
          <div className="text-center mb-6">
            {isAdmin ? (
              <>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple mb-4 transition-all">
                  <ShieldCheck className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide uppercase">Admin command center</h2>
                <p className="text-xs text-slate-500 mt-1.5 font-mono">
                  Secure authentication gateway for threat intelligence operators
                </p>
              </>
            ) : (
              <>
                <Link href="/" className="inline-flex items-center space-x-2 group justify-center mb-4">
                  <Shield className="h-8 w-8 text-cyber-cyan group-hover:scale-105 transition-transform" />
                  <span className="text-xl font-bold text-white tracking-wider">APPLYSAFE</span>
                </Link>
                <h2 className="text-2xl font-bold text-white">Access Shield Console</h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  Login to scan contracts, emails, and verify companies
                </p>
              </>
            )}
          </div>

          {/* Portal Switcher Toggle */}
          <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-900 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsAdmin(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-md transition-all ${
                !isAdmin
                  ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/15 shadow-[0_0_10px_rgba(0,240,255,0.15)] font-black'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdmin(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-md transition-all ${
                isAdmin
                  ? 'text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/15 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-black'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              Admin Login
            </button>
          </div>

          {error && (
            <div
              className={`mb-5 p-3 rounded-lg border text-xs font-mono transition-colors ${
                isAdmin
                  ? 'border-red-500/30 bg-red-500/5 text-red-400'
                  : 'border-red-500/20 bg-red-500/5 text-red-400'
              }`}
            >
              {isAdmin ? `[ALERT] ${error}` : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {isAdmin ? 'Operator ID / Email' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? 'admin@applysafe.com' : 'e.g., candidate@domain.com'}
                  className={`w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                    isAdmin
                      ? 'focus:border-cyber-purple focus:ring-cyber-purple font-mono'
                      : 'focus:border-cyber-cyan focus:ring-cyber-cyan'
                  }`}
                />
              </div>
              {isAdmin && (
                <span className="text-[10px] text-slate-600 font-mono block mt-1">
                  Secure terminal: Access logged under security protocol 401-A.
                </span>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  {isAdmin ? 'Operator Access Key' : 'Password'}
                </label>
                {!isAdmin && (
                  <button
                    type="button"
                    className="text-xs text-cyber-cyan hover:underline transition-all"
                    onClick={() => alert('Mock password reset code sent to email.')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAdmin ? '••••••••' : 'Enter secret passkey'}
                  className={`w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                    isAdmin
                      ? 'focus:border-cyber-purple focus:ring-cyber-purple font-mono'
                      : 'focus:border-cyber-cyan focus:ring-cyber-cyan'
                  }`}
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

            {/* Remember Me (Only Candidate) */}
            {!isAdmin && (
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 rounded-lg py-3 text-sm font-bold transition-all disabled:opacity-50 ${
                isAdmin
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-indigo text-white tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg hover:opacity-90'
              }`}
            >
              {loading ? (
                <div
                  className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
                    isAdmin ? 'border-white' : 'border-cyber-bg'
                  }`}
                />
              ) : (
                <>
                  <span>{isAdmin ? 'Unlock Operations' : 'Decrypt & Connect'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Register Link (Only Candidate) */}
          {!isAdmin && (
            <div className="mt-6 text-center text-xs">
              <span className="text-slate-500">Unshielded candidate? </span>
              <Link href="/register" className="text-cyber-cyan hover:underline">
                Register now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

