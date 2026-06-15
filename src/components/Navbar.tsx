/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box,
  Tooltip
} from "@mui/material";
import { 
  Sparkles, 
  Home, 
  Image as ImageIcon, 
  Bookmark, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  Sparkle,
  Layers,
  Globe
} from "lucide-react";
import { AppView, AppVersionLevel } from "../types";
import { Language, translations } from "../locales";

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  savedCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  appVersion: AppVersionLevel;
  setAppVersion: (version: AppVersionLevel) => void;
  user?: any;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export default function Navbar({ 
  currentView, 
  onViewChange, 
  savedCount,
  language,
  setLanguage,
  appVersion,
  setAppVersion,
  user,
  onSignIn,
  onSignOut
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = translations[language];

  const navItems: { id: AppView; label: string; icon: any; badge?: number }[] = [
    { id: "home", label: t.navbar.home, icon: Home },
    { id: "generate", label: t.navbar.generate, icon: Sparkles },
    { id: "htmlStudio", label: language === "en" ? "HTML Canvas Pro" : "Phòng Dựng HTML", icon: Layers },
    { id: "gallery", label: t.navbar.gallery, icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { id: "settings", label: t.navbar.settings, icon: SettingsIcon },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (viewId: AppView) => {
    onViewChange(viewId);
    setMobileOpen(false);
  };

  const versionTips = {
    v1: t.navbar.v1Desc,
    v2: t.navbar.v2Desc,
    v3: t.navbar.v3Desc,
    v4: t.navbar.v4Desc,
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        className="border-b border-white/10 bg-black/20 backdrop-blur-md shadow-none"
        style={{ backgroundColor: 'rgba(2, 2, 3, 0.4)', backgroundImage: 'none', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 50 }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Toolbar className="flex justify-between px-0 min-h-16 gap-3">
            {/* Logo Section */}
            <div 
              className="flex cursor-pointer items-center space-x-2 shrink-0" 
              onClick={() => onViewChange("home")}
              id="logo-brand"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white hidden sm:inline-block">
                Imagen<span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent ml-0.5">Studio</span>
              </span>
            </div>

            {/* Version Evolution Toggle Selector */}
            <div className="hidden sm:flex items-center space-x-1.5 border border-white/10 bg-black/30 rounded-xl p-1 pointer-events-auto">
              {(["v1", "v2", "v3", "v4"] as AppVersionLevel[]).map((v) => (
                <Tooltip key={v} title={versionTips[v]} arrow leaveDelay={100}>
                  <button
                    onClick={() => setAppVersion(v)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      appVersion === v
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md cursor-default"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {v.toUpperCase()}
                  </button>
                </Tooltip>
              ))}
            </div>

            {/* Desktop Actions and Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    id={`nav-btn-${item.id}`}
                    startIcon={<Icon size={16} />}
                    className={`px-3.5 py-2 capitalize font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-white/10 text-white shadow-md border border-white/20 backdrop-blur-sm" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-1.5 flex h-5 min-w-5 tokens items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-1 text-[10px] font-bold text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}

              <div className="h-6 w-[1px] bg-white/10 mx-2" />

              {/* Language Switch Button */}
              <button
                onClick={() => setLanguage(language === "en" ? "vi" : "en")}
                className="px-3 py-2 mr-1 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-xs font-bold flex items-center space-x-1 shrink-0"
                title={language === "en" ? "Chuyển sang Tiếng Việt" : "Switch to English"}
              >
                <Globe size={13} className="text-purple-400" />
                <span>{language === "en" ? "EN" : "VI"}</span>
              </button>

              {/* Authentication Trigger Module */}
              {user ? (
                <div className="flex items-center space-x-2 border border-purple-500/20 bg-purple-500/5 rounded-xl px-2 py-1">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop"} 
                    alt={user.displayName || "User"} 
                    className="w-6 h-6 rounded-full border border-purple-400 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:flex flex-col text-left mr-1">
                    <span className="text-[10px] font-bold text-white leading-tight max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {user.displayName || "Developer"}
                    </span>
                    <span className="text-[8px] text-purple-300 leading-tight">
                      Firestore Active
                    </span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-300 px-2 py-1 rounded-md font-bold transition-all"
                  >
                    {language === "en" ? "Sign Out" : "Đăng xuất"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-lg shadow-purple-600/20"
                >
                  <Sparkle size={13} className="text-purple-200" />
                  <span>{language === "en" ? "Sign In" : "Đăng nhập Google"}</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger menu & Controls */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "en" ? "vi" : "en")}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-xs font-bold"
              >
                {language === "en" ? "EN" : "VI"}
              </button>
              
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className="text-zinc-400 hover:text-white"
                id="menu-hamburger-btn"
              >
                <Menu size={24} />
              </IconButton>
            </div>
          </Toolbar>
        </div>
      </AppBar>

      {/* Drawer for Mobile Navigation */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiPaper-root': {
            width: 270,
            backgroundColor: 'rgba(2, 2, 3, 0.85)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f4f4f5',
            backgroundImage: 'none',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            zIndex: 100
          }
        }}
      >
        <Box className="flex h-full flex-col bg-transparent">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-purple-400" />
              <Typography variant="subtitle1" className="font-display font-bold text-white">
                Imagen Studio Pro
              </Typography>
            </div>
            <IconButton onClick={handleDrawerToggle} className="text-zinc-400 hover:text-white">
              <X size={20} />
            </IconButton>
          </div>

          {/* User profile section for Mobile view */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop"} 
                    alt="User Profile" 
                    className="w-8 h-8 rounded-full border border-purple-400 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {user.displayName || "Developer"}
                    </span>
                    <span className="text-[9px] text-zinc-400 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {user.email || "local@guest"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => { onSignOut?.(); setMobileOpen(false); }}
                  className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-1.5 rounded-lg font-bold"
                >
                  {language === "en" ? "Sign Out" : "Đăng xuất"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onSignIn?.(); setMobileOpen(false); }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5"
              >
                <Sparkle size={13} className="text-purple-200" />
                <span>{language === "en" ? "Sign In" : "Đăng nhập Google"}</span>
              </button>
            )}
          </div>

          {/* Mobile Version evolution selector list */}
          <div className="p-4 border-b border-white/5 bg-white/2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2">{t.navbar.versionLabel}</span>
            <div className="grid grid-cols-4 gap-1.5 bg-black/45 p-1 rounded-xl border border-white/5">
              {(["v1", "v2", "v3", "v4"] as AppVersionLevel[]).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setAppVersion(v);
                    setMobileOpen(false);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    appVersion === v
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <List className="flex-1 px-2 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavClick(item.id)}
                    className={`rounded-lg px-3 py-2.5 transition-all ${
                      isActive 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                    id={`mobile-nav-btn-${item.id}`}
                  >
                    <ListItemIcon className={`min-w-8 ${isActive ? "text-purple-400" : "text-zinc-500"}`}>
                      <Icon size={18} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<span className="text-sm font-semibold">{item.label}</span>}
                    />
                    {item.badge !== undefined && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-1 text-[10px] font-bold text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <div className="p-4 border-t border-white/10 text-center">
            <p className="text-[10px] text-zinc-500 font-mono text-center">
              Active Server Tier: {appVersion.toUpperCase()} • {language.toUpperCase()}
            </p>
          </div>
        </Box>
      </Drawer>
    </>
  );
}
