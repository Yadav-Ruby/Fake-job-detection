'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../../store/useStore';
import { ListFilter, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

export default function AdminReportsPage() {
  const { reports, updateReportStatus, fetchReports } = useStore();

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleApprove = (id: string) => {
    updateReportStatus(id, 'reviewed');
  };

  const handleReject = (id: string) => {
    updateReportStatus(id, 'rejected');
  };

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
            <ListFilter className="h-7 w-7 text-cyber-rose mr-2 animate-pulse" />
            Scam Reports Moderation Queue
          </h1>
        </div>
      </header>

      {/* Reports Queue */}
      <section className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div 
              key={report.id} 
              className={`glass-panel rounded-xl p-5 border relative ${
                report.status === 'pending' ? 'border-cyber-rose/15 bg-slate-950/70' :
                report.status === 'reviewed' ? 'border-cyber-emerald/10 bg-slate-950/20' :
                'border-slate-800 bg-slate-950/10'
              }`}
            >
              {/* Top accent badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-slate-900 mb-4 text-xs font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white">{report.companyName}</h3>
                  <span className="text-slate-500 block mt-0.5">Website: <span className="text-cyber-cyan font-bold">{report.website}</span></span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                    report.status === 'pending' ? 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10' :
                    report.status === 'reviewed' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                    'text-slate-500 bg-slate-900 border-slate-800'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-slate-500 mt-1 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 leading-relaxed font-mono mb-4 bg-slate-950/50 p-3 rounded border border-slate-900">
                <span className="text-slate-500 font-bold block mb-1">CANDIDATE DISCLOSURE:</span>
                "{report.description}"
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600 font-bold uppercase">Incident ID: {report.id}</span>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(report.id)}
                      className="flex items-center space-x-1 py-1.5 px-3 border border-slate-800 hover:border-cyber-rose rounded bg-slate-900/40 hover:bg-cyber-rose/5 text-slate-400 hover:text-cyber-rose transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Flag</span>
                    </button>
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="flex items-center space-x-1 py-1.5 px-3 border border-slate-800 hover:border-cyber-emerald rounded bg-slate-900/40 hover:bg-cyber-emerald/5 text-slate-400 hover:text-cyber-emerald transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve Alert</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-xl p-8 border border-slate-900 text-center text-slate-500 font-mono text-xs">
            Queue empty. No active crowdsourced incident reports pending.
          </div>
        )}
      </section>
    </div>
  );
}
