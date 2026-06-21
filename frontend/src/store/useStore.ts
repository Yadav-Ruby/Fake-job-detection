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
  login: (email: string, name?: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;

  // Analysis actions
  runAnalysis: (type: 'url' | 'screenshot' | 'text', value: string, fileName?: string) => Promise<JobAnalysis>;
  setActiveAnalysis: (analysis: JobAnalysis | null) => void;

  // Recruiter actions
  checkRecruiter: (email: string, companyName: string, name?: string) => Promise<RecruiterVerification>;

  // Crowdsourcing scam reports
  submitScamReport: (companyName: string, website: string, recruiterEmail: string, description: string, screenshot?: string) => void;
  updateReportStatus: (id: string, status: 'pending' | 'reviewed' | 'rejected') => void;

  // Admin configurations
  addDomain: (domain: string, riskScore: number, threatType: string, status: 'active' | 'offline' | 'monitored', registrar: string) => void;
  deleteDomain: (id: string) => void;
  addKeyword: (keyword: string, riskWeight: 'low' | 'medium' | 'high', category: string) => void;
  deleteKeyword: (id: string) => void;
  fetchJobs: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  analyses: INITIAL_ANALYSES,
  recruiters: INITIAL_RECRUITERS,
  reports: INITIAL_REPORTS,
  domains: INITIAL_DOMAINS,
  keywords: INITIAL_KEYWORDS,
  activeAnalysis: INITIAL_ANALYSES[0], // prefill with Amazon analysis initially
  isScanning: false,
  scanProgress: 0,

  login: async (email, name, role) => {
    const userRole = role || (email.includes('admin') ? 'admin' : 'user');
    const displayName = name || (userRole === 'admin' ? 'Senior Threat Analyst' : 'User Member');
    const userId = `usr-${Math.floor(Math.random() * 9000) + 1000}`;
    
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, email, name: displayName, role: userRole })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
        
        // Log the login audit trail
        fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: email, action: 'LOGIN', details: 'User logged into console.' })
        }).catch(err => console.error("Audit log failed:", err));
      }
    } catch (e) {
      console.error("Login profile upsert error:", e);
      // Fallback local memory state
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

  logout: () => {
    set({ user: null });
  },

  runAnalysis: async (type, value, fileName) => {
    set({ isScanning: true, scanProgress: 5, activeAnalysis: null });

    // Simulate analysis step progress for scanning animations
    const progressInterval = setInterval(() => {
      set((state) => {
        if (state.scanProgress >= 95) {
          clearInterval(progressInterval);
          return { scanProgress: 95 };
        }
        return { scanProgress: state.scanProgress + 15 };
      });
    }, 250);

    // Dynamic scanner logic
    return new Promise<JobAnalysis>((resolve) => {
      setTimeout(() => {
        clearInterval(progressInterval);
        const result = evaluateJobScam(type, value, fileName);

        // Prepend to analysis history
        set((state) => {
          const updatedAnalyses = [result, ...state.analyses];
          
          // Increment user counts
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

        resolve(result);
      }, 2000);
    });
  },

  setActiveAnalysis: (analysis) => {
    set({ activeAnalysis: analysis });
  },

  checkRecruiter: async (email, companyName, name) => {
    try {
      const res = await fetch('/api/verify/recruiter', {
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

  submitScamReport: (companyName, website, recruiterEmail, description, screenshot) => {
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

    set((state) => {
      const updatedReports = [newReport, ...state.reports];
      const updatedUser = state.user 
        ? { ...state.user, reportCount: state.user.reportCount + 1 }
        : null;

      // Add report website to suspicious domains database if not present
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

  updateReportStatus: (id, status) => {
    set((state) => ({
      reports: state.reports.map(r => r.id === id ? { ...r, status } : r)
    }));
  },

  addDomain: (domain, riskScore, threatType, status, registrar) => {
    const newDomain: SuspiciousDomain = {
      id: `dom-${Math.floor(Math.random() * 9000) + 1000}`,
      domain,
      riskScore,
      threatType,
      status,
      lastActive: new Date().toISOString(),
      registrar
    };
    set((state) => ({
      domains: [newDomain, ...state.domains]
    }));
  },

  deleteDomain: (id) => {
    set((state) => ({
      domains: state.domains.filter(d => d.id !== id)
    }));
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
      const res = await fetch('/api/jobs');
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
  }
}));
