/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip, Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  Image as ImageIcon, 
  Zap, 
  Download, 
  History,
  Terminal,
  Layers,
  Database,
  Cpu,
  Volume2,
  VolumeX,
  Activity,
  Check,
  Plus,
  ArrowUpRight,
  Sparkle,
  Fingerprint,
  Wifi,
  HardDrive
} from "lucide-react";
import { INSPIRATION_PROMPTS } from "../constants";
import { GeneratedImage, AppView, AppVersionLevel } from "../types";
import { Language, translations } from "../locales";
import { playAmbientSound, stopAmbientSound } from "../lib/audioSynth";

interface HomeViewProps {
  onViewChange: (view: AppView) => void;
  setPromptInput: (prompt: string) => void;
  recentImages: GeneratedImage[];
  language: Language;
  appVersion: AppVersionLevel;
}

// Interactive style chips for prompt builder
const DESIGN_TOKENS = {
  subject: [
    { en: "ancient cybernetic dragon", vi: "rồng cơ khí cổ đại" },
    { en: "minimalist wooden glass cabin", vi: "nhà gỗ kính tối giản" },
    { en: "golden baby phoenix", vi: "phượng hoàng lửa sơ sinh" },
    { en: "neon-accented sky whale", vi: "cá voi mây phát sáng neon" }
  ],
  atmosphere: [
    { en: "volumetric lighting, golden hour cinematic", vi: "ánh sáng vàng cinematic, sương mù" },
    { en: "wet asphalt, moody cyberpunk neon glare", vi: "đèn đường phản chiếu đường ướt, cyberpunk" },
    { en: "nostalgic morning sun rays, cozy fog", vi: "nắng sớm hoài niệm, sương ấm áp" },
    { en: "cosmic celestial star cluster, deep space", vi: "tinh vân rực rỡ, vũ trụ thăm thẳm" }
  ],
  camera: [
    { en: "cinematic photograph, dslr sharp focus, depth of field", vi: "ảnh chụp dslr sắc nét, xóa phông nhẹ" },
    { en: "3D Octane Render, abstract stylized toys", vi: "Octane render 3D nổi khối, phong cách đồ chơi" },
    { en: "fine watercolor cold press textured paper", vi: "tranh vẽ màu nước mộc, giấy vân nhám" }
  ]
};

