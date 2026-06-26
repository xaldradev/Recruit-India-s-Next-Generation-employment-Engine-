import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, Trash2, Edit2, Check, X, Users, Briefcase, FileCheck, Landmark, Database, UserCheck, Eye, EyeOff,
  Lock, ShieldAlert, Sparkles, LogOut, Clock, Activity, ShieldCheck, RefreshCw, BarChart3, MessageSquare, BookOpen, AlertCircle, Play
} from 'lucide-react';
import { Posting, Application, CategoryType, VacancyDetail } from '../types';

const siteActivities = [
  { id: '1', type: 'visit', description: 'Visitor from Bhubaneswar, Odisha viewed State Welfare Schemes', timestamp: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: '2', type: 'chat', description: 'User inquired about AROHI AI counseling for Civil Service exams', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '3', type: 'resume', description: 'Resume reviewed for Indian Railways General Post (Score: 78%)', timestamp: new Date(Date.now() - 32 * 60000).toISOString() },
  { id: '4', type: 'roadmap', description: 'Career roadmap generated for Junior Engineer transition inside IT field', timestamp: new Date(Date.now() - 48 * 60000).toISOString() },
  { id: '5', type: 'apply', description: 'Candidate Subhasish Sen submitted application profile for SSC GD Constable', timestamp: new Date(Date.now() - 95 * 60000).toISOString() },
  { id: '6', type: 'enroll', description: 'User enrolled in MSME Business Fundamentals training program', timestamp: new Date(Date.now() - 140 * 60000).toISOString() },
  { id: '7', type: 'admin', description: 'Administrator logged into the main Control Panel & telemetry console', timestamp: new Date(Date.now() - 210 * 60000).toISOString() }
];

