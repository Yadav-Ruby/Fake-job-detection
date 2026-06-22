'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Globe, 
  User, 
  Settings, 
  LogOut,
  LayoutDashboard,
  ShieldAlert as ShieldIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  BarChart3,
  ListFilter,
  Briefcase
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  // Hide sidebar until user signs up/logs in
  if (!user) return null;

  // If user is not logged in, we shouldn't show the dashboard sidebar (or redirects would handle it)
  // But since we want it fully working, we'll display it whenever we are on a panel route
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

  if (!isPanelRoute) return null;

  const mainNavItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify Scam', href: '/analyze', icon: Terminal },
    { name: 'Jobs Database', href: '/jobs', icon: Briefcase },
    { name: 'Verify Recruiter', href: '/verify-recruiter', icon: CheckCircle2 },
    { name: 'Report Scam', href: '/report-scam', icon: AlertTriangle },
    { name: 'Scan History', href: '/history', icon: History },
    { name: 'Domain Database', href: '/domains', icon: Globe },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
    { name: 'Users Management', href: '/admin/users', icon: Users },
    { name: 'Reports Queue', href: '/admin/reports', icon: ListFilter },
    { name: 'Blocklist Domains', href: '/admin/domains', icon: Globe },
    { name: 'Threat Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const personalNavItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside 
      className={`relative flex flex-col border-r border-cyber-indigo/10 bg-cyber-bg-darker/90 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 h-screen select-none`}
    >
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-cyber-indigo/5">
        <Link href="/" className="flex items-center space-x-2 overflow-hidden">
          <ShieldIcon className="h-6 w-6 text-cyber-cyan shrink-0 animate-pulse" />
          {!collapsed && (
            <span className="bg-gradient-to-r from-white to-cyber-cyan bg-clip-text text-md font-bold tracking-wider text-transparent">
              APPLYSAFE<span className="text-cyber-cyan font-mono text-xs">.COM</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-cyber-indigo/10 bg-cyber-bg text-slate-400 hover:text-cyber-cyan shadow-md transition-all hover:scale-105"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!collapsed && <p className="px-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase">Scanner Portal</p>}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyber-blue/15 to-cyber-cyan/5 text-cyber-cyan border-l-2 border-cyber-cyan pl-2.5' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-14 z-50 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section (Only for Admin role) */}
        {user?.role === 'admin' && (
          <div className="space-y-1 border-t border-slate-900 pt-4">
            {!collapsed && <p className="px-2 text-[10px] font-bold text-cyber-purple tracking-widest uppercase">Admin Command Center</p>}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative ${
                    isActive 
                      ? 'bg-cyber-purple/10 text-cyber-purple border-l-2 border-cyber-purple pl-2.5' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-cyber-purple' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!collapsed && <span>{item.name}</span>}
                  {collapsed && (
                    <div className="absolute left-14 z-50 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Account Settings */}
        <div className="space-y-1 border-t border-slate-900 pt-4">
          {!collapsed && <p className="px-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase">Personal</p>}
          {personalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyber-blue/15 to-cyber-cyan/5 text-cyber-cyan border-l-2 border-cyber-cyan pl-2.5' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-14 z-50 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Session Footer */}
      <div className="border-t border-cyber-indigo/5 p-4 flex flex-col gap-2">
        {user ? (
          <div className="flex items-center justify-between">
            <Link href="/profile" className="flex items-center space-x-3 min-w-0 group">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-cyber-cyan/25 object-cover transition-transform group-hover:scale-105"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-cyber-cyan transition-colors">{user.name}</p>
                  <p className="truncate text-[10px] text-slate-500 font-mono capitalize">{user.role}</p>
                </div>
              )}
            </Link>
            {!collapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-cyber-rose transition-colors rounded-lg hover:bg-slate-900"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <User className="h-3.5 w-3.5" />
            {!collapsed && <span>Authenticate</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
