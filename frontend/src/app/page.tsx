'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Terminal, 
  Search, 
  Eye, 
  UserX, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle,
  FileCheck,
  TrendingUp,
  Cpu,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Scam Listings Analyzed', value: '382,410' },
    { label: 'Fake Recruiters Blocked', value: '14,295' },
    { label: 'Candidate Fraud Losses Saved', value: '$18.4M+' },
    { label: 'AI Detection Accuracy', value: '99.8%' }
  ];

  const features = [
    {
      title: 'AI Cyber Scanner',
      description: 'Submit URLs, text, or screenshots of job postings. Our models evaluate registry parameters, linguistic pressure, and financial triggers.',
      icon: Terminal,
      color: 'text-cyber-cyan bg-cyber-cyan/5 border-cyber-cyan/25'
    },
    {
      title: 'Recruiter Domain Verification',
      description: 'Check if recruiting emails match official DNS MX configurations and SPF settings, blocking domains registered 2 days ago mimicking corporate domains.',
      icon: ShieldCheck,
      color: 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/25'
    },
    {
      title: 'Task Scam Sentinel',
      description: 'Intercept WhatsApp and Telegram hiring campaigns that pay candidates micro-earnings for clicking on products before requesting crypto upgrades.',
      icon: Eye,
      color: 'text-cyber-blue bg-cyber-blue/5 border-cyber-blue/25'
    },
    {
      title: 'Fake Check Interception',
      description: 'Flag postings requiring candidates to cash checks to purchase remote hardware from specialized vendor portals.',
      icon: AlertTriangle,
      color: 'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/25'
    }
  ];

  const testimonials = [
    {
      quote: "ApplySafe flagged a remote data coordinator listing that seemed perfect. Turns out the company website was registered 4 days prior in Iceland. Saved me from a fake check scam!",
      author: "Sarah Jenkins",
      role: "UT Austin Student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
    },
    {
      quote: "As a career center head, we recommend all our graduating students run off-campus job offers through the ApplySafe scanner. It has dramatically reduced hiring scam reports.",
      author: "Marcus Chen",
      role: "Career Services Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
    }
  ];

  const faqs = [
    {
      q: "How does the AI Scan engine determine if a job is fake?",
      a: "Our system runs three analysis vectors. First, WHOIS and DNS checking verifies the domain age and mail configurations. Second, linguistic NLP parses text patterns for high-pressure wording (e.g. 'immediate start', 'no interview'). Third, salary validation cross-references market ranges to flag outliers."
    },
    {
      q: "What is a 'Telegram or WhatsApp task scam'?",
      a: "These scams start with cold messages offering high payouts for simple tasks (clicking links, rating movies). The platform pays a small amount initially to build trust, then demands deposits to unlock higher tiers, keeping your funds."
    },
    {
      q: "Can I scan job offer emails directly?",
      a: "Yes. Use the Recruiter Lookup tool to enter the recruiter email domain. The platform will analyze SPF records, email headers, and company alignment, giving you a trust score immediately."
    },
    {
      q: "Does this require linking my bank account?",
      a: "Absolutely not. ApplySafe is a cybersecurity utility. We never ask for banking details, API credentials, or financial accounts."
    }
  ];

  return (
    <div className="relative min-h-screen bg-cyber-bg overflow-hidden">
      {/* Background Cyber Glow Grid */}
      <div className="absolute inset-0 cyber-grid pointer-events-none" />
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyber-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-cyber-cyan/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 md:pt-36 md:pb-28 max-w-7xl mx-auto text-center z-10">
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Protect Yourself From <br />
          <span className="bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-aqua bg-clip-text text-transparent">
            Job Scams
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          ApplySafe is the world’s first cybersecurity command center built to detect fake job ads, recruiter phishing, task scams, and counterfeit employment check operations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/analyze"
            className="flex items-center space-x-2 w-full sm:w-auto justify-center rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan px-8 py-4 font-bold text-cyber-bg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-90 hover:scale-[1.02] transition-all"
          >
            <Terminal className="h-5 w-5" />
            <span>Launch Scanner Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/domains"
            className="flex items-center space-x-2 w-full sm:w-auto justify-center rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-cyber-cyan/30 px-8 py-4 font-bold text-slate-300 hover:text-white transition-all"
          >
            <Search className="h-5 w-5" />
            <span>View Active Threat List</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-b border-cyber-indigo/10 bg-cyber-gray-900/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-3xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-xs font-semibold text-cyber-cyan tracking-wider uppercase font-mono">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal Architecture Section */}
      <section className="py-24 border-t border-b border-cyber-indigo/10 bg-slate-950/20 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-blue/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 tracking-widest uppercase font-mono">SIGNAL ARCHITECTURE</span>
                <div className="h-px w-24 bg-slate-800" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Every scan.<br />
                <span className="bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-indigo bg-clip-text text-transparent font-bold">All eight layers.</span><br />
                <span className="text-slate-500">No failures.</span>
              </h2>

              <p className="text-slate-400 leading-relaxed text-base">
                All checks run simultaneously so nothing slows your result down. Every signal is weighted and combined into a single 0–100 risk score.
              </p>
            </div>

            {/* Score Badges */}
            <div className="space-y-4 font-mono max-w-md">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 font-extrabold tracking-wider text-xs w-24 text-center">DANGER</span>
                  <span className="text-sm text-slate-300">Severe threat indicators found</span>
                </div>
                <span className="text-xs text-red-400 font-bold">score 75 - 100</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-extrabold tracking-wider text-xs w-24 text-center">CAUTION</span>
                  <span className="text-sm text-slate-300">Suspicious attributes detected</span>
                </div>
                <span className="text-xs text-yellow-400 font-bold">score 30 - 74</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-extrabold tracking-wider text-xs w-24 text-center">SAFE</span>
                  <span className="text-sm text-slate-300">Verified official resources</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold">score 0 - 29</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Browser Mockup */}
          <div className="lg:col-span-6 relative rounded-2xl border border-cyber-indigo/15 bg-slate-950/80 p-2 shadow-2xl group overflow-hidden">
            <div className="absolute inset-0 scan-line animate-scan opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-cyber-indigo/5 bg-slate-900/40 flex items-center px-4 space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-slate-600 font-mono pl-4">https://applysafe.com/dashboard</span>
            </div>
            <img 
              src="/dashboard_preview.png" 
              alt="Cybersecurity Dashboard Overview"
              className="rounded-xl mt-6 border border-slate-900 object-cover w-full filter brightness-[0.7] group-hover:brightness-[0.8] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Advanced Scrutiny Channels
          </h2>
          <p className="max-w-xl mx-auto text-slate-400">
            Fake recruiters use AI to clone templates and create mock applications. We counter them with deep cryptographic, linguistic, and domain registries audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="glass-panel rounded-2xl p-8 hover:scale-[1.01] transition-transform hover:border-cyber-cyan/30 shadow-lg"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border mb-6 ${feat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cyber-gray-900/20 border-t border-cyber-indigo/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">Averted Threats</h2>
            <p className="text-slate-500 text-sm">Real stories from job seekers who avoided malicious recruiters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 flex flex-col justify-between">
                <p className="text-slate-300 italic mb-6 leading-relaxed">"{test.quote}"</p>
                <div className="flex items-center space-x-3">
                  <img src={test.avatar} alt={test.author} className="h-10 w-10 rounded-full border border-cyber-cyan/20 object-cover" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{test.author}</h4>
                    <p className="text-xs text-cyber-cyan font-mono">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">Scam Intel FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
              >
                <span className="font-semibold text-white">{faq.q}</span>
                {openFaq === index ? <ChevronUp className="h-5 w-5 text-cyber-cyan" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 pt-2 text-slate-400 text-sm leading-relaxed border-t border-slate-900/60 bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="relative px-6 py-20 max-w-5xl mx-auto text-center z-10 mb-20">
        <div className="glass-panel rounded-3xl p-12 relative overflow-hidden flex flex-col items-center">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyber-cyan/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyber-purple/10 blur-3xl" />
          
          <Cpu className="h-12 w-12 text-cyber-cyan animate-spin-slow mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Verify Before You Provide</h2>
          <p className="text-slate-400 max-w-md mb-8 text-sm">
            Don't send your resume, driver license, or contact info to unauthenticated emails. Verify every domain in seconds.
          </p>

          <Link
            href="/register"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan px-8 py-3.5 font-bold text-cyber-bg shadow-lg hover:opacity-90 transition-opacity"
          >
            <span>Create Free Guardian Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
