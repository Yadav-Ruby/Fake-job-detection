'use client';

import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Users, Search, ShieldCheck, Mail, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { user } = useStore();
  const [search, setSearch] = useState('');

  // Mock list of registered candidates
  const mockUsers = [
    { id: 'usr-8821', name: user?.name || 'Alex Carter', email: user?.email || 'alex.carter@cybersec.io', role: user?.role || 'user', scans: user?.scanCount || 14, reports: user?.reportCount || 2, joined: '2026-03-12' },
    { id: 'usr-1205', name: 'Marcus Sterling', email: 'marcus.ster@yahoo.com', role: 'user', scans: 9, reports: 0, joined: '2026-05-18' },
    { id: 'usr-4402', name: 'Elena Rostova', email: 'elena.rost@gmail.com', role: 'user', scans: 25, reports: 4, joined: '2026-02-01' },
    { id: 'usr-9011', name: 'David Kim', email: 'david.kim@berkeley.edu', role: 'user', scans: 3, reports: 1, joined: '2026-06-10' },
    { id: 'usr-7815', name: 'Patricia Boyle', email: 'p.boyle@outlook.com', role: 'user', scans: 18, reports: 3, joined: '2026-04-15' }
  ];

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
          TOTAL ENROLLED: {mockUsers.length} MEMBERS
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
    </div>
  );
}
