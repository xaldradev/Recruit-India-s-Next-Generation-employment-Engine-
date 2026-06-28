import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  Layers, 
  Compass, 
  Activity, 
  Crown, 
  Users,
  Target,
  Volume2,
  VolumeX,
  Sparkle,
  ArrowRight,
  Tv,
  Cpu,
  Fingerprint
} from 'lucide-react';

interface Entry3DWelcomeProps {
  onClose: (userName: string) => void;
}

// Custom Premium sound effects synthesizer using Web Audio API
class AudioSynth {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio disabled:', e);
    }
  }

  public playKeypress() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 220, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.log('Audio disabled:', e);
    }
  }

  public playPortalWarp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Sweep low up to high
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 1.8);
      
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.08, now + 0.6);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start();
      osc1.stop(now + 1.8);

      // Deep harmonic chord of alignment
      const chords = [261.63, 329.63, 392.00, 523.25]; // C chord
      chords.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 1.8);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 1.8);
      });
    } catch (e) {
      console.log('Audio error:', e);
    }
  }
}

export default function Entry3DWelcome({ onClose }: Entry3DWelcomeProps) {
  const [userName, setUserName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isWarping, setIsWarping] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const synthRef = useRef<AudioSynth | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Audio Synth
  useEffect(() => {
    synthRef.current = new AudioSynth();
  }, []);

  // Sync mute state
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  // Storyboarding speeches
  const speeches = [
    {
      title: "WELCOME TO RECRUIT.ORG.IN",
      text: "Namaste! Welcome to India's next-generation premium employment portal, syncing central board vacancies with verified candidates."
    },
    {
      title: "HI, I AM AROHI!",
      text: "I am your personal AI guide and career companion. I am here to assist you with active job applications, real-time resume reviews, and certified skill certifications."
    },
    {
      title: "LET'S CHANGE YOUR FUTURE",
      text: "Together, we will unlock hidden potential, bypass obsolete job processes, and map an elite path to your professional zenith."
    },
    {
      title: "ENTER A NEW WORLD",
      text: "A world of real-time insights, smart ATS tools, and absolute national career transparency awaits. Step forward through the portal..."
    }
  ];

  // Story speech progression
  useEffect(() => {
    const currentSpeech = speeches[activeSpeechIndex].text;
    let index = 0;
    setTypedText('');

    const interval = setInterval(() => {
      if (index < currentSpeech.length) {
        setTypedText(prev => prev + currentSpeech.charAt(index));
        index++;
        // Play keyboard sound on typing
        if (synthRef.current && !isMuted && index % 2 === 0) {
          synthRef.current.playKeypress();
        }
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [activeSpeechIndex]);

  // Mouse tilt 3D Parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const relX = (e.clientX - rect.left) / width - 0.5;
    const relY = (e.clientY - rect.top) / height - 0.5;
    
    setRotation({
      x: -relY * 15,
      y: relX * 15
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleNextSpeech = () => {
    if (synthRef.current && !isMuted) {
      synthRef.current.playTick();
    }
    if (activeSpeechIndex < speeches.length - 1) {
      setActiveSpeechIndex(prev => prev + 1);
    }
  };

  const handlePrevSpeech = () => {
    if (synthRef.current && !isMuted) {
      synthRef.current.playTick();
    }
    if (activeSpeechIndex > 0) {
      setActiveSpeechIndex(prev => prev - 1);
    }
  };

  const executeWarpEntrance = () => {
    if (synthRef.current && !isMuted) {
      synthRef.current.playPortalWarp();
    }
    setIsWarping(true);

    const finalName = userName.trim() || 'Honored Guest';
    localStorage.setItem('recruit_user_name', finalName);
    localStorage.setItem('recruit_welcome_v3', 'true');

    // Wait for the hyperspace zoom warp animation before closing
    setTimeout(() => {
      onClose(finalName);
    }, 1200);
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#04020a] z-50 overflow-hidden flex items-center justify-center p-4 font-sans select-none transition-all duration-1000 ${isWarping ? 'scale-[2.5] filter blur-xl opacity-0' : 'scale-100 opacity-100'}`}
      id="entry-3d-welcome-root"
    >
      {/* Background visual space elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,10,48,0.75),rgba(4,2,10,1))] pointer-events-none"></div>
      
      {/* Dynamic star grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>

      {/* Futuristic floating dust particles */}
      <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-[#00e676] rounded-full animate-ping duration-[4s] opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-pulse duration-[6s] opacity-80"></div>
      <div className="absolute top-2/3 left-10 w-1 h-1 bg-amber-400 rounded-full animate-ping duration-[5s] opacity-50"></div>

      {/* Floating sound and settings bars */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-[#0d091e]/90 border border-[#2d2163] text-slate-300 hover:text-white rounded-2xl cursor-pointer transition-all active:scale-95 shadow-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
          title={isMuted ? "Unmute Voice Synth" : "Mute Voice Synth"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400">Synth Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-400">Synth Active</span>
            </>
          )}
        </button>
      </div>

      {/* Left Bottom corner brand watermark */}
      <div className="absolute bottom-6 left-6 z-40 hidden md:block text-[8px] font-mono tracking-widest text-slate-500 font-black uppercase">
        PORTAL INTEGRITY ENGINE v2.4 // SECURED LINK
      </div>

      {/* Interactive 3D Container with Mouse Move Parallax */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-5xl relative flex flex-col items-center justify-center min-h-[580px] preserve-3d perspective-2000 py-4"
      >
        <div 
          className="w-full flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-14 transition-transform duration-300 ease-out preserve-3d"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
          }}
        >
          {/* ================= LEFT SIDE: STUNNING 3D AI CHARACTER DISPLAY (AROHI) ================= */}
          <div 
            className="flex flex-col items-center justify-center relative w-72 h-72 md:w-80 md:h-80 preserve-3d"
            style={{ transform: 'translateZ(100px)' }}
          >
            {/* Spinning Holographic Base Ring */}
            <div className="absolute bottom-0 w-56 h-8 bg-gradient-to-r from-purple-600/20 via-cyan-400/20 to-purple-600/20 rounded-full blur-md border border-cyan-500/30 animate-spin duration-[15s]"></div>
            
            {/* Hologram Light Cone radiating upwards */}
            <div className="absolute bottom-4 w-44 h-64 bg-gradient-to-t from-cyan-400/10 via-purple-600/5 to-transparent clip-path-cone rounded-t-full pointer-events-none"></div>

            {/* AROHI 3D Character Container - Premium CSS Vector/Styling Render */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-b from-[#180f3d] via-[#090518] to-[#04020a] border-2 border-[#7c3aed]/50 shadow-[0_0_50px_rgba(124,58,237,0.4)] flex items-center justify-center relative overflow-visible group hover:border-cyan-400 hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all duration-300">
              
              {/* Outer Orbit Symbols */}
              <div className="absolute inset-0 border border-dashed border-cyan-500/20 rounded-full animate-spin duration-[25s]"></div>
              
              {/* Floating Certification and Briefcase micro holograms orbiting */}
              <div className="absolute -top-4 -left-4 p-2.5 bg-gradient-to-br from-[#0c1630] to-[#040915] border border-cyan-400/40 text-cyan-300 rounded-xl shadow-lg animate-bounce duration-[4s]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-2 -right-4 p-2.5 bg-gradient-to-br from-[#240a28] to-[#0c030d] border border-pink-400/40 text-pink-300 rounded-xl shadow-lg animate-bounce duration-[5s]">
                <Briefcase className="w-5 h-5" />
              </div>

              {/* Deep Space Star inside the glass */}
              <div className="absolute top-6 right-6 text-[#ffd700] opacity-85 animate-pulse">
                <Sparkle className="w-4 h-4 fill-current" />
              </div>

              {/* Glowing camera lens / AI core of Arohi */}
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-violet-600/90 to-cyan-500/90 p-1 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center relative">
                
                {/* Glowing Core Wave */}
                <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping duration-[2.5s]"></span>
                
                {/* Simulated 3D Face Representation */}
                <div className="w-full h-full rounded-full bg-[#04020a]/90 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  
                  {/* Cyber grid overlay on the face */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

                  {/* Gentle blinking eyes */}
                  <div className="flex gap-4 mb-2 z-10">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
                  </div>

                  {/* Golden smart neural voice curve */}
                  <div className="w-16 h-1 flex items-center justify-center gap-0.5 mt-2 z-10">
                    <span className="w-1 h-3 bg-[#ffd700] rounded-full animate-pulse"></span>
                    <span className="w-1 h-4 bg-[#ffd700] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    <span className="w-1 h-4 bg-[#ffd700] rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span>
                    <span className="w-1 h-3 bg-[#ffd700] rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></span>
                  </div>

                  {/* Character Title */}
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-2.5">
                    AROHI CORE 2.4
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Status Indicator */}
            <div className="mt-4 bg-[#0d0724]/90 border border-purple-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                INTELLIGENT PRESENCE ON
              </span>
            </div>
          </div>

          {/* ================= RIGHT SIDE: PREMIUM PRESENTATION CONSOLE ================= */}
          <div 
            className="flex-1 max-w-lg w-full bg-gradient-to-b from-[#0e0a29]/95 via-[#060414]/98 to-[#020106]/100 border border-[#3b289c] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(124,58,237,0.35)] text-center md:text-left relative overflow-hidden preserve-3d"
            style={{ transform: 'translateZ(130px)' }}
          >
            {/* Ambient gold glow spotlight */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#ffd700]/5 rounded-full blur-2xl"></div>

            {/* Custom Interactive Onboarding Step Count indicator */}
            <div className="flex justify-between items-center mb-6 border-b border-[#2d1e6e] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide">RECRUIT HUB SYSTEM</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Multi-Phase Interactive</p>
                </div>
              </div>

              {/* Progress lights */}
              <div className="flex gap-1.5">
                {speeches.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeSpeechIndex ? 'bg-[#ffd700] scale-125 shadow-[0_0_8px_#ffd700]' : 'bg-slate-700'}`}
                  ></span>
                ))}
              </div>
            </div>

            {/* Title Block with high-contrast text */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">
                {speeches[activeSpeechIndex].title === "HI, I AM AROHI!" ? "⭐ VIRTUAL CO-PILOT ACTIVE ⭐" : "NATIONAL DIRECTIVE"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {speeches[activeSpeechIndex].title}
              </h2>
            </div>

            {/* Text Typing Screen */}
            <div className="bg-[#030107] border border-[#2d1e6e] rounded-2xl p-5 my-5 text-left min-h-[120px] relative">
              {/* Typewriter message */}
              <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                {typedText}
                <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
              </p>

              {/* Visual watermarks */}
              <div className="absolute bottom-2 right-3 text-[7px] font-mono font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-cyan-500" /> Secure Terminal
              </div>
            </div>

            {/* Flow buttons */}
            <div className="flex flex-col gap-3">
              {/* If we are at the final slide, show the Portal Entrance form */}
              {activeSpeechIndex === speeches.length - 1 ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {/* Name Input Box */}
                  <div className="text-left space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                      Enter Your Name to Seal Your VIP Boarding Credentials:
                    </label>
                    <input
                      type="text"
                      placeholder="ENTER FULL NAME HERE..."
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value.substring(0, 24));
                        synthRef.current?.playKeypress();
                      }}
                      className="w-full bg-[#030107] text-white border border-purple-500/50 rounded-xl px-4 py-3.5 text-xs font-black focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/30 transition-all placeholder-slate-700 uppercase text-center tracking-wider"
                    />
                  </div>

                  {/* Warp Entrance Button */}
                  <button
                    onClick={executeWarpEntrance}
                    className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-[0_5px_30px_rgba(251,191,36,0.35)] cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>ENTER A NEW WORLD THROUGH THE PORTAL</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3px] animate-bounce" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between gap-4">
                  <button
                    onClick={handlePrevSpeech}
                    disabled={activeSpeechIndex === 0}
                    className={`px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeSpeechIndex === 0 ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-50' : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'}`}
                  >
                    BACK
                  </button>

                  <button
                    onClick={handleNextSpeech}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-[#7c3aed] hover:from-purple-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.25)] cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>CONTINUE GUIDANCE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick stats on bottom */}
            <div className="mt-5 border-t border-[#2d1e6e] pt-4 flex justify-between items-center text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              <span>BOARDING CO-PILOT: ACTIVE</span>
              <span>VERIFIED MCA & NASSCOM DATASETS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
