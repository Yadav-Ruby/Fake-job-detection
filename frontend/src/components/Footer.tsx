'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileText, CheckCircle, Globe, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Footer() {
  const pathname = usePathname();
  const user = useStore((state) => state.user);

  // Hide footer until user signs up/logs in
  if (!user) return null;

  const isPanelRoute = pathname.startsWith('/dashboard') || 
                       pathname.startsWith('/analyze') || 
                       pathname.startsWith('/analysis/result') || 
                       pathname.startsWith('/verify-recruiter') || 
                       pathname.startsWith('/report-scam') || 
                       pathname.startsWith('/history') || 
                       pathname.startsWith('/domains') || 
                       pathname.startsWith('/profile') || 
                       pathname.startsWith('/settings') || 
                       pathname.startsWith('/admin') ||
                       pathname.startsWith('/jobs');

  if (isPanelRoute) return null;

  return (
    <footer className="mt-auto border-t border-cyber-indigo/10 bg-cyber-bg/95 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-cyber-cyan" />
              <span className="text-white font-bold tracking-wider">APPLYSAFE</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Protecting candidates, students, and professionals from sophisticated job phishing networks, advance fee scams, and fraudulent recruitment agents.
            </p>
            <div className="flex space-x-4">
              <span className="flex items-center text-xs text-cyber-emerald bg-cyber-emerald/5 border border-cyber-emerald/20 px-2 py-1 rounded">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                V4 Active Protection
              </span>
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/analyze" className="hover:text-cyber-cyan transition-colors">
                  AI Scam Scanner
                </Link>
              </li>
              <li>
                <Link href="/verify-recruiter" className="hover:text-cyber-cyan transition-colors">
                  Verify Hiring Domain
                </Link>
              </li>
              <li>
                <Link href="/domains" className="hover:text-cyber-cyan transition-colors">
                  Threat Blacklist
                </Link>
              </li>
              <li>
                <Link href="/report-scam" className="hover:text-cyber-cyan transition-colors text-cyber-rose">
                  Report Scam Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Threat Intelligence</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://www.ic3.gov" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center">
                  FBI IC3 Portal
                  <AlertTriangle className="h-3 w-3 ml-1 text-cyber-amber" />
                </a>
              </li>
              <li>
                <a href="https://www.ftc.gov" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors">
                  FTC Job Fraud Hub
                </a>
              </li>
              <li>
                <span className="cursor-not-allowed text-slate-600">
                  Global Scams Dataset (v1.2)
                </span>
              </li>
              <li>
                <span className="cursor-not-allowed text-slate-600">
                  API Security Spec
                </span>
              </li>
            </ul>
          </div>

          {/* Warning disclaimer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Scam Warning</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If an employer requests money for equipment checks, requests interview completion solely on Telegram, or requires banking credentials to apply, please report the listing immediately.
            </p>
            <div className="flex space-x-3 text-slate-500">
              <a href="#" className="hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} ApplySafe. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400">Security Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
