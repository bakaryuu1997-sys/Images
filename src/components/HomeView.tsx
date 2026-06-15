/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Button, Card, CardContent, Grid, Typography, Box } from "@mui/material";
import { motion } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  Image as ImageIcon, 
  Heart, 
  Zap, 
  Download, 
  Clock, 
  History 
} from "lucide-react";
import { INSPIRATION_PROMPTS } from "../constants";
import { GeneratedImage, AppView } from "../types";

interface HomeViewProps {
  onViewChange: (view: AppView) => void;
  setPromptInput: (prompt: string) => void;
  recentImages: GeneratedImage[];
}

export default function HomeView({ onViewChange, setPromptInput, recentImages }: HomeViewProps) {
  
  const handleInspirationClick = (promptText: string) => {
    setPromptInput(promptText);
    onViewChange("generate");
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <Box className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-12 text-center md:px-12 sm:py-16 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center space-x-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-purple-300 backdrop-blur-sm">
            <Sparkles size={12} className="text-purple-400 animate-pulse" />
            <span>Powered by Google Imagen 3 Technology</span>
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mt-6 max-w-3xl mx-auto leading-tight">
            Transform Imagination into{" "}
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Stunning Artworks
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto mt-6">
            Generate high-fidelity visual masterpieces in seconds with intelligent prompt enhancement and dark modern controls.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="contained"
              id="get-started-btn"
              onClick={() => onViewChange("generate")}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 capitalize transition-all duration-300 text-sm flex items-center justify-center space-x-2"
            >
              <span>Create Your First Image</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outlined"
              id="explore-gallery-btn"
              onClick={() => onViewChange("gallery")}
              className="w-full sm:w-auto px-8 py-3.5 border-white/10 hover:border-white/20 text-zinc-350 hover:bg-white/5 rounded-xl font-medium capitalize backdrop-blur-sm"
            >
              Examine Gallery
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Grid Features */}
      <div className="mb-14">
        <Typography variant="h5" className="font-display font-semibold text-white mb-6">
          Powerful Studio Features
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              title: "Gemini Prompt Enhancer",
              desc: "Instantly draft beautiful, ultra-detailed instructions by automatically refining simple ideas into rich sensory scenes."
            },
            {
              icon: ImageIcon,
              color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              title: "Multiple Aspect Ratios",
              desc: "Generate images customized for vertical stories (9:16), wide cinematic frames (16:9), standard photos (4:3, 3:4), or perfect squares."
            },
            {
              icon: Download,
              color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
              title: "Direct Downloads",
              desc: "Export generated graphic files in full resolution directly to your local drive without compression."
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="h-full border border-white/10 bg-white/5 backdrop-blur-md text-white hover:border-white/25 transition-all duration-300 rounded-2xl animate-fade-in">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color} mb-4`}>
                    <Icon size={22} />
                  </div>
                  <Typography variant="h6" className="font-sans font-bold text-lg mb-2">
                    {feat.title}
                  </Typography>
                  <Typography variant="body2" className="text-zinc-400 leading-relaxed font-sans text-sm">
                    {feat.desc}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Prompt Inspiration List */}
      <div className="mb-14">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="text-purple-400 animate-pulse" size={18} />
          <Typography variant="h5" className="font-display font-semibold text-white">
            Spark Your Creativity
          </Typography>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          Click any preset prompt below to automatically fill it inside your generator workspace.
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
              whileHover={{ y: -4 }}
              className="cursor-pointer group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:border-white/20 hover:bg-white/10 transition-all"
              onClick={() => handleInspirationClick(prompt)}
              id={`preset-prompt-${index}`}
            >
              <div className="text-zinc-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                "{prompt}"
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                <span>Try this blueprint</span>
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
            <History className="text-blue-400 font-bold" size={18} />
            <Typography variant="h5" className="font-display font-semibold text-white">
              Recent Work
            </Typography>
          </div>
          {recentImages.length > 0 && (
            <Button 
              onClick={() => onViewChange("gallery")}
              className="text-xs font-bold text-zinc-400 hover:text-white capitalize"
            >
              View Full Gallery
            </Button>
          )}
        </div>

        {recentImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 border-dashed bg-white/5 backdrop-blur-md p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 mb-4">
              <ImageIcon size={20} />
            </div>
            <p className="text-sm text-zinc-400 max-w-sm">
              Your recent generated images will show up here. Enter a prompt to construct your first design!
            </p>
            <Button
              variant="outlined"
              onClick={() => onViewChange("generate")}
              className="mt-4 border-white/10 hover:border-white/20 text-zinc-350 hover:text-white capitalize text-xs backdrop-blur-sm"
            >
              Launch Generator
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {recentImages.slice(0, 4).map((img) => (
              <div 
                key={img.id}
                className="relative overflow-hidden group rounded-xl border border-white/10 bg-white/5 aspect-square cursor-pointer hover:border-white/20 transition-all shadow-lg"
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
                  <p className="text-[10px] text-zinc-400 mt-1 capitalize">
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
