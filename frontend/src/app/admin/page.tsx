'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../store/useStore';
import { 
  ShieldAlert, 
  Users, 
  Globe, 
  Terminal, 
  Activity, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  ListFilter
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, fetchStats } = useStore();

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totalUsersCount = stats.enrolled_candidates;
  const activeScannersCount = stats.cached_scans;
  const pendingReportsCount = stats.pending_reports;
  const blacklistedDomainsCount = stats.blocklist_records;

  const adminStats = [
    { name: 'Enrolled Candidates', value: totalUsersCount, icon: Users, color: 'text-cyber-cyan', border: 'border-cyber-cyan/15 bg-cyber-cyan/5' },
    { name: 'Pending Scam Reports', value: pendingReportsCount, icon: ListFilter, color: 'text-cyber-rose', border: 'border-cyber-rose/15 bg-cyber-rose/5' },
    { name: 'Domain Blocklist Records', value: blacklistedDomainsCount, icon: Globe, color: 'text-cyber-emerald', border: 'border-cyber-emerald/15 bg-cyber-emerald/5' },
    { name: 'Telemetry Scans Cached', value: activeScannersCount, icon: Terminal, color: 'text-cyber-purple', border: 'border-cyber-purple/15 bg-cyber-purple/5' }
  ];

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Enterprise Admin Operations Console
          </h1>
          <p className="text-xs text-cyber-purple font-mono mt-1">
            Status: <span className="text-cyber-cyan font-bold animate-pulse">● Master Control Center Active</span>
          </p>
        </div>
        <div className="flex space-x-2 text-[10px] text-slate-500 font-mono">
          <span>OPERATOR CLASS: ADVANCED ANALYST</span>
        </div>
      </header>

      {/* Stat Boxes */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-card rounded-xl p-5 border flex flex-col justify-between ${stat.border}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">{stat.name}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">{stat.value}</span>
                <p className="text-[9px] text-slate-500 mt-1">Live synchronized data</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Action shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Controls */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
            <Lock className="h-4.5 w-4.5 text-cyber-cyan mr-2" />
            Operational Subsections
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/users"
              className="p-3 border border-slate-800 bg-slate-900/30 rounded-lg hover:border-cyber-cyan/35 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-24 group"
            >
              <Users className="h-5 w-5 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-200">Users Registry</p>
                <span className="text-[9px] text-slate-500 font-mono">Inspect candidate activities</span>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="p-3 border border-slate-800 bg-slate-900/30 rounded-lg hover:border-cyber-cyan/35 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-24 group"
            >
              <ListFilter className="h-5 w-5 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-200">Moderation Queue</p>
                <span className="text-[9px] text-slate-500 font-mono">{pendingReportsCount} threats pending audit</span>
              </div>
            </Link>

            <Link
              href="/admin/domains"
              className="p-3 border border-slate-800 bg-slate-900/30 rounded-lg hover:border-cyber-cyan/35 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-24 group"
            >
              <Globe className="h-5 w-5 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-200">Blocklist Monitor</p>
                <span className="text-[9px] text-slate-500 font-mono">Configure DNS blocklists</span>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-3 border border-slate-800 bg-slate-900/30 rounded-lg hover:border-cyber-cyan/35 hover:bg-slate-900/80 transition-all flex flex-col justify-between h-24 group"
            >
              <TrendingUp className="h-5 w-5 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-200">Threat Analytics</p>
                <span className="text-[9px] text-slate-500 font-mono">View performance & false positives</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Console logs ticker */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
              <Activity className="h-4.5 w-4.5 text-cyber-rose mr-2" />
              Consolidated Security Log
            </h3>
            <div className="space-y-2 text-[10px] font-mono text-slate-400">
              {stats.audit_logs && stats.audit_logs.length > 0 ? (
                stats.audit_logs.map((log: any, idx: number) => (
                  <div key={idx} className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-600">{log.time}</span>
                    <span className={`text-slate-300 ${log.action === 'CRITICAL' ? 'text-cyber-rose font-bold' : ''}`}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-center py-4">No security logs recorded.</div>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between text-[9px] font-mono">
            <span className="text-slate-600">SECURE SHELL CONSOLE</span>
            <span className="text-cyber-cyan">V4.9.2-RELEASE</span>
          </div>
        </div>
      </section>
    </div>
  );
}
