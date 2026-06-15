/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import GenerateView from "./components/GenerateView";
import GalleryView from "./components/GalleryView";
import SettingsView from "./components/SettingsView";
import { AppView, GeneratedImage, GenerationSettings } from "./types";

// Design customized deep dark theme mirroring our design choices
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#020203", // deep glass dark
      paper: "rgba(255, 255, 255, 0.04)",
    },
    primary: {
      main: "#a855f7", // purple-500
    },
    secondary: {
      main: "#3b82f6", // blue-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Space Grotesk", sans-serif',
  },
});

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [promptInput, setPromptInput] = useState<string>("");

  // Lazy-loaded states for local persistence caching
  const [savedImages, setSavedImages] = useState<GeneratedImage[]>(() => {
    try {
      const stored = localStorage.getItem("ai_creator_gallery");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<GenerationSettings>(() => {
    try {
      const stored = localStorage.getItem("ai_creator_settings");
      return stored ? JSON.parse(stored) : {
        aspectRatio: "1:1",
        style: "none",
        quality: "standard",
        enhancePrompt: true
      };
    } catch {
      return {
        aspectRatio: "1:1",
        style: "none",
        quality: "standard",
        enhancePrompt: true
      };
    }
  });

  // Sync saved images to local-storage
  useEffect(() => {
    localStorage.setItem("ai_creator_gallery", JSON.stringify(savedImages));
  }, [savedImages]);

  // Sync settings to local-storage
  useEffect(() => {
    localStorage.setItem("ai_creator_settings", JSON.stringify(settings));
  }, [settings]);

  // Add customized generated image items to gallery history
  const handleSaveToGallery = (image: GeneratedImage) => {
    setSavedImages((prev) => [image, ...prev]);
  };

  // Remove elements from list
  const handleDeleteImage = (id: string) => {
    setSavedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Switch favourite attribute on images
  const handleToggleFavorite = (id: string) => {
    setSavedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isFavorite: !img.isFavorite } : img))
    );
  };

  // Prompt configuration reuse helper
  const handleReusePrompt = (image: GeneratedImage) => {
    setPromptInput(image.originalPrompt || image.prompt);
  };

  // Clear Entire gallery collection
  const handleClearGallery = () => {
    setSavedImages([]);
  };

  const handleUpdateSettings = (newSettings: GenerationSettings) => {
    setSettings(newSettings);
  };

  // Select dynamic view mapping under smooth animations
  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <HomeView
            onViewChange={setCurrentView}
            setPromptInput={setPromptInput}
            recentImages={savedImages}
          />
        );
      case "generate":
        return (
          <GenerateView
            promptInput={promptInput}
            setPromptInput={setPromptInput}
            settings={settings}
            onSaveToGallery={handleSaveToGallery}
            savedImages={savedImages}
          />
        );
      case "gallery":
        return (
          <GalleryView
            savedImages={savedImages}
            onDeleteImage={handleDeleteImage}
            onToggleFavorite={handleToggleFavorite}
            onReusePrompt={handleReusePrompt}
            onViewChange={setCurrentView}
          />
        );
      case "settings":
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearGallery={handleClearGallery}
            savedImagesCount={savedImages.length}
          />
        );
      default:
        return (
          <HomeView
            onViewChange={setCurrentView}
            setPromptInput={setPromptInput}
            recentImages={savedImages}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="min-h-screen bg-[#020203] flex flex-col justify-between selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/12 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <div className="flex flex-col flex-1 z-10 relative">
          {/* Navigation panel */}
          <Navbar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            savedCount={savedImages.length} 
          />

          {/* Dynamic transition container */}
          <Box className="flex-1 pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Studio footer */}
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md py-6 text-center text-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400">
              <p className="flex items-center justify-center space-x-1.5 font-sans">
                <Sparkles size={12} className="text-purple-400" />
                <span>AI Image Generator Studio &copy; {new Date().getFullYear()}</span>
              </p>
              <p className="text-[10px] font-mono text-zinc-500">
                Developed securely via Vertex Imagen 3 Engine • Frosted Glass Edition
              </p>
            </div>
          </footer>
        </div>
      </Box>
    </ThemeProvider>
  );
}
