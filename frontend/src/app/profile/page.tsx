'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  User, 
  Terminal, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  ShieldCheck,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, analyses } = useStore();

  const profile = user || {
    id: 'usr-guest',
    name: 'Anonymous Candidate',
    email: 'guest@applysafe.com',
    role: 'user',
    scanCount: 0,
    reportCount: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const completedAudits = analyses.filter(a => a.riskLevel === 'safe').length;

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Secured Profile Console
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Candidate credentials keys, protection status logs, and verified search histories.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="glass-panel rounded-xl p-6 border border-cyber-indigo/10 bg-slate-950/70 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-cyber-blue/10 blur-3xl pointer-events-none" />
          
          <img 
            src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
            alt={profile.name} 
            className="h-24 w-24 rounded-full border-2 border-cyber-cyan/35 object-cover mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          />

          <h2 className="text-xl font-bold text-white tracking-wide">{profile.name}</h2>
          <span className="text-xs text-cyber-cyan font-mono mt-1 flex items-center">
            <ShieldCheck className="h-4 w-4 mr-1 text-cyber-cyan animate-pulse" />
            Active Protection Active
          </span>

          <div className="w-full mt-6 border-t border-slate-900 pt-5 space-y-3.5 text-left text-xs font-mono text-slate-400">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <span className="text-slate-600 flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                EMAIL PATH
              </span>
              <span className="text-slate-300 truncate max-w-[150px]">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <span className="text-slate-600 flex items-center">
                <User className="h-3.5 w-3.5 mr-1.5" />
                CONSOLE KEY
              </span>
              <span className="text-slate-300 capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                DATE SIGNED
              </span>
              <span className="text-slate-300">{profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Telemetry metrics statistics */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat Box 1 */}
          <div className="glass-card rounded-xl p-5 border border-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Scans Computed</span>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">Linguistic & Domain audits</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <span className="text-4xl font-black text-white">{profile.scanCount}</span>
              <Terminal className="h-6 w-6 text-cyber-cyan" />
            </div>
          </div>

          {/* Stat Box 2 */}
          <div className="glass-card rounded-xl p-5 border border-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Scams Logged</span>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">Crowdsourced submissions</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <span className="text-4xl font-black text-white">{profile.reportCount}</span>
              <AlertTriangle className="h-6 w-6 text-cyber-rose" />
            </div>
          </div>

          {/* Stat Box 3 */}
          <div className="glass-card rounded-xl p-5 border border-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Averted Risks</span>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">Validated opportunities</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <span className="text-4xl font-black text-white">{completedAudits}</span>
              <CheckCircle className="h-6 w-6 text-cyber-emerald" />
            </div>
          </div>

          {/* Saved Threats Warning panel */}
          <div className="sm:col-span-3 glass-panel rounded-xl p-5 border border-slate-900/60 text-xs text-slate-400 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
              <FileCheck2 className="h-4.5 w-4.5 text-cyber-cyan mr-2" />
              Candidate Safety Status
            </h3>
            <p className="leading-relaxed">
              Your profile is registered with <span className="text-cyber-cyan font-bold font-mono">ApplySafe Active Protect</span>. Any jobs scanned are analyzed against active, blacklisted, and typosquatted domains. Ensure that notifications are enabled under settings to receive high-priority alerts when matching suspicious recruiters query your candidate details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
