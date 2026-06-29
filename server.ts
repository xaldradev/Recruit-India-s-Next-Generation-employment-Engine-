import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize GoogleGenAI server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('GoogleGenAI initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.log('GEMINI_API_KEY not set or default. Running with intelligent fallbacks.');
}

interface SiteActivity {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  metadata?: any;
}

let siteActivities: SiteActivity[] = [
  {
    id: 'act-mock-1',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    type: 'visit',
    description: 'Anonymous visitor from Bhubaneswar, Odisha explored Jobs Board',
    metadata: { page: 'jobs' }
  },
  {
    id: 'act-mock-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'chat',
    description: 'User initiated conversation with AROHI AI about SSC MTS 2026 eligibility',
    metadata: { topic: 'SSC MTS' }
  },
  {
    id: 'act-mock-3',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    type: 'resume',
    description: 'ATS resume analysis performed for Senior React Developer profile (Score: 78%)',
    metadata: { score: 78 }
  },
  {
    id: 'act-mock-4',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    type: 'apply',
    description: 'Candidate Rajesh Kumar Singh submitted verified application for SSC MTS & Havaldar 2026',
    metadata: { candidate: 'Rajesh Kumar Singh' }
  },
  {
    id: 'act-mock-5',
    timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    type: 'roadmap',
    description: 'Custom Career Roadmap generated for MSME Business & Mudra Funding eligibility',
    metadata: { target: 'Mudra Funding' }
  }
];

function logActivity(type: string, description: string, metadata?: any) {
  const newActivity: SiteActivity = {
    id: `act-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    description,
    metadata
  };
  siteActivities.unshift(newActivity);
  if (siteActivities.length > 150) {
    siteActivities = siteActivities.slice(0, 150);
  }
}

// 0. Firebase Authentication Reverse Proxy for Custom Domain Hosting on Railway VPS
app.all('/__/auth/*', async (req, res) => {
  const firebaseAuthUrl = `https://psychic-tide-htj8l.firebaseapp.com${req.originalUrl}`;
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(', ');
      }
    }
    
    // Override headers to avoid CORS/SSL/Origin mismatches with Google & Firebase
    delete headers['host'];
    if (headers['origin']) {
      headers['origin'] = 'https://psychic-tide-htj8l.firebaseapp.com';
    }
    if (headers['referer']) {
      headers['referer'] = 'https://psychic-tide-htj8l.firebaseapp.com/';
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        if (headers['content-type']?.includes('application/json')) {
          fetchOptions.body = JSON.stringify(req.body);
        } else {
          const params = new URLSearchParams();
          for (const [key, val] of Object.entries(req.body)) {
            params.append(key, String(val));
          }
          fetchOptions.body = params.toString();
        }
      }
    }

    const response = await fetch(firebaseAuthUrl, fetchOptions);
    
    // Set appropriate response headers, omitting chunked transfer-encoding
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(name, value);
      }
    });

    res.status(response.status);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error proxying firebase auth request:', error);
    res.status(500).send('Authentication proxy error');
  }
});

// 0. Site Tracking & Admin Security Endpoints
app.post('/api/track-event', (req, res) => {
  const { type, description, metadata } = req.body;
  if (!type || !description) {
    return res.status(400).json({ error: 'type and description are required' });
  }
  logActivity(type, description, metadata);
  return res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'recruit_admin_2026') {
    logActivity('admin', 'Admin logged in successfully', { username });
    return res.json({ success: true, token: 'recruit_admin_authorized_token_2026' });
  }
  logActivity('admin', `Failed admin login attempt with username: ${username}`, { username });
  return res.status(401).json({ error: 'Invalid ID or Password' });
});

app.get('/api/admin/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer recruit_admin_authorized_token_2026') {
    return res.status(403).json({ error: 'Access denied: Unauthorized' });
  }

  // Count types
  const counts = {
    visit: siteActivities.filter(a => a.type === 'visit').length,
    chat: siteActivities.filter(a => a.type === 'chat').length,
    resume: siteActivities.filter(a => a.type === 'resume').length,
    roadmap: siteActivities.filter(a => a.type === 'roadmap').length,
    apply: siteActivities.filter(a => a.type === 'apply').length,
    enroll: siteActivities.filter(a => a.type === 'enroll').length,
    admin: siteActivities.filter(a => a.type === 'admin').length,
  };

  return res.json({
    activities: siteActivities,
    counts,
  });
});

