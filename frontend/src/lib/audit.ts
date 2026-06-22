// Simple audit utility for the frontend application
// Scans the src/app directory for page.tsx files and reports any that are not linked in the Navbar.
// This is a placeholder implementation. In a real scenario, you would parse the JSX and analyze route usage.

export type AuditResult = {
  route: string;
  linkedInNavbar: boolean;
};

export function runAudit(): AuditResult[] {
  // Hardcoded list of routes for demonstration purposes.
  const routes = [
    '/',
    '/analyze',
    '/domains',
    '/verify-recruiter',
    '/dashboard',
    '/admin',
    '/admin/users',
    '/admin/reports',
    '/admin/analytics',
    '/admin/domains',
    '/login',
    '/register',
  ];

  // Simulated navbar links (extracted from Navbar component)
  const navbarLinks = [
    '/',
    '/analyze',
    '/domains',
    '/verify-recruiter',
    '/admin',
    '/login',
    '/register',
    '/dashboard',
  ];

  const results: AuditResult[] = routes.map((r) => ({
    route: r,
    linkedInNavbar: navbarLinks.includes(r),
  }));

  return results;
}
