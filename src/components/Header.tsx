import { useState, useEffect } from 'react';
import { Bot, Sparkles, Award, Menu, X, Landmark, Briefcase, Settings, User, BookOpen, FileText, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ activeTab, onTabChange, onSearchChange, searchQuery }: HeaderProps) {
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
    { id: 'business', label: 'Business', hasBadge: true, badgeText: 'New' },
    { id: 'arohi', label: 'Join Now', hasDropdown: false },
    { id: 'privacy', label: 'Privacy', hasDropdown: false },
    { id: 'terms', label: 'Terms', hasDropdown: false },
    { id: 'refunds', label: 'Refund', hasDropdown: false },
    { id: 'payments', label: 'Payment', hasDropdown: false },
    { id: 'contact', label: 'Contact', hasDropdown: false }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090714] border-b border-[#211b3d] text-white shadow-xl">
      
      {/* Top micro promo banner */}
      <div className="bg-gradient-to-r from-[#0b081c] via-[#21164c] to-[#0b081c] text-white text-xs font-semibold py-2 px-4 flex justify-center items-center gap-2 overflow-hidden border-b border-[#2b1f63]/50 text-center shadow-md">
        <span className="flex items-center gap-1.5 font-black text-slate-100">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="tracking-wide uppercase text-[10px] text-slate-300">Premium Upskilling Event:</span>
          <span className="text-yellow-300 font-black">Limited Spots Left!</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Offer ends in</span>
          <span className="bg-[#33227a] border border-[#4d36b3] px-2 py-0.5 rounded font-mono font-black text-[#00e676] text-xs">
            {padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}
          </span>
        </span>
        <span className="bg-yellow-400 text-slate-950 font-black px-3 py-0.5 rounded-full text-[9px] uppercase tracking-wider shadow-[0_0_12px_rgba(234,179,8,0.3)] ml-2 border border-yellow-300">
          ₹3,399/Month – Start Your Transformation Today
        </span>
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
              India's Next Generation Employment Engine
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
          
          {/* Join Now Glowing Gradient Button */}
          <button
            onClick={() => onTabChange('arohi')}
            className="hidden sm:block bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all cursor-pointer transform hover:scale-[1.02]"
          >
            Join Now
          </button>

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
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#090714] border-t border-[#211b3d] py-3 px-4 flex flex-col gap-1.5 shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onTabChange(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === link.id
                  ? 'bg-[#221f42] text-white border border-[#4c3ba0]/50'
                  : 'text-slate-300 hover:bg-[#15122e]/60'
              }`}
            >
              <span>{link.label}</span>
              {link.hasBadge && (
                <span className="bg-[#7c3aed] text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                  {link.badgeText}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              onTabChange('arohi');
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 text-center bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white py-2.5 rounded-full text-xs font-black uppercase tracking-wider"
          >
            Join Now
          </button>
        </div>
      )}

    </header>
  );
}
