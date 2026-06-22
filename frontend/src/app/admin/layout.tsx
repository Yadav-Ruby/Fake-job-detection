'use client';

import React from 'react';

// Admin layout wraps all admin pages, providing container padding.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}
