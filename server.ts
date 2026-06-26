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
