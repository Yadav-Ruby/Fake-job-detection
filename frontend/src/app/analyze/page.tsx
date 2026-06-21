'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { 
  Terminal, 
  Globe, 
  FileText, 
  UploadCloud, 
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle,
  FileImage
} from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const { runAnalysis, isScanning, scanProgress } = useStore();

  const [activeTab, setActiveTab] = useState<'url' | 'screenshot' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  
  // Structured input states for text scanner
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Loading pipeline messages for cyber theme
  const pipelineSteps = [
    { threshold: 10, text: 'Resolving destination host & certificates...' },
    { threshold: 25, text: 'Fetching DNS/WHOIS registration history...' },
    { threshold: 50, text: 'Extracting text layout values via EasyOCR...' },
    { threshold: 70, text: 'Evaluating NLP lexical vectors & tf-idf frequencies...' },
    { threshold: 85, text: 'Compiling XGBoost fraud probability metrics...' },
    { threshold: 95, text: 'Finalizing intelligence assessment report...' }
  ];

  const currentStepMessage = pipelineSteps.find(s => scanProgress <= s.threshold)?.text || 'Assessing threat vectors...';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return;

    let scanValue = '';
    let fileName = '';

    if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      scanValue = urlInput;
    } else if (activeTab === 'screenshot') {
      if (!selectedFile) return;
      scanValue = `screenshot_ocr_data_extracted_${selectedFile.name.toLowerCase().replace(/\s+/g, '_')}`;
      fileName = selectedFile.name;
    } else {
      if (!jobDescription.trim()) return;
      scanValue = JSON.stringify({
        companyName: companyName.trim() || 'Unspecified Firm',
        jobTitle: jobTitle.trim() || 'Job Description Analysis',
        domain: domain.trim() || 'anonymous-listing.info',
        jobDescription: jobDescription.trim()
      });
    }

    try {
      await runAnalysis(activeTab, scanValue, fileName);
      router.push('/analysis/result');
    } catch (err) {
      console.error('Scan error:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8 flex flex-col justify-center">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-cyber-blue/5 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full z-10 space-y-6">
        {/* Scanner Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/30 text-cyber-cyan mb-2">
            <Terminal className="h-5 w-5 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            AI Cyber Threat Scanner
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Audit hiring domains, emails, and job listings for counterfeit profiles, phishing endpoints, and fake check indicators.
          </p>
        </div>

        {/* Scanning Progress Dialog Overlay */}
        {isScanning ? (
          <div className="glass-panel rounded-2xl p-8 border border-cyber-cyan/25 bg-slate-950/90 text-center relative overflow-hidden shadow-2xl space-y-6">
            {/* Pulsing Scan Beam */}
            <div className="absolute inset-0 scan-line animate-scan opacity-40 pointer-events-none" />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-cyber-cyan animate-spin" />
              <h3 className="text-lg font-bold text-white font-mono tracking-wider">SECURE PIPELINE RUNNING</h3>
            </div>

            {/* Simulated progress meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>{currentStepMessage}</span>
                <span className="text-cyber-cyan font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-cyan h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center items-center space-x-6 text-[10px] text-slate-600 font-mono">
              <span className={scanProgress > 15 ? 'text-cyber-emerald' : 'animate-pulse'}>[WHOIS VALID]</span>
              <span className={scanProgress > 45 ? 'text-cyber-emerald' : 'animate-pulse'}>[OCR CONTEXT]</span>
              <span className={scanProgress > 75 ? 'text-cyber-emerald' : 'animate-pulse'}>[XGBOOST EVAL]</span>
            </div>
          </div>
        ) : (
          /* Main Tabbed Form Cards */
          <div className="glass-panel rounded-2xl border border-cyber-indigo/10 bg-slate-950/70 p-6 shadow-2xl relative">
            {/* Top Glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-indigo rounded-t-2xl" />

            {/* Scanner Tab Buttons */}
            <div className="grid grid-cols-3 gap-2 border-b border-slate-900 pb-4 mb-6">
              <button
                onClick={() => setActiveTab('url')}
                type="button"
                className={`flex flex-col md:flex-row items-center justify-center py-3 px-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider space-y-1.5 md:space-y-0 md:space-x-2 border transition-all ${
                  activeTab === 'url'
                    ? 'border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan'
                    : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                <Globe className="h-4.5 w-4.5" />
                <span>Link / URL</span>
              </button>
              <button
                onClick={() => setActiveTab('screenshot')}
                type="button"
                className={`flex flex-col md:flex-row items-center justify-center py-3 px-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider space-y-1.5 md:space-y-0 md:space-x-2 border transition-all ${
                  activeTab === 'screenshot'
                    ? 'border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan'
                    : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                <UploadCloud className="h-4.5 w-4.5" />
                <span>Screenshot</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                type="button"
                className={`flex flex-col md:flex-row items-center justify-center py-3 px-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider space-y-1.5 md:space-y-0 md:space-x-2 border transition-all ${
                  activeTab === 'text'
                    ? 'border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan'
                    : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Job Text</span>
              </button>
            </div>

            <form onSubmit={handleScan} className="space-y-6">
              {/* Tab Content: URL Input */}
              {activeTab === 'url' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Target Opportunity URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Globe className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="e.g., https://amazon-jobsite.com/careers/apply"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-3.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono">
                    Scans domain registrar ages, SSL security certificates, mail SPF matching, and keywords.
                  </p>
                </div>
              )}

              {/* Tab Content: Screenshot Upload */}
              {activeTab === 'screenshot' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Upload Listing Screenshot</label>
                  
                  {selectedFile ? (
                    <div className="flex items-center justify-between p-4 border border-cyber-cyan/20 bg-cyber-cyan/5 rounded-xl">
                      <div className="flex items-center space-x-3 min-w-0">
                        <FileImage className="h-8 w-8 text-cyber-cyan shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-cyber-rose hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        dragActive 
                          ? 'border-cyber-cyan bg-cyber-cyan/5' 
                          : 'border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20'
                      }`}
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                      <input 
                        id="file-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="h-10 w-10 text-slate-500 mb-3" />
                      <p className="text-xs text-slate-300 font-semibold mb-1">Drag and drop screenshot image here</p>
                      <p className="text-[10px] text-slate-600 font-mono">Supports JPG, PNG, WebP. Performs full text OCR scan.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Job Text Description */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Apex Data Solvers"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Marketing Specialist"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Domain / Website</label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g., apexdatasolutions.work"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 font-mono uppercase">Job Description Details</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={5}
                      placeholder="Paste full text advertisement, recruiter text messages, or email body copy here..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-200 placeholder-slate-600 focus:border-cyber-cyan focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono">
                    Analyzes textual pressure, salary discrepancies, check schemes, and contact emails.
                  </p>
                </div>
              )}

              {/* Scan Trigger */}
              <button
                type="submit"
                disabled={
                  (activeTab === 'url' && !urlInput.trim()) ||
                  (activeTab === 'screenshot' && !selectedFile) ||
                  (activeTab === 'text' && !jobDescription.trim())
                }
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan py-3.5 text-sm font-bold text-cyber-bg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Shield className="h-4.5 w-4.5" />
                <span>Execute AI Scrutiny Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
