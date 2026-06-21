'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-mono text-xs tracking-wider animate-pulse">REDIRECTING TO SECURE GATEWAY...</p>
      </div>
    </div>
  );
}
