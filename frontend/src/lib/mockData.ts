import { JobAnalysis, RecruiterVerification, ScamReport, SuspiciousDomain, KeywordThreat, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-8821',
  name: 'Alex Carter',
  email: 'alex.carter@cybersec.io',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  scanCount: 14,
  reportCount: 2,
  joinedDate: '2026-03-12'
};

export const INITIAL_RECRUITERS: RecruiterVerification[] = [
  {
    id: 'rec-001',
    email: 'recruiting@google.com',
    companyName: 'Google LLC',
    trustScore: 98,
    domainMatch: true,
    status: 'verified',
    reputationIndicators: ['Domain age > 10 years', 'SPF/DKIM/DMARC active', 'Official enterprise domain'],
    checkedAt: '2026-06-18T10:30:00Z'
  },
  {
    id: 'rec-002',
    email: 'hr-support@amazon-jobsite.com',
    companyName: 'Amazon (Claimed)',
    trustScore: 12,
    domainMatch: false,
    status: 'suspicious',
    reputationIndicators: ['Domain age < 15 days', 'No SPF alignment', 'Unregistered business contact', 'Similar to brand name (typosquatting)'],
    checkedAt: '2026-06-18T14:45:00Z'
  },
  {
    id: 'rec-003',
    email: 'careers@stripe.com',
    companyName: 'Stripe Inc.',
    trustScore: 99,
    domainMatch: true,
    status: 'verified',
    reputationIndicators: ['Domain matches registered entity', 'Valid SSL matching Stripe Inc', 'High reputation mail servers'],
    checkedAt: '2026-06-17T09:12:00Z'
  },
  {
    id: 'rec-004',
    email: 'hiring-manager@easy-crypto-tasks.org',
    companyName: 'Easy Crypto Tasks',
    trustScore: 8,
    domainMatch: true,
    status: 'suspicious',
    reputationIndicators: ['Whois identity hidden', 'Flagged by DNS blocklists', 'High volume spam reports', 'Cryptocurrency payout patterns'],
    checkedAt: '2026-06-15T16:22:00Z'
  }
];

export const INITIAL_DOMAINS: SuspiciousDomain[] = [
  {
    id: 'dom-001',
    domain: 'amazon-jobsite.com',
    riskScore: 92,
    threatType: 'Typosquatting / Phishing',
    status: 'active',
    lastActive: '2026-06-19T00:00:00Z',
    registrar: 'Namecheap Inc.'
  },
  {
    id: 'dom-002',
    domain: 'easy-crypto-tasks.org',
    riskScore: 88,
    threatType: 'Task Scam / Scam Portal',
    status: 'active',
    lastActive: '2026-06-18T12:00:00Z',
    registrar: 'Tucows Domains Inc.'
  },
  {
    id: 'dom-003',
    domain: 'dhl-delivery-jobs.space',
    riskScore: 95,
    threatType: 'Advance Fee Fraud',
    status: 'active',
    lastActive: '2026-06-18T22:30:00Z',
    registrar: 'Hostinger UAB'
  },
  {
    id: 'dom-004',
    domain: 'netflix-auditions-careers.net',
    riskScore: 78,
    threatType: 'Phishing',
    status: 'offline',
    lastActive: '2026-06-14T08:15:00Z',
    registrar: 'GoDaddy.com LLC'
  },
  {
    id: 'dom-005',
    domain: 'remote-work-at-home-data-entry.online',
    riskScore: 85,
    threatType: 'Fake Data Entry Portal',
    status: 'monitored',
    lastActive: '2026-06-19T00:10:00Z',
    registrar: 'NameSilo LLC'
  }
];

export const INITIAL_KEYWORDS: KeywordThreat[] = [
  { id: 'kw-1', keyword: 'Telegram interview', riskWeight: 'high', category: 'Communication' },
  { id: 'kw-2', keyword: 'deposit for equipment', riskWeight: 'high', category: 'Financial' },
  { id: 'kw-3', keyword: 'WhatsApp recruiter', riskWeight: 'medium', category: 'Communication' },
  { id: 'kw-4', keyword: 'check refund', riskWeight: 'high', category: 'Financial' },
  { id: 'kw-5', keyword: 'data entry quick money', riskWeight: 'medium', category: 'Compensation' },
  { id: 'kw-6', keyword: 'no experience $50/hour', riskWeight: 'high', category: 'Compensation' },
  { id: 'kw-7', keyword: 'package forwarding coordinator', riskWeight: 'high', category: 'Role Type' },
  { id: 'kw-8', keyword: 'crypto investment wallet', riskWeight: 'high', category: 'Financial' }
];

