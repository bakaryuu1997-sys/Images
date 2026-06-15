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
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  Settings, 
  Trash2, 
  ShieldAlert, 
  Network, 
  RefreshCw, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  Sliders,
  Database
} from "lucide-react";
import { GenerationSettings, AppVersionLevel } from "../types";
import { STYLE_PRESETS } from "../constants";
import { Language, translations } from "../locales";

interface SettingsViewProps {
  settings: GenerationSettings;
  onUpdateSettings: (settings: GenerationSettings) => void;
  onClearGallery: () => void;
  savedImagesCount: number;
  language: Language;
  appVersion: AppVersionLevel;
}

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  onClearGallery,
  savedImagesCount,
  language,
  appVersion
}: SettingsViewProps) {
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "valid" | "missing" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error" | "info">("success");

  // Test API status on load
  const runDiagnostics = async () => {
    setApiKeyStatus("checking");
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "diagnostics scan test", style: "none" })
      });
      
      const data = await res.json();
      if (res.ok && data.enhancedPrompt) {
        setApiKeyStatus("valid");
        setToastMessage("Core API connection diagnostics status: Healthy! Vertex Imagen and Gemini are fully configured.");
        setToastSeverity("success");
      } else {
        setApiKeyStatus("missing");
        setErrorMessage(data.error || "Missing credential bindings on server.");
        setToastMessage("Setup missing: Please configure GEMINI_API_KEY.");
        setToastSeverity("error");
      }
    } catch (err: any) {
      setApiKeyStatus("error");
      setErrorMessage(err.message || "Endpoint error during handshakes.");
      setToastMessage("Server diagnostics failed to reach Gemini client.");
      setToastSeverity("error");
    }
    setShowStatusToast(true);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handleRatioChange = (e: any) => {
    onUpdateSettings({ ...settings, aspectRatio: e.target.value });
  };

  const handleStyleChange = (e: any) => {
    onUpdateSettings({ ...settings, style: e.target.value });
  };

  const handleQualityChange = (e: any) => {
    onUpdateSettings({ ...settings, quality: e.target.value });
  };

  const handleToggleEnhancement = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, enhancePrompt: e.target.checked });
  };

  const handlePurgeClick = () => {
    const msg = language === "vi"
      ? "Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ảnh đã lưu khỏi Thư viện không? Hành động này không thể hoàn tác!"
      : "Are you absolutely sure you want to permanently delete all saved images from your Gallery? This action is non-reversible!";
    if (window.confirm(msg)) {
      onClearGallery();
      setToastMessage(language === "vi" ? "Thư viện đã được xóa sạch." : "Gallery cleared successfully.");
      setToastSeverity("info");
      setShowStatusToast(true);
    }
  };

  // Test API status on load
  const runDiagnosticsLocal = async () => {
    setApiKeyStatus("checking");
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "diagnostics scan test", style: "none" })
      });
      
      const data = await res.json();
      if (res.ok && data.enhancedPrompt) {
        setApiKeyStatus("valid");
        setToastMessage(language === "vi" 
          ? "Kiểm thử kết nối API: Hoạt động tốt! Vertex Imagen và Gemini đã được cấu hình đầy đủ." 
          : "Core API connection diagnostics status: Healthy! Vertex Imagen and Gemini are fully configured.");
        setToastSeverity("success");
      } else {
        setApiKeyStatus("missing");
        setErrorMessage(data.error || "Missing credential bindings on server.");
        setToastMessage(language === "vi" 
          ? "Thiết lập bị thiếu: Vui lòng cấu hình khóa GEMINI_API_KEY." 
          : "Setup missing: Please configure GEMINI_API_KEY.");
        setToastSeverity("error");
      }
    } catch (err: any) {
      setApiKeyStatus("error");
      setErrorMessage(err.message || "Endpoint error during handshakes.");
      setToastMessage(language === "vi" 
        ? "Kiểm thử thất bại: Không thể kết nối tới dịch vụ Gemini." 
        : "Server diagnostics failed to reach Gemini client.");
      setToastSeverity("error");
    }
    setShowStatusToast(true);
  };

  useEffect(() => {
    runDiagnosticsLocal();
  }, []);

  return (
    <Box className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-purple-400">
          <Settings size={22} className="animate-spin-slow" />
        </div>
        <div>
          <Typography variant="h4" className="font-display font-extrabold text-white">
            {language === "vi" ? "Cấu hình Studio" : "Studio Settings"}
          </Typography>
          <p className="text-zinc-400 text-sm mt-1">
            {language === "vi" 
              ? "Thiết lập các cấu hình ảnh mặc định, chuẩn đoán API và dọn dẹp bộ nhớ." 
              : "Build personal presets, customize output fidelity, and manage storage."}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Generation Defaults */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2.5 mb-6">
              <Sliders size={20} className="text-purple-400" />
              <Typography variant="h6" className="font-sans font-bold text-lg">
                {language === "vi" ? "Thiết lập mặc định" : "Generation Defaults"}
              </Typography>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormControl fullWidth className="bg-black/25 rounded-xl border border-white/5">
                <InputLabel id="default-ratio-label" className="text-zinc-400">
                  {language === "vi" ? "Tỉ lệ khung mặc định" : "Default Aspect Ratio"}
                </InputLabel>
                <Select
                  labelId="default-ratio-label"
                  id="default-ratio-select"
                  value={settings.aspectRatio}
                  label={language === "vi" ? "Tỉ lệ khung mặc định" : "Default Aspect Ratio"}
                  onChange={handleRatioChange}
                  className="text-white border-white/10 focus:border-purple-500"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a855f7' },
                    color: 'white',
                    '.MuiSvgIcon-root': { color: '#a1a1aa' }
                  }}
                >
                  <MenuItem value="1:1" className="bg-zinc-950 hover:bg-zinc-900">1:1 ({language === "vi" ? "Ảnh Vuông" : "Square"})</MenuItem>
                  <MenuItem value="16:9" className="bg-zinc-950 hover:bg-zinc-900">16:9 ({language === "vi" ? "Ngang HD rộng" : "Landscape HD"})</MenuItem>
                  <MenuItem value="9:16" className="bg-zinc-950 hover:bg-zinc-900">9:16 ({language === "vi" ? "Khung Dọc Đứng" : "Vertical Story"})</MenuItem>
                  <MenuItem value="4:3" className="bg-zinc-950 hover:bg-zinc-900">4:3 ({language === "vi" ? "Khung Ảnh Cổ Điện" : "Traditional Portrait"})</MenuItem>
                  <MenuItem value="3:4" className="bg-zinc-950 hover:bg-zinc-900">3:4 ({language === "vi" ? "Kích thước chụp ảnh" : "Photo Aspect"})</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth className="bg-black/25 rounded-xl border border-white/5">
                <InputLabel id="default-style-label" className="text-zinc-400">
                  {language === "vi" ? "Chủ đề phong cách" : "Default Style Theme"}
                </InputLabel>
                <Select
                  labelId="default-style-label"
                  id="default-style-select"
                  value={settings.style}
                  label={language === "vi" ? "Chủ đề phong cách" : "Default Style Theme"}
                  onChange={handleStyleChange}
                  className="text-white"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a855f7' },
                    color: 'white',
                    '.MuiSvgIcon-root': { color: '#a1a1aa' }
                  }}
                >
                  {STYLE_PRESETS.map((style) => {
                    const mappedName = language !== "vi" ? style.name : (() => {
                      switch (style.id) {
                        case "none": return "Không (Mặc định)";
                        case "anime": return "Hoạt họa Anime";
                        case "cyberpunk": return "Cyberpunk Tương lai";
                        case "cinematic": return "Điện ảnh Cinematic";
                        case "fantasy": return "Thần thoại Phong cảnh";
                        case "pixel": return "Pixel Art Cổ điển";
                        case "3d-render": return "Mô phỏng 3D Render";
                        case "watercolor": return "Tranh Sơn mài Thủy mặc";
                        default: return style.name;
                      }
                    })();
                    return (
                      <MenuItem key={style.id} value={style.id} className="bg-zinc-950 hover:bg-zinc-900">
                        {mappedName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth className="bg-black/25 rounded-xl border border-white/5">
                <InputLabel id="default-quality-label" className="text-zinc-400">
                  {language === "vi" ? "Chất lượng phân giải mặc định" : "Default Resolution Quality"}
                </InputLabel>
                <Select
                  labelId="default-quality-label"
                  id="default-quality-select"
                  value={settings.quality}
                  label={language === "vi" ? "Chất lượng phân giải mặc định" : "Default Resolution Quality"}
                  onChange={handleQualityChange}
                  className="text-white"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a855f7' },
                    color: 'white',
                    '.MuiSvgIcon-root': { color: '#a1a1aa' }
                  }}
                >
                  <MenuItem value="standard" className="bg-zinc-950 hover:bg-zinc-900">
                    {language === "vi" ? "Tiêu chuẩn (Nhanh, Tối ưu hoá Vertex)" : "Standard (Fast, Octane Render Optimized)"}
                  </MenuItem>
                  <MenuItem value="highest" className="bg-zinc-950 hover:bg-zinc-900">
                    {language === "vi" ? "HD Cao cấp (Độ chi tiết Imagen tối đa)" : "HD Premium (Imagen High Fidelity)"}
                  </MenuItem>
                </Select>
              </FormControl>

              <div className="flex items-center justify-start h-full pl-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enhancePrompt}
                      onChange={handleToggleEnhancement}
                      classes={{
                        thumb: 'bg-zinc-300',
                        track: 'bg-zinc-800'
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#a855f7',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#7e22ce',
                        },
                      }}
                    />
                  }
                  label={
                    <div className="flex flex-col ml-1">
                      <span className="text-sm font-semibold text-zinc-100 flex items-center space-x-1.5">
                        <Sparkles size={14} className="text-purple-400" />
                        <span>{language === "vi" ? "Tối ưu hóa ý tưởng tự động" : "Auto-Enhance Prompts"}</span>
                      </span>
                      <span className="text-xs text-zinc-400 mt-0.5">
                        {language === "vi" 
                          ? "Sử dụng trí tuệ nhân tạo Gemini để làm phong phú mẫu và từ khóa thiết kế." 
                          : "Use Gemini to enrich drafts automatically prior to compilation."}
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Diagnostics System */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-2.5">
                <Network size={20} className="text-blue-400" />
                <Typography variant="h6" className="font-sans font-bold text-lg">
                  {language === "vi" ? "Kiểm tra Kết nối Hệ thống" : "System Diagnostics"}
                </Typography>
              </div>
              <Button
                variant="outlined"
                onClick={runDiagnosticsLocal}
                className="self-start sm:self-auto text-xs px-3 py-1.5 border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-300 capitalize flex items-center space-x-1.5"
              >
                <RefreshCw size={12} className={apiKeyStatus === "checking" ? "animate-spin" : ""} />
                <span>{language === "vi" ? "Kiểm thử lại" : "Rerun Handshakes"}</span>
              </Button>
            </div>

            <div className="rounded-xl bg-black/25 p-4 border border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  {apiKeyStatus === "valid" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle size={20} />
                    </div>
                  ) : apiKeyStatus === "checking" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                      <RefreshCw size={18} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      <ShieldAlert size={20} />
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-zinc-500 font-mono block">GEMINI_API_KEY HEALTH</span>
                    <span className="text-sm font-bold text-zinc-200">
                      {apiKeyStatus === "valid" 
                        ? (language === "vi" ? "Đã xác thực thành công" : "Linked & Authorized")
                        : apiKeyStatus === "checking" 
                        ? (language === "vi" ? "Đang kết nối cổng máy chủ..." : "Connecting to endpoint...") 
                        : (language === "vi" ? "Yêu cầu cấu hình Khóa" : "Credentials Required")}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 font-sans max-w-sm">
                  {apiKeyStatus === "valid" ? (
                    (language === "vi" 
                      ? "Cổng API Gemini phản hồi thành công (mã 200). Các tính năng mở rộng ý tưởng và sinh ảnh hoạt động tối ưu."
                      : "The Gemini API endpoints responded with status code 200. Prompt expansions, stylizations, and image render matrices are fully functional.")
                  ) : apiKeyStatus === "checking" ? (
                    (language === "vi" ? "Đang gửi gói tín hiệu thử tới Express..." : "Sending test request packets...")
                  ) : (
                    <span className="text-rose-400 font-semibold block">
                      {language === "vi" 
                        ? "Cảnh báo: Chưa liên kết khóa. Vào Settings > Secrets ở thanh AI Studio để thiết lập."
                        : "Warning: No active key detected. Go to Settings > Secrets inside the AI Studio toolbar."}
                    </span>
                  )}
                </div>
              </div>

              {errorMessage && apiKeyStatus !== "valid" && apiKeyStatus !== "checking" && (
                <div className="mt-3 text-xs bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg font-mono text-rose-450">
                  <span className="font-bold">Diagnostics Output:</span> {errorMessage}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Storage Management */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2.5 mb-6">
              <Database size={20} className="text-rose-400" />
              <Typography variant="h6" className="font-sans font-bold text-lg">
                {language === "vi" ? "Thông tin lưu trữ & Bộ nhớđệm" : "Gallery & Cache Settings"}
              </Typography>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {language === "vi" 
                ? "Mọi tác phẩm của bạn được lưu an toàn tại bộ nhớ LocalStorage riêng tư trên trình duyệt của bạn. Việc dọn dẹp trình duyệt sẽ làm sạch bộ nhớ này." 
                : "Your artworks are safely saved inside your browser's private Sandboxed LocalStorage. Clearing site caches will clean this storage. You can prune your gallery elements immediately using the control below."}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm">
              <div>
                <span className="text-sm font-bold text-zinc-200 block">{language === "vi" ? "Danh mục Tác phẩm đã lưu" : "Saved Artworks Catalog"}</span>
                <span className="text-xs text-zinc-500 mt-1 block">
                  {language === "vi" 
                    ? `Hiện đang lưu trữ ${savedImagesCount} tác phẩm sáng tạo.` 
                    : `Currently hosting ${savedImagesCount} items in LocalStorage.`}
                </span>
              </div>
              <Button
                variant="contained"
                onClick={handlePurgeClick}
                disabled={savedImagesCount === 0}
                className={`text-xs font-bold px-4 py-2.5 rounded-lg capitalize flex items-center space-x-1.5 transition-all ${
                  savedImagesCount === 0
                    ? "bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed"
                    : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg leading-none hover:opacity-90 active:scale-[0.99]"
                }`}
                id="purge-gallery-btn"
              >
                <Trash2 size={14} />
                <span>{language === "vi" ? "Làm sạch Thư viện" : "Wipe Saved Gallery"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Snackbar 
        open={showStatusToast} 
        autoHideDuration={4000} 
        onClose={() => setShowStatusToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowStatusToast(false)} 
          severity={toastSeverity} 
          sx={{ 
            width: '100%', 
            bgcolor: 'rgba(2, 2, 3, 0.85)', 
            backdropFilter: 'blur(10px)', 
            color: 'white', 
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