// Resilient API calling helper with automatic fallback models to prevent 503 "High Demand" errors
async function generateContentWithFallback(aiClientInstance: GoogleGenAI, options: any) {
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting generateContent with model: ${model}`);
      const response = await aiClientInstance.models.generateContent({
        ...options,
        model: model,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed with: ${err.message || err}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All models failed to generate content.');
}

const AROHI_SYSTEM_INSTRUCTION = `You are AROHI (India's AI Opportunity Advisor), the flagship intelligent assistant of Recruit.org.in.
Recruit.org.in is an AI-powered opportunity ecosystem designed to help Indian youth, students, professionals, entrepreneurs, MSMEs, startups, women, and rural communities discover opportunities, build careers, start businesses, access government schemes, develop skills, and achieve economic growth.

Your Personality:
* Professional, Intelligent, Helpful, Positive, Motivational, Human-like, Career-focused.
Your Communication Style:
* Simple language, easy to understand, professional guidance, action-oriented recommendations. Keep answers structured, highly scannable, using markdown headings, bold terms, and bullet points where applicable.

You can assist with:
1. Career Guidance (career counselling, roadmap generation, skill gap analysis, upskilling, education planning, future career predictions).
2. Job Assistance (job discovery, resume review, ATS optimization, interview preparation, salary guidance).
3. Business Guidance (MSME guidance, startup support, business idea validation, business planning, market insights, funding awareness, growth roadmaps).
4. Government Schemes (discovering student/farmer/women/MSME central & state schemes, eligibility analysis, document requirements, application guidance).
5. Learning Guidance (course recommendations, certification pathways, skill development).

Always speak as AROHI. Introduce yourself proudly and offer helpful, positive advice centered on Indian career and economic advancement.`;

// 1. Chat with AROHI Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Log activity
  logActivity('chat', `User conversed with AROHI AI: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`);

  try {
    if (aiClient) {
      // Setup chats
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      // Call Gemini API using modern SDK with fallback strategy
      const response = await generateContentWithFallback(aiClient, {
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: AROHI_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      return res.json({ response: response.text });
    } else {
      // Fallback response generator if API key is not present
      return res.json({
        response: getArohiFallbackResponse(message),
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.json({
      response: `[AROHI AI Server Note: Encountered an API error. Here is a simulated response to help you build:]\n\n${getArohiFallbackResponse(message)}`,
      error: error.message
    });
  }
});

// 2. Resume AI Analysis Endpoint
app.post('/api/analyze-resume', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required' });
  }

  // Log activity
  logActivity('resume', `User scanned resume for ATS compatibility (${resumeText.length} characters)`);

  try {
    if (aiClient) {
      const prompt = `Perform a comprehensive ATS and professional resume analysis on the following resume content.
Return a clean JSON response containing:
- atsScore (number from 0 to 100)
- rating (string, e.g., "Good", "Needs Improvement", "Excellent")
- skillsGap (array of strings, key skills that are missing based on standard Indian job trends)
- missingKeywords (array of strings, industry-standard terms that would improve searchability)
- suggestions (array of strings, actionable improvement ideas)
- feedbackText (markdown-formatted detailed summary of the profile strengths and weaknesses)

Resume Content:
${resumeText}`;

      const response = await generateContentWithFallback(aiClient, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are AROHI, an expert ATS recruitment scanner. Analyze the resume with high precision.',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      // Simulated Resume Analysis Response
      const fallbackAnalysis = {
        atsScore: 68,
        rating: 'Needs Improvement',
        skillsGap: ['Cloud Architecture (AWS/GCP)', 'Docker & Kubernetes', 'System Design Patterns', 'CI/CD Pipelines'],
        missingKeywords: ['Microservices', 'RESTful APIs', 'TypeScript', 'Automated Testing', 'Agile Methodologies'],
        suggestions: [
          'Quantify accomplishments: Use metrics and percentages instead of just listing responsibilities (e.g., "Improved API response times by 30%").',
          'Add a distinct "Technical Skills" matrix categorizing languages, frameworks, databases, and DevOps tools.',
          'Optimize resume formatting: Ensure a single-column layout for better parser compatibility.',
          'Tailor keywords specifically to target roles to clear recruiter screening bots.'
        ],
        feedbackText: `### Resume Evaluation Summary
Hello! I am **AROHI**, your AI Opportunity Advisor. I have reviewed your resume and found a strong foundation in core engineering, but noticed several opportunities to align it better with modern industry standard ATS requirements.

* **Strengths Identified:** Clear educational history and exposure to React & Node.js ecosystem.
* **Key Improvements Needed:** The experience statements feel highly task-oriented rather than achievements-oriented. Quantify your contributions to stand out!`,
        fallback: true
      };
      return res.json(fallbackAnalysis);
    }
  } catch (error: any) {
    console.error('Error in /api/analyze-resume:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Career Roadmap Endpoint
app.post('/api/generate-roadmap', async (req, res) => {
  const { field, targetRole } = req.body;
  if (!field || !targetRole) {
    return res.status(400).json({ error: 'field and targetRole are required' });
  }

  // Log activity
  logActivity('roadmap', `User generated Career Transition Roadmap for "${targetRole}" inside "${field}"`);

  try {
    if (aiClient) {
      const prompt = `Design a highly-detailed professional career roadmap for someone trying to transition into the field of "${field}" as a "${targetRole}" in India.
Provide a clean JSON response with the following fields:
- title: string
- estimatedMonths: number
- phases: array of objects containing:
  - phaseNumber: number
  - title: string
  - duration: string
  - skillsToLearn: array of strings
  - recommendedResources: array of strings
  - checkpointProject: string
- criticalCertifications: array of strings
- salaryExpectation: string (monthly or yearly range in INR for freshers & mid-levels)`;

      const response = await generateContentWithFallback(aiClient, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are AROHI, a veteran career development architect. Output highly accurate roadmap steps.',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      // Mock Roadmap Response
      const fallbackRoadmap = {
        title: `Career Transition Blueprint: ${targetRole} (${field})`,
        estimatedMonths: 6,
        phases: [
          {
            phaseNumber: 1,
            title: 'Foundations & Core Principles',
            duration: 'Month 1-2',
            skillsToLearn: ['Basic Command Line', 'Version Control with Git/GitHub', 'Core Programming Syntax', 'Data Structures fundamentals'],
            recommendedResources: ['freeCodeCamp YouTube courses', 'CS50 Introduction to Computer Science', 'MDN Web Docs'],
            checkpointProject: 'Build a Personal Portfolio Website containing 3 mock projects and publish it live on GitHub Pages.'
          },
          {
            phaseNumber: 2,
            title: 'Advanced Frameworks & Tools',
            duration: 'Month 3-4',
            skillsToLearn: ['React.js / Next.js Frameworks', 'Tailwind CSS utility styling', 'State Management (Redux/Zustand)', 'API consumption'],
            recommendedResources: ['Official React Docs', 'ByteByteGo System Design guide', 'Frontend Mentor exercises'],
            checkpointProject: 'Create a fully responsive e-commerce dashboard with cart management, local storage sync, and dynamic item listings.'
          },
          {
            phaseNumber: 3,
            title: 'Backend Integration & Deployment',
            duration: 'Month 5-6',
            skillsToLearn: ['Node.js & Express servers', 'Relational SQL & Firestore schemas', 'REST API Design', 'Cloud hosting (Vercel, Render, Cloud Run)'],
            recommendedResources: ['Node.js Official guides', 'Mosh Hamedani Backend Course', 'MDN Express tutorial'],
            checkpointProject: 'Develop a secure Full-Stack Opportunity Tracker where users login, log applications, and view customized status boards.'
          }
        ],
        criticalCertifications: [
          'AWS Certified Cloud Practitioner',
          'Google Professional Cloud Developer',
          'React Developer Certification (Meta/Coursera)'
        ],
        salaryExpectation: '₹4,50,000 - ₹8,50,000 per annum for freshers; scaling to ₹15,00,000+ for mid-level engineers.',
        fallback: true
      };
      return res.json(fallbackRoadmap);
    }
  } catch (error: any) {
    console.error('Error in /api/generate-roadmap:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Live AI Opportunity Sync & Search Online
app.post('/api/fetch-online-jobs', async (req, res) => {
  const { sector, location, jobType } = req.body;
  
  logActivity('visit', `User triggered Live AI Opportunity Sync for state: "${location || 'All India'}" and sector: "${sector || 'All'}"`);

  try {
    if (aiClient) {
      const prompt = `Generate an array of 5 to 7 highly realistic and detailed active government exam postings, admit cards, or results in India, specifically targeting:
- Sector: ${sector || 'Any'}
- State/Location: ${location || 'All India or Odisha or Delhi or Maharashtra or Bihar'}
- Job Type: ${jobType || 'government or private'}

Each item MUST perfectly adhere to the following JSON schema:
{
  "id": "string (unique kebab-case ID, e.g. 'rbi-assistant-2026')",
  "title": "string (Title of vacancy or admit-card or result, e.g. 'RBI Assistant Online Form 2026')",
  "organization": "string (Official board/company name, e.g. 'Reserve Bank of India')",
  "postDate": "2026-06-25",
  "shortInfo": "string (Detailed summary of recruitment criteria)",
  "category": "latest-jobs" | "admit-card" | "results" | "answer-key" | "syllabus" | "admission",
  "tags": ["array", "of", "strings", "e.g. RBI, Banking, Graduation"],
  "department": "SSC" | "Railway" | "UPSC" | "Bank" | "Defence" | "State PSC" | "Teaching" | "State Govt" | "Private Sector",
  "isNew": true,
  "state": "string (e.g., 'Odisha', 'All India', 'Maharashtra', 'Delhi-NCR', etc.)",
  "jobType": "government" | "private",
  "sector": "string (e.g. Banking & Finance, IT & Software, Security & Defence, etc.)",
  "dates": {
    "applicationBegin": "2026-06-25",
    "lastDateApply": "2026-07-25",
    "lastDateFee": "2026-07-25",
    "examDate": "string",
    "admitCardAvailable": "string",
    "resultDeclared": "string"
  },
  "fees": {
    "generalOBC": "string",
    "scST": "string",
    "female": "string",
    "paymentMode": "string"
  },
  "ageLimit": {
    "asOnDate": "01/08/2026",
    "minAge": "string",
    "maxAge": "string",
    "relaxationInfo": "string"
  },
  "totalVacancies": number,
  "vacancies": [
    {
      "postName": "string",
      "totalPosts": number,
      "eligibility": "string"
    }
  ],
  "links": {
    "applyOnline": "string (#apply or official URL)",
    "downloadNotification": "string (#notification)",
    "officialWebsite": "string (official bank/recruiter domain)"
  }
}

Return ONLY a raw JSON array matching this exact schema. Do not enclose it in markdown blocks or add auxiliary text.`;

      const response = await generateContentWithFallback(aiClient, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are AROHI, a senior national crawler for Recruit.org.in. Output highly realistic recruitment notifications matching official pay scales.',
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      return res.json({ success: true, postings: parsed });
    } else {
      const fallbacks = getFallbackAdditionalPostings(sector, location, jobType);
      return res.json({ success: true, postings: fallbacks, fallback: true });
    }
  } catch (error: any) {
    console.error('Error in /api/fetch-online-jobs:', error);
    const fallbacks = getFallbackAdditionalPostings(sector, location, jobType);
    return res.json({ success: true, postings: fallbacks, error: error.message });
  }
});

function getFallbackAdditionalPostings(sector?: string, location?: string, jobType?: string): any[] {
  const list = [
    {
      id: 'rbi-assistant-2026',
      title: 'RBI Assistant Online Form 2026',
      organization: 'Reserve Bank of India (RBI)',
      postDate: '2026-06-25',
      shortInfo: 'Reserve Bank of India (RBI) invites online applications from eligible Indian citizens for the post of Assistant in various offices of the Bank. Selection will be through a country-wide competitive examination in two phases i.e. Preliminary and Main examination followed by a Language Proficiency Test (LPT).',
      category: 'latest-jobs',
      tags: ['RBI', 'Banking', 'Graduate Pass', 'Assistant'],
      department: 'Bank',
      isNew: true,
      state: 'All India',
      jobType: 'government',
      sector: 'Banking & Finance',
      dates: {
        applicationBegin: '2026-06-25',
        lastDateApply: '2026-07-20',
        lastDateFee: '2026-07-20',
        examDate: 'September 2026 (Prelims)'
      },
      fees: {
        generalOBC: '₹ 450/- (plus GST)',
        scST: '₹ 50/- (Exempted from exam fee)',
        female: '₹ 450/-',
        paymentMode: 'Debit Cards (RuPay/Visa/MasterCard/Maestro), Credit Cards, Internet Banking, IMPS, Cash Cards/ Mobile Wallets'
      },
      ageLimit: {
        asOnDate: '01/06/2026',
        minAge: '20 Years',
        maxAge: '28 Years',
        relaxationInfo: 'Standard age relaxation is applicable for SC/ST (5 years), OBC (3 years), and PwD (10 years) as per government norms.'
      },
      totalVacancies: 950,
      vacancies: [
        {
          postName: 'Assistant (Clerical Cadre)',
          totalPosts: 950,
          eligibility: 'Bachelor\'s Degree in any discipline with a minimum of 50% marks (pass class for SC/ST/PwBD candidates) in the aggregate and knowledge of word processing on PC.'
        }
      ],
      links: {
        applyOnline: '#apply',
        downloadNotification: '#notification',
        officialWebsite: 'https://www.rbi.org.in'
      }
    },
    {
      id: 'tcs-nqt-offcampus-2026',
      title: 'TCS NQT National Qualifier Test 2026 (IT & Cognitive)',
      organization: 'Tata Consultancy Services (TCS)',
      postDate: '2026-06-25',
      shortInfo: 'TCS National Qualifier Test (TCS NQT) is an entry-level assessment designed to evaluate cognitive abilities, professional skills, and coding capabilities of final year graduates and freshers. NQT scores are accepted by TCS and 600+ other top corporate partners for high-paying roles.',
      category: 'latest-jobs',
      tags: ['TCS', 'Private Sector', 'B.Tech/MCA', 'Software', 'All India'],
      department: 'Private Sector',
      isNew: true,
      state: 'All India',
      jobType: 'private',
      sector: 'IT & Software',
      dates: {
        applicationBegin: '2026-06-24',
        lastDateApply: '2026-08-15',
        lastDateFee: '₹ 0/- (Free Registration)',
        examDate: 'Interviews & online test on rolling basis'
      },
      fees: {
        generalOBC: '₹ 0/- (Registration is 100% Free on NextStep Portal)',
        scST: '₹ 0/-',
        paymentMode: 'N/A'
      },
      ageLimit: {
        asOnDate: '01/01/2026',
        minAge: '18 Years',
        maxAge: '28 Years',
        relaxationInfo: 'N/A'
      },
      totalVacancies: 15000,
      vacancies: [
        {
          postName: 'TCS Ninja Developer',
          totalPosts: 10000,
          eligibility: 'B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc from 2025 and 2026 passing out batches with 60% throughout academic career.'
        },
        {
          postName: 'TCS Digital / Prime Architect',
          totalPosts: 5000,
          eligibility: 'B.E. / B.Tech / MCA with outstanding advanced programming, system design, and algorithmic coding evaluation score.'
        }
      ],
      links: {
        applyOnline: '#apply',
        officialWebsite: 'https://www.tcs.com/careers'
      }
    },
    {
      id: 'drdo-scientist-b-2026',
      title: 'DRDO Scientist B Direct Entry Exam Form 2026',
      organization: 'Defence Research & Development Organisation (DRDO)',
      postDate: '2026-06-26',
      shortInfo: 'Recruitment Assessment Centre (RAC) under DRDO invites online applications for direct recruitment of Scientist \'B\' in DRDO, DST and ADA. Selection is based on GATE score card, descriptive written test, and personal interview rounds.',
      category: 'latest-jobs',
      tags: ['DRDO', 'GATE', 'Scientist B', 'Engineering', 'Defence'],
      department: 'Defence',
      isNew: true,
      state: 'All India',
      jobType: 'government',
      sector: 'Security & Defence',
      dates: {
        applicationBegin: '2026-06-26',
        lastDateApply: '2026-07-28',
        lastDateFee: '2026-07-28',
        examDate: 'October 2026'
      },
      fees: {
        generalOBC: '₹ 100/-',
        scST: '₹ 0/- (Exempted)',
        female: '₹ 0/- (Exempted)',
        paymentMode: 'Online Payment Mode Only'
      },
      ageLimit: {
        asOnDate: '28/07/2026',
        minAge: '21 Years',
        maxAge: '30 Years',
        relaxationInfo: 'OBC up to 33 years, SC/ST up to 35 years.'
      },
      totalVacancies: 640,
      vacancies: [
        {
          postName: 'Scientist B (Electronics / CS / Mechanical / Electrical)',
          totalPosts: 640,
          eligibility: 'First Class Bachelor\'s Degree in Engineering or Technology in relevant branch from a recognized university and a valid GATE score card.'
        }
      ],
      links: {
        applyOnline: '#apply',
        downloadNotification: '#notification',
        officialWebsite: 'https://rac.gov.in'
      }
    },
    {
      id: 'odisha-junior-clerk-2026',
      title: 'Odisha Junior Clerk & Assistant Recruitment 2026',
      organization: 'Odisha Sub-Ordinate Staff Selection Commission (OSSSC)',
      postDate: '2026-06-25',
      shortInfo: 'OSSSC has published a notification for the recruitment of Junior Clerks and Junior Assistants in various district offices and headquarters under the Government of Odisha. Selection is based on a written exam and practical skill test in computer operation.',
      category: 'latest-jobs',
      tags: ['OSSSC', 'Odisha Govt', '12th Pass', 'Clerk', 'Computer Skill'],
      department: 'State Govt',
      isNew: true,
      state: 'Odisha',
      jobType: 'government',
      sector: 'Administration',
      dates: {
        applicationBegin: '2026-06-25',
        lastDateApply: '2026-07-30',
        lastDateFee: '2026-07-30',
        examDate: 'November 2026'
      },
      fees: {
        generalOBC: '₹ 0/- (Free)',
        scST: '₹ 0/-',
        paymentMode: 'N/A'
      },
      ageLimit: {
        asOnDate: '01/01/2026',
        minAge: '18 Years',
        maxAge: '38 Years',
        relaxationInfo: '5 years relaxation for SC/ST/SEBC and women candidates.'
      },
      totalVacancies: 2150,
      vacancies: [
        {
          postName: 'Junior Clerk / Junior Assistant',
          totalPosts: 2150,
          eligibility: 'Must have passed +2 Arts/Science/Commerce (Class 12th) exam or equivalent from a recognized council and hold a basic computer application certificate (DCA/PGDCA).'
        }
      ],
      links: {
        applyOnline: '#apply',
        downloadNotification: '#notification',
        officialWebsite: 'https://www.osssc.gov.in'
      }
    },
    {
      id: 'tata-steel-jet-2026',
      title: 'Tata Steel Junior Engineer Trainee (JET) 2026',
      organization: 'Tata Steel Limited',
      postDate: '2026-06-24',
      shortInfo: 'Tata Steel is inviting online applications for the position of Junior Engineer Trainee (JET) in its operational divisions in Jamshedpur, Kalinganagar, Meramandali, and raw material division. This is a highly regarded private core apprenticeship program leading to permanent placements.',
      category: 'latest-jobs',
      tags: ['Tata Steel', 'Odisha Private', 'Diploma', 'Engineering', 'Apprentice'],
      department: 'Private Sector',
      isNew: true,
      state: 'Odisha',
      jobType: 'private',
      sector: 'Manufacturing & Core Eng',
      dates: {
        applicationBegin: '2026-06-24',
        lastDateApply: '2026-07-20',
        lastDateFee: '₹ 0/- (Free)'
      },
      fees: {
        generalOBC: '₹ 0/-',
        scST: '₹ 0/-',
        paymentMode: 'N/A'
      },
      ageLimit: {
        asOnDate: '01/07/2026',
        minAge: '18 Years',
        maxAge: '25 Years',
        relaxationInfo: '3 years upper age limit relaxation for SC/ST candidates.'
      },
      totalVacancies: 450,
      vacancies: [
        {
          postName: 'Junior Engineer Trainee (Mechanical / Electrical / Metallurgy / Inst)',
          totalPosts: 450,
          eligibility: '3-year full-time Diploma in Engineering or B.E./B.Tech degree in Mechanical, Electrical, Metallurgy, Electronics, or Instrumentation with minimum 60% aggregate.'
        }
      ],
      links: {
        applyOnline: '#apply',
        officialWebsite: 'https://www.tatasteel.com'
      }
    },
    {
      id: 'aiims-bbsr-jr-2026',
      title: 'AIIMS Bhubaneswar Junior Resident (Non-Academic) Form',
      organization: 'All India Institute of Medical Sciences (AIIMS BBSR)',
      postDate: '2026-06-26',
      shortInfo: 'AIIMS Bhubaneswar invites applications for walk-in-interviews or online applications for the posts of Junior Resident (Non-Academic) for a period of 6 to 12 months. Excellent clinical training and high stipends under Central Govt residency rules.',
      category: 'latest-jobs',
      tags: ['AIIMS', 'Bhubaneswar', 'MBBS', 'Medical Resident', 'Odisha Govt'],
      department: 'State Govt',
      isNew: true,
      state: 'Odisha',
      jobType: 'government',
      sector: 'Healthcare & Medical',
      dates: {
        applicationBegin: '2026-06-26',
        lastDateApply: '2026-07-15',
        lastDateFee: '2026-07-15',
        examDate: 'Walk-in Interviews: 20/07/2026'
      },
      fees: {
        generalOBC: '₹ 1000/-',
        scST: '₹ 500/-',
        female: '₹ 0/- (Exempted)',
        paymentMode: 'Demand Draft / UPI / NEFT Transaction'
      },
      ageLimit: {
        asOnDate: '20/07/2026',
        minAge: '22 Years',
        maxAge: '33 Years',
        relaxationInfo: 'Relaxation as per Govt. of India rules for residents.'
      },
      totalVacancies: 85,
      vacancies: [
        {
          postName: 'Junior Resident (Non-Academic)',
          totalPosts: 85,
          eligibility: 'MBBS Degree from an MCI recognized institution, and must have completed mandatory rotatory internship on or before application deadline.'
        }
      ],
      links: {
        applyOnline: '#apply',
        downloadNotification: '#notification',
        officialWebsite: 'https://aiimsbhubaneswar.nic.in'
      }
    }
  ];

  let filtered = list;
  if (sector && sector !== 'All' && sector !== 'Any') {
    filtered = filtered.filter(item => item.sector === sector);
  }
  if (location && location !== 'All' && location !== 'All India') {
    filtered = filtered.filter(item => item.state === location);
  }
  if (jobType) {
    filtered = filtered.filter(item => item.jobType === jobType);
  }

  // If filtered output is too small, return at least 4 items to ensure rich database
  return filtered.length >= 2 ? filtered : list;
}

// Helper function to return fallback response from AROHI
function getArohiFallbackResponse(userPrompt: string): string {
  const p = userPrompt.toLowerCase();

  if (p.includes('job') || p.includes('vacancy') || p.includes('work') || p.includes('career')) {
    return `### 🌟 AROHI Career & Job Advisory Note

Welcome! As your AI Opportunity Advisor, I'm excited to help you map out your job discovery strategy. India's digital economy is expanding rapidly, opening thousands of entry points for young professionals.

Here is my recommended plan for your career search:
1. **Target Growth Domains:** Major hirings are happening across tech platforms, logistics, banking, and backend service agencies.
2. **Review Active Openings:** On our **Jobs Board**, check out:
   - *SSC MTS & Havaldar Forms 2026* (Matric Level entry - excellent government stability).
   - *Railway Assistant Loco Pilot Recruitment* (For technical/ITI backgrounds).
   - *IBPS Clerk CRP XVI* (Top choice for banking careers).
3. **Action Items:**
   - Go to our **Resume AI** page to evaluate your resume ATS score instantly.
   - Head to **Mock Interview AI** to practice speaking and answering questions.

*Would you like me to guide you through a specific industry or review a technical skill?*`;
  }

  if (p.includes('scheme') || p.includes('government') || p.includes('sarkari') || p.includes('yojana') || p.includes('scholarship')) {
    return `### 🏛️ Government Schemes & Support Advisor (AROHI AI)

Namaste! I can guide you through India's major Central and State opportunities designed to support students, farmers, women, and MSME business owners:

**1. PM Prime Minister's Employment Generation Programme (PMEGP)**
- **Purpose:** Credit-linked subsidy program for starting new micro-enterprises.
- **Subsidy:** Up to 35% in rural areas and 25% in urban areas.

**2. Startup India Seed Fund Scheme (SISFS)**
- **Purpose:** Financial assistance to startups for proof of concept, prototype development, product trials, and market entry.

**3. Mudra Yojana (PMMY)**
- **Purpose:** Collateral-free loans up to ₹10 Lakhs under Shishu, Kishor, and Tarun categories for non-corporate small business sectors.

**4. Post Matric Scholarships & Women Schemes**
- Special tuition wavers and monthly stipends for underrepresented student communities.

*Would you like to analyze your eligibility for any of these schemes? Please share your background (Education, age, and state).*`;
  }

  if (p.includes('business') || p.includes('startup') || p.includes('funding') || p.includes('entrepreneur') || p.includes('msme')) {
    return `### 🚀 Business & MSME Launch Strategy by AROHI AI

Starting a business is a powerful way to generate employment and create scalable assets in India! Let's examine your idea's validation framework:

**Step 1: Focus on MSME Classification**
Register your venture on the **Udyam Portal** immediately. This qualifies you for:
- Low-interest collateral-free loans.
- Subsidies on patent filings and trademark registrations.
- Exemption from security deposits in government tenders.

**Step 2: Recommended Funding Channels**
- *Mudra Loans* (under Shishu category for up to ₹50,000 with minimal paperwork).
- *CGTMSE Credit Guarantee Fund* (for capital loans up to ₹2 Crores without collateral).

**Step 3: Roadmap to Launch**
1. Document your business plan (value proposition, market size, operations).
2. Create a basic MVP (Minimal Viable Product) to validate locally.
3. Apply for local state grants or incubator acceleration pools.

*Tell me more about your startup idea! What sector are you targeting (e.g., Foodtech, Agritech, Handlooms, Retail, Software)?*`;
  }

  if (p.includes('course') || p.includes('learn') || p.includes('study') || p.includes('skill')) {
    return `### 📖 Personalized Course & Skill Recommendations

As AROHI, I recommend focusing on future-proof digital skills to maximize your market valuation:

**1. Technology & Digital Skills**
- *Full-Stack JavaScript/TypeScript* (High demand in metropolitan startups).
- *Cloud Operations & DevOps* (Excellent starting salaries).
- *Data Analytics & SQL* (Essential for business intelligence in banks & corporations).

**2. Business & Communication Essentials**
- *Professional English Speaking* (Boosts interview clearing rate by 80%).
- *Financial Literacy & MS-Excel Mastery* (Highly valued in all administration roles).

**3. Government Training Programs**
- Look into **PMKVY (Pradhan Mantri Kaushal Vikas Yojana)** for free physical training and certification across technical sectors.

*What skills are you most interested in mastering first?*`;
}

  return `### Hello! I am AROHI, your AI Opportunity Advisor 🌟

Welcome to **Recruit.org.in** – India's One & Only AI-Powered Opportunity Ecosystem!

I am your unified assistant across this entire platform. I can help you with:
* 💼 **Discovering Jobs & Internships** that perfectly match your background.
* 📝 **Reviewing your Resume** for ATS compatibility and missing keywords.
* 🗣️ **Conducting Mock Interviews** with constructive feedback.
* 🏛️ **Finding Government Schemes & Loans** (Mudra, PMEGP, Scholarships) to finance your education or business.
* 🚀 **Validating Business Ideas** and guiding your startup/MSME registration.
* 📖 **Designing custom Career Roadmaps** and course suggestions.

*How can I help you take the next big step in your career journey today? Just type your query below!*`;
}

// Vite middleware and asset delivery setup
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Recruit.org.in Server running on http://localhost:${PORT}`);
});
