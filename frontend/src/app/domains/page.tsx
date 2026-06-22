'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Globe, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  Activity,
  AlertTriangle,
  ServerOff,
  Radio,
  FileCheck2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DomainsPage() {
  const { domains, fetchDomains } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDomains();
  }, [fetchDomains]);

  // Mock domain activity data over last 7 days
  const activityData = [
    { day: 'Mon', activeThreats: 14, blockedMails: 85 },
    { day: 'Tue', activeThreats: 18, blockedMails: 120 },
    { day: 'Wed', activeThreats: 25, blockedMails: 145 },
    { day: 'Thu', activeThreats: 30, blockedMails: 190 },
    { day: 'Fri', activeThreats: 22, blockedMails: 160 },
    { day: 'Sat', activeThreats: 19, blockedMails: 110 },
    { day: 'Sun', activeThreats: 24, blockedMails: 135 }
  ];

  // Perform filtration
  const filteredDomains = domains.filter((item) => {
    const matchesSearch = item.domain.toLowerCase().includes(search.toLowerCase()) || 
                          item.threatType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      <header className="border-b border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Domain Blacklist Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Global threat database of fraudulent company lookalikes, task-scam portals, and fake email servers.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-cyber-cyan font-mono border border-cyber-cyan/25 bg-cyber-cyan/5 px-2.5 py-1 rounded">
          <Activity className="h-4.5 w-4.5 text-cyber-cyan animate-pulse mr-1" />
          <span>Active DNS Spiders Scanning...</span>
        </div>
      </header>

      {/* Domain activity chart */}
      <section className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 h-[280px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">DNS Spoofing & Phishing Activity</h3>
            <p className="text-[10px] text-slate-500 font-mono">Telemetry metrics: Blocked emails vs Flagged active servers (Last 7 Days)</p>
          </div>
        </div>
        <div className="flex-1 w-full text-xs">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="domainColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f1a30" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080f1e', borderColor: '#1e293b', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="blockedMails" stroke="#00f0ff" fill="none" strokeWidth={2} name="Spam Emails Blocked" />
                <Area type="monotone" dataKey="activeThreats" stroke="#f43f5e" fillOpacity={1} fill="url(#domainColor)" strokeWidth={2} name="Active Domains Flagged" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-600 font-mono">Loading charts...</div>
          )}
        </div>
      </section>

      {/* Search & Filtration Bar */}
      <section className="glass-panel rounded-xl p-4 border border-slate-900 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain or threat type..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyber-cyan font-mono w-full sm:w-auto"
        >
          <option value="all">All Domain Statuses</option>
          <option value="active">Active Blocklist</option>
          <option value="monitored">Under Monitoring</option>
          <option value="offline">Offline / Suspended</option>
        </select>
      </section>

      {/* Domains Table list */}
      <section className="glass-panel rounded-xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500">
                <th className="p-4 font-semibold uppercase">Domain Node</th>
                <th className="p-4 font-semibold uppercase">Threat Type Classification</th>
                <th className="p-4 font-semibold uppercase">Registrar Authority</th>
                <th className="p-4 font-semibold uppercase">Risk Factor</th>
                <th className="p-4 font-semibold uppercase">Status</th>
                <th className="p-4 font-semibold uppercase">Last Spider Query</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredDomains.length > 0 ? (
                filteredDomains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="p-4 flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-200 truncate max-w-[200px]" title={dom.domain}>{dom.domain}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">{dom.threatType}</td>
                    <td className="p-4 text-slate-500">{dom.registrar}</td>
                    <td className="p-4 font-bold">
                      <span className={`inline-block ${
                        dom.riskScore > 85 ? 'text-cyber-rose' :
                        dom.riskScore > 60 ? 'text-cyber-amber' :
                        'text-cyber-blue'
                      }`}>
                        {dom.riskScore}% DANGER
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        dom.status === 'active' ? 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10' :
                        dom.status === 'monitored' ? 'text-cyber-amber bg-cyber-amber/5 border-cyber-amber/10' :
                        'text-slate-500 bg-slate-900 border-slate-800'
                      }`}>
                        {dom.status === 'active' && <Radio className="h-2.5 w-2.5 text-cyber-rose animate-pulse mr-1" />}
                        {dom.status === 'monitored' && <Activity className="h-2.5 w-2.5 text-cyber-amber mr-1" />}
                        {dom.status === 'offline' && <ServerOff className="h-2.5 w-2.5 text-slate-500 mr-1" />}
                        {dom.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(dom.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No blacklisted domains match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
