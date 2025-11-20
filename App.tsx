import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, Session } from './types';
import { initializeMutsumiChat, sendMessageToMutsumi, resetChatSession, restoreChatSession, initializeApiClient } from './services/gemini';
import { storageUtils } from './src/utils/storage';
import Settings from './src/components/Settings';

// --- Constants ---
const STORAGE_KEY = 'mutsumi_chat_sessions';
const AVATAR_STORAGE_KEY = 'mutsumi_user_avatar';
const CHARACTER_AVATAR_STORAGE_KEY = 'mutsumi_character_avatar';

// --- Utilities ---
const compressImage = (file: File, maxWidth = 600, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- Icons ---
const Icons = {
  Guitar: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  WaterDrop: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.25a.75.75 0 01.75.75c0 2.192-.533 5.367-1.658 7.868-1.08 2.4-2.545 4.128-3.592 4.128-1.36 0-2.5-1.122-2.5-2.5 0-.95.38-1.82 1-2.445V10c0 2.75 2.25 5 5 5s5-2.25 5-5V8.953c.62.625 1 1.495 1 2.445 0 1.378-1.14 2.5-2.5 2.5-1.047 0-2.512-1.728-3.592-4.128C11.783 4.617 11.25 1.442 11.25 3a.75.75 0 01.75-.75z" opacity="0.5" />
      <path d="M12 22c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9zm0-2c-3.87 0-7-3.13-7-7 0-3.18 4.49-8.85 7-11.1 2.51 2.25 7 7.92 7 11.1 0 3.87-3.13 7-7 7z" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Hand: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  Pick: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L3 8l3 12h12l3-12-9-6z" />
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
    </svg>
  ),
  Headphones: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18v-6a9 9 0 0118 0v6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Seed: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-mutsumi-dim">
      <circle cx="12" cy="12" r="4" opacity="0.5" />
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    </svg>
  ),
  Sprout: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-mutsumi-glow" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22v-9m0 0c0-3-3-5-5-5s-5 2-5 5m10-5c0-3 3-5 5-5s5 2 5 5" />
    </svg>
  ),
  Flower: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-mutsumi-glow" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m0-8a4 4 0 100 8 4 4 0 000-8z M12 3l2 5-2 1-2-1 2-5z M12 21l-2-5 2-1 2 1-2 5z M3 12l5-2 1 2-1 2-5-2z M21 12l-5 2-1-2 1-2 5 2z" />
    </svg>
  ),
  Cucumber: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-mutsumi-glow">
       <path d="M7.5 18.5c-2.5-2.5-3-7.5-1-11.5 1.5-3 5-4.5 8-4 3.5.5 6 4 5.5 8-.5 3.5-3.5 6.5-7 7.5-2 .5-4 .5-5.5 0z" />
       <path stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-white/50" fill="none" d="M10 8c.5.5 1.5.5 2 0M13 11c.5.5 1.5.5 2 0M9 13c.5.5 1.5.5 2 0" />
    </svg>
  ),
  Scan: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7V5a2 2 0 012-2h2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 3h2a2 2 0 012 2v2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 17v2a2 2 0 01-2 2h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21H5a2 2 0 01-2-2v-2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 16v3m0-14v3m4 5h3m-14 0h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};

// --- Components ---

const AmbientBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationFrameId: number;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      targetOpacity: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = 40; 

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: 0,
        targetOpacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? '#6b9c8a' : '#e1e8e5' // Sage Green or Mist White
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // No background fill here to allow CSS bg to show through clearly
      
      particles.forEach(p => {
        // Movement
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Twinkle effect
        if (Math.random() < 0.01) {
            p.targetOpacity = Math.random() * 0.5 + 0.1;
        }
        const diff = p.targetOpacity - p.opacity;
        p.opacity += diff * 0.02;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const Avatar = ({ className = "", customSrc }: { className?: string, customSrc?: string | null }) => {
  return (
    <div className={`flex items-center justify-center bg-mutsumi-surface/50 backdrop-blur-sm text-mutsumi-glow font-serif border border-mutsumi-border/50 rounded-full overflow-hidden shadow-sm ${className}`}>
      {customSrc ? (
        <img src={customSrc} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs md:text-sm tracking-widest font-light opacity-80">WM</span>
      )}
    </div>
  );
};

const RainStyles = () => (
  <style>{`
    @keyframes dropFall {
      0% { transform: translateY(-10px) scale(0.8); opacity: 0.8; }
      50% { transform: translateY(5px) scale(1); opacity: 0.6; }
      100% { transform: translateY(20px) scale(0.5); opacity: 0; }
    }
    .animate-drop {
      animation: dropFall 0.6s ease-in forwards;
    }
    @keyframes harvestGlow {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0; transform: scale(1.5); }
    }
    .animate-harvest {
      animation: harvestGlow 1.5s ease-out forwards;
    }
    .input-glow:focus-within {
      box-shadow: 0 4px 30px rgba(107, 156, 138, 0.1), inset 0 0 0 1px rgba(107, 156, 138, 0.2);
      background-color: rgba(32, 38, 36, 0.7);
    }
  `}</style>
);

const SidebarProfile = ({ 
  className = "", 
  onNewChat,
  onAvatarUpdate,
  userAvatar,
  mutsumiAvatar,
  onMutsumiAvatarUpdate
}: { 
  className?: string, 
  onNewChat: () => void,
  onAvatarUpdate: (url: string) => void,
  userAvatar: string | null,
  mutsumiAvatar: string | null,
  onMutsumiAvatarUpdate: (url: string) => void
}) => {
  const [status, setStatus] = useState("观察中...");
  const [statusLocked, setStatusLocked] = useState(false);
  const [cucumberProgress, setCucumberProgress] = useState(0);
  const [waterDrops, setWaterDrops] = useState<number[]>([]);
  const [isHarvesting, setIsHarvesting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutsumiFileInputRef = useRef<HTMLInputElement>(null);

  // Idle Status Loop
  useEffect(() => {
    if (statusLocked) return;
    const statuses = [
      "凝视着月亮...",
      "听雨声...",
      "发呆...",
      "思考吉他谱...",
      "……（沉默）",
    ];
    let i = 0;
    
    const statusTimer = setInterval(() => {
      if (!statusLocked) {
        i = Math.floor(Math.random() * statuses.length);
        setStatus(statuses[i]);
      }
    }, 8000);

    return () => {
        clearInterval(statusTimer);
    };
  }, [statusLocked]);

  // Auto growth logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCucumberProgress(prev => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 0.1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInteraction = (type: 'water' | 'poke' | 'pick' | 'music' | 'stare') => {
    setStatusLocked(true);
    
    if (type === 'water') {
        if (cucumberProgress >= 100) {
            setIsHarvesting(true);
            setStatus("……收获了。");
            setTimeout(() => {
                setCucumberProgress(0);
                setIsHarvesting(false);
                setStatusLocked(false);
            }, 2000);
        } else {
            setCucumberProgress(prev => Math.min(100, prev + 15));
            const now = Date.now();
            setWaterDrops(prev => prev.map(d => d)); 
            setWaterDrops(prev => [...prev, now, now + 1, now + 2]);
            setTimeout(() => setWaterDrops(prev => prev.filter(d => d < now)), 700);
            setStatus("……黄瓜喝水了。");
        }
    } else if (type === 'poke') {
        const responses = [
            "……？（困惑地看着你）",
            "……有事吗？",
            "……（稍微往后缩了一下）",
            "……痒。",
            "（默默地盯着你的手指）",
            "……怎么了？"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setStatus(randomResponse);
    } else if (type === 'pick') {
        const responses = [
            "……谢谢。",
            "（收进了口袋）",
            "……给我的？",
            "……这种厚度……嗯。",
            "（轻轻握住了拨片）",
            "……（点头）"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setStatus(randomResponse);
    } else if (type === 'music') {
        const responses = [
            "……Ave Mujica的歌？",
            "（默默戴上了一只耳机）",
            "……声音有点大。",
            "……这首歌……嗯。",
            "（跟着节奏轻轻点头）",
            "……我也在听。"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setStatus(randomResponse);
    } else if (type === 'stare') {
        const responses = [
            "……？",
            "（没有任何表情地回望）",
            "……脸上有什么吗？",
            "（移开了视线）",
            "……一直看我做什么。",
            "……（眨了一下眼睛）"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setStatus(randomResponse);
    }

    if (type !== 'water' || cucumberProgress < 100) {
        setTimeout(() => setStatusLocked(false), 3000);
    }
  };

  const handleUserAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const compressed = await compressImage(file, 300, 0.7);
        localStorage.setItem(AVATAR_STORAGE_KEY, compressed);
        onAvatarUpdate(compressed);
    } catch (error) {
        console.error("Failed to process avatar image", error);
    }
  };

  const handleMutsumiAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const compressed = await compressImage(file, 300, 0.7);
          localStorage.setItem(CHARACTER_AVATAR_STORAGE_KEY, compressed);
          onMutsumiAvatarUpdate(compressed);
      } catch (error) {
          console.error("Failed to process mutsumi image", error);
      }
  };

  // Get icon based on progress
  const getPlantIcon = () => {
    if (cucumberProgress < 30) return <Icons.Seed />;
    if (cucumberProgress < 60) return <Icons.Sprout />;
    if (cucumberProgress < 90) return <Icons.Flower />;
    return <Icons.Cucumber />;
  };

  const getStageName = () => {
    if (cucumberProgress < 30) return "种子 (Seed)";
    if (cucumberProgress < 60) return "幼苗 (Sprout)";
    if (cucumberProgress < 90) return "开花 (Flower)";
    return "成熟 (Ripe)";
  };

  return (
    <div className={`flex flex-col gap-6 text-mutsumi-text ${className}`}>
      <RainStyles />
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleUserAvatarUpload}
      />
      <input 
        type="file" 
        ref={mutsumiFileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleMutsumiAvatarUpload}
      />

      {/* Harvest Overlay */}
      {isHarvesting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute inset-0 bg-mutsumi-glow/10 animate-pulse"></div>
          <div className="animate-harvest flex flex-col items-center">
            <div className="text-mutsumi-glow drop-shadow-[0_0_20px_rgba(107,156,138,0.5)]">
               <Icons.Cucumber />
            </div>
            <span className="text-4xl font-serif text-mutsumi-text tracking-[0.5em] mt-6 drop-shadow-lg font-bold ml-4">收 获</span>
          </div>
        </div>
      )}

      {/* Mutsumi Profile Header */}
      <div className="flex flex-col items-center text-center pt-2">
        <div 
            className="w-32 h-32 rounded-full border border-mutsumi-border/30 p-1 relative group cursor-pointer bg-mutsumi-surface/30 shadow-lg backdrop-blur-sm"
            onClick={() => mutsumiFileInputRef.current?.click()}
            title="点击更换若叶睦头像"
        >
          <div className="absolute inset-0 bg-mutsumi-glow/5 rounded-full animate-pulse-slow group-hover:bg-mutsumi-glow/10 transition-colors"></div>
          <div className="w-full h-full rounded-full bg-mutsumi-bg/50 overflow-hidden relative flex items-center justify-center">
               {mutsumiAvatar ? (
                   <img src={mutsumiAvatar} alt="Mutsumi" className="w-full h-full object-cover" />
               ) : (
                   <span className="font-serif text-4xl text-mutsumi-glow/50 tracking-widest opacity-90">WM</span>
               )}
               {/* Upload Overlay */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-mutsumi-text">
                   <Icons.Camera />
               </div>
          </div>
        </div>

        <h2 className="mt-4 font-serif text-xl tracking-wider text-mutsumi-text font-semibold opacity-90">若叶 睦</h2>
        <p className="text-[10px] text-mutsumi-dim tracking-[0.3em] uppercase mt-1">Wakaba Mutsumi</p>
        
        {/* Status Card */}
        <div className="mt-4 w-full px-4 py-3 bg-mutsumi-surface/20 backdrop-blur-md border border-mutsumi-border/30 rounded-lg shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-center text-center min-h-[1.5rem]">
                <span className="text-xs font-serif text-mutsumi-text/80 tracking-wide animate-fade-in italic">
                    "{status}"
                </span>
            </div>
        </div>

        {/* Interaction Grid */}
        <div className="grid grid-cols-2 gap-2 mt-5 w-full">
            <button 
                onClick={() => handleInteraction('poke')}
                className="group p-2 rounded-lg bg-mutsumi-surface/30 border border-mutsumi-border/30 text-mutsumi-dim hover:text-mutsumi-glow hover:border-mutsumi-glow/30 hover:bg-mutsumi-surface/50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                title="戳一戳"
            >
                <Icons.Hand />
                <span className="text-[9px] opacity-60 group-hover:opacity-100">戳一戳</span>
            </button>
            <button 
                onClick={() => handleInteraction('pick')}
                className="group p-2 rounded-lg bg-mutsumi-surface/30 border border-mutsumi-border/30 text-mutsumi-dim hover:text-mutsumi-glow hover:border-mutsumi-glow/30 hover:bg-mutsumi-surface/50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                title="递吉他拨片"
            >
                <Icons.Pick />
                <span className="text-[9px] opacity-60 group-hover:opacity-100">送拨片</span>
            </button>
             <button 
                onClick={() => handleInteraction('music')}
                className="group p-2 rounded-lg bg-mutsumi-surface/30 border border-mutsumi-border/30 text-mutsumi-dim hover:text-mutsumi-glow hover:border-mutsumi-glow/30 hover:bg-mutsumi-surface/50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                title="一起听歌"
            >
                <Icons.Headphones />
                <span className="text-[9px] opacity-60 group-hover:opacity-100">一起听歌</span>
            </button>
             <button 
                onClick={() => handleInteraction('stare')}
                className="group p-2 rounded-lg bg-mutsumi-surface/30 border border-mutsumi-border/30 text-mutsumi-dim hover:text-mutsumi-glow hover:border-mutsumi-glow/30 hover:bg-mutsumi-surface/50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                title="注视"
            >
                <Icons.Eye />
                <span className="text-[9px] opacity-60 group-hover:opacity-100">注视</span>
            </button>
        </div>
      </div>

      <div className="h-px w-full bg-mutsumi-border/30"></div>

      {/* Rich Cucumber Widget - Unified */}
      <div className="bg-mutsumi-surface/20 p-4 rounded-xl border border-mutsumi-border/30 relative overflow-hidden group backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-3 z-10 relative">
            <div className="w-14 h-14 rounded-lg bg-mutsumi-surface/40 border border-mutsumi-border/30 flex items-center justify-center text-mutsumi-glow">
               {getPlantIcon()}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-mutsumi-dim uppercase tracking-wider">GARDEN</span>
                <span className="font-serif text-sm text-mutsumi-text">{getStageName()}</span>
            </div>
        </div>

        <div className="w-full bg-mutsumi-dark/50 h-1 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full rounded-full relative transition-all duration-300 ease-out ${cucumberProgress >= 100 ? 'bg-mutsumi-glow shadow-[0_0_10px_rgba(107,156,138,0.5)]' : 'bg-mutsumi-glow/80'}`}
              style={{ width: `${cucumberProgress}%` }}
            ></div>
        </div>

        <div className="flex justify-between items-center">
             <span className="text-[10px] text-mutsumi-dim font-mono">{cucumberProgress.toFixed(0)}%</span>
             <button 
              onClick={() => handleInteraction('water')}
              className={`relative flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-md border transition-all duration-200 active:scale-90 overflow-visible z-10
                ${cucumberProgress >= 100 
                  ? 'bg-mutsumi-glow text-white border-transparent hover:bg-mutsumi-glow/90 shadow-[0_0_15px_rgba(107,156,138,0.3)]' 
                  : 'bg-mutsumi-surface/40 hover:bg-mutsumi-surface/60 text-mutsumi-glow border-mutsumi-border/30'
                }`}
            >
              {cucumberProgress >= 100 ? (
                <>
                  <Icons.Cucumber />
                  <span>收割</span>
                </>
              ) : (
                <>
                  <Icons.WaterDrop />
                  <span>浇水</span>
                </>
              )}
              
              {waterDrops.map((id, idx) => (
                <div 
                  key={id} 
                  className="absolute -top-4 text-mutsumi-glow pointer-events-none animate-drop z-20"
                  style={{ left: `${40 + (idx % 3) * 20}%`, animationDelay: `${(idx % 3) * 0.1}s` }}
                >
                  <Icons.WaterDrop />
                </div>
              ))}
            </button>
        </div>
      </div>

      <div className="h-px w-full bg-mutsumi-border/30"></div>

      {/* User Avatar Settings */}
      <div className="flex items-center justify-between px-2">
         <span className="text-xs text-mutsumi-dim uppercase tracking-wider">我</span>
         <div 
           onClick={() => fileInputRef.current?.click()}
           className="w-8 h-8 rounded-full border border-mutsumi-border/30 cursor-pointer hover:border-mutsumi-glow/50 transition-colors overflow-hidden relative group shadow-sm bg-mutsumi-surface/20"
           title="点击上传头像"
         >
           {userAvatar ? (
             <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-mutsumi-dim">
               <Icons.User />
             </div>
           )}
           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
             <Icons.Camera />
           </div>
         </div>
      </div>

      <button 
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 bg-mutsumi-surface/20 border border-mutsumi-border/30 hover:bg-mutsumi-surface/40 hover:text-mutsumi-glow text-mutsumi-text/80 text-xs py-3 rounded-lg transition-all active:scale-95 mt-auto"
      >
        <Icons.Plus />
        新对话
      </button>
    </div>
  );
};

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({ 
  session, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all group mb-1
        ${isActive 
          ? 'bg-mutsumi-surface/40 border-mutsumi-border/40 text-mutsumi-text font-medium' 
          : 'bg-transparent border-transparent hover:bg-mutsumi-surface/20 text-mutsumi-dim hover:text-mutsumi-text'
        }`}
    >
      <div className="flex items-center gap-2 mb-1">
         <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-mutsumi-glow shadow-[0_0_5px_rgba(107,156,138,0.8)]' : 'bg-mutsumi-border'}`}></div>
         <span className={`text-xs font-serif truncate`}>
            {session.title}
         </span>
      </div>
    </button>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [mutsumiAvatar, setMutsumiAvatar] = useState<string | null>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check for API key on component mount
  useEffect(() => {
    const checkApiKey = () => {
      const hasKey = storageUtils.hasApiKey();
      setHasApiKey(hasKey);
      if (!hasKey) {
        setShowSettings(true);
      }
    };
    checkApiKey();
  }, []);

  // Handle API key update from settings
  const handleApiKeyUpdate = async (newApiKey: string) => {
    try {
      storageUtils.setApiKey(newApiKey);
      setHasApiKey(true);
      setShowSettings(false);
      
      // Initialize the API client with the new key
      await initializeApiClient(newApiKey);
      
      // Add a welcome message if this is the first time
      if (!hasApiKey) {
        setMessages([{
          id: 'welcome',
          text: '……欢迎回来。',
          sender: Sender.MUTSUMI,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to update API key:', error);
      // Keep settings open if there's an error
    }
  };

  // Toggle settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Session Management
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Effects ---

  // Load Sessions & Avatar from LocalStorage on Mount
  useEffect(() => {
    let hasHistory = false;
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (storedSessions) {
          const parsed = JSON.parse(storedSessions);
          if (parsed.length > 0) hasHistory = true;
          const hydrated: Session[] = parsed.map((s: any) => ({
              ...s,
              messages: s.messages.map((m: any) => ({
                  ...m,
                  timestamp: new Date(m.timestamp)
              }))
          }));
          setSessions(hydrated);
      }

      const storedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (storedAvatar) setCustomAvatar(storedAvatar);

      const storedMutsumiAvatar = localStorage.getItem(CHARACTER_AVATAR_STORAGE_KEY);
      if (storedMutsumiAvatar) setMutsumiAvatar(storedMutsumiAvatar);
    } catch (e) {
      console.error("Failed to load storage", e);
    }

    // If no history, add initial greeting from Mutsumi
    if (!hasHistory) {
        setMessages([{
            id: 'init-greeting',
            text: '……我在。',
            sender: Sender.MUTSUMI,
            timestamp: new Date()
        }]);
    }

  }, []);

  // Safe Session Saving Logic
  const saveSessionsSafe = (sessionsToSave: Session[]) => {
      try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
      } catch (e) {
          // Fallback: Try saving without images
          console.warn("Storage quota exceeded. Saving text-only history.", e);
          try {
              const lightSessions = sessionsToSave.map(s => ({
                  ...s,
                  messages: s.messages.map(m => {
                      const { image, ...rest } = m;
                      return rest;
                  })
              }));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(lightSessions));
          } catch (e2) {
              console.error("Critical: Failed to save history.", e2);
          }
      }
  };

  useEffect(() => {
      if (sessions.length > 0) {
          saveSessionsSafe(sessions);
      }
  }, [sessions]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const init = async () => {
        await initializeMutsumiChat();
    };
    init();
  }, []);

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsgText = input;
    const userImage = selectedImage;

    // Clear inputs
    setInput('');
    setSelectedImage(null);
    if(imageInputRef.current) imageInputRef.current.value = '';
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: Sender.USER,
      timestamp: new Date(),
      image: userImage || undefined
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Update Sessions
    let sessionId = currentSessionId;
    let newSessions = [...sessions];
    
    if (!sessionId) {
        sessionId = Date.now().toString();
        setCurrentSessionId(sessionId);
        const newSession: Session = {
            id: sessionId,
            title: userMsgText.slice(0, 20) || "新对话",
            lastModified: Date.now(),
            messages: [newMessage]
        };
        newSessions = [newSession, ...sessions];
    } else {
        newSessions = sessions.map(s => 
            s.id === sessionId 
            ? { ...s, messages: [...s.messages, newMessage], lastModified: Date.now(), title: s.messages.length === 0 ? (userMsgText.slice(0, 20) || "图片对话") : s.title } 
            : s
        );
        // Move current to top
        const current = newSessions.find(s => s.id === sessionId);
        if(current) {
            newSessions = [current, ...newSessions.filter(s => s.id !== sessionId)];
        }
    }
    setSessions(newSessions);

    try {
      // Send to Gemini
      const response = await sendMessageToMutsumi(userMsgText, userImage || undefined);
      
      const finalMessages = [...updatedMessages, response];
      setMessages(finalMessages);
      
      // Update session with response
      const finalSessions = newSessions.map(s => 
          s.id === sessionId 
          ? { ...s, messages: [...s.messages, response], lastModified: Date.now() } 
          : s
      );
      setSessions(finalSessions);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
      setCurrentSessionId(null);
      setMessages([{
          id: Date.now().toString(),
          text: '……我在。',
          sender: Sender.MUTSUMI,
          timestamp: new Date()
      }]);
      await resetChatSession();
      if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSelectSession = async (session: Session) => {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      await restoreChatSession(session.messages);
      if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
          // Compress before setting to state to save memory/quota
          const compressed = await compressImage(file, 800, 0.7);
          setSelectedImage(compressed);
      } catch (err) {
          console.error("Failed to compress image", err);
      }
  };

  const clearImage = () => {
      setSelectedImage(null);
      if(imageInputRef.current) imageInputRef.current.value = '';
  };

  // Auto-resize textarea
  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setInput(target.value);
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-mutsumi-text relative bg-mutsumi-bg transition-colors duration-500">
      <AmbientBackground />
      
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-mutsumi-surface/80 rounded-lg border border-mutsumi-border/50 backdrop-blur-md text-mutsumi-text shadow-sm"
      >
        {showSidebar ? <Icons.X /> : <Icons.Menu />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:relative w-72 h-full z-40 transition-transform duration-300 ease-out flex flex-col
        bg-mutsumi-bg/50 backdrop-blur-xl border-r border-mutsumi-border/20
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
             <SidebarProfile 
                onNewChat={handleNewChat} 
                onAvatarUpdate={(url) => setCustomAvatar(url)}
                userAvatar={customAvatar}
                mutsumiAvatar={mutsumiAvatar}
                onMutsumiAvatarUpdate={(url) => setMutsumiAvatar(url)}
             />
             
             <div className="mt-8">
                 <h3 className="text-[10px] font-serif text-mutsumi-dim uppercase tracking-widest mb-3 px-1 opacity-70">History</h3>
                 <div className="space-y-1">
                    {sessions.map(s => (
                        <SessionItem 
                            key={s.id} 
                            session={s} 
                            isActive={s.id === currentSessionId}
                            onClick={() => handleSelectSession(s)}
                        />
                    ))}
                 </div>
             </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        {/* Header - Minimal */}
        <div className="h-14 flex items-center justify-center md:justify-end px-6 bg-gradient-to-b from-mutsumi-bg/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full pointer-events-auto">
               <div className="w-1 h-1 rounded-full bg-mutsumi-glow animate-pulse shadow-[0_0_8px_rgba(107,156,138,0.8)]"></div>
               <span className="text-[9px] text-mutsumi-dim font-mono tracking-widest opacity-60">
                   CONNECTED
               </span>
               <button
                 onClick={toggleSettings}
                 className="ml-2 p-1.5 rounded-full bg-mutsumi-surface/30 border border-mutsumi-border/30 text-mutsumi-dim hover:text-mutsumi-glow hover:border-mutsumi-glow/30 hover:bg-mutsumi-surface/50 transition-all"
                 title="设置"
               >
                 <span className="text-lg">⚙️</span>
               </button>
            </div>
        </div>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-6" ref={scrollContainerRef}>
           
           {messages.map((msg) => (
             <div 
                key={msg.id} 
                className={`flex gap-4 animate-fade-in-up ${msg.sender === Sender.USER ? 'flex-row-reverse' : ''}`}
             >
                <Avatar 
                    className="w-8 h-8 md:w-9 md:h-9 shrink-0 mt-1 border-none bg-transparent shadow-none" 
                    customSrc={msg.sender === Sender.USER ? customAvatar : mutsumiAvatar} 
                />
                
                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`
                        px-5 py-3.5 text-sm md:text-[15px] leading-relaxed
                        ${msg.sender === Sender.USER 
                          ? 'bg-mutsumi-glow/20 text-mutsumi-text rounded-2xl rounded-tr-sm border border-mutsumi-glow/20 backdrop-blur-sm' 
                          : 'bg-mutsumi-surface/40 text-mutsumi-text rounded-2xl rounded-tl-sm border border-mutsumi-border/30 backdrop-blur-sm'
                        }
                    `}>
                        {msg.image && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-white/5">
                                <img src={msg.image} alt="Uploaded" className="max-w-full h-auto max-h-60 object-contain bg-black/20" />
                            </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    <span className="text-[9px] text-mutsumi-dim mt-1.5 px-1 opacity-50">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
             </div>
           ))}
           
           {isLoading && (
             <div className="flex gap-4 animate-fade-in">
                 <Avatar className="w-8 h-8 md:w-9 md:h-9 shrink-0 border-none bg-transparent" customSrc={mutsumiAvatar} />
                 <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-mutsumi-surface/20 border border-mutsumi-border/20 rounded-tl-sm">
                     <div className="w-1 h-1 bg-mutsumi-dim rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                     <div className="w-1 h-1 bg-mutsumi-dim rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     <div className="w-1 h-1 bg-mutsumi-dim rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div className="p-4 md:p-6 glass-heavy border-t-0 mt-auto">
            {selectedImage && (
                <div className="flex items-center gap-2 mb-3 px-2 animate-fade-in-up">
                    <div className="relative group">
                        <img src={selectedImage} alt="Preview" className="h-14 w-14 object-cover rounded-md border border-mutsumi-border/50 shadow-sm" />
                        <button 
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 p-1 bg-mutsumi-bg rounded-full text-mutsumi-dim border border-mutsumi-border hover:text-white hover:border-white/50 transition-colors shadow-sm"
                        >
                            <Icons.X />
                        </button>
                    </div>
                    <span className="text-xs text-mutsumi-dim font-mono">Image Attached</span>
                </div>
            )}
            
            {/* Animated Input Container */}
            <div className="flex items-end gap-2 md:gap-4 max-w-4xl mx-auto bg-mutsumi-surface/40 backdrop-blur-md border border-mutsumi-border/30 rounded-3xl p-2 md:p-2 shadow-lg transition-all duration-300 ease-out input-glow group relative z-20">
                
                {/* Visual Cortex Unit (Image Upload) */}
                <div className="relative">
                    <input 
                        type="file" 
                        ref={imageInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageSelect}
                    />
                    <button 
                        onClick={() => imageInputRef.current?.click()}
                        className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full transition-all duration-300 ${selectedImage ? 'text-mutsumi-glow bg-mutsumi-glow/20' : 'text-mutsumi-dim hover:text-mutsumi-text hover:bg-white/5'}`}
                        title="Upload Image"
                    >
                        <Icons.Scan />
                    </button>
                </div>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                    placeholder="发送讯息..."
                    rows={1}
                    className="flex-1 bg-transparent text-base md:text-[15px] text-mutsumi-text placeholder-mutsumi-dim/30 focus:outline-none py-2.5 md:py-2.5 resize-none custom-scrollbar leading-relaxed selection:bg-mutsumi-glow/30"
                    style={{ minHeight: '44px', maxHeight: '160px' }}
                />
                
                <button 
                    onClick={handleSendMessage}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-mutsumi-glow text-mutsumi-bg hover:bg-mutsumi-text hover:scale-105 disabled:opacity-20 disabled:hover:bg-mutsumi-glow disabled:hover:scale-100 transition-all duration-300 shadow-sm"
                >
                    <Icons.Send />
                </button>
            </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          isOpen={showSettings}
          onApiKeyUpdate={handleApiKeyUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;