// src/components/admin/Sidebar.tsx
'use client';

import React from 'react';
import GenericSidebar from '@/components/Sidebar';

// Simple wrapper that re-exports the generic Sidebar for admin routes.
// This allows the admin layout to import '@/components/admin/Sidebar' without errors.
export default function Sidebar() {
  return <GenericSidebar />;
}
