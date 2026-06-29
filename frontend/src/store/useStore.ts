import { create } from 'zustand';
import { JobAnalysis, RecruiterVerification, ScamReport, SuspiciousDomain, KeywordThreat, UserProfile } from '../types';
import { 
  INITIAL_USER, 
  INITIAL_ANALYSES, 
  INITIAL_RECRUITERS, 
  INITIAL_DOMAINS, 
  INITIAL_KEYWORDS, 
  INITIAL_REPORTS,
  evaluateJobScam
} from '../lib/mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

interface AppState {
  user: UserProfile | null;
  analyses: JobAnalysis[];
  recruiters: RecruiterVerification[];
  reports: ScamReport[];
  domains: SuspiciousDomain[];
  keywords: KeywordThreat[];
  activeAnalysis: JobAnalysis | null;
  isScanning: boolean;
  scanProgress: number; // 0 - 100

  // Auth actions
  login: (email: string, name?: string, role?: 'user' | 'admin', password?: string, isRegister?: boolean) => Promise<void>;
  createAdmin: (name: string, email: string, passcode: string) => Promise<void>;
  logout: () => void;

  // Analysis actions
  runAnalysis: (type: 'url' | 'screenshot' | 'text', value: string, fileName?: string, file?: File) => Promise<JobAnalysis>;
  setActiveAnalysis: (analysis: JobAnalysis | null) => void;

  // Recruiter actions
  checkRecruiter: (email: string, companyName: string, name?: string) => Promise<RecruiterVerification>;

  // Crowdsourcing scam reports
  submitScamReport: (companyName: string, website: string, recruiterEmail: string, description: string, screenshot?: string) => void;
  updateReportStatus: (id: string, status: 'pending' | 'reviewed' | 'rejected') => Promise<void>;

  // Admin configurations
  addDomain: (domain: string, riskScore: number, threatType: string, status: 'active' | 'offline' | 'monitored', registrar: string) => Promise<void>;
  deleteDomain: (id: string) => Promise<void>;
  addKeyword: (keyword: string, riskWeight: 'low' | 'medium' | 'high', category: string) => void;
  deleteKeyword: (id: string) => void;
  fetchJobs: () => Promise<void>;
  users: any[];
  fetchUsers: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchDomains: () => Promise<void>;
  fetchAnalytics: () => Promise<any>;
  stats: any;
  fetchStats: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  users: [],
  analyses: INITIAL_ANALYSES,
  recruiters: INITIAL_RECRUITERS,
  reports: INITIAL_REPORTS,
  domains: INITIAL_DOMAINS,
  keywords: INITIAL_KEYWORDS,
  stats: {
    enrolled_candidates: 0,
    pending_reports: 0,
    blocklist_records: 0,
    cached_scans: 0,
    audit_logs: []
  },
  activeAnalysis: INITIAL_ANALYSES[0], // prefill with Amazon analysis initially
  isScanning: false,
  scanProgress: 0,

