'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../store/useStore';
import { 
  AlertTriangle, 
  Building, 
  Globe, 
  Mail, 
  FileText, 
  UploadCloud, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileImage
} from 'lucide-react';

export default function ReportScamPage() {
  const { submitScamReport } = useStore();

  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('Please provide a descriptive account (min 20 characters) of the fraudulent interaction.');
      return;
    }

    setLoading(true);

    // Simulate submission
    setTimeout(() => {
      const mockTicket = `TRT-${Math.floor(Math.random() * 900000) + 100000}`;
      const screenshotVal = selectedFile ? `report_evidence_${selectedFile.name.toLowerCase()}` : undefined;
      
      submitScamReport(
        companyName,
        website || 'Not Provided',
        recruiterEmail || 'Not Provided',
        description,
        screenshotVal
      );

      setTicketId(mockTicket);
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setCompanyName('');
    setWebsite('');
    setRecruiterEmail('');
    setDescription('');
    setSelectedFile(null);
    setSuccess(false);
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Crowdsourced Threat Registry
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Submit details of suspicious job ads, fake checks, or recruiter fraud to alert candidates worldwide.
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        {success ? (
          /* SUCCESS STATE PANEL */
          <div className="glass-panel rounded-xl p-8 border border-cyber-emerald/20 bg-slate-950/80 text-center relative overflow-hidden space-y-6">
            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-cyber-emerald/10 blur-2xl" />
            
            <div className="flex flex-col items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 flex items-center justify-center text-cyber-emerald mb-4">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Threat Registered Successfully</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">TICKET ID: {ticketId}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Our AI analysis pipelines have successfully cataloged this threat signature. The details are immediately pushed to our domain monitoring networks and visible to admin review boards.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-300 transition-colors"
              >
                File Another Threat Report
              </button>
              <Link
                href="/domains"
                className="flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan px-5 py-2.5 text-xs font-bold text-cyber-bg hover:opacity-90 transition-opacity"
              >
                <span>Browse Threat Database</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* REPORT INPUT FORM */
          <div className="glass-panel rounded-xl p-6 border border-cyber-indigo/10 bg-slate-950/70 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-rose to-cyber-purple rounded-t-xl" />

            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-5">
              <AlertTriangle className="h-5 w-5 text-cyber-rose animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Incident Indicators Form</h3>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Employer Company Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Building className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Meta Careers Ltd"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Website / Scam Link</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                      <Globe className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g., company-jobdesk.xyz"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Recruiter Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Recruiter / Sender Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="e.g., hr-support@company-jobdesk.xyz"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Interaction Account (Min 20 chars) *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Explain how the scam occurred (e.g., offered $40/hr on Telegram, sent check to buy laptop, asked for crypto deposits for product reviews)..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* screenshot evidence upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Evidence Screenshot</label>
                
                {selectedFile ? (
                  <div className="flex items-center justify-between p-3 border border-cyber-rose/20 bg-cyber-rose/5 rounded-lg text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileImage className="h-5 w-5 text-cyber-rose shrink-0" />
                      <span className="text-slate-300 truncate">{selectedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-cyber-rose hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => document.getElementById('report-file-input')?.click()}
                    className="border border-dashed border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20 rounded-lg py-5 text-center cursor-pointer flex flex-col items-center justify-center"
                  >
                    <input 
                      id="report-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="h-7 w-7 text-slate-600 mb-1" />
                    <span className="text-[10px] text-slate-400 font-semibold">Upload Chat logs or job posting image</span>
                  </div>
                )}
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={loading || !companyName.trim() || description.length < 20}
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyber-rose to-cyber-purple py-2.5 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Broadcasting Threat Brief</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
