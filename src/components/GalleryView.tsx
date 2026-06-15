/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Grid, 
  Box,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Heart, 
  Download, 
  Trash2, 
  ExternalLink, 
  X, 
  RefreshCw, 
  Calendar, 
  Bookmark, 
  Filter, 
  Copy, 
  Check 
} from "lucide-react";
import { GeneratedImage, AppView } from "../types";

interface GalleryViewProps {
  savedImages: GeneratedImage[];
  onDeleteImage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onReusePrompt: (image: GeneratedImage) => void;
  onViewChange: (view: AppView) => void;
}

export default function GalleryView({
  savedImages,
  onDeleteImage,
  onToggleFavorite,
  onReusePrompt,
  onViewChange
}: GalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRatio, setFilterRatio] = useState<string>("all");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Active dialog popup image selection
  const activeImage = useMemo(() => {
    return savedImages.find(img => img.id === activeImageId) || null;
  }, [savedImages, activeImageId]);

  // Compute filtered images
  const filteredImages = useMemo(() => {
    return savedImages.filter(img => {
      const matchSearch = 
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (img.originalPrompt && img.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        img.style.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchRatio = filterRatio === "all" || img.aspectRatio === filterRatio;
      const matchFavorite = !filterFavorite || img.isFavorite;

      return matchSearch && matchRatio && matchFavorite;
    });
  }, [savedImages, searchQuery, filterRatio, filterFavorite]);

  const handleDownload = (img: GeneratedImage, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal opening
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `art_saved_${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal opening
    if (window.confirm("Are you sure you want to delete this masterwork from your library?")) {
      onDeleteImage(id);
      if (id === activeImageId) {
        setActiveImageId(null);
      }
    }
  };

  const handleToggleFavClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal opening
    onToggleFavorite(id);
  };

  const handleReuse = (img: GeneratedImage) => {
    onReusePrompt(img);
    setActiveImageId(null);
    onViewChange("generate");
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Box className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <Bookmark size={26} className="text-purple-400" />
            <Typography variant="h4" className="font-display font-extrabold text-white">
              Creative Gallery
            </Typography>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Browse, export, and favor your synthesized designs. ({savedImages.length} saved)
          </p>
        </div>

        {savedImages.length > 0 && (
          <Button
            variant="contained"
            onClick={() => onViewChange("generate")}
            className="capitalize self-start sm:self-auto bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold leading-none px-5 py-3 rounded-xl shadow-lg shadow-purple-500/10 text-xs hover:opacity-90 transition-all"
          >
            Create New Image
          </Button>
        )}
      </div>

      {savedImages.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 border-dashed bg-white/5 backdrop-blur-md p-12 text-center min-h-[350px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-purple-400 mb-5">
            <Bookmark size={24} />
          </div>
          <Typography variant="h6" className="font-display font-bold text-zinc-200">
            Gallery Archive Empty
          </Typography>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mt-2 font-sans">
            You don't have any saved masterworks yet. Spin up the generator, synthesize a canvas, and click "Save to Gallery"!
          </p>
          <Button
            variant="outlined"
            onClick={() => onViewChange("generate")}
            className="mt-6 border-white/10 hover:border-white/20 bg-white/5 text-zinc-300 hover:text-white capitalize px-5 py-2.5 rounded-xl font-semibold text-xs"
          >
            Launch Art Workspace
          </Button>
        </div>
      ) : (
        /* Content Grid */
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt, style presets..."
                className="w-full bg-black/20 hover:bg-black/30 text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-sm font-sans transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Buttons Aspect Ratio */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono hidden lg:inline mr-1 flex items-center space-x-1.5">
                <Filter size={12} />
                <span>ASPECT FILTER:</span>
              </span>
              {["all", "1:1", "16:9", "9:16", "4:3", "3:4"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setFilterRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all font-semibold ${
                    filterRatio === ratio 
                      ? "bg-white/10 text-purple-400 border border-white/20" 
                      : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {ratio === "all" ? "All Type" : ratio}
                </button>
              ))}

              <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

              {/* Favorites Filter */}
              <button
                onClick={() => setFilterFavorite(!filterFavorite)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterFavorite 
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/25" 
                    : "text-zinc-400 hover:text-white bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <Heart size={12} fill={filterFavorite ? "currentColor" : "none"} />
                <span>Favorites</span>
              </button>
            </div>
          </div>

              {/* Core Art Cards Grid list */}
              {filteredImages.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm font-sans">
                  No artworks matched your search filters. Try typing different keywords or clearing filters.
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredImages.map((img) => (
                    <motion.div
                      key={img.id}
                      layout
                      whileHover={{ y: -4 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-square cursor-pointer flex flex-col justify-end shadow-xl transition-all hover:border-white/20 hover:shadow-2xl"
                      onClick={() => setActiveImageId(img.id)}
                      id={`gallery-card-${img.id}`}
                    >
                  {/* Base64 Asset */}
                  <img 
                    src={img.url} 
                    alt={img.prompt}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Top Header Card Controls: Quick Fav indicator */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton
                      onClick={(e) => handleToggleFavClick(img.id, e)}
                      size="small"
                      className="bg-zinc-950/70 hover:bg-zinc-950 text-white backdrop-blur-md"
                    >
                      <Heart 
                        size={14} 
                        fill={img.isFavorite ? "#f43f5e" : "none"} 
                        className={img.isFavorite ? "text-rose-500" : "text-white"} 
                      />
                    </IconButton>
                  </div>

                  {/* Gradient cover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Bottom details card drawer */}
                  <div className="absolute bottom-0 inset-x-0 p-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end z-10">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono">
                      Aspect {img.aspectRatio} • Preset: {img.style}
                    </span>
                    <p className="text-xs text-white leading-snug line-clamp-2 italic font-sans mt-1">
                      "{img.originalPrompt || img.prompt}"
                    </p>

                    {/* Miniature tools */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500">
                        {new Date(img.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>

                      <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          onClick={(e) => handleDownload(img, e)}
                          size="small"
                          title="Download artwork"
                          className="text-zinc-400 hover:text-white"
                        >
                          <Download size={13} />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleDelete(img.id, e)}
                          size="small"
                          title="Delete design"
                          className="text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </IconButton>
                      </div>
                    </div>
                  </div>

                  {/* Small Aspect overlay always visible when not hovered */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-md py-0.5 px-2 text-[9px] font-mono font-semibold tracking-wider text-zinc-400 group-hover:opacity-0 transition-opacity">
                    {img.aspectRatio}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Art Lightbox Detail Popup Dialog */}
      <Dialog
        open={activeImage !== null}
        onClose={() => setActiveImageId(null)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(2, 2, 3, 0.75)',
            color: 'white',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            backgroundImage: 'none',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)'
          }
        }}
        id="gallery-detail-dialog"
      >
        {activeImage && (
          <DialogContent className="p-0">
            <div className="absolute top-4 right-4 z-50">
              <IconButton 
                onClick={() => setActiveImageId(null)}
                className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
              >
                <X size={18} />
              </IconButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              
              {/* Image Frame Left Panel */}
              <div className="md:col-span-7 flex items-center justify-center p-4 bg-black/30 min-h-[300px]">
                <img 
                  src={activeImage.url} 
                  alt={activeImage.prompt}
                  className="max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl border border-white/5"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Data Specifications Right Panel */}
              <div className="md:col-span-5 md:border-l border-white/10 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono tracking-widest block uppercase font-bold">Image Blueprint Specifications</span>
                    <Typography variant="h6" className="font-display font-bold text-zinc-100 mt-1 pb-3 border-b border-white/10">
                      Canvas Details
                    </Typography>
                  </div>

                  {/* Prompt Text details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                      <span>Synthesized Prompt</span>
                      <button
                        onClick={() => handleCopyPrompt(activeImage.prompt)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1 capitalize"
                      >
                        {copySuccess ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copySuccess ? "Copied" : "Copy Prompt text"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 italic font-sans leading-relaxed bg-black/35 p-3.5 rounded-xl border border-white/10">
                      "{activeImage.prompt}"
                    </p>
                  </div>

                  {/* Metadata Chips metadata details */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center animate-fade-in">
                      <span className="text-[9px] text-zinc-500 font-mono block">STYLE PRESET</span>
                      <span className="text-xs font-bold text-zinc-200 mt-1 block truncate capitalize">{activeImage.style}</span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center animate-fade-in">
                      <span className="text-[9px] text-zinc-500 font-mono block">ASPECT RATIO</span>
                      <span className="text-xs font-bold text-purple-400 mt-1 block">{activeImage.aspectRatio}</span>
                    </div>
                  </div>

                  {/* Date specs */}
                  <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <Calendar size={12} className="text-blue-400" />
                    <span>Chronos Log: {new Date(activeImage.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer Controls Actions */}
                <div className="flex flex-col gap-3.5 pt-6 mt-8 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      onClick={() => handleReuse(activeImage)}
                      className="flex-1 py-2.5 border-white/10 text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/5 capitalize font-bold text-xs flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw size={13} />
                      <span>Edit & Re-use Prompt</span>
                    </Button>

                    <IconButton
                      onClick={(e) => handleToggleFavClick(activeImage.id, e)}
                      className="border border-white/10 hover:bg-white/5 text-zinc-300"
                    >
                      <Heart 
                        size={16} 
                        fill={activeImage.isFavorite ? "#f43f5e" : "none"} 
                        className={activeImage.isFavorite ? "text-rose-500" : "text-zinc-350"} 
                      />
                    </IconButton>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      onClick={() => handleDownload(activeImage)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:opacity-90 text-white font-bold capitalize text-xs shadow-lg text-center"
                    >
                      Export Resolution (Download)
                    </Button>
                    
                    <IconButton
                      onClick={() => handleDelete(activeImage.id)}
                      className="bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-400 text-zinc-400"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>

              </div>

            </div>
          </DialogContent>
        )}
      </Dialog>

    </Box>
  );
}