  login: async (email, name, role, password, isRegister) => {
    const userRole = role || (email.includes('admin') ? 'admin' : 'user');
    const displayName = name || (userRole === 'admin' ? 'Senior Threat Analyst' : 'User Member');
    const userId = `usr-${Math.floor(Math.random() * 9000) + 1000}`;
    
    try {
      const res = await fetch(apiUrl('/api/auth/profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: userId, 
          email, 
          name: displayName, 
          role: userRole, 
          password: password || undefined, 
          is_register: !!isRegister 
        })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
        
        // Log the login audit trail
        fetch(apiUrl('/api/audit-logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: email, action: 'LOGIN', details: 'User logged into console.' })
        }).catch(err => console.error("Audit log failed:", err));
      } else {
        let errMessage = 'Authentication failed.';
        try {
          const errData = await res.json();
          errMessage = errData.detail || errMessage;
        } catch (_) {
          try {
            errMessage = await res.text() || errMessage;
          } catch (_) {}
        }
        throw new Error(errMessage);
      }
    } catch (e) {
      console.error("Login profile upsert error:", e);
      if (userRole === 'admin') {
        throw e;
      }
      
      if (e instanceof Error && (
        e.message.includes('Access Denied') || 
        e.message.includes('Invalid') || 
        e.message.includes('not found') || 
        e.message.includes('already exists')
      )) {
        throw e;
      }
      
      // Fallback local memory state for offline mode
      set({
        user: {
          id: userId,
          name: displayName,
          email,
          role: userRole,
          scanCount: 0,
          reportCount: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  },

  createAdmin: async (name, email, password) => {
    try {
      const res = await fetch(apiurl('/api/admin/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        let errMessage = 'Failed to create administrator.';
        try {
          const errData = await res.json();
          errMessage = errData.detail || errMessage;
        } catch (_) {
          try {
            errMessage = await res.text() || errMessage;
          } catch (_) {}
        }
        throw new Error(errMessage);
      }
      await get().fetchUsers();
    } catch (e) {
      console.error("createAdmin error:", e);
      throw e;
    }
  },

  logout: () => {
    set({ user: null });
  },

  runAnalysis: async (type, value, fileName, file) => {
    set({ isScanning: true, scanProgress: 5, activeAnalysis: null });

    // Simulate analysis step progress for scanning animations
    const progressInterval = setInterval(() => {
      set((state) => {
        if (state.scanProgress >= 90) {
          clearInterval(progressInterval);
          return { scanProgress: 90 };
        }
        return { scanProgress: state.scanProgress + 15 };
      });
    }, 250);

    try {
      let endpoint = '';
      let method = 'POST';
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any = null;

      if (type === 'url') {
        endpoint = '/api/analyze/url';
        body = JSON.stringify({ url: value });
      } else if (type === 'text') {
        endpoint = '/api/analyze/job';
        let parsedVal = { job_title: 'Manual Description Scan', job_description: value, company_name: 'Unspecified Firm', location_raw: 'India', salary_raw: '' };
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            const data = JSON.parse(value);
            parsedVal = {
              job_title: data.jobTitle || 'Manual Description Scan',
              job_description: data.jobDescription || '',
              company_name: data.companyName || 'Unspecified Firm',
              location_raw: 'India',
              salary_raw: ''
            };
          } catch(e) {}
        }
        body = JSON.stringify(parsedVal);
      } else if (type === 'screenshot') {
        endpoint = '/api/analyze/screenshot';
        const formData = new FormData();
        if (file) {
          formData.append('file', file);
        } else {
          const blob = new Blob([value], { type: 'text/plain' });
          formData.append('file', blob, fileName || 'screenshot.png');
        }
        headers = {};
        body = formData;
      }

      const response = await fetch(endpoint, {
        method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body
      });
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      
      const data = await response.json();
      clearInterval(progressInterval);
      set({ scanProgress: 95 });

      const mappedRiskLevel: Record<string, 'safe' | 'low' | 'medium' | 'high' | 'critical'> = {
        'Safe': 'safe',
        'Low Risk': 'low',
        'Medium Risk': 'medium',
        'High Risk': 'high',
        'Scam Likely': 'critical'
      };

      const jobDetails = data.job_details || {};
      const riskLevel = mappedRiskLevel[data.risk_level] || 'medium';

      const indicators = (data.alerts || []).map((alert: any) => ({
        category: alert.title || 'Risk Signal',
        status: alert.severity === 'red' ? 'danger' : alert.severity === 'amber' ? 'warning' : 'safe',
        message: alert.message
      }));

      const result: JobAnalysis = {
        id: `an-${Math.floor(Math.random() * 90000) + 10000}`,
        title: jobDetails.job_title || 'Unknown Title',
        company: jobDetails.company_name || 'Unknown Company',
        type,
        url: type === 'url' ? value : undefined,
        text: type === 'text' ? (value.startsWith('{') ? JSON.parse(value).jobDescription : value) : undefined,
        screenshot: type === 'screenshot' ? fileName : undefined,
        riskScore: data.score,
        scamProbability: data.score,
        riskLevel,
        analyzedAt: new Date().toISOString(),
        indicators,
        salaryValidation: {
          status: data.signals?.salary_risk > 75 ? 'unrealistic' : data.signals?.salary_risk > 35 ? 'suspicious' : 'fair',
          analysis: data.explanation || 'Salary bounds verified against market standards.',
          detectedRange: jobDetails.salary_raw || 'Not Specified',
          marketRange: '$22.00 - $28.00/hour'
        },
        domainIntelligence: {
          domain: jobDetails.company_name ? `${jobDetails.company_name.toLowerCase().replace(/\s+/g, '')}.com` : 'unknown.com',
          ageDays: data.signals?.company_risk > 50 ? 10 : 450,
          sslValid: true,
          registrar: data.signals?.company_risk > 50 ? 'Privately Registered' : 'Verified Registrar',
          riskIndicators: data.signals?.company_risk > 50 ? ['Newly registered domain'] : [],
          trustScore: Math.max(0, 100 - (data.signals?.company_risk || 0))
        },
        recruiterVerification: {
          email: '',
          name: 'Unknown Recruiter',
          status: data.signals?.contact_risk > 75 ? 'suspicious' : data.signals?.contact_risk > 35 ? 'unverified' : 'verified',
          domainMatch: data.signals?.contact_risk <= 35,
          message: `Verification indicators score: ${100 - (data.signals?.contact_risk || 0)}/100`,
          trustScore: Math.max(0, 100 - (data.signals?.contact_risk || 0)),
          reputationIndicators: []
        },
        securityRecommendations: data.score > 50 ? [
          'Do not make any upfront payments for recruitment or training equipment.',
          'Verify recruitment contacts through official public phone listings.'
        ] : [
          'Proceed with caution. Always verify recruiters independently.'
        ]
      };

      set((state) => {
        const updatedAnalyses = [result, ...state.analyses];
        const updatedUser = state.user 
          ? { ...state.user, scanCount: state.user.scanCount + 1 }
          : null;

        return {
          analyses: updatedAnalyses,
          activeAnalysis: result,
          isScanning: false,
          scanProgress: 100,
          user: updatedUser
        };
      });

      // Log the scan audit trail
      const currentUser = get().user;
      if (currentUser) {
        fetch(apiurl('/api/audit-logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_email: currentUser.email, 
            action: 'SCAN', 
            details: `Scanned job listing: ${result.title} at ${result.company}.` 
          })
        }).catch(err => console.error("Audit log failed:", err));
      }

      return result;
    } catch (e) {
      clearInterval(progressInterval);
      set({ isScanning: false, scanProgress: 0 });
      console.error("Scan failed:", e);
      throw e;
    }
  },

