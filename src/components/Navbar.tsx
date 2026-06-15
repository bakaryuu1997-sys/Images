/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Box 
} from "@mui/material";
import { 
  Sparkles, 
  Home, 
  Image as ImageIcon, 
  Bookmark, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  Sparkle
} from "lucide-react";
import { AppView } from "../types";

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  savedCount: number;
}

export default function Navbar({ currentView, onViewChange, savedCount }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: any; badge?: number }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "generate", label: "Generate Image", icon: Sparkles },
    { id: "gallery", label: "Gallery", icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (viewId: AppView) => {
    onViewChange(viewId);
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        className="border-b border-white/10 bg-black/20 backdrop-blur-md shadow-none"
        style={{ backgroundColor: 'rgba(2, 2, 3, 0.4)', backgroundImage: 'none', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Toolbar className="flex justify-between px-0 min-h-16">
            {/* Logo Section */}
            <div 
              className="flex cursor-pointer items-center space-x-2" 
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

            {/* Desktop Nav Items */}
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
                    className={`px-4 py-2 capitalize font-medium rounded-lg transition-all duration-200 ${
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
            </div>

            {/* Mobile Hamburger menu */}
            <div className="md:hidden">
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
            width: 256,
            backgroundColor: 'rgba(2, 2, 3, 0.75)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f4f4f5',
            backgroundImage: 'none',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }
        }}
      >
        <Box className="flex h-full flex-col bg-transparent">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sparkle size={18} className="text-purple-450" />
              <Typography variant="subtitle1" className="font-display font-bold text-white">
                AI Image Studio
              </Typography>
            </div>
            <IconButton onClick={handleDrawerToggle} className="text-zinc-400 hover:text-white">
              <X size={20} />
            </IconButton>
          </div>

          <List className="flex-1 px-2 py-4 space-y-1">
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
                      primary={<span className="text-sm font-medium">{item.label}</span>}
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
            <p className="text-[10px] text-zinc-500 font-mono">
              v1.0.0 • Powered by Imagen 3
            </p>
          </div>
        </Box>
      </Drawer>
    </>
  );
}