export default function HomeView({ 
  onViewChange, 
  setPromptInput, 
  recentImages,
  language,
  appVersion
}: HomeViewProps) {
  
  const t = translations[language];

  // Homepage sound synth control
  const [ambientStyle, setAmbientStyle] = useState<"none" | "lofi" | "cyber" | "cinematic" | "scifi">("none");
  const [soundOn, setSoundOn] = useState<boolean>(false);

  // Dynamic Prompt Builder state
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [promptPreview, setPromptPreview] = useState<string>("");

  // Live Metrics Simulator
  const [pingLatency, setPingLatency] = useState<number>(14);
  const [loadPercentage, setLoadPercentage] = useState<number>(18.5);

  // Audio equalizer bars helper state
  useEffect(() => {
    if (soundOn && ambientStyle !== "none") {
      playAmbientSound(ambientStyle);
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [soundOn, ambientStyle]);

  // Simulate network stats fluctuation elegantly
  useEffect(() => {
    const interval = setInterval(() => {
      setPingLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, Math.min(22, prev + delta));
      });
      setLoadPercentage(prev => {
        const delta = Number((Math.random() * 2 - 1).toFixed(1));
        return Math.max(12, Math.min(25, Number((prev + delta).toFixed(1))));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInspirationClick = (promptText: string) => {
    setPromptInput(promptText);
    onViewChange("generate");
  };

  // Build current composite template
  const toggleToken = (token: string) => {
    setSelectedTokens(prev => 
      prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]
    );
  };

  useEffect(() => {
    setPromptPreview(selectedTokens.join(", "));
  }, [selectedTokens]);

  const handleLaunchWithCustomPrompt = () => {
    if (promptPreview) {
      setPromptInput(promptPreview);
      onViewChange("generate");
    }
  };

  // 3D Tilt Hover effect implementation
  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate position within the element
    const y = e.clientY - rect.top;  // y coordinate position within the element
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 14; 
    const angleY = (x - xc) / 14;
    
    card.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
    card.style.borderColor = "rgba(168, 85, 247, 0.4)";
    card.style.boxShadow = `0 15px 35px -5px rgba(124, 58, 237, 0.15)`;
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;
    card.style.borderColor = "rgba(255, 255, 255, 0.08)";
    card.style.boxShadow = "none";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <Box className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
      {/* Immersive background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[400px] bg-gradient-to-b from-purple-900/10 via-blue-950/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Dynamic Telemetry Banner */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30">
            <Terminal size={14} className="text-purple-400 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-zinc-300">
              {language === "vi" 
                ? "Bảng điều khiển lõi tổng hợp thần kinh" 
                : "Neural Synthesis Core Dashboard"}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              ENGINE_SPEC: IMAGEN_V3_ACTIVE • REG_LAT: {pingLatency}ms
            </p>
          </div>
        </div>

        {/* Live Audio / Soundscape controllers */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
            {language === "vi" ? "Đồng bộ nhạc nền:" : "Ambient soundscape:"}
          </span>
          <select
            value={ambientStyle}
            onChange={(e) => {
              setAmbientStyle(e.target.value as any);
              setSoundOn(true);
            }}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-350 focus:outline-none focus:border-purple-500"
          >
            <option value="none">Muted</option>
            <option value="lofi">Lo-Fi Dreamscape</option>
            <option value="cyber">Synthwave Core</option>
            <option value="cinematic">Cinematic Swells</option>
            <option value="scifi">Celestial Drone</option>
          </select>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
              soundOn && ambientStyle !== "none"
                ? "bg-purple-500/25 text-purple-300 border-purple-500/40"
                : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {soundOn && ambientStyle !== "none" ? <Volume2 size={13} className="animate-bounce" /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* Hero Section - Godly Style Immersive */}
      <div className="relative mb-12 rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm px-6 py-12 text-center md:px-12 sm:py-20 overflow-hidden">
        {/* Cinematic parallax background glowing orb */}
        <div className="absolute right-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute left-[-100px] bottom-[-100px] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center space-x-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-sm shadow-inner">
            <Sparkle size={13} className="text-purple-400 animate-spin" />
            <span className="font-mono tracking-wider">{t.home.tagline}</span>
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mt-8 max-w-4xl mx-auto leading-tight">
            {t.home.heroTitlePre}{" "}
            <span className="bg-gradient-to-r from-purple-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              {t.home.heroTitleSpan}
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 font-sans">
            {t.home.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="contained"
              onClick={() => onViewChange("generate")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/10 transition-all duration-300 text-sm flex items-center justify-center space-x-2"
            >
              <span>{t.home.createBtn}</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outlined"
              onClick={() => onViewChange("htmlStudio")}
              className="w-full sm:w-auto px-7 py-3.5 border-purple-500/20 bg-purple-500/5 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/40 rounded-2xl font-bold capitalize backdrop-blur-sm flex items-center justify-center space-x-2 border transition-all"
            >
              <Layers size={14} className="text-purple-400" />
              <span>{language === "en" ? "HTML Studio Pro" : "Phòng Dựng HTML Pro"}</span>
            </Button>
            <Button
              variant="outlined"
              onClick={() => onViewChange("gallery")}
              className="w-full sm:w-auto px-8 py-3.5 border-white/10 hover:border-white/20 text-zinc-350 hover:bg-white/5 rounded-2xl font-semibold capitalize backdrop-blur-sm border transition-all text-sm"
            >
              {t.home.galleryBtn}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 3D LAYERING INTERACTIVE BENTO GRID SHOWCASE */}
      <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-6 font-mono flex items-center gap-2">
        <Activity size={14} className="text-purple-400 animate-pulse" />
        {language === "vi" ? "Bảng Tổng Hợp Kỹ Thuật Đồ Họa Cao Cấp (Bento Grid)" : "Advanced Synthesis Studio Bento Spaces"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14 items-stretch">
        
        {/* Card 1: Dynamic Prompt Assembler - spans 2 columns on desktop */}
        <div 
          onMouseMove={(e) => handleTiltMove(e, "bento-assembly")}
          onMouseLeave={handleTiltLeave}
          className="lg:col-span-2 rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-lg p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden group min-h-[420px]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-bold uppercase font-mono text-zinc-400">
                  {language === "vi" ? "Hệ thống lắp ghép Token tương tác" : "Interactive Token Builder Panel"}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                PROMPT_SYNTH v2
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                {language === "vi" ? "Sân chơi lắp ghép từ khóa" : "Neural Prompt Constructor Suite"}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === "vi" 
                  ? "Tạo prompt trực tiếp bằng cách click chọn các mảnh ghép nghệ thuật dưới đây."
                  : "Assemble custom premium prompts organically by picking design style blocks below."}
              </p>
            </div>

            {/* Structured Tags block group selection */}
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
                  1. Subject & Core Theme
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DESIGN_TOKENS.subject.map((token, idx) => {
                    const str = token[language];
                    const enStr = token.en;
                    const active = selectedTokens.includes(enStr);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleToken(enStr)}
                        className={`text-[10px] font-medium py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                          active 
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-200" 
                            : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {active ? <Check size={10} /> : <Plus size={10} />}
                        <span>{str}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
                  2. Light, Colors & Vibe
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DESIGN_TOKENS.atmosphere.map((token, idx) => {
                    const str = token[language];
                    const enStr = token.en;
                    const active = selectedTokens.includes(enStr);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleToken(enStr)}
                        className={`text-[10px] font-medium py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                          active 
                            ? "bg-sky-500/20 border-sky-500/40 text-sky-200" 
                            : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {active ? <Check size={10} /> : <Plus size={10} />}
                        <span>{str}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
                  3. Cinematic Camera & Finish
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DESIGN_TOKENS.camera.map((token, idx) => {
                    const str = token[language];
                    const enStr = token.en;
                    const active = selectedTokens.includes(enStr);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleToken(enStr)}
                        className={`text-[10px] font-medium py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                          active 
                            ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200" 
                            : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {active ? <Check size={10} /> : <Plus size={10} />}
                        <span>{str}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 flex flex-col gap-3">
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <p className="text-xs text-zinc-350 italic font-mono truncate max-w-[80%]">
                {promptPreview || (language === "vi" ? "Click chọn các nhãn phía trên để dựng prompt..." : "Selected tokens will compose standard prompts here...")}
              </p>
              {promptPreview && (
                <button 
                  onClick={() => setSelectedTokens([])} 
                  className="text-[10px] text-zinc-500 hover:text-white uppercase font-mono font-bold shrink-0"
                >
                  Clear All
                </button>
              )}
            </div>

            <Button
              onClick={handleLaunchWithCustomPrompt}
              disabled={!promptPreview}
              variant="contained"
              className={`w-full py-3.5 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center space-x-1.5 ${
                promptPreview 
                  ? "bg-gradient-to-r from-purple-500 to-sky-500 text-white hover:opacity-90"
                  : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
              }`}
            >
              <Zap size={13} className="animate-bounce" />
              <span>{language === "vi" ? "ĐƯA VÀO XƯỞNG TỔNG HỢP ẢNH" : "LOAD CONSTRUCT INTO IMAGEN GENERATOR"}</span>
              <ArrowUpRight size={13} />
            </Button>
          </div>
        </div>

        {/* Card 2: Interactive HTML Pro Side Window [1 Column] */}
        <div 
          onMouseMove={(e) => handleTiltMove(e, "bento-html")}
          onMouseLeave={handleTiltLeave}
          onClick={() => onViewChange("htmlStudio")}
          className="rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-lg p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden group min-h-[420px] cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                <Layers size={12} className="text-purple-400 animate-pulse" />
                {language === "vi" ? "ĐỘT PHÁ GRAPHICS" : "BREAKTHROUGH WEB ART"}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">
                NO API BILLING
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                {language === "vi" ? "Phòng Thí Nghiệm HTML" : "HTML Graphics Studio"}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === "vi" 
                  ? "Dựng đồ họa động, hiệu ứng hạt ảo ảnh 3D và xuất trực tiếp sang PNG sành điệu không tốn phí."
                  : "Frictionless graphic loops, 3D particle sunset matrices, and soundscape integrations. 100% free."}
              </p>
            </div>

            {/* Visual simulation box simulating active dynamic space with grid matrix */}
            <div className="relative bg-black/60 rounded-2xl h-44 overflow-hidden border border-white/5 flex items-center justify-center p-3">
              {/* Rotating glowing sun simulation */}
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-b from-amber-400 to-rose-600 blur-[2px] opacity-40 animate-pulse" />
              <div className="absolute w-full h-[1px] bg-rose-500 top-2/3 shadow-glow" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />

              {/* Live interactive graphic overlay */}
              <div className="absolute z-10 bottom-3 left-3 text-left">
                <span className="text-[8px] font-mono font-bold text-purple-400 block uppercase">Cybernetic Sun Grid</span>
                <span className="text-[9px] font-mono text-zinc-400">Render Status: Active • 60 FPS</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
            <span>{language === "vi" ? "Khám phá phòng thí nghiệm" : "Open HTML Canvas Spec"}</span>
            <ArrowRight size={13} className="transform transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14 items-stretch">
        
        {/* Card 3: Neural Telemetry Monitoring Dashboard - Spans 2 columns */}
        <div 
          onMouseMove={(e) => handleTiltMove(e, "bento-telemetry")}
          onMouseLeave={handleTiltLeave}
          className="lg:col-span-2 rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-lg p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden min-h-[350px]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-400 animate-pulse" />
                {language === "vi" ? "Thông Số Kết Nối & Tốc Độ Lõi Thần Kinh" : "Aura Node Latency & Connection Specs"}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 bg-black/35 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <Wifi size={13} />
                  <span className="text-[10px] font-mono font-bold uppercase">PING LATENCY</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{pingLatency}</span>
                  <span className="text-xs text-zinc-500 font-mono ml-1">ms (Durable)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${(pingLatency/22)*100}%` }} />
                </div>
              </div>

              <div className="space-y-2 bg-black/35 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <Activity size={13} />
                  <span className="text-[10px] font-mono font-bold uppercase">CORE MEMORY</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-purple-400">{loadPercentage}</span>
                  <span className="text-xs text-zinc-500 font-mono ml-1">% (Allocated)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${(loadPercentage/25)*100}%` }} />
                </div>
              </div>

              <div className="space-y-2 bg-black/35 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-zinc-500 mb-1">
                    <HardDrive size={13} />
                    <span className="text-[10px] font-mono font-bold uppercase">PERSISTENCE TIER</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono block">Google Firestore</span>
                  <span className="text-[9px] text-purple-300 font-mono">Durable Cloud Sync</span>
                </div>
                <span className="text-[8px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold self-start mt-2">
                  SECURE PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Equalizer Wave simulation dynamically responsive to the soundtrack control */}
          <div className="mt-6 border-t border-white/5 pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>PROCEDURAL EQUALIZER MATRIX</span>
              {soundOn && ambientStyle !== "none" ? (
                <span className="text-purple-400 font-bold animate-pulse">SYNTH WAVE ACTIVE</span>
              ) : (
                <span>SILENT / STANDBY</span>
              )}
            </div>
            
            <div className="flex items-end gap-1.5 h-10 px-2 bg-black/20 rounded-xl overflow-hidden py-1">
              {Array.from({ length: 30 }).map((_, idx) => {
                // Determine heights based on state
                let hStyle = "15%";
                if (soundOn && ambientStyle !== "none") {
                  hStyle = `${Math.floor(Math.random() * 75) + 20}%`;
                }
                return (
                  <div 
                    key={idx} 
                    className={`flex-1 transition-all duration-300 rounded-t-sm ${
                      soundOn && ambientStyle !== "none" 
                        ? "bg-gradient-to-t from-purple-500 to-sky-400" 
                        : "bg-zinc-800"
                    }`}
                    style={{ height: hStyle }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Active Refactoring Pipeline Specs Roadmap [1 Column] */}
        <div 
          onMouseMove={(e) => handleTiltMove(e, "bento-evolution")}
          onMouseLeave={handleTiltLeave}
          className="rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-lg p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider text-purple-400 font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Database size={12} className="text-purple-400" />
              {language === "vi" ? "MỨC TIẾN HOÁ HỆ THỐNG" : "SYSTEM EVOLUTION TIER"}
            </span>

            <div className="space-y-3.5">
              {[
                { level: "V1", title: t.versionPanel.v1Title, active: appVersion === "v1" },
                { level: "V2", title: t.versionPanel.v2Title, active: appVersion === "v2" },
                { level: "V3", title: t.versionPanel.v3Title, active: appVersion === "v3" },
                { level: "V4", title: t.versionPanel.v4Title, active: appVersion === "v4" }
              ].map((tier, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-left">
                  <div className={`h-7 w-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center border transition-all shrink-0 ${
                    tier.active 
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400"
                      : "bg-black/30 text-zinc-650 border-white/5"
                  }`}>
                    {tier.level}
                  </div>
                  <div>
                    <span className={`text-xs font-bold font-display block ${tier.active ? "text-purple-300" : "text-zinc-500"}`}>
                      {tier.title}
                    </span>
                    {tier.active && (
                      <span className="text-[9px] text-purple-400 font-mono font-bold animate-pulse leading-none block">
                        ● CURRENT ACTIVE STAGE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Roadmap Explainer Panel (Refactoring Spec Details) */}
      <div className="mb-14 border border-white/10 bg-black/45 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-45px] w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Typography variant="h6" className="font-display font-extrabold text-white flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              {t.versionPanel.title}
            </Typography>
            <Typography variant="caption" className="text-zinc-400">
              {t.versionPanel.subtitle}
            </Typography>
          </div>
          <div className="px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-full text-[10px] font-mono text-purple-300 uppercase font-bold tracking-wider">
            {t.versionPanel.activeTag}: <strong>{appVersion.toUpperCase()}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              id: "v1",
              title: t.versionPanel.v1Title,
              desc: t.versionPanel.v1Subtitle,
              badge: "Original Created",
              tech: "React 19 + Vertex Imagen 3 API",
              icon: Sparkles,
              color: "border-zinc-800 bg-zinc-950/20 text-zinc-400",
              activeColor: "border-purple-500/35 bg-purple-500/5 text-purple-300"
            },
            {
              id: "v2",
              title: t.versionPanel.v2Title,
              desc: t.versionPanel.v2Subtitle,
              badge: "Prompt Engineering core",
              tech: "Token Suite Assembler, Custom Assets, Folders",
              icon: Cpu,
              color: "border-zinc-800 bg-zinc-950/20 text-zinc-400",
              activeColor: "border-purple-500/35 bg-purple-500/5 text-purple-300"
            },
            {
              id: "v3",
              title: t.versionPanel.v3Title,
              desc: t.versionPanel.v3Subtitle,
              badge: "Automation Agentic",
              tech: "Visual Node Pipelines, Alt-Text & QA Agents",
              icon: Terminal,
              color: "border-zinc-800 bg-zinc-950/20 text-zinc-400",
              activeColor: "border-purple-500/35 bg-purple-500/5 text-purple-300"
            },
            {
              id: "v4",
              title: t.versionPanel.v4Title,
              desc: t.versionPanel.v4Subtitle,
              badge: "Backend Enterprise",
              tech: "Spring Boot Microservice, Postgres SQL Shell, CDN Browser",
              icon: Database,
              color: "border-zinc-800 bg-zinc-950/20 text-zinc-400",
              activeColor: "border-purple-500/35 bg-purple-500/5 text-purple-300"
            }
          ].map((item) => {
            const isActive = appVersion === item.id;
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                  isActive ? item.activeColor + " ring-1 ring-purple-500/30 shadow-md scale-[1.01]" : item.color + " opacity-50"
                }`}
              >
                {isActive && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse font-mono">
                    Active
                  </span>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border mb-3 ${isActive ? "border-purple-500/20 bg-purple-500/10 text-purple-400" : "border-zinc-800 bg-zinc-900/50 text-zinc-550"}`}>
                  <Icon size={16} />
                </div>
                <Typography className="font-sans font-bold text-sm text-zinc-100">{item.title}</Typography>
                <Typography className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{item.desc}</Typography>
                <div className="mt-4 border-t border-white/5 pt-2.5 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500">TAG: {item.badge}</span>
                  <span className="text-[9px] font-semibold text-purple-400 leading-none">{item.tech}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Features */}
      <div className="mb-14">
        <Typography variant="h5" className="font-display font-semibold text-white mb-6">
          {t.home.featuresTitle}
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              title: t.home.feature1Title,
              desc: t.home.feature1Desc
            },
            {
              icon: ImageIcon,
              color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              title: t.home.feature2Title,
              desc: t.home.feature2Desc
            },
            {
              icon: Download,
              color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
              title: t.home.feature3Title,
              desc: t.home.feature3Desc
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white/[0.02] border border-white/8 backdrop-blur-md p-6 rounded-2xl hover:border-white/15 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color} mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-white font-sans font-bold text-lg mb-2">
                  {feat.title}
                </h3>
                <p className="text-zinc-450 leading-relaxed font-sans text-xs sm:text-sm">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prompt Inspiration List */}
      <div className="mb-14">
        <div className="flex items-center space-x-2.5 mb-2">
          <Sparkles className="text-purple-400 animate-pulse" size={18} />
          <Typography variant="h5" className="font-display font-semibold text-white">
            {t.home.creativityTitle}
          </Typography>
        </div>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6">
          {t.home.creativitySubtitle}
        </p>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {INSPIRATION_PROMPTS.map((prompt, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="cursor-pointer group flex flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.01] backdrop-blur-md p-5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all"
              onClick={() => handleInspirationClick(prompt)}
              id={`preset-prompt-${index}`}
            >
              <div className="text-zinc-350 text-xs sm:text-sm leading-relaxed group-hover:text-white transition-colors">
                "{prompt}"
              </div>
              <div className="mt-4 flex items-center text-[10px] sm:text-xs font-semibold text-purple-400 group-hover:text-purple-350">
                <span>{t.home.tryBlueprint}</span>
                <ArrowRight size={12} className="ml-1 transform transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Generations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="text-blue-400 font-bold animate-pulse" size={18} />
            <Typography variant="h5" className="font-display font-semibold text-white">
              {t.home.recentTitle}
            </Typography>
          </div>
          {recentImages.length > 0 && (
            <Button 
              onClick={() => onViewChange("gallery")}
              className="text-xs font-extrabold text-zinc-400 hover:text-white capitalize font-mono"
            >
              {t.home.viewGallery}
            </Button>
          )}
        </div>

        {recentImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 border-dashed bg-white/[0.01] backdrop-blur-md p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 mb-4 animate-bounce">
              <ImageIcon size={20} />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
              {t.home.recentEmpty}
            </p>
            <Button
              variant="outlined"
              onClick={() => onViewChange("generate")}
              className="mt-4 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white capitalize text-xs backdrop-blur-sm px-4 py-2"
            >
              {t.home.launchBtn}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {recentImages.slice(0, 4).map((img) => (
              <div 
                key={img.id}
                className="relative overflow-hidden group rounded-2xl border border-white/8 bg-white/5 aspect-square cursor-pointer hover:border-purple-500/30 transition-all shadow-lg"
                onClick={() => onViewChange("gallery")}
              >
                <img 
                  src={img.url} 
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-xs text-white line-clamp-2 italic font-sans">
                    "{img.originalPrompt || img.prompt}"
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1.5 capitalize font-mono">
                    Style: {img.style}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
}