export const INITIAL_REPORTS: ScamReport[] = [
  {
    id: 'rep-001',
    companyName: 'Global Task Networks',
    website: 'tasknetwork-global.cc',
    recruiterEmail: 'hr@tasknetwork-global.cc',
    description: 'Offered an online job paying $200 daily for clicking on products, but required buying crypto package upgrades to unlock payouts.',
    status: 'pending',
    reportedAt: '2026-06-18T21:40:00Z'
  },
  {
    id: 'rep-002',
    companyName: 'Apex Data Solvers',
    website: 'apexdatasolutions.work',
    recruiterEmail: 'careers@apexdatasolutions.work',
    description: 'Sent a check for office supplies, asked to cash it and wire the remaining funds to their preferred hardware vendor. Bank later identified the check as counterfeit.',
    status: 'reviewed',
    reportedAt: '2026-06-15T11:20:00Z'
  },
  {
    id: 'rep-003',
    companyName: 'Meta Careers Group',
    website: 'meta-hiring-desk.net',
    recruiterEmail: 'recruiting-team@meta-hiring-desk.net',
    description: 'Impersonating Meta HR, holding interviews entirely on Telegram with text messages and requesting SSN and driver license images prior to any contract.',
    status: 'reviewed',
    reportedAt: '2026-06-12T15:10:00Z'
  }
];

export const INITIAL_ANALYSES: JobAnalysis[] = [
  {
    id: 'an-001',
    title: 'Remote Data Entry Associate',
    company: 'Amazon Jobs Site (Fake)',
    type: 'url',
    url: 'https://amazon-jobsite.com/careers/data-entry-apply',
    riskScore: 89,
    scamProbability: 94,
    riskLevel: 'high',
    analyzedAt: '2026-06-18T18:30:00Z',
    indicators: [
      { category: 'Domain Verification', status: 'danger', message: 'Domain registered 5 days ago, mimicking Amazon LLC (typosquatting)' },
      { category: 'Financial Ask', status: 'danger', message: 'Job posting mentions an upfront payment required for laptop configuration' },
      { category: 'Communication Channel', status: 'warning', message: 'Interviews held exclusively via Telegram or Signal' }
    ],
    salaryValidation: {
      status: 'unrealistic',
      analysis: 'The advertised salary of $45/hour for an entry-level data entry role is significantly higher than the standard market range of $15-$22/hour.',
      detectedRange: '$45.00/hour',
      marketRange: '$18.50/hour'
    },
    domainIntelligence: {
      domain: 'amazon-jobsite.com',
      ageDays: 5,
      sslValid: true,
      registrar: 'Namecheap Inc.',
      riskIndicators: ['Recent registration', 'Typosquatting pattern', 'WHOIS details redacted'],
      trustScore: 8
    },
    recruiterVerification: {
      email: 'hr-support@amazon-jobsite.com',
      status: 'suspicious',
      domainMatch: false,
      message: 'Email domain does not match Amazon official domains (amazon.com)',
      trustScore: 12,
      reputationIndicators: ['Domain spoofing risk', 'New mail server configuration']
    },
    securityRecommendations: [
      'Do not engage with the recruiter on external chat applications.',
      'Do not provide your personal credentials, SSN, or banking credentials.',
      'Report the site to domain hosting provider (Namecheap) for phishing.'
    ]
  },
  {
    id: 'an-002',
    title: 'Software Engineer Intern',
    company: 'Google LLC',
    type: 'url',
    url: 'https://careers.google.com/jobs/results/software-engineer-intern',
    riskScore: 4,
    scamProbability: 2,
    riskLevel: 'safe',
    analyzedAt: '2026-06-18T11:15:00Z',
    indicators: [
      { category: 'Domain Verification', status: 'safe', message: 'Domain matches official Google corporate ownership' },
      { category: 'SSL Security', status: 'safe', message: 'Highly secure SSL configuration signed by Google Trust Services' },
      { category: 'Recruiter Match', status: 'safe', message: 'Verified hiring pipelines match official recruiting endpoints' }
    ],
    salaryValidation: {
      status: 'fair',
      analysis: 'The compensation is aligned with standard Silicon Valley intern rates ($40-$60/hour).',
      detectedRange: 'Competitive stipend',
      marketRange: '$45.00 - $55.00/hour'
    },
    domainIntelligence: {
      domain: 'careers.google.com',
      ageDays: 9850,
      sslValid: true,
      registrar: 'MarkMonitor Inc.',
      riskIndicators: [],
      trustScore: 99
    },
    recruiterVerification: {
      email: 'careers@google.com',
      status: 'verified',
      domainMatch: true,
      message: 'Official corporate recruitment contact',
      trustScore: 98,
      reputationIndicators: ['A+ Domain Trust', 'Perfect DMARC alignment']
    },
    securityRecommendations: [
      'This job link is safe to proceed with. Ensure you submit applications through the official Google careers dashboard.'
    ]
  },
  {
    id: 'an-003',
    title: 'Digital Marketing Specialist',
    company: 'Apex Data Solvers',
    type: 'text',
    text: 'Job Opportunity: Apex Data Solvers is looking for Digital Marketing Specialists. We pay $65 per hour. No experience is required. The interview will be completed on Telegram. You will need to cash a check that we mail you to buy office supplies from our verified provider.',
    riskScore: 97,
    scamProbability: 99,
    riskLevel: 'critical',
    analyzedAt: '2026-06-17T15:20:00Z',
    indicators: [
      { category: 'Financial Ask', status: 'danger', message: 'Uses counterfeit check-cashing check scheme to steal cash' },
      { category: 'Communication Channel', status: 'danger', message: 'Text states the interview is entirely on Telegram' },
      { category: 'Unrealistic Pay', status: 'warning', message: '$65/hour with no marketing experience required' }
    ],
    salaryValidation: {
      status: 'suspicious',
      analysis: 'Marketing specialist with zero experience does not pay $65/hr. Standard rates are around $20-$28/hr.',
      detectedRange: '$65.00/hour',
      marketRange: '$24.00/hour'
    },
    domainIntelligence: {
      domain: 'apexdatasolutions.work',
      ageDays: 12,
      sslValid: true,
      registrar: 'GoDaddy.com LLC',
      riskIndicators: ['Low age', 'Unregistered domain company'],
      trustScore: 18
    },
    recruiterVerification: {
      email: 'careers@apexdatasolutions.work',
      status: 'suspicious',
      domainMatch: true,
      message: 'Domain exists but matches known task scam activity logs.',
      trustScore: 15,
      reputationIndicators: ['Spam flags', 'Fake employee listings']
    },
    securityRecommendations: [
      'Cease all contact. This is a classic Fake Check Scam.',
      'Do not cash any check mailed to you; your bank will charge you for fraudulent check returns and lock your account.',
      'Report the threat details to IC3.gov.'
    ]
  }
];

