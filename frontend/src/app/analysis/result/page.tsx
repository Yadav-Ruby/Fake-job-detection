'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../../store/useStore';
import { 
  AlertTriangle, 
  CheckCircle, 
  Terminal, 
  ShieldAlert, 
  Printer, 
  ArrowLeft,
  Mail,
  Globe,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Calendar,
  Lock
} from 'lucide-react';

export default function AnalysisResultPage() {
  const { activeAnalysis, analyses } = useStore();

  // Safeguard: Fallback to the latest analysis if activeAnalysis is null
  const report = activeAnalysis || analyses[0];

  if (!report) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-slate-500 font-mono">
        No telemetry reports loaded in console cache.
      </div>
    );
  }

  // Risk colors helper
  const getRiskColors = (level: string) => {
    switch (level) {
      case 'safe':
        return { text: 'text-cyber-emerald', border: 'border-cyber-emerald/20', bg: 'bg-cyber-emerald/5', textBg: 'bg-cyber-emerald/10' };
      case 'low':
        return { text: 'text-cyber-blue', border: 'border-cyber-blue/20', bg: 'bg-cyber-blue/5', textBg: 'bg-cyber-blue/10' };
      case 'medium':
        return { text: 'text-cyber-indigo', border: 'border-cyber-indigo/20', bg: 'bg-cyber-indigo/5', textBg: 'bg-cyber-indigo/10' };
      case 'high':
        return { text: 'text-cyber-amber', border: 'border-cyber-amber/20', bg: 'bg-cyber-amber/5', textBg: 'bg-cyber-amber/10' };
      case 'critical':
      default:
        return { text: 'text-cyber-rose', border: 'border-cyber-rose/25', bg: 'bg-cyber-rose/5', textBg: 'bg-cyber-rose/15' };
    }
  };

  const colors = getRiskColors(report.riskLevel);

  // SVG Circular Gauge parameters
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.riskScore / 100) * circumference;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-4 md:p-6 space-y-6 print:bg-white print:text-black">
      {/* Background grids (hidden in print) */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none print:hidden" />

      {/* Top Header Controls */}
      <header className="flex items-center justify-between border-b border-slate-900 pb-4 print:hidden">
        <Link 
          href="/dashboard"
          className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-cyber-cyan transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Control Center</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Export Security Brief</span>
        </button>
      </header>

      {/* Master Telemetry summary block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Circle Card */}
        <div className="glass-panel rounded-2xl p-6 border flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-cyber-cyan/5 blur-2xl print:hidden" />
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mb-4">Risk Threat Score</h3>
          
          <div className="relative flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-900 fill-transparent"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-cyber-cyan fill-transparent transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  stroke: report.riskScore > 70 ? '#f43f5e' : report.riskScore > 35 ? '#f59e0b' : '#10b981'
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono">{report.riskScore}</span>
              <span className="text-[10px] text-slate-500 font-mono">OF 100</span>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded border uppercase font-mono tracking-wider ${colors.text} ${colors.border} ${colors.textBg}`}>
              {report.riskLevel} Level Threat
            </span>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Scam Likelihood: <span className="font-bold text-white">{report.scamProbability}%</span>
            </p>
          </div>
        </div>

        {/* Audit Details Summary */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-cyber-indigo/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-cyber-cyan" />
              <span className="text-xs font-bold text-cyber-cyan font-mono uppercase tracking-widest">Dataset Signature</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-600 block">ADVERTISED POSITION</span>
                <p className="text-slate-200 font-bold text-sm truncate">{report.title}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 block">IMPERSONATED ENTITY</span>
                <p className="text-slate-200 font-bold text-sm truncate">{report.company}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 block">ANALYSIS VECTOR TYPE</span>
                <p className="text-slate-300 uppercase">{report.type}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 block">SECURITY LOG DATE</span>
                <p className="text-slate-300 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-slate-500" />
                  {new Date(report.analyzedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {report.url && (
              <div className="p-2.5 rounded bg-slate-950/50 border border-slate-900 text-xs font-mono break-all">
                <span className="text-slate-600 font-bold block mb-0.5">SOURCE ENDPOINT:</span>
                <a href={report.url} target="_blank" rel="noreferrer" className="text-cyber-cyan hover:underline">{report.url}</a>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>PLATFORM VERDICT: COMPLETED</span>
            <span className="text-cyber-emerald flex items-center">
              <FileCheck2 className="h-4 w-4 mr-0.5" />
              AI Signed Audit
            </span>
          </div>
        </div>
      </section>

      {/* Telemetry Core Details: Indicators, Domain details, recruiter details */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Indicators */}
        <div className="glass-panel rounded-2xl p-6 border">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center">
            <AlertCircle className="h-4.5 w-4.5 text-cyber-rose mr-2" />
            Flagged Threat Indicators
          </h3>
          <div className="space-y-3">
            {report.indicators.map((ind, i) => (
              <div key={i} className={`p-3 rounded-lg border flex space-x-3 text-xs ${
                ind.status === 'danger' ? 'border-cyber-rose/25 bg-cyber-rose/5 text-slate-300' :
                ind.status === 'warning' ? 'border-cyber-amber/20 bg-cyber-amber/5 text-slate-300' :
                'border-cyber-emerald/10 bg-cyber-emerald/5 text-slate-300'
              }`}>
                {ind.status === 'danger' ? <ShieldAlert className="h-4.5 w-4.5 text-cyber-rose shrink-0" /> :
                 ind.status === 'warning' ? <AlertTriangle className="h-4.5 w-4.5 text-cyber-amber shrink-0" /> :
                 <CheckCircle className="h-4.5 w-4.5 text-cyber-emerald shrink-0" />}
                <div>
                  <span className="font-bold text-white block font-mono text-[10px] uppercase mb-0.5">{ind.category}</span>
                  <p className="leading-relaxed">{ind.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center">
            <Lock className="h-4.5 w-4.5 text-cyber-cyan mr-2" />
            Security Recommendations
          </h3>
          <div className="space-y-3">
            {report.securityRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start space-x-3 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyber-cyan/10 text-cyber-cyan font-mono font-bold text-[10px] mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-300 leading-relaxed pt-0.5">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Intel, Recruiter Intel, Salary validation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Domain Intel */}
        <div className="glass-card rounded-xl p-5 border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-cyber-cyan">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold font-mono uppercase">Domain Intelligence</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Host Domain</span>
                <span className="text-slate-200 truncate max-w-[140px]" title={report.domainIntelligence.domain}>{report.domainIntelligence.domain}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Domain Age</span>
                <span className="text-slate-200">{report.domainIntelligence.ageDays} Days</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">SSL Sec Status</span>
                <span className={report.domainIntelligence.sslValid ? 'text-cyber-emerald' : 'text-cyber-rose'}>
                  {report.domainIntelligence.sslValid ? 'SECURE' : 'UNVERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registrar</span>
                <span className="text-slate-300 text-[10px] truncate max-w-[120px]">{report.domainIntelligence.registrar}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between text-[9px] font-mono">
            <span className="text-slate-600">WHOIS CONFIDENCE</span>
            <span className={report.domainIntelligence.trustScore > 60 ? 'text-cyber-emerald' : 'text-cyber-rose'}>
              {report.domainIntelligence.trustScore}/100
            </span>
          </div>
        </div>

        {/* Recruiter verification */}
        <div className="glass-card rounded-xl p-5 border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-cyber-cyan">
              <Mail className="h-4 w-4" />
              <span className="text-xs font-bold font-mono uppercase">Recruiter Alignment</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Header Match</span>
                <span className={report.recruiterVerification.domainMatch ? 'text-cyber-emerald' : 'text-cyber-rose'}>
                  {report.recruiterVerification.domainMatch ? 'MATCHED' : 'ALIGN FALSE'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Audit Status</span>
                <span className={`uppercase ${
                  report.recruiterVerification.status === 'verified' ? 'text-cyber-emerald' :
                  report.recruiterVerification.status === 'suspicious' ? 'text-cyber-rose font-bold' :
                  'text-slate-400'
                }`}>
                  {report.recruiterVerification.status}
                </span>
              </div>
              <div className="p-1 rounded bg-slate-950/40 border border-slate-900 text-[9px] text-slate-400 leading-normal">
                {report.recruiterVerification.message}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between text-[9px] font-mono">
            <span className="text-slate-600">SPF MAIL ALIGN</span>
            <span className="text-cyber-cyan">{report.recruiterVerification.trustScore}%</span>
          </div>
        </div>

        {/* Salary Validation */}
        <div className="glass-card rounded-xl p-5 border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-cyber-cyan">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-bold font-mono uppercase">Salary Validation</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Wage Rating</span>
                <span className={`uppercase font-bold ${
                  report.salaryValidation.status === 'fair' ? 'text-cyber-emerald' :
                  report.salaryValidation.status === 'suspicious' ? 'text-cyber-amber' :
                  'text-cyber-rose'
                }`}>
                  {report.salaryValidation.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Scanned Offer</span>
                <span className="text-slate-200">{report.salaryValidation.detectedRange || 'None parsed'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Market Standard</span>
                <span className="text-slate-200">{report.salaryValidation.marketRange || 'Standard rates'}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-4 text-[9px] font-mono text-slate-500 leading-normal">
            {report.salaryValidation.analysis}
          </div>
        </div>
      </section>
    </div>
  );
}
