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
import HtmlStudioView from "./components/HtmlStudioView";
import { AppView, GeneratedImage, GenerationSettings, AppVersionLevel, Project, CustomAsset } from "./types";
import { Language, translations } from "./locales";
import { auth, db, isRealFirebaseAvailable } from "./lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, updateDoc, query, where, onSnapshot } from "firebase/firestore";

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

  // Firebase Auth states
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as User);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      if (isRealFirebaseAvailable) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        await (auth as any).signInWithPopup();
      }
    } catch (e) {
      console.error("Firebase Sign In Encountered Error: ", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase Sign Out Encountered Error: ", e);
    }
  };

  // Bilingual Language Choice state
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("ai_studio_language");
      return (stored === "en" || stored === "vi") ? (stored as Language) : "vi"; // Default to Vietnamese per request
    } catch {
      return "vi";
    }
  });

  // Architectural Version Progression state
  const [appVersion, setAppVersion] = useState<AppVersionLevel>(() => {
    try {
      const stored = localStorage.getItem("ai_studio_version");
      return (stored === "v1" || stored === "v2" || stored === "v3" || stored === "v4") ? (stored as AppVersionLevel) : "v2"; // Default to active V2
    } catch {
      return "v2";
    }
  });

  // Project Directories state (V2 feature)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem("ai_studio_projects");
      return stored ? JSON.parse(stored) : [
        { id: "proj_default", name: "Default Campaign Portfolio", createdAt: new Date().toISOString() }
      ];
    } catch {
      return [{ id: "proj_default", name: "Default Campaign Portfolio", createdAt: new Date().toISOString() }];
    }
  });

  // Customized image style modifiers asset library (V2 feature)
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>(() => {
    try {
      const stored = localStorage.getItem("ai_studio_assets");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  // Listen / Subscribe to Firestore if user is authenticated and DB is available
  useEffect(() => {
    if (!db || !user) return;

    // Listen to images
    const qImages = query(collection(db, "images"), where("userId", "==", user.uid));
    const unsubImages = onSnapshot(qImages, (snapshot) => {
      const items: GeneratedImage[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as GeneratedImage);
      });
      items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedImages(items);
    }, (error) => {
      console.warn("Firestore listen images error:", error);
    });

    // Listen to projects
    const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Project);
      });
      if (items.length === 0) {
        items.push({ id: "proj_default", name: "Default Campaign Portfolio", createdAt: new Date().toISOString(), userId: user.uid });
      }
      setProjects(items);
    }, (error) => {
      console.warn("Firestore listen projects error:", error);
    });

    // Listen to custom assets
    const qAssets = query(collection(db, "assets"), where("userId", "==", user.uid));
    const unsubAssets = onSnapshot(qAssets, (snapshot) => {
      const items: CustomAsset[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CustomAsset);
      });
      setCustomAssets(items);
    }, (error) => {
      console.warn("Firestore listen assets error:", error);
    });

    return () => {
      unsubImages();
      unsubProjects();
      unsubAssets();
    };
  }, [user]);

  // Fallback sync saved images to local-storage only when not connected to Db
  useEffect(() => {
    if (!db || !user) {
      localStorage.setItem("ai_creator_gallery", JSON.stringify(savedImages));
    }
  }, [savedImages, user]);

  // Sync settings to local-storage at all times
  useEffect(() => {
    localStorage.setItem("ai_creator_settings", JSON.stringify(settings));
  }, [settings]);

  // Sync state modifications
  useEffect(() => {
    localStorage.setItem("ai_studio_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("ai_studio_version", appVersion);
  }, [appVersion]);

  useEffect(() => {
    if (!db || !user) {
      localStorage.setItem("ai_studio_projects", JSON.stringify(projects));
    }
  }, [projects, user]);

  useEffect(() => {
    if (!db || !user) {
      localStorage.setItem("ai_studio_assets", JSON.stringify(customAssets));
    }
  }, [customAssets, user]);

  // Add customized generated image items to gallery history
  const handleSaveToGallery = async (image: GeneratedImage) => {
    const payload = { ...image, userId: user?.uid || "anonymous_local" };
    if (db && user) {
      try {
        await setDoc(doc(db, "images", payload.id), payload);
      } catch (err) {
        console.error("Firestore save error:", err);
      }
    } else {
      setSavedImages((prev) => [payload, ...prev]);
    }
  };

  // Remove elements from list
  const handleDeleteImage = async (id: string) => {
    if (db && user) {
      try {
        await deleteDoc(doc(db, "images", id));
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    } else {
      setSavedImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  // Switch favourite attribute on images
  const handleToggleFavorite = async (id: string) => {
    const target = savedImages.find((img) => img.id === id);
    if (!target) return;
    const nextVal = !target.isFavorite;

    if (db && user) {
      try {
        await updateDoc(doc(db, "images", id), { isFavorite: nextVal });
      } catch (err) {
        console.error("Firestore update toggle favorite error:", err);
      }
    } else {
      setSavedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, isFavorite: nextVal } : img))
      );
    }
  };

  // Prompt configuration reuse helper
  const handleReusePrompt = (image: GeneratedImage) => {
    setPromptInput(image.originalPrompt || image.prompt);
  };

  // Clear Entire gallery collection
  const handleClearGallery = async () => {
    if (db && user) {
      try {
        for (const img of savedImages) {
          await deleteDoc(doc(db, "images", img.id));
        }
      } catch (err) {
        console.error("Firestore purge error:", err);
      }
    } else {
      setSavedImages([]);
    }
  };

  const handleUpdateSettings = (newSettings: GenerationSettings) => {
    setSettings(newSettings);
  };

  // V2 Project manipulation functions
  const handleCreateProject = async (name: string) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      userId: user?.uid || "anonymous_local"
    };

    if (db && user) {
      try {
        await setDoc(doc(db, "projects", newProj.id), newProj);
      } catch (err) {
        console.error("Firestore create project error:", err);
      }
    } else {
      setProjects((prev) => [...prev, newProj]);
    }
  };

  // V2 Asset creation function
  const handleRegisterAsset = async (name: string, token: string, type: string) => {
    const newAsset: CustomAsset = {
      id: `asset_${Date.now()}`,
      name,
      token,
      type,
      userId: user?.uid || "anonymous_local"
    };

    if (db && user) {
      try {
        await setDoc(doc(db, "assets", newAsset.id), newAsset);
      } catch (err) {
        console.error("Firestore register asset error:", err);
      }
    } else {
      setCustomAssets((prev) => [...prev, newAsset]);
    }
  };

  const handleMoveToProject = async (imageId: string, projectId: string) => {
    if (db && user) {
      try {
        await updateDoc(doc(db, "images", imageId), { projectId });
      } catch (err) {
        console.error("Firestore move item error:", err);
      }
    } else {
      setSavedImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, projectId } : img))
      );
    }
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
            language={language}
            appVersion={appVersion}
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
            language={language}
            appVersion={appVersion}
            customAssets={customAssets}
            onRegisterAsset={handleRegisterAsset}
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
            language={language}
            appVersion={appVersion}
            projects={projects}
            onCreateProject={handleCreateProject}
            onMoveToProject={handleMoveToProject}
          />
        );
      case "settings":
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearGallery={handleClearGallery}
            savedImagesCount={savedImages.length}
            language={language}
            appVersion={appVersion}
          />
        );
      case "htmlStudio":
        return (
          <HtmlStudioView
            language={language}
            onSaveToGallery={handleSaveToGallery}
          />
        );
      default:
        return (
          <HomeView
            onViewChange={setCurrentView}
            setPromptInput={setPromptInput}
            recentImages={savedImages}
            language={language}
            appVersion={appVersion}
          />
        );
    }
  };

  const t = translations[language];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="min-h-screen bg-[#020203] flex flex-col justify-between selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/12 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <div className="flex flex-col flex-1 z-10 relative">
          {/* Navigation panel with localization & version choices */}
          <Navbar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            savedCount={savedImages.length} 
            language={language}
            setLanguage={setLanguage}
            appVersion={appVersion}
            setAppVersion={setAppVersion}
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
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
                <span>{language === "vi" ? "AI Image Generator Studio" : "AI Image Generator Studio"} &copy; {new Date().getFullYear()}</span>
              </p>
              <p className="text-[10px] font-mono text-zinc-500">
                {language === "vi" 
                  ? `Được vận hành bởi Trí tuệ Nhân tạo Vertex Imagen 3 • Phiên bản ${appVersion.toUpperCase()}`
                  : `Developed securely via Vertex Imagen 3 Engine • Edition ${appVersion.toUpperCase()}`}
              </p>
            </div>
          </footer>
        </div>
      </Box>
    </ThemeProvider>
  );
}
