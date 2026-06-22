'use client';

import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Users, Search, ShieldCheck, Mail, ArrowLeft, Clock, UserPlus, X, Eye, EyeOff, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { users, fetchUsers, createAdmin } = useStore();
  const [search, setSearch] = useState('');
  
  // Modal states for provisioning new administrators
  const [isOpen, setIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nameInput.trim()) {
      setError('Name is required');
      return;
    }
    if (!emailInput.trim() || !emailInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('A valid email is required');
      return;
    }
    if (passwordInput.length < 6) {
      setError('Secret security passcode must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await createAdmin(nameInput, emailInput, passwordInput);
      setSuccess('Administrator provisioned successfully.');
      setNameInput('');
      setEmailInput('');
      setPasswordInput('');
      // Keep modal open briefly to show success, then close
      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to provision administrator.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/admin" className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-cyber-cyan transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Admin Overview</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center">
            <Users className="h-7 w-7 text-cyber-cyan mr-2" />
            Users Registry Manager
          </h1>
        </div>
        <button
          onClick={() => {
            setError('');
            setSuccess('');
            setNameInput('');
            setEmailInput('');
            setPasswordInput('');
            setIsOpen(true);
          }}
          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-indigo px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.15)]"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision Admin</span>
        </button>
      </header>

      {/* Toolbar */}
      <section className="glass-panel rounded-xl p-4 border border-slate-900 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          TOTAL ENROLLED: {users.length} MEMBERS
        </div>
      </section>

      {/* Table list */}
      <section className="glass-panel rounded-xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500">
                <th className="p-4 font-semibold uppercase">Candidate Node</th>
                <th className="p-4 font-semibold uppercase">Email Handle</th>
                <th className="p-4 font-semibold uppercase">Operational Key</th>
                <th className="p-4 font-semibold uppercase">Audits Executed</th>
                <th className="p-4 font-semibold uppercase">Threats Flagged</th>
                <th className="p-4 font-semibold uppercase">Date Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredUsers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/35 transition-colors">
                  <td className="p-4 font-bold text-slate-200">{item.name}</td>
                  <td className="p-4 text-slate-400">{item.email}</td>
                  <td className="p-4">
                    <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                      item.role === 'admin' ? 'text-cyber-purple bg-cyber-purple/5 border-cyber-purple/10' : 'text-cyber-cyan bg-cyber-cyan/5 border-cyber-cyan/10'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{item.scans}</td>
                  <td className="p-4 font-bold text-cyber-rose">{item.reports}</td>
                  <td className="p-4 text-slate-500 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {item.joined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-cyber-purple/20 bg-slate-950/95 shadow-2xl relative overflow-hidden">
            {/* Top aesthetic stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-purple via-cyber-indigo to-pink-500" />
            
            {/* Close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Provision Operator Node</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Create a secure admin profile with operational command privileges
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[10px] text-red-400 font-mono">
                [ALERT] {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg border border-cyber-emerald/20 bg-cyber-emerald/5 text-[10px] text-cyber-emerald font-mono">
                [SUCCESS] {success}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Handle</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="operator@applysafe.com"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Secret security passcode</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-10 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-purple focus:outline-none focus:ring-1 focus:ring-cyber-purple font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-indigo py-2.5 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 tracking-wider uppercase font-mono shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                >
                  {loading ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>PROVISION ADMIN KEY</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
