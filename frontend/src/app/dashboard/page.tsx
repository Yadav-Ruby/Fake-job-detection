'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  CheckCircle, 
  Terminal, 
  Search, 
  AlertTriangle, 
  FileText, 
  Users, 
  ChevronRight,
  TrendingUp,
  Activity,
  Globe,
  Clock
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { user, analyses, reports, domains, recruiters, setActiveAnalysis, fetchJobs, fetchDomains, fetchReports } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchJobs();
    fetchDomains();
    fetchReports();
  }, [fetchJobs, fetchDomains, fetchReports]);

  // Calculate live values
  const totalAnalyzed = analyses.length;
  const scamReportsCount = reports.length;
  const threatAlerts = analyses.filter(a => a.riskScore > 60).length + domains.filter(d => d.riskScore > 80).length;
  const safeOpportunities = analyses.filter(a => a.riskScore <= 15).length;

  // Mock charts datasets
  const trendData = [
    { name: 'Jan', Scams: 22, Checked: 40 },
    { name: 'Feb', Scams: 35, Checked: 65 },
    { name: 'Mar', Scams: 45, Checked: 90 },
    { name: 'Apr', Scams: 60, Checked: 120 },
    { name: 'May', Scams: 85, Checked: 180 },
    { name: 'Jun', Scams: 110, Checked: 240 }
  ];

  const distributionData = [
    { name: 'Safe', value: analyses.filter(a => a.riskLevel === 'safe').length || 1, color: '#10b981' },
    { name: 'Low/Med', value: analyses.filter(a => a.riskLevel === 'low' || a.riskLevel === 'medium').length || 1, color: '#6366f1' },
    { name: 'High', value: analyses.filter(a => a.riskLevel === 'high').length || 1, color: '#f59e0b' },
    { name: 'Critical', value: analyses.filter(a => a.riskLevel === 'critical').length || 1, color: '#f43f5e' }
  ];

  const handleViewResult = (analysis: typeof analyses[0]) => {
    setActiveAnalysis(analysis);
    router.push('/analysis/result');
  };

  const statCards = [
    { 
      title: 'Jobs Analyzed', 
      value: totalAnalyzed, 
      desc: 'Cumulative text & url scans', 
      icon: Terminal, 
      color: 'text-cyber-cyan', 
      bg: 'bg-cyber-cyan/5 border-cyber-cyan/15' 
    },
    { 
      title: 'Active Threats Listed', 
      value: threatAlerts, 
      desc: 'Identified scam listings & domains', 
      icon: ShieldAlert, 
      color: 'text-cyber-rose', 
      bg: 'bg-cyber-rose/5 border-cyber-rose/15' 
    },
    { 
      title: 'Verified Opportunities', 
      value: safeOpportunities, 
      desc: 'Validated safe corporate links', 
      icon: CheckCircle, 
      color: 'text-cyber-emerald', 
      bg: 'bg-cyber-emerald/5 border-cyber-emerald/15' 
    },
    { 
      title: 'Crowdsourced Reports', 
      value: scamReportsCount, 
      desc: 'User flagged job advertisements', 
      icon: AlertTriangle, 
      color: 'text-cyber-amber', 
      bg: 'bg-cyber-amber/5 border-cyber-amber/15' 
    }
  ];

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Cyber Threat Command Center
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Status: <span className="text-cyber-emerald font-bold animate-pulse">● System Online</span> | Operator ID: {user?.id || 'usr-guest'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/analyze"
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan px-4 py-2 text-xs font-bold text-cyber-bg hover:opacity-90 transition-opacity shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <Terminal className="h-4 w-4" />
            <span>New Scan</span>
          </Link>
          <Link
            href="/report-scam"
            className="flex items-center space-x-1.5 rounded-lg border border-cyber-rose/20 bg-cyber-rose/5 hover:bg-cyber-rose/10 px-4 py-2 text-xs font-bold text-cyber-rose transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Report Scam</span>
          </Link>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`glass-card rounded-xl p-5 border flex flex-col justify-between ${card.bg}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">{card.title}</span>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">{card.value}</span>
                <p className="text-[10px] text-slate-500 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Trend */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Job Scam Proliferation</h3>
              <p className="text-[10px] text-slate-500">Historical trend mapping: Analyses vs Confirmed Scams</p>
            </div>
            <TrendingUp className="h-4 w-4 text-cyber-cyan" />
          </div>
          <div className="flex-1 w-full text-xs">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scamsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1a30" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#080f1e', borderColor: '#1e293b', color: '#fff' }} 
                  />
                  <Area type="monotone" dataKey="Checked" stroke="#6366f1" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="Scams" stroke="#00f0ff" fillOpacity={1} fill="url(#scamsColor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-600 font-mono">Loading telemetry...</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Distribution */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Risk Profile Ratio</h3>
              <p className="text-[10px] text-slate-500">Distribution of evaluated datasets</p>
            </div>
            <Activity className="h-4 w-4 text-cyber-purple" />
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            {mounted ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full text-[10px] text-slate-400">
                  {distributionData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 justify-center">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-600 font-mono">Loading metrics...</div>
            )}
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses List */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Scans</h3>
              <p className="text-[10px] text-slate-500 font-mono">Direct audit logs</p>
            </div>
            <Link href="/history" className="text-xs text-cyber-cyan hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3.5">
            {analyses.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                onClick={() => handleViewResult(item)}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-900/60 bg-slate-950/20 hover:border-cyber-cyan/20 hover:bg-slate-900/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`h-8 w-8 rounded flex items-center justify-center border shrink-0 ${
                    item.riskLevel === 'safe' ? 'border-cyber-emerald/20 bg-cyber-emerald/5 text-cyber-emerald' :
                    item.riskLevel === 'low' || item.riskLevel === 'medium' ? 'border-cyber-blue/20 bg-cyber-blue/5 text-cyber-blue' :
                    'border-cyber-rose/20 bg-cyber-rose/5 text-cyber-rose'
                  }`}>
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyber-cyan transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.company} • {item.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                      item.riskLevel === 'safe' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                      item.riskLevel === 'low' ? 'text-cyber-blue bg-cyber-blue/5 border-cyber-blue/10' :
                      item.riskLevel === 'medium' ? 'text-cyber-indigo bg-cyber-indigo/5 border-cyber-indigo/10' :
                      item.riskLevel === 'high' ? 'text-cyber-amber bg-cyber-amber/5 border-cyber-amber/10' :
                      'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10'
                    }`}>
                      {item.riskLevel}
                    </span>
                    <p className="text-[9px] text-slate-600 font-mono mt-1 flex items-center">
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      {new Date(item.analyzedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-cyber-cyan transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Intelligence Watchlist */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Domain Watchlist</h3>
              <p className="text-[10px] text-slate-500 font-mono">Top malicious lookalikes</p>
            </div>
            <Link href="/domains" className="text-xs text-cyber-cyan hover:underline flex items-center">
              <span>Full List</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {domains.slice(0, 4).map((domain) => (
              <div key={domain.id} className="flex justify-between items-center p-2.5 rounded bg-slate-950/45 border border-slate-900">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate font-mono">{domain.domain}</p>
                  <span className="text-[9px] text-slate-500 font-mono">{domain.threatType}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-cyber-rose font-bold">{domain.riskScore}%</span>
                  <p className="text-[8px] font-mono text-slate-600 uppercase">{domain.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
