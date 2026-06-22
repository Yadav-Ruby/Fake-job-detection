'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../../store/useStore';
import { Globe, ArrowLeft, Trash2, Plus, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminDomainsPage() {
  const { domains, addDomain, deleteDomain, fetchDomains } = useStore();

  const [domainName, setDomainName] = useState('');
  const [riskScore, setRiskScore] = useState(85);
  const [threatType, setThreatType] = useState('Phishing / Fake Job Board');
  const [status, setStatus] = useState<'active' | 'offline' | 'monitored'>('active');
  const [registrar, setRegistrar] = useState('Namecheap Inc.');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!domainName.trim()) {
      setError('Domain name is required.');
      return;
    }
    if (domains.some(d => d.domain.toLowerCase() === domainName.toLowerCase().trim())) {
      setError('This domain is already registered in blocklist.');
      return;
    }

    addDomain(domainName.trim(), riskScore, threatType, status, registrar);
    setSuccess(`Domain ${domainName.trim()} appended successfully.`);
    setDomainName('');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 pb-6">
        <Link href="/admin" className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-cyber-cyan transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Admin Overview</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center">
          <Globe className="h-7 w-7 text-cyber-cyan mr-2" />
          DNS Blocklist Registry
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Domain Form */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 bg-slate-950/70 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-4">
            <Plus className="h-4.5 w-4.5 text-cyber-cyan" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Register Suspect Node</h3>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg border border-cyber-emerald/20 bg-cyber-emerald/5 text-xs text-cyber-emerald font-mono">
              {success}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Domain Name</label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="e.g., joboffer-ups-check.xyz"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <label className="uppercase font-bold tracking-widest">Danger Risk Index</label>
                <span className="text-cyber-rose font-bold">{riskScore}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={99}
                value={riskScore}
                onChange={(e) => setRiskScore(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyber-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Threat Classification</label>
              <input
                type="text"
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                placeholder="e.g., Phishing"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registrar Authority</label>
              <input
                type="text"
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                placeholder="e.g., GoDaddy"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 px-3 text-xs text-slate-300 focus:border-cyber-cyan focus:outline-none font-mono"
              >
                <option value="active">Active blocklist</option>
                <option value="monitored">Under monitoring</option>
                <option value="offline">Offline / Suspended</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan py-2 text-xs font-bold text-cyber-bg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              <span>Register Blocklist Node</span>
            </button>
          </form>
        </div>

        {/* Domains List Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-xl border border-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500">
                    <th className="p-4 font-semibold uppercase">Domain Node</th>
                    <th className="p-4 font-semibold uppercase">Danger Index</th>
                    <th className="p-4 font-semibold uppercase">Classification</th>
                    <th className="p-4 font-semibold uppercase">Status</th>
                    <th className="p-4 font-semibold uppercase text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {domains.map((dom) => (
                    <tr key={dom.id} className="hover:bg-slate-900/35 transition-colors">
                      <td className="p-4 font-bold text-slate-200 truncate max-w-[150px]" title={dom.domain}>
                        {dom.domain}
                      </td>
                      <td className="p-4 font-bold text-cyber-rose">{dom.riskScore}%</td>
                      <td className="p-4 text-slate-400 truncate max-w-[120px]" title={dom.threatType}>{dom.threatType}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                          dom.status === 'active' ? 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10' :
                          dom.status === 'monitored' ? 'text-cyber-amber bg-cyber-amber/5 border-cyber-amber/10' :
                          'text-slate-500 bg-slate-900 border-slate-800'
                        }`}>
                          {dom.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteDomain(dom.id)}
                          className="p-1 hover:text-cyber-rose text-slate-600 transition-colors rounded hover:bg-slate-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
