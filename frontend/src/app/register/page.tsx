'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, User, Mail, Lock, ArrowRight, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function RegisterPage() {
  const router = useRouter();
  const loginAction = useStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Strength check metrics
  const isLengthValid = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isMatch = password && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Username is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Provide a valid email address');
      return;
    }
    if (!isLengthValid || !hasNumber || !hasLetter) {
      setError('Password must satisfy all security metrics');
      return;
    }
    if (!isMatch) {
      setError('Password confirmation does not match');
      return;
    }

    setLoading(true);

    // Call registration endpoint via store action
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('redirect') || '/';

    loginAction(email, name, 'user', password, true)
      .then(() => {
        setLoading(false);
        router.push(redirectPath);
      })
      .catch((err) => {
        setError(err?.message || 'Registration failed. Please check database connection.');
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple" />

          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2 group justify-center mb-3">
              <Shield className="h-8 w-8 text-cyber-cyan" />
              <span className="text-xl font-bold text-white tracking-wider">APPLYSAFE</span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Enroll Candidate Key</h2>
            <p className="text-sm text-slate-500 mt-1">
              Initialize shield sensors for your employment search
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Carter"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., candidate@domain.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Create Passkey</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password length >= 6"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
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

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Confirm Passkey</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter passkey"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Validation Grid */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950/50 border border-slate-900 text-[10px]">
              <div className="flex items-center space-x-1">
                {isLengthValid ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <X className="h-3.5 w-3.5 text-slate-700" />}
                <span className={isLengthValid ? 'text-slate-300' : 'text-slate-600'}>Min 6 Characters</span>
              </div>
              <div className="flex items-center space-x-1">
                {hasLetter ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <X className="h-3.5 w-3.5 text-slate-700" />}
                <span className={hasLetter ? 'text-slate-300' : 'text-slate-600'}>Contains Letters</span>
              </div>
              <div className="flex items-center space-x-1">
                {hasNumber ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <X className="h-3.5 w-3.5 text-slate-700" />}
                <span className={hasNumber ? 'text-slate-300' : 'text-slate-600'}>Contains Numbers</span>
              </div>
              <div className="flex items-center space-x-1">
                {isMatch ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <X className="h-3.5 w-3.5 text-slate-700" />}
                <span className={isMatch ? 'text-slate-300' : 'text-slate-600'}>Keys Align</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-blue py-2.5 text-sm font-bold text-cyber-bg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-bg border-t-transparent" />
              ) : (
                <>
                  <span>Deploy Cyber Shield</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Already have a key? </span>
            <Link href="/login" className="text-cyber-cyan hover:underline">
              Login to Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
