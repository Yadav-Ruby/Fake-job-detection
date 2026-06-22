export interface ThreatIndicator {
  category: string;
  status: 'danger' | 'warning' | 'safe';
  message: string;
}

export interface DomainIntelligence {
  domain: string;
  ageDays: number;
  sslValid: boolean;
  registrar: string;
  riskIndicators: string[];
  trustScore: number;
}

export interface RecruiterVerificationResult {
  email: string;
  name?: string;
  status: 'verified' | 'unverified' | 'suspicious';
  domainMatch: boolean;
  message: string;
  trustScore: number;
  reputationIndicators: string[];
}

export interface SalaryAnalysis {
  status: 'fair' | 'suspicious' | 'unrealistic';
  analysis: string;
  detectedRange?: string;
  marketRange?: string;
}

export interface JobAnalysis {
  id: string;
  title: string;
  company: string;
  type: 'url' | 'screenshot' | 'text';
  url?: string;
  text?: string;
  screenshot?: string;
  riskScore: number; // 0 - 100
  scamProbability: number; // 0 - 100
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  analyzedAt: string;
  indicators: ThreatIndicator[];
  salaryValidation: SalaryAnalysis;
  domainIntelligence: DomainIntelligence;
  recruiterVerification: RecruiterVerificationResult;
  securityRecommendations: string[];
}

export interface RecruiterVerification {
  id: string;
  email: string;
  companyName: string;
  trustScore: number;
  domainMatch: boolean;
  status: 'verified' | 'suspicious' | 'unknown';
  reputationIndicators: string[];
  checkedAt: string;
}

export interface ScamReport {
  id: string;
  companyName: string;
  website: string;
  recruiterEmail: string;
  description: string;
  screenshot?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  reportedAt: string;
}

export interface SuspiciousDomain {
  id: string;
  domain: string;
  riskScore: number;
  threatType: string;
  status: 'active' | 'offline' | 'monitored';
  lastActive: string;
  registrar: string;
}

export interface KeywordThreat {
  id: string;
  keyword: string;
  riskWeight: 'low' | 'medium' | 'high';
  category: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  scanCount: number;
  reportCount: number;
  joinedDate: string;
}
