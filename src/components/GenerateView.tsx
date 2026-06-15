/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wand2, 
  Sparkles, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Ratio,
  Maximize,
  ArrowRight,
  Sparkle
} from "lucide-react";
import { STYLE_PRESETS } from "../constants";
import { GeneratedImage, GenerationSettings } from "../types";

interface GenerateViewProps {
  promptInput: string;
  setPromptInput: (prompt: string) => void;
  settings: GenerationSettings;
  onSaveToGallery: (image: GeneratedImage) => void;
  savedImages: GeneratedImage[];
}

// Aspect ratio details for styling cards
const RATIO_PRESETS = [
  { id: "1:1", label: "1:1", desc: "Square", aspectClass: "aspect-square w-12 h-12" },
  { id: "16:9", label: "16:9", desc: "Landscape", aspectClass: "aspect-[16/9] w-14 h-8" },
  { id: "9:16", label: "9:16", desc: "Story/Mobile", aspectClass: "aspect-[9/16] w-8 h-14" },
  { id: "4:3", label: "4:3", desc: "Traditional", aspectClass: "aspect-[4/3] w-12 h-9" },
  { id: "3:4", label: "3:4", desc: "Portrait", aspectClass: "aspect-[3/4] w-9 h-12" },
] as const;

export default function GenerateView({
  promptInput,
  setPromptInput,
  settings,
  onSaveToGallery,
  savedImages
}: GenerateViewProps) {
  const [selectedRatio, setSelectedRatio] = useState<"1:1" | "3:4" | "4:3" | "16:9" | "9:16">(settings.aspectRatio);
  const [selectedStyle, setSelectedStyle] = useState<string>(settings.style);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Progressive loading text sequence to simulate actual AI generation steps
  const loadingSteps = [
    "Deconstructing prompt semantic triggers...",
    "Synthesizing compositional blueprints...",
    "Initializing Imagen 3 neural matrices...",
    "Computing high-contrast diffusion steps...",
    "Polishing resolution micro-textures...",
    "Rendering finalized high-fidelity assets..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationStep(0);
      const intervalTime = 2500; // Increment step every 2.5s
      timer = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, intervalTime);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Enhance prompt using Gemini
  const handleEnhancePrompt = async () => {
    if (!promptInput.trim()) return;
    setIsEnhancing(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          style: STYLE_PRESETS.find(s => s.id === selectedStyle)?.name || "none"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to expand prompt.");
      }
      setPromptInput(data.enhancedPrompt);
      setEnhancedPrompt(data.enhancedPrompt);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "A networking error occurred during prompt expansion.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Image using Imagen 3
  const handleGenerateImage = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setErrorText(null);
    setGeneratedImgUrl(null);
    setSaveSuccess(false);

    try {
      // Find style prompt additive if chosen
      const styleObj = STYLE_PRESETS.find(s => s.id === selectedStyle);
      const stylePayloadName = styleObj && styleObj.id !== "none" ? styleObj.name : "none";

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          aspectRatio: selectedRatio,
          style: stylePayloadName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image schema model.");
      }

      setGeneratedImgUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "A production connection error occurred. Verify credentials inside the settings tab.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptInput);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download Generated Image Assets
  const handleDownloadImage = () => {
    if (!generatedImgUrl) return;
    const link = document.createElement("a");
    link.href = generatedImgUrl;
    link.download = `art_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Generated Image to Local History Gallery
  const handleSaveToGallery = () => {
    if (!generatedImgUrl) return;
    const newImage: GeneratedImage = {
      id: `img_${Date.now()}`,
      url: generatedImgUrl,
      prompt: promptInput,
      originalPrompt: promptInput,
      style: STYLE_PRESETS.find(s => s.id === selectedStyle)?.name || "Standard Description",
      aspectRatio: selectedRatio,
      createdAt: new Date().toISOString(),
      isFavorite: false
    };
    onSaveToGallery(newImage);
    setSaveSuccess(true);
  };

  // Check if current image is already saved in history
  const isImageAlreadySaved = () => {
    if (!generatedImgUrl) return false;
    return savedImages.some(img => img.url === generatedImgUrl) || saveSuccess;
  };

  // Set aspect ratio class helper for the output container
  const getOutputAspectRatioClass = () => {
    switch (selectedRatio) {
      case "16:9": return "aspect-[16/9]";
      case "9:16": return "aspect-[9/16] max-h-[500px]";
      case "4:3": return "aspect-[4/3]";
      case "3:4": return "aspect-[3/4] max-h-[480px]";
      default: return "aspect-square";
    }
  };

  return (
    <Box className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Creation Settings Controls */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-2xl flex-1 shadow-2xl flex flex-col justify-between">
            <CardContent className="p-6 flex flex-col h-full space-y-6">
              
              {/* Box Header */}
              <div>
                <span className="text-xs text-purple-400 font-mono tracking-wider uppercase font-semibold block">Artistic Core Control</span>
                <Typography variant="h5" className="font-display font-bold text-zinc-100 mt-1">
                  Creative Workspace
                </Typography>
              </div>

              {/* Text Prompt Entry */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-200">Text Prompt</span>
                  {promptInput.trim().length > 0 && (
                    <button 
                      onClick={() => setPromptInput("")}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Clear Draft
                    </button>
                  )}
                </div>

                <div className="relative">
                  <TextField
                    id="art-prompt-input"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Describe your design vision in vivid details, e.g., 'A majestic white cat walking through a field of glowing lavender neon moss, fantasy oil painting style...'"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(0, 0, 0, 0.25)',
                        color: 'white',
                        fontFamily: 'var(--font-sans)',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#a855f7' },
                      }
                    }}
                  />
                  
                  {copySuccess && (
                     <span className="absolute bottom-3 right-12 text-[10px] bg-zinc-800 text-purple-400 px-2 py-1 rounded">Copied!</span>
                  )}
                  {promptInput.trim() && (
                    <IconButton 
                      onClick={handleCopyPrompt}
                      className="absolute bottom-2.5 right-2 text-zinc-400 hover:text-white"
                      size="small"
                    >
                      {copySuccess ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </IconButton>
                  )}
                </div>

                {/* Prompt Enhancer Trigger */}
                <div className="pt-1">
                  <Button
                    id="gemini-enhance-btn"
                    disabled={isEnhancing || isGenerating || !promptInput.trim()}
                    onClick={handleEnhancePrompt}
                    className={`w-full text-xs py-2.5 rounded-xl border-dashed capitalize font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                      !promptInput.trim() 
                        ? "border-white/5 text-zinc-600 cursor-not-allowed" 
                        : isEnhancing 
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                        : "border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 hover:text-white"
                    }`}
                  >
                    {isEnhancing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-purple-400" />
                        <span>Gemini expands prompt metrics...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} />
                        <span>Enhance Description via Gemini</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Aspect Ratio Presets */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-zinc-200 block">Aspect Ratio Selection</span>
                <div className="grid grid-cols-5 gap-2">
                  {RATIO_PRESETS.map((preset) => {
                    const isActive = selectedRatio === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedRatio(preset.id as any)}
                        id={`ratio-btn-${preset.id.replace(':', '-')}`}
                        className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                          isActive 
                            ? "bg-white/10 border-white/20 text-white shadow-md" 
                            : "border-white/5 bg-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <div className={`rounded border flex items-center justify-center text-[8px] font-mono leading-none ${
                            isActive ? "border-purple-400/50 bg-purple-400/10" : "border-zinc-700 bg-zinc-800/20"
                          } ${preset.aspectClass}`} />
                        </div>
                        <span className="text-[10px] font-bold mt-2 tracking-wide font-sans">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style Presets */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-zinc-200 block">Aesthetic Preset Theme</span>
                <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                  {STYLE_PRESETS.map((style) => {
                    const isActive = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        id={`style-btn-${style.id}`}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                          isActive 
                            ? "bg-white/10 border-white/30 text-white font-semibold" 
                            : "border-white/5 bg-white/5 text-zinc-400 hover:border-white/15 hover:bg-white/10 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-xs font-bold text-zinc-100 flex items-center space-x-1.5">
                          <Sparkle size={10} className={isActive ? "text-indigo-400 animate-spin-slow" : "text-zinc-600"} />
                          <span>{style.name}</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-1 font-sans">
                          {style.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Generation Button */}
              <div className="pt-4 mt-auto">
                <Button
                  id="generate-trigger-btn"
                  variant="contained"
                  disabled={isGenerating || isEnhancing || !promptInput.trim()}
                  onClick={handleGenerateImage}
                  className={`w-full py-4 rounded-xl font-bold tracking-tight text-sm capitalize transition-all duration-300 flex items-center justify-center space-x-2 ${
                    !promptInput.trim() || isGenerating
                      ? "bg-white/5 text-zinc-650 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-[0.99]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <CircularProgress size={16} className="text-white" />
                      <span>Processing Matrix ({Math.round(((generationStep + 1) / loadingSteps.length) * 100)}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Synthesize Imagen Canvas</span>
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Creative Canvas Output Display */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-2xl flex-1 shadow-2xl overflow-hidden flex flex-col justify-center items-center relative p-6 minimum-height-canvas">
            
            <AnimatePresence mode="wait">
              {/* Standard Idle Screen */}
              {!isGenerating && !generatedImgUrl && !errorText && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center p-8 max-w-sm"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-purple-400 mb-6">
                    <Sparkles size={28} className="text-purple-400 animate-pulse" />
                  </div>
                  <Typography variant="h6" className="font-display font-bold text-zinc-200">
                    Your Canvas is Empty
                  </Typography>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2.5 font-sans">
                    Use our creative configuration panel on the left to write a prompt, apply presets, and command the compiler. Click "Synthesize" to materialize your thoughts.
                  </p>
                </motion.div>
              )}

              {/* Progress Generation Screen */}
              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center p-8 w-full max-w-md"
                >
                  <div className="relative mb-8">
                    <CircularProgress size={80} thickness={2} className="text-purple-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={24} className="text-purple-400 animate-pulse" />
                    </div>
                  </div>

                  <p className="text-sm font-bold text-zinc-100 tracking-wide">
                    {loadingSteps[generationStep]}
                  </p>
                  
                  {/* Decorative Loader bar progress indicator */}
                  <div className="w-full bg-white/5 h-1 rounded-full mt-5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 h-full rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((generationStep + 1) / loadingSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-3 font-mono">
                    Synthesizing diffusion coordinates • Aspect: {selectedRatio}
                  </p>
                </motion.div>
              )}

              {/* Error Screen state */}
              {errorText && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center p-6 max-w-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-5">
                    <AlertCircle size={26} />
                  </div>
                  <Typography variant="h6" className="font-sans font-bold text-zinc-100">
                    Generation Failed
                  </Typography>
                  <p className="text-xs text-rose-300 mt-2 font-mono bg-black/20 p-3.5 border border-white/10 rounded-xl leading-relaxed text-left">
                    {errorText}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed font-sans">
                    This usually happens if your secret `GEMINI_API_KEY` is not bound, contains typo values, or has expired. Head to Settings inside the top right panel.
                  </p>
                  <Button
                    variant="outlined"
                    onClick={() => handleGenerateImage()}
                    className="mt-6 text-xs px-4 py-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 capitalize text-zinc-200"
                  >
                    Retry Synthesis
                  </Button>
                </motion.div>
              )}

              {/* Accomplished Generated Image Screen */}
              {generatedImgUrl && !isGenerating && !errorText && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="w-full h-full flex flex-col justify-between items-center"
                >
                  {/* Outer Wrapper conforming aspect ratios */}
                  <div className={`w-full flex items-center justify-center relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex-1`}>
                    <img 
                      src={generatedImgUrl} 
                      alt="AI masterwork canvas output"
                      className={`max-w-full max-h-[460px] object-contain rounded-lg transition-transform hover:scale-[1.01] duration-300 shadow-2xl ${getOutputAspectRatioClass()}`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Metadata overlays */}
                    <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none">
                      <span className="bg-black/50 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold text-zinc-300 px-2.5 py-1 rounded-full">
                        {selectedRatio}
                      </span>
                      <span className="bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 px-2.5 py-1 rounded-full capitalize">
                        preset: {STYLE_PRESETS.find(s => s.id === selectedStyle)?.name || "Raw Prompt"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar Footer Controls */}
                  <div className="w-full mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-black/15 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-zinc-500 block font-mono">GENERATED CANVAS DESCRIPTION</span>
                        <p className="text-xs text-zinc-300 leading-snug line-clamp-1 italic mt-0.5">
                          "{promptInput}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outlined"
                        onClick={handleSaveToGallery}
                        disabled={isImageAlreadySaved()}
                        className={`text-xs px-3.5 py-2.5 rounded-lg capitalize font-semibold transition-all flex items-center space-x-1.5 ${
                          isImageAlreadySaved()
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default"
                            : "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 hover:text-white"
                        }`}
                      >
                        {isImageAlreadySaved() ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        <span>{isImageAlreadySaved() ? "Saved to Gallery" : "Save to Gallery"}</span>
                      </Button>

                      <Button
                        variant="contained"
                        onClick={handleDownloadImage}
                        className="text-xs px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg capitalize font-semibold transition-all flex items-center space-x-1.5 hover:opacity-90"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </Card>
        </div>

      </div>
    </Box>
  );
}