// Dynamic evaluator simulator
export function evaluateJobScam(
  type: 'url' | 'screenshot' | 'text',
  value: string,
  fileName?: string
): JobAnalysis {
  const lowercaseVal = (value || '').toLowerCase();
  let company = 'Unknown Company';
  let title = 'Job Posting Analysis';
  let riskScore = 20; // default base
  const indicators: JobAnalysis['indicators'] = [];
  const recommendations: string[] = [];

  // Parse details
  if (type === 'url') {
    const urlObj = value.startsWith('http') ? value : `https://${value}`;
    let domain = 'unknown-site.xyz';
    try {
      const parsed = new URL(urlObj);
      domain = parsed.hostname.replace('www.', '');
    } catch {
      domain = value;
    }

    if (lowercaseVal.includes('google.com')) {
      company = 'Google LLC';
      title = 'Google Career Opportunity';
      riskScore = 3;
    } else if (lowercaseVal.includes('amazon') && !lowercaseVal.includes('amazon.com')) {
      company = 'Amazon (Purported)';
      title = 'Amazon Remote Associate';
      riskScore = 88;
    } else if (lowercaseVal.includes('crypto') || lowercaseVal.includes('task') || lowercaseVal.includes('click') || lowercaseVal.includes('jobsite')) {
      company = 'Global Tasks & Crypto Ltd';
      title = 'Remote Tasks Coordinator';
      riskScore = 85;
    } else {
      company = domain.split('.')[0].toUpperCase();
      title = 'Online Application Portal';
      riskScore = 42; // Medium risk base for general unverified URLs
    }

    // Set domain intel
    const ageDays = riskScore > 50 ? Math.floor(Math.random() * 20) + 1 : Math.floor(Math.random() * 5000) + 200;
    const sslValid = riskScore < 90;
    const registrar = riskScore > 50 ? 'Namecheap Inc.' : 'MarkMonitor Inc.';
    const trustScore = Math.max(100 - riskScore - Math.floor(Math.random() * 10), 5);

    if (riskScore > 50) {
      indicators.push({ category: 'Domain Verification', status: 'danger', message: `Domain registered recently (${ageDays} days ago), showing anomalous patterns.` });
      indicators.push({ category: 'SSL Security', status: 'warning', message: sslValid ? 'SSL Active but short domain validity cert detected' : 'Invalid or expired SSL Certificate.' });
      recommendations.push('Do not share sensitive resumes, social security numbers or personal info on this website.');
      recommendations.push('Verify the vacancies on official business hiring portals.');
    } else {
      indicators.push({ category: 'Domain Verification', status: 'safe', message: `Domain has healthy age history (${ageDays} days active).` });
      indicators.push({ category: 'SSL Security', status: 'safe', message: 'Valid and highly encrypted SSL configuration.' });
      recommendations.push('This domain exhibits safe signals. You are secure to apply.');
    }

    return {
      id: `an-${Math.floor(Math.random() * 90000) + 10000}`,
      title,
      company,
      type,
      url: value,
      riskScore,
      scamProbability: Math.min(riskScore + 5, 100),
      riskLevel: riskScore < 15 ? 'safe' : riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : riskScore < 90 ? 'high' : 'critical',
      analyzedAt: new Date().toISOString(),
      indicators,
      salaryValidation: {
        status: riskScore > 50 ? 'suspicious' : 'fair',
        analysis: riskScore > 50 ? 'The payment matches indicators for high compensation data-entry schemes.' : 'The salary lies in standard parameters.',
        detectedRange: riskScore > 50 ? '$48.00/hour' : 'Market competitive',
        marketRange: '$22.00 - $35.00/hour'
      },
      domainIntelligence: {
        domain,
        ageDays,
        sslValid,
        registrar,
        riskIndicators: riskScore > 50 ? ['Newly Registered', 'Private WHOIS', 'Lookalike Domain Pattern'] : [],
        trustScore
      },
      recruiterVerification: {
        email: `careers@${domain}`,
        status: riskScore > 50 ? 'suspicious' : 'verified',
        domainMatch: true,
        message: riskScore > 50 ? 'Recruiting email domain exhibits low reputation scores.' : 'Authentic corporate communications domain.',
        trustScore,
        reputationIndicators: riskScore > 50 ? ['Recent domain activation', 'Low mail server volume'] : ['Verified SPF configuration']
      },
      securityRecommendations: recommendations
    };
  }

  if (type === 'screenshot') {
    // Screenshot upload analysis
    company = 'Flagged Upload Agency';
    title = fileName ? `OCR: ${fileName}` : 'Uploaded Document Scan';
    riskScore = 65; // base

    if (lowercaseVal.includes('telegram') || lowercaseVal.includes('whatsapp')) {
      riskScore = 90;
      indicators.push({ category: 'Communication Method', status: 'danger', message: 'OCR analysis found social chats (WhatsApp/Telegram) used for interviews.' });
    }
    if (lowercaseVal.includes('deposit') || lowercaseVal.includes('fee') || lowercaseVal.includes('cash')) {
      riskScore = Math.min(riskScore + 20, 99);
      indicators.push({ category: 'Financial Alert', status: 'danger', message: 'OCR detected references to checks, advance fees or equipment purchases.' });
    }

    if (indicators.length === 0) {
      indicators.push({ category: 'Content Reputation', status: 'warning', message: 'Document contains unverified digital signatures and non-standard layouts.' });
    }

    return {
      id: `an-${Math.floor(Math.random() * 90000) + 10000}`,
      title,
      company,
      type,
      screenshot: value,
      riskScore,
      scamProbability: Math.min(riskScore + 3, 100),
      riskLevel: riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : riskScore < 90 ? 'high' : 'critical',
      analyzedAt: new Date().toISOString(),
      indicators,
      salaryValidation: {
        status: riskScore > 75 ? 'unrealistic' : 'suspicious',
        analysis: 'OCR extracted salary metrics indicate anomalies relative to target position rates.',
        detectedRange: '$5,000/week base',
        marketRange: '$1,200 - $1,800/week'
      },
      domainIntelligence: {
        domain: 'unverified-document-host.net',
        ageDays: 45,
        sslValid: true,
        registrar: 'Tucows Domains Inc.',
        riskIndicators: ['Private WHOIS data'],
        trustScore: 40
      },
      recruiterVerification: {
        email: 'unknown-sender@unverified.org',
        status: 'unverified',
        domainMatch: false,
        message: 'No matching authorized recruiting contacts found in OCR output.',
        trustScore: 35,
        reputationIndicators: ['Sender identity unauthenticated']
      },
      securityRecommendations: [
        'Do not open any PDF links or sign documents attached in these chats.',
        'Beware of phishing portals requesting your corporate logins.'
      ]
    };
  }

  // Text description scanner
  company = 'Unspecified Firm';
  title = 'Job Description Analysis';
  let domain = 'anonymous-listing.info';
  let rawText = value;

  if (value.startsWith('{') && value.endsWith('}')) {
    try {
      const data = JSON.parse(value);
      company = data.companyName || company;
      title = data.jobTitle || title;
      domain = data.domain || domain;
      rawText = data.jobDescription || '';
    } catch (e) {
      // JSON parse error fallback
    }
  }

  riskScore = 25; // low base
  let telegramFound = false;
  let cashFound = false;
  let highSalary = false;

  const checkText = rawText.toLowerCase();

  if (checkText.includes('telegram') || checkText.includes('whatsapp') || checkText.includes('signal app') || domain.includes('telegram') || domain.includes('whatsapp')) {
    riskScore += 35;
    telegramFound = true;
    indicators.push({ category: 'Communication Channel', status: 'danger', message: 'Text requests contact via unencrypted personal messaging apps (Telegram/WhatsApp).' });
  }

  if (checkText.includes('deposit') || checkText.includes('equipment fee') || checkText.includes('cash a check') || checkText.includes('bank wire')) {
    riskScore += 40;
    cashFound = true;
    indicators.push({ category: 'Financial Transaction', status: 'danger', message: 'Identified prompts for financial activities, buying supplies, or checks.' });
  }

  if (checkText.includes('quick cash') || checkText.includes('$50/hour') || checkText.includes('$100/hr') || checkText.includes('no experience required')) {
    riskScore += 15;
    highSalary = true;
    indicators.push({ category: 'Salary Realism', status: 'warning', message: 'Advertises high compensation with no prerequisites.' });
  }

  // If a suspicious domain is entered
  const domainLower = domain.toLowerCase();
  const isSuspiciousDomain = domainLower.includes('jobsite') || domainLower.includes('task') || domainLower.includes('crypto') || domainLower.includes('work');
  if (isSuspiciousDomain) {
    riskScore += 20;
    indicators.push({ category: 'Domain Verification', status: 'danger', message: `Domain registered privately with suspicious lookalike pattern: ${domain}` });
  }

  const riskLevel = riskScore < 15 ? 'safe' : riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : riskScore < 90 ? 'high' : 'critical';

  return {
    id: `an-${Math.floor(Math.random() * 90000) + 10000}`,
    title,
    company,
    type,
    text: rawText,
    riskScore: Math.min(riskScore, 100),
    scamProbability: Math.min(riskScore + 2, 100),
    riskLevel,
    analyzedAt: new Date().toISOString(),
    indicators,
    salaryValidation: {
      status: highSalary ? 'unrealistic' : 'fair',
      analysis: highSalary ? 'The salary mentioned represents an outlier far exceeding similar role listings.' : 'Salary bounds conform to active industry baselines.',
      detectedRange: highSalary ? '$50.00+/hour' : '$24.00 - $30.00/hour',
      marketRange: '$22.00 - $28.00/hour'
    },
    domainIntelligence: {
      domain,
      ageDays: isSuspiciousDomain ? 4 : 450,
      sslValid: true,
      registrar: isSuspiciousDomain ? 'Namecheap Inc.' : 'MarkMonitor Inc.',
      riskIndicators: isSuspiciousDomain ? ['Newly Registered', 'Lookalike Domain'] : [],
      trustScore: isSuspiciousDomain ? 12 : 88
    },
    recruiterVerification: {
      email: `recruiting@${domain}`,
      status: riskScore > 50 ? 'suspicious' : 'verified',
      domainMatch: true,
      message: riskScore > 50 ? 'Email domain matches flagged lookalike configuration registers.' : 'Verified official corporate routing parameters.',
      trustScore: riskScore > 50 ? 15 : 94,
      reputationIndicators: riskScore > 50 ? ['Low SPF verification alignment'] : ['Perfect mail record alignment']
    },
    securityRecommendations: riskScore > 50 ? [
      'Stop communicating. Real companies do not hire via Telegram chat texts.',
      'Do not cash checks sent for office setups.',
      'Do not buy gift cards or bitcoin for job training.'
    ] : [
      'Search for official contact info of the company name specified to verify.'
    ]
  };
}