interface AdminPanelProps {
  postings: Posting[];
  onAddPosting: (posting: Posting) => void;
  onEditPosting: (posting: Posting) => void;
  onDeletePosting: (id: string) => void;
  applications: Application[];
  onUpdateAppStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

export default function AdminPanel({
  postings,
  onAddPosting,
  onEditPosting,
  onDeletePosting,
  applications,
  onUpdateAppStatus
}: AdminPanelProps) {
  // Authentication & Tracking State Variables
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('recruit_admin_is_logged_in') === 'true';
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('recruit_admin_token');
  });
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats & Logs state variables
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [filterActivityType, setFilterActivityType] = useState<string>('all');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Live online users count (simulated and drifting slightly for realistic admin tracking)
  const [liveUsersCount, setLiveUsersCount] = useState<number>(17);

  // Normal active tab (default is 'metrics' monitor tab now!)
  const [activeTab, setActiveTab] = useState<'metrics' | 'listings' | 'add-form' | 'candidates'>('metrics');
  const [selectedAppForView, setSelectedAppForView] = useState<Application | null>(null);

  const fetchStats = async () => {
    if (!authToken) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStatsError('Session expired or unauthorized. Please re-login.');
        setIsLoggedIn(false);
        sessionStorage.removeItem('recruit_admin_is_logged_in');
        sessionStorage.removeItem('recruit_admin_token');
      }
    } catch (e: any) {
      setStatsError('Could not reach backend tracking server. Using local live fallbacks.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
      const interval = setInterval(() => {
        fetchStats();
        // Drifts live users count between 12 and 22
        setLiveUsersCount(prev => {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const newVal = prev + delta;
          return newVal >= 10 && newVal <= 25 ? newVal : prev;
        });
      }, autoRefreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, autoRefreshInterval, authToken]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPassword) {
      setLoginError('Both Admin ID and Password are required.');
      return;
    }

    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId, password: loginPassword })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('recruit_admin_is_logged_in', 'true');
        sessionStorage.setItem('recruit_admin_token', data.token);
        setAuthToken(data.token);
        setIsLoggedIn(true);
        setLoginPassword('');
      } else {
        const errData = await response.json();
        setLoginError(errData.error || 'Invalid Admin ID or Password.');
      }
    } catch (err) {
      // Local check fallback
      if (loginId === 'admin' && loginPassword === 'recruit_admin_2026') {
        const fallbackToken = 'recruit_admin_authorized_token_2026';
        sessionStorage.setItem('recruit_admin_is_logged_in', 'true');
        sessionStorage.setItem('recruit_admin_token', fallbackToken);
        setAuthToken(fallbackToken);
        setIsLoggedIn(true);
        setLoginPassword('');
      } else {
        setLoginError('Incorrect Admin Credentials or Server Offline.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('recruit_admin_is_logged_in');
    sessionStorage.removeItem('recruit_admin_token');
    setIsLoggedIn(false);
    setAuthToken(null);
    setStats(null);
  };

  const simulateVisitorEvent = async (type: string, description: string, metadata?: any) => {
    setIsSimulating(type);
    try {
      await fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, metadata })
      });
      await fetchStats();
    } catch (e) {
      console.error('Failed to trigger simulator event:', e);
    } finally {
      setIsSimulating(null);
    }
  };

  // Form states for adding a new posting
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<CategoryType>('latest-jobs');
  const [department, setDepartment] = useState('SSC');
  const [tagsInput, setTagsInput] = useState('');
  const [shortInfo, setShortInfo] = useState('');
  
  // Dates
  const [applicationBegin, setApplicationBegin] = useState('');
  const [lastDateApply, setLastDateApply] = useState('');
  const [lastDateFee, setLastDateFee] = useState('');
  const [examDate, setExamDate] = useState('');
  const [admitCardAvailable, setAdmitCardAvailable] = useState('');
  const [resultDeclared, setResultDeclared] = useState('');

  // Fees
  const [feeGeneral, setFeeGeneral] = useState('₹ 100/-');
  const [feeSCST, setFeeSCST] = useState('₹ 0/-');
  const [feeFemale, setFeeFemale] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online Mode Only');

  // Age Limit
  const [ageAsOnDate, setAgeAsOnDate] = useState('01/08/2026');
  const [ageMin, setAgeMin] = useState('18 Years');
  const [ageMax, setAgeMax] = useState('27 Years');
  const [ageRelaxation, setAgeRelaxation] = useState('Age relaxation extra as per government recruitment standards.');

  // Vacancy
  const [totalVacancies, setTotalVacancies] = useState<number>(100);
  const [vacanciesList, setVacanciesList] = useState<VacancyDetail[]>([
    { postName: 'General Posts', totalPosts: 100, eligibility: 'Passed 10th / 12th / Graduate from any recognized Board.' }
  ]);

  // Links
  const [officialSite, setOfficialSite] = useState('');

  const addVacancyRow = () => {
    setVacanciesList([...vacanciesList, { postName: '', totalPosts: 0, eligibility: '' }]);
  };

  const removeVacancyRow = (idx: number) => {
    setVacanciesList(vacanciesList.filter((_, i) => i !== idx));
  };

  const handleVacancyChange = (idx: number, field: keyof VacancyDetail, val: string | number) => {
    const updated = [...vacanciesList];
    updated[idx] = {
      ...updated[idx],
      [field]: val
    };
    setVacanciesList(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title || !organization || !shortInfo) {
      alert('Title, Organization and Short Info are mandatory fields.');
      return;
    }

    const newId = `custom-rec-${Math.random().toString(36).substring(2, 9)}`;
    const parsedTags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [department, 'Latest Alert'];

    const newPosting: Posting = {
      id: newId,
      title,
      organization,
      category,
      department,
      tags: parsedTags,
      shortInfo,
      postDate: new Date().toISOString().split('T')[0],
      isNew: true,
      dates: {
        applicationBegin,
        lastDateApply,
        lastDateFee,
        examDate: examDate || undefined,
        admitCardAvailable: admitCardAvailable || undefined,
        resultDeclared: resultDeclared || undefined
      },
      fees: {
        generalOBC: feeGeneral,
        scST: feeSCST,
        female: feeFemale || undefined,
        paymentMode
      },
      ageLimit: {
        asOnDate: ageAsOnDate,
        minAge: ageMin,
        maxAge: ageMax,
        relaxationInfo: ageRelaxation
      },
      totalVacancies,
      vacancies: vacanciesList,
      links: {
        applyOnline: category === 'latest-jobs' ? '#apply' : undefined,
        downloadNotification: '#notification',
        downloadSyllabus: category === 'syllabus' ? '#syllabus' : undefined,
        officialWebsite: officialSite || 'https://india.gov.in'
      }
    };

    onAddPosting(newPosting);
    resetForm();
    setActiveTab('listings');
    alert(`Success: Posting "${title}" has been added to the board!`);
  };

  const resetForm = () => {
    setTitle('');
    setOrganization('');
    setCategory('latest-jobs');
    setDepartment('SSC');
    setTagsInput('');
    setShortInfo('');
    setApplicationBegin('');
    setLastDateApply('');
    setLastDateFee('');
    setExamDate('');
    setAdmitCardAvailable('');
    setResultDeclared('');
    setFeeGeneral('₹ 100/-');
    setFeeSCST('₹ 0/-');
    setFeeFemale('');
    setPaymentMode('Online Mode Only');
    setAgeAsOnDate('01/08/2026');
    setAgeMin('18 Years');
    setAgeMax('27 Years');
    setAgeRelaxation('Age relaxation is applicable as per guidelines.');
    setTotalVacancies(100);
    setVacanciesList([
      { postName: 'General Posts', totalPosts: 100, eligibility: 'Passed 10th / 12th / Graduate from any recognized Board.' }
    ]);
    setOfficialSite('');
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-slate-950 text-white min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract glowing backgrounds matching platform */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#0d0a1f] border border-[#2b1f63]/60 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-red-950/40 border border-red-500/30 text-rose-500 rounded-full mb-2 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
              Authorized Access Only
            </h2>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
              Recruit.org.in Security Module. Please authenticate using your administrator credential token to unlock operational logs.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Admin ID</label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-[#151030] border border-[#3c2a84] rounded-2xl px-4.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Security Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-[#151030] border border-[#3c2a84] rounded-2xl px-4.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
              />
            </div>

            {loginError && (
              <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3 text-xs font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Verifying token...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5 text-yellow-300" />
                  <span>Authenticate Access</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#1d163d] pt-4.5 text-center">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">DEMO CREDENTIALS:</span>
            <div className="bg-[#120a2a]/60 border border-[#27184b] rounded-xl p-2.5 inline-block text-[11px] font-mono font-bold text-[#c084fc] space-y-0.5">
              <p>ID: <span className="text-white">admin</span></p>
              <p>Password: <span className="text-white">recruit_admin_2026</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Title & Stats Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-rose-500 flex items-center gap-2">
              <Database className="w-8 h-8" /> Control Panel & Database
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Add new recruitments, manage listings, and monitor platform operations in real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'metrics' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Traffic Logs
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'listings' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Listings Board
            </button>
            <button
              onClick={() => setActiveTab('add-form')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'add-form' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              + Create Posting
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'candidates' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Candidates Log
              {applications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {applications.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-400 cursor-pointer flex items-center gap-1"
              title="Logout current session"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Analytical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="bg-rose-600/20 p-3 rounded-lg text-rose-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Listings</p>
              <p className="text-2xl font-black mt-0.5">{postings.length}</p>
            </div>
          </div>
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="bg-emerald-600/20 p-3 rounded-lg text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Applications</p>
              <p className="text-2xl font-black mt-0.5">{applications.length}</p>
            </div>
          </div>
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="bg-amber-600/20 p-3 rounded-lg text-amber-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Approved Candidates</p>
              <p className="text-2xl font-black mt-0.5">{applications.filter(a => a.status === 'Approved').length}</p>
            </div>
          </div>
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-lg text-blue-500">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Agency Org</p>
              <p className="text-2xl font-black mt-0.5">8 Boards</p>
            </div>
          </div>
        </div>

        {/* Tab 0: Real-Time Site Activity & Operations Monitor */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Monitor Sub-Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-[#0b081c] border border-emerald-900/40 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 m-4 animate-ping"></div>
                <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Online Visitors</p>
                  <p className="text-2xl font-black mt-0.5 text-emerald-400">{liveUsersCount}</p>
                </div>
              </div>

              <div className="bg-[#0b081c] border border-violet-900/40 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-violet-500/10 p-3.5 rounded-xl text-violet-400 border border-violet-500/20">
                  <MessageSquare className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AROHI Chat Sessions</p>
                  <p className="text-2xl font-black mt-0.5 text-violet-300">
                    {stats?.counts?.chat || stats?.activities?.filter((a: any) => a.type === 'chat').length || 42} queries
                  </p>
                </div>
              </div>

              <div className="bg-[#0b081c] border border-cyan-900/40 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-cyan-500/10 p-3.5 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <FileCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ATS Resume Scans</p>
                  <p className="text-2xl font-black mt-0.5 text-cyan-300">
                    {stats?.counts?.resume || stats?.activities?.filter((a: any) => a.type === 'resume').length || 29} scans
                  </p>
                </div>
              </div>

              <div className="bg-[#0b081c] border border-amber-900/40 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-400 border border-amber-500/20">
                  <BookOpen className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Career Blueprints</p>
                  <p className="text-2xl font-black mt-0.5 text-amber-300">
                    {stats?.counts?.roadmap || stats?.activities?.filter((a: any) => a.type === 'roadmap').length || 18} maps
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Live Visitor Query Sandbox Engine */}
            <div className="bg-[#120e2b] rounded-2xl border border-[#2d2163] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#251a54] pb-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Operational Traffic Sandbox
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Click any scenario to simulate user actions across India and see live logs update instantaneously.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-2.5 py-1 rounded-full font-bold">
                    Telemetry Engine: Connected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => simulateVisitorEvent('visit', 'User from Cuttack, Odisha visited Schemes Board')}
                  disabled={isSimulating !== null}
                  className="bg-[#181338] hover:bg-[#251a54] border border-[#2d2163] text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>{isSimulating === 'visit' ? 'Simulating...' : 'Visit Govt Schemes'}</span>
                </button>
                <button
                  onClick={() => simulateVisitorEvent('chat', 'User from Mumbai asked AROHI about Mudra loan categories')}
                  disabled={isSimulating !== null}
                  className="bg-[#181338] hover:bg-[#251a54] border border-[#2d2163] text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-purple-400" />
                  <span>{isSimulating === 'chat' ? 'Simulating...' : 'Ask about Mudra Loan'}</span>
                </button>
                <button
                  onClick={() => simulateVisitorEvent('resume', 'ATS scan completed for IT Project Manager resume (Score: 84%)')}
                  disabled={isSimulating !== null}
                  className="bg-[#181338] hover:bg-[#251a54] border border-[#2d2163] text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>{isSimulating === 'resume' ? 'Simulating...' : 'Scan Resume (84% score)'}</span>
                </button>
                <button
                  onClick={() => simulateVisitorEvent('enroll', 'User registered for PMKVY Skills Certificate program')}
                  disabled={isSimulating !== null}
                  className="bg-[#181338] hover:bg-[#251a54] border border-[#2d2163] text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-yellow-400" />
                  <span>{isSimulating === 'enroll' ? 'Simulating...' : 'Enroll in PMKVY Course'}</span>
                </button>
              </div>
            </div>

            {/* Live activity trace logs list */}
            <div className="bg-slate-850 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-200">
                    Active Platform Event Feed
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Filter:</span>
                    <select
                      value={filterActivityType}
                      onChange={(e) => setFilterActivityType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value="all">All Activities</option>
                      <option value="visit">Visits</option>
                      <option value="chat">AROHI Chats</option>
                      <option value="resume">Resume Scans</option>
                      <option value="roadmap">Roadmaps</option>
                      <option value="apply">Applications</option>
                      <option value="enroll">Enrollments</option>
                      <option value="admin">Admin Actions</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
                    <span className="text-slate-400 text-[11px]">Sync:</span>
                    <select
                      value={autoRefreshInterval}
                      onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value={5}>Every 5s</option>
                      <option value={10}>Every 10s</option>
                      <option value={30}>Every 30s</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchStats}
                    disabled={statsLoading}
                    className="p-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-rose-400 flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
                    title="Refresh Live Trace Feed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto font-medium">
                {statsLoading && !stats && (
                  <div className="p-16 text-center text-sm text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-3" />
                    Fetching operational logs telemetry...
                  </div>
                )}

                {statsError && (
                  <div className="p-8 text-center bg-yellow-500/5 text-yellow-400 border-b border-slate-800/50 text-xs flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <span>{statsError}</span>
                  </div>
                )}

                {(() => {
                  const items = (stats?.activities || siteActivities).filter((act: any) => {
                    return filterActivityType === 'all' || act.type === filterActivityType;
                  });

                  if (items.length === 0) {
                    return (
                      <div className="p-16 text-center text-sm text-slate-500 italic">
                        No events of type "{filterActivityType}" logged in the trace cache. Try simulating some actions above!
                      </div>
                    );
                  }

                  return items.map((act: any) => {
                    let iconBg = 'bg-slate-800/50 text-slate-400';
                    let typeLabel = act.type.toUpperCase();
                    let iconComponent = <Activity className="w-4 h-4" />;

                    if (act.type === 'visit') {
                      iconBg = 'bg-slate-900 border border-slate-800 text-slate-300';
                      typeLabel = 'PAGE VISIT';
                      iconComponent = <Eye className="w-4 h-4" />;
                    } else if (act.type === 'chat') {
                      iconBg = 'bg-purple-950/40 border border-purple-900/60 text-purple-400';
                      typeLabel = 'AROHI CHAT';
                      iconComponent = <MessageSquare className="w-4 h-4" />;
                    } else if (act.type === 'resume') {
                      iconBg = 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-400';
                      typeLabel = 'RESUME ATS';
                      iconComponent = <FileCheck className="w-4 h-4" />;
                    } else if (act.type === 'roadmap') {
                      iconBg = 'bg-blue-950/40 border border-blue-900/60 text-blue-400';
                      typeLabel = 'CAREER MAP';
                      iconComponent = <BookOpen className="w-4 h-4" />;
                    } else if (act.type === 'apply') {
                      iconBg = 'bg-amber-950/40 border border-amber-900/60 text-amber-400';
                      typeLabel = 'APPLY FORM';
                      iconComponent = <UserCheck className="w-4 h-4" />;
                    } else if (act.type === 'enroll') {
                      iconBg = 'bg-cyan-950/40 border border-cyan-900/60 text-cyan-400';
                      typeLabel = 'ENROLLMENT';
                      iconComponent = <Sparkles className="w-4 h-4" />;
                    } else if (act.type === 'admin') {
                      iconBg = 'bg-rose-950/40 border border-rose-900/60 text-rose-400';
                      typeLabel = 'SECURITY';
                      iconComponent = <ShieldCheck className="w-4 h-4" />;
                    }

                    let timeStr = act.timestamp;
                    try {
                      const d = new Date(act.timestamp);
                      timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString('en-IN');
                    } catch (e) {}

                    return (
                      <div key={act.id} className="p-4 hover:bg-slate-800/15 transition-colors flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
                            {iconComponent}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
                                act.type === 'visit' ? 'bg-slate-900 border-slate-800 text-slate-300' :
                                act.type === 'chat' ? 'bg-purple-950/50 border-purple-900 text-purple-400' :
                                act.type === 'resume' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
                                act.type === 'roadmap' ? 'bg-blue-950/50 border-blue-900 text-blue-400' :
                                act.type === 'apply' ? 'bg-amber-950/50 border-amber-900 text-amber-400' :
                                act.type === 'enroll' ? 'bg-cyan-950/50 border-cyan-900 text-cyan-400' :
                                'bg-rose-950/50 border-rose-900 text-rose-400'
                              }`}>
                                {typeLabel}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{timeStr}</span>
                            </div>
                            <p className="text-slate-100 text-xs md:text-sm leading-relaxed">{act.description}</p>
                          </div>
                        </div>

                        {act.metadata && (
                          <div className="text-[10px] font-mono font-bold bg-[#110c26] text-[#c084fc] px-2 py-1 rounded border border-[#231a47] shrink-0 hidden sm:block">
                            {JSON.stringify(act.metadata).length > 25 ? Object.keys(act.metadata)[0] + ': ' + Object.values(act.metadata)[0] : JSON.stringify(act.metadata)}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="bg-slate-850 px-4 py-3 border-t border-slate-800 text-center text-[10px] text-slate-500 font-bold tracking-wider">
                System Time: {new Date().toLocaleDateString('en-IN')} (UTC+5:30) | Live Telemetry Streaming Active
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Database Listings List */}
        {activeTab === 'listings' && (
          <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-wider uppercase text-slate-300">Available Database Records</h3>
              <span className="text-xs text-slate-400 font-mono">Database Connection: Active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-300 border-b border-slate-700 font-bold">
                    <th className="py-3 px-4">Post Reference Title</th>
                    <th className="py-3 px-4">Organization / Department</th>
                    <th className="py-3 px-4 text-center">Category Section</th>
                    <th className="py-3 px-4 text-center">Total Vacancy</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {postings.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">{post.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Date Added: {post.postDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        <div>{post.organization}</div>
                        <span className="text-[10px] bg-slate-800 text-rose-400 px-1.5 py-0.5 rounded mt-1 inline-block border border-slate-700 font-mono">
                          {post.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-600/10 text-rose-400 border border-rose-900">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-yellow-400">
                        {post.totalVacancies > 0 ? post.totalVacancies : 'Eligibility Exam'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this recruitment record?')) {
                              onDeletePosting(post.id);
                            }
                          }}
                          className="bg-red-950/40 hover:bg-red-900 border border-red-900 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Create / Add New Job Listing Form */}
        {activeTab === 'add-form' && (
          <div className="bg-slate-850 rounded-xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-bold border-b border-slate-700 pb-3 mb-6 uppercase tracking-wider text-rose-500">
              Create New Government Recruitment / Exam Posting
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Post Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., UPSC IAS 2026 Online Form"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Organization Board Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Union Public Service Commission (UPSC)"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category Target Section *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white"
                  >
                    <option value="latest-jobs">Latest Jobs</option>
                    <option value="admit-card">Admit Card</option>
                    <option value="results">Latest Results</option>
                    <option value="answer-key">Answer Key</option>
                    <option value="syllabus">Syllabus PDF</option>
                    <option value="admission">University Admission</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Department / Tag *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white"
                    >
                      <option value="SSC">SSC Matrix</option>
                      <option value="Railway">Railway Boards</option>
                      <option value="UPSC">UPSC Central</option>
                      <option value="Bank">Banking Boards</option>
                      <option value="Defence">Defence & Police</option>
                      <option value="State PSC">State PSC Boards</option>
                      <option value="Teaching">Teaching / Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tags (Comma Sep)</label>
                    <input
                      type="text"
                      placeholder="UPSC, 12th Pass, Army"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Short Information Summary *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a quick overview of the post details for candidates."
                    value={shortInfo}
                    onChange={(e) => setShortInfo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  ></textarea>
                </div>
              </div>

              {/* Dates & Fees Section */}
              <div className="border-t border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3">🕒 Important Timelines</h4>
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Begin Date</label>
                        <input
                          type="date"
                          value={applicationBegin}
                          onChange={(e) => setApplicationBegin(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Last Date to Apply</label>
                        <input
                          type="date"
                          value={lastDateApply}
                          onChange={(e) => setLastDateApply(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Fee Last Date</label>
                        <input
                          type="date"
                          value={lastDateFee}
                          onChange={(e) => setLastDateFee(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Expected Exam Date</label>
                        <input
                          type="text"
                          placeholder="e.g. Sept 2026"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Admit Card Date</label>
                        <input
                          type="text"
                          placeholder="e.g. August 2026"
                          value={admitCardAvailable}
                          onChange={(e) => setAdmitCardAvailable(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Result declared Date</label>
                        <input
                          type="text"
                          placeholder="e.g. Dec 2026"
                          value={resultDeclared}
                          onChange={(e) => setResultDeclared(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3">💵 Registration Fee matrix</h4>
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">General / OBC fee</label>
                        <input
                          type="text"
                          value={feeGeneral}
                          onChange={(e) => setFeeGeneral(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">SC / ST / PH fee</label>
                        <input
                          type="text"
                          value={feeSCST}
                          onChange={(e) => setFeeSCST(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Female Candidate Fee (If any)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹ 0/- (Exempted)"
                        value={feeFemale}
                        onChange={(e) => setFeeFemale(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Fee Payment Mode Description</label>
                      <input
                        type="text"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Age Limit & Vacancies details */}
              <div className="border-t border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3">👥 Candidate Age Criteria</h4>
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Min Age</label>
                        <input
                          type="text"
                          value={ageMin}
                          onChange={(e) => setAgeMin(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Max Age</label>
                        <input
                          type="text"
                          value={ageMax}
                          onChange={(e) => setAgeMax(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Calculate As On</label>
                        <input
                          type="text"
                          value={ageAsOnDate}
                          onChange={(e) => setAgeAsOnDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Age Relaxation Description</label>
                      <textarea
                        rows={1}
                        value={ageRelaxation}
                        onChange={(e) => setAgeRelaxation(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3">📈 Vacancy Matrix</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Posts Vacancy count</label>
                      <input
                        type="number"
                        value={totalVacancies}
                        onChange={(e) => setTotalVacancies(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Eligibility Breakdown */}
              <div className="border-t border-slate-800 pt-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                    📋 Sub-Posts Breakdown & Qualification Eligibility Requirements
                  </h4>
                  <button
                    type="button"
                    onClick={addVacancyRow}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 text-xs rounded font-bold cursor-pointer flex items-center gap-1"
                  >
                    + Add post row
                  </button>
                </div>

                <div className="space-y-3.5">
                  {vacanciesList.map((vac, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Post Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Multi Tasking Staff (MTS)"
                          value={vac.postName}
                          onChange={(e) => handleVacancyChange(idx, 'postName', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Vacancy count</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={vac.totalPosts}
                          onChange={(e) => handleVacancyChange(idx, 'totalPosts', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Eligibility Criteria Details *</label>
                        <input
                          type="text"
                          required
                          placeholder="Passed Class 10th / 12th from any board in India."
                          value={vac.eligibility}
                          onChange={(e) => handleVacancyChange(idx, 'eligibility', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="md:col-span-1 text-right">
                        <button
                          type="button"
                          disabled={vacanciesList.length === 1}
                          onClick={() => removeVacancyRow(idx)}
                          className="bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-900 p-1.5 rounded disabled:opacity-40 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External fields */}
              <div className="border-t border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Official Board Website URL</label>
                  <input
                    type="url"
                    placeholder="https://ssc.gov.in"
                    value={officialSite}
                    onChange={(e) => setOfficialSite(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="border-t border-slate-800 pt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg text-sm font-bold text-slate-300 cursor-pointer"
                >
                  Reset form
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-2 rounded-lg text-sm font-black uppercase tracking-wider cursor-pointer"
                >
                  Publish Posting
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tab 3: Candidate Applications Log */}
        {activeTab === 'candidates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Candidates Table List */}
            <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-wider uppercase text-slate-300">Registered Candidates Log</h3>
                <span className="text-xs bg-slate-900 px-2.5 py-1 rounded text-rose-400 font-mono font-bold">
                  {applications.length} Records
                </span>
              </div>
              
              {applications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No candidate application slips submitted yet. Use the "Apply Online" tab on any job posting on the front page to submit one!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-800/40 text-slate-300 border-b border-slate-700 font-bold">
                        <th className="py-3 px-4">Candidate Profile</th>
                        <th className="py-3 px-4">Target Job Posting</th>
                        <th className="py-3 px-4 text-center">Verification Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-white">{app.candidateName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.registrationNumber}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-semibold max-w-[200px] truncate">
                            {app.postingTitle}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              app.status === 'Approved'
                                ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-900/50'
                                : app.status === 'Rejected'
                                ? 'bg-red-600/10 text-red-400 border border-red-900/50'
                                : 'bg-yellow-600/10 text-yellow-400 border border-yellow-900/50 animate-pulse'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center flex items-center justify-center gap-1.5 mt-1.5">
                            <button
                              onClick={() => setSelectedAppForView(app)}
                              className="bg-slate-850 hover:bg-slate-700 border border-slate-700 text-white p-1 rounded transition-all cursor-pointer"
                              title="View full credentials"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {app.status === 'Submitted' && (
                              <>
                                <button
                                  onClick={() => onUpdateAppStatus(app.id, 'Approved')}
                                  className="bg-emerald-950/80 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800 p-1 rounded transition-all cursor-pointer"
                                  title="Approve verification"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onUpdateAppStatus(app.id, 'Rejected')}
                                  className="bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white border border-red-800 p-1 rounded transition-all cursor-pointer"
                                  title="Reject application"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Candidate Credential Reader panel */}
            <div className="bg-slate-850 rounded-xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-700 pb-2 mb-4 text-slate-300">
                🔍 Candidate Credentials Reader
              </h3>

              {selectedAppForView ? (
                <div className="space-y-4 text-xs font-semibold text-slate-300">
                  <div className="flex gap-4 items-start bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {selectedAppForView.photoUrl ? (
                      <img src={selectedAppForView.photoUrl} alt="Photo" className="w-20 h-24 object-cover border border-slate-750 bg-slate-950" />
                    ) : (
                      <div className="w-20 h-24 bg-slate-950 flex items-center justify-center text-slate-600 border text-[9px] uppercase font-bold">No Photo</div>
                    )}
                    <div>
                      <div className="text-sm font-black text-white uppercase">{selectedAppForView.candidateName}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Son/Daughter of:</div>
                      <div className="text-slate-200 uppercase">{selectedAppForView.fatherName}</div>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">Reg: {selectedAppForView.registrationNumber}</div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <p className="flex justify-between pb-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Gender / DOB:</span>
                      <span className="text-slate-200">{selectedAppForView.gender} | {selectedAppForView.dob}</span>
                    </p>
                    <p className="flex justify-between pb-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Reservation Category:</span>
                      <span className="text-slate-200 font-bold">{selectedAppForView.category}</span>
                    </p>
                    <p className="flex justify-between pb-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Contact Email:</span>
                      <span className="text-slate-200 font-mono">{selectedAppForView.email}</span>
                    </p>
                    <p className="flex justify-between pb-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Contact Mobile:</span>
                      <span className="text-slate-200">+91 {selectedAppForView.phone}</span>
                    </p>
                    <p className="flex flex-col pb-1 border-b border-slate-800/40 gap-0.5">
                      <span className="text-slate-500">Academic Qualification:</span>
                      <span className="text-slate-200 leading-normal">{selectedAppForView.qualification}</span>
                    </p>
                    <p className="flex flex-col pb-1 gap-0.5">
                      <span className="text-slate-500">Postal Address:</span>
                      <span className="text-slate-300 leading-tight italic">{selectedAppForView.address}</span>
                    </p>
                  </div>

                  {selectedAppForView.signatureUrl && (
                    <div className="border-t border-slate-800 pt-3">
                      <span className="text-slate-500 block mb-1">Captured Signature:</span>
                      <div className="bg-white/90 p-2 rounded border border-slate-800">
                        <img src={selectedAppForView.signatureUrl} alt="Signature" className="h-10 w-full object-contain" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedAppForView(null)}
                      className="text-xs text-rose-400 hover:text-rose-500 font-bold border border-rose-900/40 hover:bg-rose-950/20 px-3 py-1.5 rounded"
                    >
                      Close Reader
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-lg border border-slate-800/60">
                  Select a candidate from the log list to inspect their credentials and document uploads.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
