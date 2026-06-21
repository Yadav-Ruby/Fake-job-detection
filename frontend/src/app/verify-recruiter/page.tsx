'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ShieldCheck, 
  Mail, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  History,
  Clock,
  User
} from 'lucide-react';

export default function VerifyRecruiterPage() {
  const { checkRecruiter, recruiters } = useStore();

  const [recruiterName, setRecruiterName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [activeResult, setActiveResult] = useState<typeof recruiters[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailInput.trim()) {
      setError('Please provide recruiter email address.');
      return;
    }
    if (!emailInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email layout structure.');
      return;
    }

    setLoading(true);

    // Perform actual recruiter verification API call via store action
    checkRecruiter(emailInput, companyInput || 'Claimed Employer', recruiterName)
      .then((result) => {
        setActiveResult(result);
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Recruiter Domain Validator
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Perform real-time SPF/DMARC checks and domain registry validation to detect recruiter impersonation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Form */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 bg-slate-950/70 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-4">
            <ShieldCheck className="h-4.5 w-4.5 text-cyber-cyan" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Verify Agent Credentials</h3>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Recruiter Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Recruiter Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="hr-support@company.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Company Name (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Building2 className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan py-2.5 text-xs font-bold text-cyber-bg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-bg border-t-transparent" />
              ) : (
                <>
                  <span>Audit Identity</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        <div className="lg:col-span-2 space-y-6">
          {activeResult ? (
            <div className="glass-panel rounded-xl p-6 border border-cyber-cyan/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-cyber-cyan" style={{
                backgroundColor: activeResult.status === 'verified' ? '#10b981' : activeResult.status === 'suspicious' ? '#f43f5e' : '#64748b'
              }} />

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  {recruiterName && (
                    <p className="text-[10px] font-bold text-cyber-cyan font-mono uppercase tracking-wider mb-1">RECRUITER: {recruiterName}</p>
                  )}
                  <h3 className="text-lg font-bold text-white font-mono break-all">{activeResult.email}</h3>
                  <p className="text-xs text-slate-400 mt-1">Claimed Company: <span className="text-slate-200 font-semibold">{activeResult.companyName}</span></p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                    activeResult.status === 'verified' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                    activeResult.status === 'suspicious' ? 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10' :
                    'text-slate-400 bg-slate-900 border-slate-800'
                  }`}>
                    {activeResult.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">Checked: {new Date(activeResult.checkedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="mt-6 space-y-2 border-t border-slate-900 pt-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Identity Confidence Trust Score</span>
                  <span className={`font-bold ${
                    activeResult.trustScore > 75 ? 'text-cyber-emerald' :
                    activeResult.trustScore > 40 ? 'text-cyber-amber' :
                    'text-cyber-rose'
                  }`}>{activeResult.trustScore}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${activeResult.trustScore}%`,
                      backgroundColor: activeResult.trustScore > 75 ? '#10b981' : activeResult.trustScore > 40 ? '#f59e0b' : '#f43f5e'
                    }} 
                  />
                </div>
              </div>

              {/* Check details */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Domain Indicators Matrix</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2 p-2.5 rounded bg-slate-950/40 border border-slate-900">
                    {activeResult.domainMatch ? (
                      <CheckCircle className="h-4.5 w-4.5 text-cyber-emerald" />
                    ) : (
                      <XCircle className="h-4.5 w-4.5 text-cyber-rose" />
                    )}
                    <span className="text-slate-300">Domain Match Status</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2.5 rounded bg-slate-950/40 border border-slate-900">
                    {activeResult.status === 'verified' ? (
                      <CheckCircle className="h-4.5 w-4.5 text-cyber-emerald" />
                    ) : (
                      <AlertTriangle className="h-4.5 w-4.5 text-cyber-rose" />
                    )}
                    <span className="text-slate-300">SPF alignment check</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">DNS Registry Logs</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeResult.reputationIndicators.map((ind, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-8 border border-slate-900 text-center text-slate-500 font-mono text-xs h-[300px] flex flex-col items-center justify-center">
              <Mail className="h-8 w-8 text-slate-700 mb-3 animate-pulse" />
              <span>Query recruiter email above to initialize DNS security checks.</span>
            </div>
          )}
        </div>
      </div>

      {/* Audit History Logs */}
      <section className="glass-panel rounded-xl p-5 border border-slate-900/60">
        <div className="flex items-center space-x-2 mb-4 border-b border-slate-900 pb-3">
          <History className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Previous Queries Telemetry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500">
                <th className="pb-3 font-semibold uppercase">Email Query</th>
                <th className="pb-3 font-semibold uppercase">Company</th>
                <th className="pb-3 font-semibold uppercase">Trust Score</th>
                <th className="pb-3 font-semibold uppercase">Security Status</th>
                <th className="pb-3 font-semibold uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {recruiters.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/35 transition-colors cursor-pointer" onClick={() => setActiveResult(rec)}>
                  <td className="py-3.5 font-bold truncate max-w-[200px]" title={rec.email}>{rec.email}</td>
                  <td className="py-3.5 text-slate-400">{rec.companyName}</td>
                  <td className="py-3.5">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${
                        rec.trustScore > 75 ? 'text-cyber-emerald' : rec.trustScore > 40 ? 'text-cyber-amber' : 'text-cyber-rose'
                      }`}>{rec.trustScore}%</span>
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full rounded-full" style={{ 
                          width: `${rec.trustScore}%`,
                          backgroundColor: rec.trustScore > 75 ? '#10b981' : rec.trustScore > 40 ? '#f59e0b' : '#f43f5e'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                      rec.status === 'verified' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                      rec.status === 'suspicious' ? 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10' :
                      'text-slate-400 bg-slate-900 border-slate-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {new Date(rec.checkedAt).toLocaleDateString()}
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
