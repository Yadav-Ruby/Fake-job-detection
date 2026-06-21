'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const isPublicRoute = cleanPathname === '/' || 
                        cleanPathname === '/login' || 
                        cleanPathname === '/register' ||
                        cleanPathname === '/admin/login' ||
                        cleanPathname === '/admin/register';

  const isAdminRoute = cleanPathname.startsWith('/admin') && 
                       cleanPathname !== '/admin/login' && 
                       cleanPathname !== '/admin/register';

  useEffect(() => {
    if (mounted) {
      if (!isPublicRoute && !user) {
        // Redirect to login page and preserve the current path
        if (cleanPathname.startsWith('/admin')) {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } else if (isAdminRoute && user && user.role !== 'admin') {
        // Enforce admin permission check
        router.push(`/admin/login?error=unauthorized&redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, pathname, cleanPathname, router, isPublicRoute, isAdminRoute, mounted]);

  // Prevent flash of protected content for unauthenticated users or unauthorized admin access
  if (mounted && ((!isPublicRoute && !user) || (isAdminRoute && user && user.role !== 'admin'))) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs tracking-wider animate-pulse">AUTHENTICATING SECURE SESSION...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
