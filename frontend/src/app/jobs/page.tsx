'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { 
  Briefcase, 
  Search, 
  ChevronRight, 
  Clock, 
  Filter,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function JobsDashboardPage() {
  const router = useRouter();
  const { analyses, setActiveAnalysis, fetchJobs } = useStore();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleViewBrief = (job: typeof analyses[0]) => {
    setActiveAnalysis(job);
    router.push('/analysis/result');
  };

  // Perform filtration
  const filteredJobs = analyses.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) || 
      job.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || job.riskLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Calculate quick stats
  const totalCount = analyses.length;
  const safeCount = analyses.filter(j => j.riskLevel === 'safe').length;
  const threatCount = analyses.filter(j => j.riskLevel === 'high' || j.riskLevel === 'critical').length;
  const suspiciousRatio = ((threatCount / totalCount) * 100).toFixed(0);

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center">
          <Briefcase className="h-7 w-7 text-cyber-cyan mr-2" />
          Global Job Listings Safety Registry
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Explore complete evaluated postings database. Scan vacancy parameters and read comprehensive cybersecurity briefings.
        </p>
      </header>

      {/* Stats Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-5 border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Total Database Entries</span>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-3xl font-black text-white">{totalCount} Jobs</span>
            <Briefcase className="h-5 w-5 text-cyber-cyan" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-cyber-emerald/10 bg-cyber-emerald/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Verified Safe Roles</span>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-3xl font-black text-cyber-emerald">{safeCount} Jobs</span>
            <ShieldCheck className="h-5 w-5 text-cyber-emerald" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-cyber-rose/10 bg-cyber-rose/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Malicious Listings Flagged</span>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-3xl font-black text-cyber-rose">{threatCount} Jobs</span>
            <ShieldAlert className="h-5 w-5 text-cyber-rose" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Threat Index Percentage</span>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-3xl font-black text-white">{suspiciousRatio}% Danger</span>
            <BarChart3 className="h-5 w-5 text-cyber-purple" />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="glass-panel rounded-xl p-4 border border-slate-900 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, company, or title..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-mono text-slate-500 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1" />
            Sort:
          </span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyber-cyan font-mono"
          >
            <option value="all">All Risk Classes</option>
            <option value="safe">Verified Safe</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Threats</option>
          </select>
        </div>
      </section>

      {/* Job Grid database layout */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div 
            key={job.id}
            className="glass-panel rounded-xl p-5 border border-slate-900/60 hover:border-cyber-cyan/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">{job.company}</span>
                <h3 className="text-sm font-bold text-slate-200 truncate">{job.title}</h3>
              </div>
              <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold shrink-0 ${
                job.riskLevel === 'safe' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                job.riskLevel === 'low' ? 'text-cyber-blue bg-cyber-blue/5 border-cyber-blue/10' :
                job.riskLevel === 'medium' ? 'text-cyber-indigo bg-cyber-indigo/5 border-cyber-indigo/10' :
                job.riskLevel === 'high' ? 'text-cyber-amber bg-cyber-amber/5 border-cyber-amber/10' :
                'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10'
              }`}>
                {job.riskLevel}
              </span>
            </div>

            {/* Quick telemetry details */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 p-2.5 rounded bg-slate-950/40 border border-slate-900">
              <div>
                <span className="text-slate-600 block">SCAM PROBABILITY</span>
                <span className="text-slate-300 font-bold">{job.scamProbability}%</span>
              </div>
              <div>
                <span className="text-slate-600 block">DANGER FACTOR</span>
                <span className="text-slate-300 font-bold">{job.riskScore}/100</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-xs">
              <span className="text-[9px] text-slate-600 font-mono flex items-center">
                <Clock className="h-3 w-3 mr-0.5" />
                Audited: {new Date(job.analyzedAt).toLocaleDateString()}
              </span>
              
              <button
                onClick={() => handleViewBrief(job)}
                className="flex items-center space-x-1 text-cyber-cyan hover:text-white font-bold transition-colors"
              >
                <span>View Security Report</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