  setActiveAnalysis: (analysis) => {
    set({ activeAnalysis: analysis });
  },

  checkRecruiter: async (email, companyName, name) => {
    try {
      const res = await fetch(apiurl('/api/verify/recruiter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || '', email, company: companyName })
      });
      if (res.ok) {
        const data = await res.json();
        const newCheck: RecruiterVerification = {
          id: `rec-${Math.floor(Math.random() * 9000) + 1000}`,
          email,
          companyName: companyName || 'Unknown',
          trustScore: data.score,
          domainMatch: data.checks.find((c: any) => c.label === "Domain Match")?.status === "pass",
          status: data.status === 'likely_genuine' ? 'verified' : data.status,
          reputationIndicators: data.checks.map((c: any) => `${c.label}: ${c.value} (${c.status.toUpperCase()})`),
          checkedAt: new Date().toISOString()
        };
        if (data.registrar && data.registrar !== "Unknown") {
          newCheck.reputationIndicators.push(`Domain Registrar: ${data.registrar}`);
        }
        set((state) => ({
          recruiters: [newCheck, ...state.recruiters]
        }));
        return newCheck;
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback Mock
    const newCheck: RecruiterVerification = {
      id: `rec-${Math.floor(Math.random() * 9000) + 1000}`,
      email,
      companyName,
      trustScore: 50,
      domainMatch: false,
      status: 'unknown',
      reputationIndicators: ['Verification offline fallback'],
      checkedAt: new Date().toISOString()
    };
    return newCheck;
  },

  submitScamReport: async (companyName, website, recruiterEmail, description, screenshot) => {
    const newReport: ScamReport = {
      id: `rep-${Math.floor(Math.random() * 9000) + 1000}`,
      companyName,
      website,
      recruiterEmail,
      description,
      screenshot,
      status: 'pending',
      reportedAt: new Date().toISOString()
    };

    try {
      await fetch(apiurl('/api/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_url: website,
          job_description: description,
          company_name: companyName,
          contact_method: recruiterEmail ? 'Email' : 'Website',
          experience: '',
          contact: recruiterEmail || ''
        })
      });
      
      const currentUser = get().user;
      if (currentUser) {
        fetch(apiurl('/api/audit-logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_email: currentUser.email, 
            action: 'REPORT', 
            details: `Filed scam report for company: ${companyName}.` 
          })
        }).catch(err => console.error("Audit log failed:", err));
      }
    } catch (e) {
      console.error("Failed to submit scam report:", e);
    }

    set((state) => {
      const updatedReports = [newReport, ...state.reports];
      const updatedUser = state.user 
        ? { ...state.user, reportCount: state.user.reportCount + 1 }
        : null;

      let updatedDomains = [...state.domains];
      const domainName = website.replace('https://', '').replace('http://', '').split('/')[0];
      if (domainName && !state.domains.some(d => d.domain === domainName)) {
        updatedDomains = [
          {
            id: `dom-${Math.floor(Math.random() * 9000) + 1000}`,
            domain: domainName,
            riskScore: 75,
            threatType: 'User Flagged / Crowdsourced',
            status: 'monitored',
            lastActive: new Date().toISOString(),
            registrar: 'Pending Lookup'
          },
          ...updatedDomains
        ];
      }

      return {
        reports: updatedReports,
        user: updatedUser,
        domains: updatedDomains
      };
    });
  },

  updateReportStatus: async (id, status) => {
    try {
      await fetch(`/api/admin/reports/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      set((state) => ({
        reports: state.reports.map(r => r.id === id ? { ...r, status } : r)
      }));
    } catch (e) {
      console.error("Error updating report status:", e);
    }
  },

  addDomain: async (domain, riskScore, threatType, status, registrar) => {
    try {
      await fetch(apiurl('/api/admin/domains'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, riskScore, threatType, status, registrar })
      });
      const res = await fetch(apiurl('/api/admin/domains'));
      if (res.ok) {
        const data = await res.json();
        set({ domains: data.domains || [] });
      }
    } catch (e) {
      console.error("Error adding domain:", e);
    }
  },

  deleteDomain: async (id) => {
    try {
      await fetch(`/api/admin/domains/${id}`, {
        method: 'DELETE'
      });
      set((state) => ({
        domains: state.domains.filter(d => d.id !== id)
      }));
    } catch (e) {
      console.error("Error deleting domain:", e);
    }
  },

  addKeyword: (keyword, riskWeight, category) => {
    const newKeyword: KeywordThreat = {
      id: `kw-${Math.floor(Math.random() * 9000) + 1000}`,
      keyword,
      riskWeight,
      category
    };
    set((state) => ({
      keywords: [newKeyword, ...state.keywords]
    }));
  },

  deleteKeyword: (id) => {
    set((state) => ({
      keywords: state.keywords.filter(k => k.id !== id)
    }));
  },

  fetchJobs: async () => {
    try {
      const res = await fetch(apiurl('/api/jobs'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.jobs) {
          const mappedJobs = data.jobs.map((dbJob: any) => {
            const riskLevelMap: Record<string, 'safe' | 'low' | 'medium' | 'high' | 'critical'> = {
              'Safe': 'safe',
              'Low Risk': 'low',
              'Medium Risk': 'medium',
              'High Risk': 'high',
              'Scam Likely': 'critical'
            };

            const companyName = dbJob.companies?.name || 'Unknown Company';
            const companyTrust = dbJob.companies?.company_trust_score || 50;

            const recruiterName = dbJob.recruiters?.name || 'Unknown Recruiter';
            const recruiterVerify = dbJob.recruiters?.recruiter_verification_score || 30;

            const indicators = (dbJob.risk_factors || []).map((factor: string) => ({
              category: 'Listing Signal',
              status: dbJob.scam_score > 60 ? 'danger' : dbJob.scam_score > 30 ? 'warning' : 'safe',
              message: factor
            }));

            return {
              id: String(dbJob.id || Math.random()),
              title: dbJob.job_title || 'Unknown Title',
              company: companyName,
              type: 'url',
              url: dbJob.source_url || '',
              text: dbJob.job_description || '',
              riskScore: dbJob.scam_score || 0,
              scamProbability: dbJob.scam_score || 0,
              riskLevel: riskLevelMap[dbJob.scam_risk_level] || 'medium',
              analyzedAt: dbJob.created_at || new Date().toISOString(),
              indicators: indicators,
              salaryValidation: {
                status: dbJob.scam_score > 60 ? 'suspicious' : 'fair',
                analysis: dbJob.salary_raw ? `Salary: ${dbJob.salary_raw}` : 'Salary not specified.',
                detectedRange: dbJob.salary_raw || ''
              },
              domainIntelligence: {
                domain: dbJob.companies?.domain || '',
                ageDays: 365,
                sslValid: true,
                registrar: 'Verified Registrar',
                riskIndicators: [],
                trustScore: companyTrust
              },
              recruiterVerification: {
                email: '',
                name: recruiterName,
                status: recruiterVerify > 75 ? 'verified' : recruiterVerify > 40 ? 'unverified' : 'suspicious',
                domainMatch: recruiterVerify > 50,
                message: `Verification score: ${recruiterVerify}/100`,
                trustScore: recruiterVerify,
                reputationIndicators: []
              },
              securityRecommendations: [
                'Verify the company registration status.',
                'Do not make any upfront payments for recruitment.',
                'Check communication headers and domain authentication.'
              ]
            };
          });
          set({ analyses: mappedJobs });
        }
      }
    } catch (e) {
      console.error("Error fetching jobs from API:", e);
    }
  },

  fetchUsers: async () => {
    try {
      const res = await fetch(apiurl('/api/admin/users'));
      if (res.ok) {
        const data = await res.json();
        set({ users: data.users || [] });
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  },

  fetchReports: async () => {
    try {
      const res = await fetch(apiurl('/api/admin/reports'));
      if (res.ok) {
        const data = await res.json();
        set({ reports: data.reports || [] });
      }
    } catch (e) {
      console.error("Error fetching reports:", e);
    }
  },

  fetchDomains: async () => {
    try {
      const res = await fetch(apiurl('/api/admin/domains'));
      if (res.ok) {
        const data = await res.json();
        set({ domains: data.domains || [] });
      }
    } catch (e) {
      console.error("Error fetching domains:", e);
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await fetch(apiurl('/api/admin/analytics'));
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    }
    return null;
  },

  fetchStats: async () => {
    try {
      const res = await fetch(apiurl('/api/stats'));
      if (res.ok) {
        const data = await res.json();
        set({
          stats: {
            enrolled_candidates: data.users_count || 0,
            pending_reports: data.reports_filed || 0,
            blocklist_records: data.companies_count || 0,
            cached_scans: data.total_jobs || 0,
            audit_logs: data.audit_logs || []
          }
        });
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }
}));
