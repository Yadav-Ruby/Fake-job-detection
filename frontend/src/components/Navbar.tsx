'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Menu, X, LayoutDashboard, Terminal, CheckCircle2, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide navbar until user signs up/logs in
  if (!user) return null;

  // Check if current route is part of dashboard/admin layout to hide the main landing navbar
  const isPanelRoute = (pathname.startsWith('/dashboard') || 
                       pathname.startsWith('/analyze') || 
                       pathname.startsWith('/analysis/result') || 
                       pathname.startsWith('/verify-recruiter') || 
                       pathname.startsWith('/report-scam') || 
                       pathname.startsWith('/history') || 
                       pathname.startsWith('/domains') || 
                       pathname.startsWith('/profile') || 
                       pathname.startsWith('/settings') || 
                       pathname.startsWith('/admin') || 
                       pathname.startsWith('/jobs')) &&
                      pathname !== '/admin/login' &&
                      pathname !== '/admin/register';

  if (isPanelRoute) return null;

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Verify Scam', href: '/analyze', icon: Terminal },
    { name: 'Threat Index', href: '/domains', icon: ShieldAlert },
    { name: 'Recruiter Lookup', href: '/verify-recruiter', icon: CheckCircle2 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-cyber-indigo/10 bg-cyber-bg/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/5 transition-all duration-300 group-hover:border-cyber-cyan group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <ShieldAlert className="h-5 w-5 text-cyber-cyan animate-pulse" />
                <div className="absolute inset-0 rounded-lg bg-cyber-cyan/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-200 to-cyber-cyan bg-clip-text text-xl font-bold tracking-tight text-transparent">
                ApplySafe<span className="text-cyber-cyan text-xs font-mono ml-1 px-1.5 py-0.5 rounded border border-cyber-cyan/20 bg-cyber-cyan/5">Console</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-cyber-cyan transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-sm font-medium text-slate-300 hover:text-cyber-cyan transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-sm font-medium text-cyber-purple hover:text-cyber-cyan transition-colors border border-cyber-purple/20 bg-cyber-purple/5 px-2.5 py-1 rounded-md"
                  >
                    <Terminal className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-slate-400 hover:text-cyber-rose transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="text-sm font-medium text-cyber-purple hover:text-cyber-purple/80 transition-colors border border-cyber-purple/20 bg-cyber-purple/5 px-3.5 py-1.5 rounded-lg"
                >
                  Admin
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan px-4 py-2 text-sm font-semibold text-cyber-bg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                >
                  Get Shielded
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyber-indigo/10 bg-cyber-bg/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-cyber-cyan transition-all"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-800" />
          {user ? (
            <div className="space-y-2">
              <div className="px-3 py-2 text-slate-400 text-xs flex items-center space-x-2">
                <User className="h-4 w-4 text-cyber-cyan" />
                <span>Logged in as: {user.name}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-cyber-cyan transition-all"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-cyber-purple hover:bg-slate-800 hover:text-cyber-cyan transition-all"
                >
                  Admin Center
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-cyber-rose hover:bg-slate-800 transition-all"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-md border border-cyber-purple/35 py-2 text-sm font-medium text-cyber-purple hover:bg-cyber-purple/5 transition-all"
              >
                Admin
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-md border border-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-md bg-gradient-to-r from-cyber-blue to-cyber-cyan py-2 text-sm font-semibold text-cyber-bg transition-all"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
