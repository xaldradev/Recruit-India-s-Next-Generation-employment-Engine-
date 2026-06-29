import { useState, useEffect } from 'react';
import { Bot, Sparkles, Award, Menu, X, Landmark, Briefcase, Settings, User, BookOpen, FileText, ChevronDown, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  onOpenAuth: () => void;
}

export default function Header({ activeTab, onTabChange, onSearchChange, searchQuery, onOpenAuth }: HeaderProps) {
  const { user, userData, signOutUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          m = 59;
          s = 59;
        }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  const navLinks = [
    { id: 'home', label: 'Home', hasDropdown: false },
    { id: 'jobs', label: 'Jobs', hasDropdown: true },
    { id: 'courses', label: 'Skills', hasDropdown: true },
    { id: 'syllabus', label: 'Syllabus 1-10', hasBadge: true, badgeText: 'Odia/CBSE' },
    { id: 'business', label: 'Business', hasBadge: true, badgeText: 'New' },
    { id: 'arohi', label: user ? 'Dashboard' : 'Join Now', hasDropdown: false },
    { id: 'privacy', label: 'Privacy', hasDropdown: false },
    { id: 'terms', label: 'Terms', hasDropdown: false },
    { id: 'refunds', label: 'Refund', hasDropdown: false },
    { id: 'payments', label: 'Payment', hasDropdown: false },
    { id: 'contact', label: 'Contact', hasDropdown: false }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090714] border-b border-[#211b3d] text-white shadow-xl">
      
      {/* Top micro promo banner - Replaced with premium Apple-style status announcement */}
      <div className="bg-gradient-to-r from-[#070510] via-[#100a29] to-[#070510] text-slate-300 text-xs py-2 px-4 flex justify-center items-center gap-3 overflow-hidden border-b border-[#1b1535] text-center shadow-md">
        <div className="flex items-center gap-2.5 font-medium text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide text-[10px] sm:text-xs font-semibold text-slate-200">
            Official National Career Registry Network Active
          </span>
          <span className="text-[#3b3261] hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 inline" /> Verified Portal Integration
          </span>
          <span className="text-[#3b3261] hidden md:inline">•</span>
          <span className="text-[10px] sm:text-xs text-slate-400 hidden md:inline">
            Over 24,500+ Live Government & Corporate Vacancies Synchronized
          </span>
        </div>
      </div>

      {/* Main Navbar: Height 80px */}
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center gap-4">
        
        {/* Left Side: Logo */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Custom Graduation Cap Logo inside deep purple rounded square */}
          <div className="bg-[#7c3aed] p-2.5 rounded-2xl border border-[#a78bfa]/40 shadow-[0_0_15px_rgba(124,58,237,0.35)] group-hover:scale-105 transition-transform flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M11.645 2.044a.75.75 0 0 1 .71 0l9.75 5.25a.75.75 0 0 1 0 1.312l-9.75 5.25a.75.75 0 0 1-.71 0L1.9 8.606a.75.75 0 0 1 0-1.312h.005l9.74-5.25ZM22 12.75a.75.75 0 0 1-.75-.75V9.11l-2 1.077v3.063c0 .385-.21.74-.55 1.13-1.256 1.436-3.708 2.62-7.2 2.62-3.492 0-5.944-1.184-7.2-2.62a1.5 1.5 0 0 1-.55-1.13V10.187L2.75 9.11v2.89a.75.75 0 0 1-1.5 0V8.534a.75.75 0 0 1 .373-.648l9.75-5.25a.75.75 0 0 1 .746 0l9.75 5.25a.75.75 0 0 1 .373.648v4.216a.75.75 0 0 1-.75.75Zm-10.25 2.5c2.975 0 4.968-.946 5.86-1.966a.25.25 0 0 0 .04-.154v-1.74l-5.63 3.03a.75.75 0 0 1-.74 0L5.65 11.39v1.74a.25.25 0 0 0 .04.154c.892 1.02 2.885 1.966 5.86 1.966Z" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight select-none leading-none text-white">
              Recruit
            </h1>
            <span className="text-[9px] sm:text-xs text-slate-400 font-semibold tracking-normal mt-0.5 leading-tight max-w-[180px] sm:max-w-none">
              Empowering India’s Students, Professionals, and MSMEs
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeTab === link.id
                  ? 'bg-[#221f42] text-white border border-[#4c3ba0]/50'
                  : 'text-slate-300 hover:text-white hover:bg-[#15122e]/60'
              }`}
            >
              <span>{link.label}</span>
              {link.hasDropdown && <ChevronDown className="w-3 h-3 opacity-60" />}
              {link.hasBadge && (
                <span className="bg-[#7c3aed] text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse uppercase">
                  {link.badgeText}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Side: CTA and Mobile toggle */}
        <div className="flex items-center gap-2.5">
          
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              {/* Account details badge */}
              <div 
                onClick={() => onTabChange('arohi')}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#17113a] border border-[#3b289c] rounded-full cursor-pointer hover:bg-[#251b5c] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white text-[10px] font-black uppercase">
                  {userData?.profile?.name?.slice(0, 2) || user.displayName?.slice(0, 2) || 'IN'}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white leading-tight uppercase tracking-wider truncate max-w-[90px]">
                    {userData?.profile?.name || user.displayName || 'Guest'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold leading-none uppercase">
                    {userData?.profile?.location || 'India'}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOutUser()}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              {/* Sign In Button */}
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full border border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer bg-[#0f0a28]/40"
              >
                Sign In
              </button>

              {/* Join Now Glowing Gradient Button */}
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[#1c1836] hover:bg-[#2c2654] border border-[#2d255a] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Immersive backdrop with custom blur and fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#04020a]/85 backdrop-blur-md z-[100] xl:hidden"
            />

            {/* Immersive 3D perspective floating menu */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 xl:hidden pointer-events-none perspective-[1200px]">
              <motion.div
                initial={{ 
                  opacity: 0, 
                  scale: 0.85, 
                  rotateX: 18, 
                  rotateY: -10, 
                  z: -150,
                  y: -30
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateX: 0, 
                  rotateY: 0, 
                  z: 0,
                  y: 0,
                  transition: { 
                    type: 'spring', 
                    damping: 24, 
                    stiffness: 110,
                    mass: 1
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  rotateX: -15, 
                  rotateY: 5, 
                  z: -100,
                  y: 40,
                  transition: { duration: 0.25 }
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="pointer-events-auto relative w-full max-w-md bg-[#0a061a]/90 border border-purple-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_30px_70px_rgba(124,58,237,0.35)] overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Decorative premium corner glowing rings */}
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-purple-600/25 blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-pulse" />
                
                {/* Header section of 3D floating board */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-purple-950/40 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="bg-[#7c3aed] p-2 rounded-xl border border-purple-400/30">
                      <Bot className="w-5 h-5 text-white animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#a78bfa] uppercase block leading-none">Navigation Space</span>
                      <span className="text-sm font-black text-white uppercase tracking-tight">Recruit Engine</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-full bg-purple-950/50 hover:bg-purple-900 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-white transition-all cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid of Link items: Scrollable container */}
                <div 
                  className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 relative z-10 custom-scrollbar mb-4 py-1"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {navLinks.map((link, idx) => {
                    const isActive = activeTab === link.id;
                    
                    // Inline helper to render icons inside the menu beautifully
                    const getLinkIcon = (id: string) => {
                      switch (id) {
                        case 'home': return <Landmark className="w-4 h-4 text-purple-400" />;
                        case 'jobs': return <Briefcase className="w-4 h-4 text-blue-400" />;
                        case 'courses': return <BookOpen className="w-4 h-4 text-emerald-400" />;
                        case 'syllabus': return <FileText className="w-4 h-4 text-amber-400" />;
                        case 'business': return <Sparkles className="w-4 h-4 text-pink-400" />;
                        case 'arohi': return <Bot className="w-4 h-4 text-fuchsia-400" />;
                        case 'privacy': return <ShieldCheck className="w-4 h-4 text-teal-400" />;
                        case 'terms': return <FileText className="w-4 h-4 text-indigo-400" />;
                        case 'refunds': return <Landmark className="w-4 h-4 text-red-400" />;
                        case 'payments': return <Award className="w-4 h-4 text-violet-400" />;
                        case 'contact': return <User className="w-4 h-4 text-cyan-400" />;
                        default: return <Sparkles className="w-4 h-4 text-purple-400" />;
                      }
                    };

                    return (
                      <motion.button
                        key={link.id}
                        initial={{ opacity: 0, x: -15, z: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          z: 0,
                          transition: { delay: idx * 0.03 } 
                        }}
                        whileHover={{ 
                          scale: 1.02, 
                          x: 4, 
                          translateZ: 15,
                          backgroundColor: 'rgba(124, 58, 237, 0.15)',
                          borderColor: 'rgba(167, 139, 250, 0.4)' 
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onTabChange(link.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#2c1d54] to-[#1a113a] text-white border-purple-500 shadow-[0_4px_15px_rgba(124,58,237,0.25)]'
                            : 'bg-[#120a28]/60 text-slate-300 border-purple-950/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-lg ${isActive ? 'bg-purple-500/25' : 'bg-purple-950/40'}`}>
                            {getLinkIcon(link.id)}
                          </span>
                          <span className="tracking-wide">{link.label}</span>
                        </div>
                        
                        {link.hasBadge && (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                            {link.badgeText}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Profile/Auth CTA panel at the bottom of the board */}
                <div 
                  className="pt-4 border-t border-purple-950/40 relative z-10 mt-auto"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#130b2c]/80 border border-purple-950/40 rounded-2xl shadow-inner">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white text-xs font-black uppercase shadow-md border border-purple-400/30">
                          {userData?.profile?.name?.slice(0, 2) || user.displayName?.slice(0, 2) || 'IN'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white uppercase tracking-wide truncate">
                            {userData?.profile?.name || user.displayName}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-tight truncate leading-none mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          signOutUser();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-center bg-red-950/40 border border-red-500/20 text-red-200 py-3 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-md transition-colors"
                      >
                        Sign Out
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onOpenAuth();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-center bg-purple-950/20 hover:bg-[#130b2c] border border-purple-500/25 text-purple-300 hover:text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                        >
                          Sign In
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onOpenAuth();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-center bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
                        >
                          Sign Up
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </header>
  );
}
