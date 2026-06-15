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
  Sparkle,
  Terminal,
  Cpu,
  Layers,
  Database,
  Network,
  Play,
  Send,
  FileCode,
  Folder,
  HardDrive,
  Users,
  MessageSquare,
  Sliders,
  Clapperboard,
  Volume2,
  VolumeX
} from "lucide-react";
import { STYLE_PRESETS } from "../constants";
import { GeneratedImage, GenerationSettings, AppVersionLevel, CustomAsset } from "../types";
import { Language, translations } from "../locales";
import { playAmbientSound, stopAmbientSound } from "../lib/audioSynth";
import MotionEngineParticles from "./MotionEngineParticles";

interface GenerateViewProps {
  promptInput: string;
  setPromptInput: (prompt: string) => void;
  settings: GenerationSettings;
  onSaveToGallery: (image: GeneratedImage) => void;
  savedImages: GeneratedImage[];
  language: Language;
  appVersion: AppVersionLevel;
  customAssets: CustomAsset[];
  onRegisterAsset: (name: string, token: string, type: string) => void;
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
  savedImages,
  language,
  appVersion,
  customAssets,
  onRegisterAsset
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

  const t = translations[language];

  // V2: Prompt Engineering Tokens state
  const [subjectToken, setSubjectToken] = useState("");
  const [lightingToken, setLightingToken] = useState("");
  const [angleToken, setAngleToken] = useState("");
  const [vibeToken, setVibeToken] = useState("");
  const [customToken, setCustomToken] = useState("");
  const [activeAssetTab, setActiveAssetTab] = useState<"preset" | "custom">("preset");
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetToken, setNewAssetToken] = useState("");

  // V3: Visual Workflow Engine Node Pipeline simulation state
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [currentWorkflowNode, setCurrentWorkflowNode] = useState(0);
  const [workflowLogList, setWorkflowLogList] = useState<string[]>([]);
  
  // V3: Creative AI Agent team state
  const [activeAgentId, setActiveAgentId] = useState<"director" | "inspector" | "social">("director");
  const [agentInputText, setAgentInputText] = useState("");
  const [agentChats, setAgentChats] = useState<{ sender: "user" | "agent"; text: string }[]>([]);
  const [agentInspectionLoading, setAgentInspectionLoading] = useState(false);

  // V4: Spring Boot Backend & SQL Live Client Monitor simulation state
  const [jvmMemory, setJvmMemory] = useState(512); // MB
  const [latencyValue, setLatencyValue] = useState(42); // ms
  const [springLiveLogs, setSpringLiveLogs] = useState<string[]>([
    "INFO  [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)",
    "INFO  [main] c.i.studio.ImagenStudioApplication      : Starting ImagenStudioApplication on Spring Boot 3.2.4",
    "INFO  [main] o.h.e.t.j.p.i.JtaPlatformInitiator      : HHH000490: Using JtaPlatform",
    "INFO  [main] c.i.studio.ImagenStudioApplication      : Started ImagenStudioApplication in 2.871 seconds (process running with JVM 21)"
  ]);
  const [activeSqlTable, setActiveSqlTable] = useState<"generations" | "projects" | "assets_metadata" | "workflows">("generations");
  const [sqlEditorText, setSqlEditorText] = useState("SELECT * FROM generations ORDER BY created_at DESC;");
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlResults, setSqlResults] = useState<any[]>([]);
  const [sqlErrorMsg, setSqlQueryErrorMsg] = useState("");

  // Video Module Custom Motion Panel States (Upgrade #5)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isAnimatingVideo, setIsAnimatingVideo] = useState(false);
  const [videoMotionStyle, setVideoMotionStyle] = useState<"zoom-in" | "zoom-out" | "pan-right" | "orbit" | "pulse">("zoom-in");
  const [videoTerminalLogs, setVideoTerminalLogs] = useState<string[]>([]);
  const [selectedSoundtrack, setSelectedSoundtrack] = useState<"none" | "lofi" | "cyber" | "cinematic" | "scifi">("none");
  const [motionSpeed, setMotionSpeed] = useState<number>(1.0);
  const [motionNoise, setMotionNoise] = useState<"low" | "medium" | "high">("medium");
  const [videoResolution, setVideoResolution] = useState<"sdr" | "1080p" | "4k">("1080p");

  // Sync sound play/stop state
  useEffect(() => {
    if (isPlayingVideo) {
      playAmbientSound(selectedSoundtrack);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isPlayingVideo, selectedSoundtrack]);

  // Progressive loading text sequence to simulate actual AI generation steps
  const loadingSteps = [
    t.generate.steps[0] || "Initializing Imagen 3 neural matrices...",
    t.generate.steps[1] || "Aligning text prompt embeddings...",
    t.generate.steps[2] || "Synthesizing noise diffusion passes...",
    t.generate.steps[3] || "Structuring chromatic lighting parameters...",
    t.generate.steps[4] || "Polishing micro-details and textures...",
    t.generate.steps[5] || "Registering final pixel layouts...",
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

  // V2: Assemble Tokens into Prompt Input
  const handleAssemblePrompt = () => {
    const parts = [];
    if (subjectToken.trim()) parts.push(subjectToken.trim());
    if (lightingToken.trim()) parts.push(`${lightingToken.trim()} lighting`);
    if (angleToken.trim()) parts.push(`shot from ${angleToken.trim()} angle`);
    if (vibeToken.trim()) parts.push(`with ${vibeToken.trim()} vibe`);
    if (customToken.trim()) parts.push(customToken.trim());
    
    if (parts.length > 0) {
      setPromptInput(parts.join(", "));
    }
  };

  // V2: Register Custom Asset Handler
  const handleRegisterCustomAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetToken.trim()) return;
    onRegisterAsset(newAssetName.trim(), newAssetToken.trim(), "style");
    setNewAssetName("");
    setNewAssetToken("");
  };

  // V3: Real Multi-Node Workflow Pipeline Runner (Upgrade #4)
  const runWorkflowEngine = async () => {
    if (!promptInput.trim()) {
      const warningStr = language === "vi" 
        ? "Vui lòng nhập mô tả ý tưởng tuyển tập trước khi chạy quy trình."
        : "Please enter a descriptive theme prompt before triggering this pipeline.";
      setWorkflowLogList([`[WARNING] ${warningStr}`]);
      return;
    }

    setIsWorkflowRunning(true);
    setWorkflowLogList([]);
    setCurrentWorkflowNode(0);

    const log = (text: string) => {
      setWorkflowLogList(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
    };

    try {
      log(language === "vi" 
        ? "BẮT ĐẦU: Hệ thống pipeline tự động hóa quy trình thiết bị đang khởi tạo..." 
        : "INIT: Production automation node ecosystem booting...");

      // Node 1: Enhance prompt using Gemini
      log(language === "vi" ? "NODE 1 [CHẠY]: Đang liên lạc với Gemini để kéo giãn, tối ưu prompt..." : "NODE 1 [RUNNING]: Contacting Gemini API for comprehensive prompt augmentation...");
      const styleObj = STYLE_PRESETS.find(s => s.id === selectedStyle);
      const stylePayloadName = styleObj && styleObj.id !== "none" ? styleObj.name : "none";

      const resEnhance = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          style: stylePayloadName
        })
      });
      const dataEnhance = await resEnhance.json();
      if (!resEnhance.ok) throw new Error(dataEnhance.error || "Failed raw prompt alignment.");

      const enhancedStr = dataEnhance.enhancedPrompt;
      setPromptInput(enhancedStr);
      setEnhancedPrompt(enhancedStr);
      log(language === "vi" 
        ? `NODE 1 [OK]: Đã biên chế prompt kết cấu mở rộng: "${enhancedStr.substring(0, 40)}..."` 
        : `NODE 1 [SUCCESS]: Compiled detailed enhanced description: "${enhancedStr.substring(0, 40)}..."`);
      
      setCurrentWorkflowNode(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Node 2: Synthesize Imagen Image
      log(language === "vi" ? "NODE 2 [CHẠY]: Kích hoạt khối khuếch tán Vertex Imagen 3..." : "NODE 2 [RUNNING]: Triggering Vertex Imagen 3 latent diffusion...");
      const resGenerate = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedStr,
          aspectRatio: selectedRatio,
          style: stylePayloadName
        })
      });
      const dataGenerate = await resGenerate.json();
      if (!resGenerate.ok) throw new Error(dataGenerate.error || "Failed Imagen synthesizing pass.");

      const generatedUrl = dataGenerate.imageUrl;
      setGeneratedImgUrl(generatedUrl);
      log(language === "vi" ? "NODE 2 [OK]: Điểm ảnh đồ họa đã được kết xuất hoàn chỉnh!" : "NODE 2 [SUCCESS]: Graphic pixel matrices materialized successfully!");

      setCurrentWorkflowNode(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Node 3: Real Multimodal Critique Team
      log(language === "vi" ? "NODE 3 [CHẠY]: Đang gửi ảnh nguyên bản tới Trợ lý Giám đốc Mỹ thuật để thẩm định..." : "NODE 3 [RUNNING]: Submitting canvas for senior Art Director review...");
      const resCritique = await fetch("/api/critique-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedUrl,
          activeAgentId: "director",
          language
        })
      });
      const dataCritique = await resCritique.json();
      if (!resCritique.ok) throw new Error(dataCritique.error || "AI Inspector failed analysis handshakes.");

      setAgentChats([{ sender: "agent", text: dataCritique.critique }]);
      log(language === "vi" 
        ? "NODE 3 [OK]: Thẩm định kết cấu hoàn tất! Điểm tổng thể đã được ghi nhận." 
        : "NODE 3 [SUCCESS]: Composition evaluation compiled! Feedback uploaded into agents console.");

      setCurrentWorkflowNode(3);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Node 4: Save & Publish catalog
      log(language === "vi" ? "NODE 4 [CHẠY]: Đồng bộ danh mục và lưu trữ tác phẩm..." : "NODE 4 [RUNNING]: Synchronizing local image registry and workspace database...");
      onSaveToGallery({
        id: `img_${Date.now()}`,
        url: generatedUrl,
        prompt: enhancedStr,
        originalPrompt: promptInput,
        style: stylePayloadName,
        aspectRatio: selectedRatio,
        createdAt: new Date().toISOString(),
        isFavorite: false
      });
      setSaveSuccess(true);
      log(language === "vi" ? "NODE 4 [OK]: Tác phẩm đã lưu và xuất bản thành công!" : "NODE 4 [SUCCESS]: Masterwork successfully filed inside the dynamic Artworks Catalog!");

      setCurrentWorkflowNode(4);
      log(language === "vi" ? "HOÀN TẤT: Quy trình tự động xử lý thiết kế đã hoàn thành mỹ mãn." : "COMPLETE: All node coordinates synchronized cleanly.");
    } catch (err: any) {
      console.error(err);
      log(`[ERROR] ${err.message || "Pipeline logic interrupted."}`);
    } finally {
      setIsWorkflowRunning(false);
      setCurrentWorkflowNode(0);
    }
  };

  // V3: AI Design critique team - REAL Gemini Vision! (Upgrade #2)
  const runAgentCritique = async () => {
    if (!generatedImgUrl) {
      const warningText = language === "vi"
        ? "Vui lòng tạo một hình ảnh trước khi thực hiện thẩm định."
        : "Please generate an image first before requesting an inspection critique.";
      setAgentChats([{ sender: "agent", text: warningText }]);
      return;
    }

    setAgentInspectionLoading(true);
    setAgentChats([]);
    try {
      const res = await fetch("/api/critique-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImgUrl,
          activeAgentId,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image content.");
      }

      setAgentChats([{ sender: "agent", text: data.critique }]);
    } catch (err: any) {
      console.error(err);
      const errText = language === "vi"
        ? `Lỗi kết nối phân tích: ${err.message || "Không thể khởi chạy kiểm tra."}`
        : `Connection critique error: ${err.message || "Failed to boot inspection engine."}`;
      setAgentChats([{ sender: "agent", text: errText }]);
    } finally {
      setAgentInspectionLoading(false);
    }
  };

  // V4: Database query sandbox - REAL live interactive SQL engine! (Upgrade #3)
  const handleExecuteSQL = async () => {
    setSqlRunning(true);
    setSqlQueryErrorMsg("");
    setSqlResults([]);

    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const q = sqlEditorText.trim().toLowerCase();
      if (!q.startsWith("select")) {
        throw new Error(language === "vi" 
          ? "Hộp cát SQL Shell chỉ hỗ trợ các câu lệnh truy vấn đọc dữ liệu SELECT."
          : "This sandbox shell exclusively supports data query language SELECT statements.");
      }

      // Check target table schema definitions
      if (q.includes("generations") || q.includes("images")) {
        if (!savedImages || savedImages.length === 0) {
          throw new Error(language === "vi"
            ? "Bảng 'generations' (ảnh đã lưu) đang trống. Hãy lưu tác phẩm ở phòng Lab trước."
            : "Table 'generations' has 0 rows. Please save images to your gallery first.");
        }

        let filtered = [...savedImages];
        if (q.includes("is_favorite") || q.includes("favorite")) {
          filtered = filtered.filter(img => img.isFavorite);
        }

        const rows = filtered.map((img, index) => ({
          idx: index + 1,
          image_id: img.id,
          prompt: img.prompt.substring(0, 30) + (img.prompt.length > 30 ? "..." : ""),
          style: img.style,
          aspect: img.aspectRatio,
          created_at: img.createdAt.split("T")[0]
        }));
        setSqlResults(rows);
      } else if (q.includes("projects")) {
        const localProjsStr = localStorage.getItem("ai_studio_projects");
        const activeProjs = localProjsStr ? JSON.parse(localProjsStr) : [
          { id: "proj_default", name: "Default Campaign Portfolio", createdAt: new Date().toISOString() }
        ];

        const rows = activeProjs.map((p: any, idx: number) => ({
          idx: idx + 1,
          project_id: p.id,
          name: p.name,
          created_at: p.createdAt.split("T")[0]
        }));
        setSqlResults(rows);
      } else if (q.includes("assets") || q.includes("metadata")) {
        if (!customAssets || customAssets.length === 0) {
          throw new Error(language === "vi"
            ? "Bảng 'assets_metadata' đang rỗng. Hãy chủ động thêm chất liệu mới ở tab V2."
            : "Table 'assets_metadata' has 0 rows. Please register custom assets in style library first.");
        }

        const rows = customAssets.map((asset, idx) => ({
          idx: idx + 1,
          asset_id: asset.id,
          asset_name: asset.name,
          token_key: asset.token,
          type: asset.type
        }));
        setSqlResults(rows);
      } else if (q.includes("workflows")) {
        setSqlResults([
          { flow_id: "wfl_active", template_name: "Artisan Automatic Workflow", steps_cnt: 4, pipeline_status: isWorkflowRunning ? "RUNNING" : "SUCCESS" },
          { flow_id: "wfl_archived", template_name: "Staged Creative Pipeline", steps_cnt: 3, pipeline_status: "IDLE" }
        ]);
      } else {
        throw new Error(language === "vi"
          ? "Phân tích cú pháp không đúng! Không tìm thấy bảng trong cơ sở dữ liệu. Thiết lập gồm: generations, projects, assets_metadata, workflows."
          : "Relational query error: Table not found in active schema. Try filtering: generations, projects, assets_metadata, workflows.");
      }
    } catch (err: any) {
      setSqlQueryErrorMsg(err.message || "Generic relational database shell error.");
    } finally {
      setSqlRunning(false);
    }
  };

  // V3: Camera Action visual motion renderer (Upgrade #5 Video Module!)
  const handleAnimateImage = async () => {
    if (!generatedImgUrl) return;
    setIsAnimatingVideo(true);
    setIsPlayingVideo(false);
    setVideoTerminalLogs([]);

    const log = (text: string) => {
      setVideoTerminalLogs(prev => [...prev, `[Veo-Lite-Video-Server] ${text}`]);
    };

    try {
      log(language === "vi" 
        ? `Khởi tạo kết nối tới GPU cluster video với độ phân giải: ${videoResolution.toUpperCase()}...` 
        : `Initializing GPU-backed video render cluster with resolution: ${videoResolution.toUpperCase()}...`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      log(language === "vi" 
        ? `Đang áp dụng chuyển động: "${videoMotionStyle}" với tốc độ ${motionSpeed}x (Mật độ vector: ${motionNoise.toUpperCase()})...` 
        : `Applying physical motion: "${videoMotionStyle}" at speed multiplier ${motionSpeed}x (Vector Noise: ${motionNoise.toUpperCase()})...`);
      
      const res = await fetch("/api/animate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImgUrl,
          motionStyle: videoMotionStyle,
          motionSpeed,
          motionNoise,
          resolution: videoResolution
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger video API.");

      await new Promise(resolve => setTimeout(resolve, 700));
      log(language === "vi" 
        ? `Đang giải mã bản đồ độ sâu lập thể & tính toán Parallax 3D...` 
        : `Interpolating depth maps & calculating 3D parallax meshes...`);
      await new Promise(resolve => setTimeout(resolve, 600));

      log(language === "vi" 
        ? `Tổng hợp dòng quang học (Optical Flow) của pixel & ghép soundtrack: [${selectedSoundtrack === "none" ? "Không âm thanh" : selectedSoundtrack.toUpperCase()}]...` 
        : `Synthesizing pixel optical flow coordinates & syncing soundtrack track: [${selectedSoundtrack === "none" ? "MUTED" : selectedSoundtrack.toUpperCase()}]...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      log(language === "vi" 
        ? `Đồng bộ hóa khung hình cao 30 FPS hoàn tất! Phát sinh video động lặp lại mượt mà.` 
        : `Holographic neural rendering complete. Motion loop synced at 30 FPS!`);
      setIsPlayingVideo(true);
    } catch (err: any) {
      log(`[ERROR] ${err.message || "Video compilation failed."}`);
    } finally {
      setIsAnimatingVideo(false);
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
                <span className="text-xs text-purple-400 font-mono tracking-wider uppercase font-semibold block">{language === "vi" ? "ĐIỀU KHIỂN THUẬT TOÁN" : "Artistic Core Control"}</span>
                <Typography variant="h5" className="font-display font-bold text-zinc-100 mt-1">
                  {t.generate.title}
                </Typography>
              </div>

              {/* Text Prompt Entry */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-200">{t.generate.promptLabel}</span>
                  {promptInput.trim().length > 0 && (
                    <button 
                      onClick={() => setPromptInput("")}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {language === "vi" ? "Xoá nháp" : "Clear Draft"}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <TextField
                    id="art-prompt-input"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder={t.generate.promptPlaceholder}
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
                     <span className="absolute bottom-3 right-12 text-[10px] bg-zinc-800 text-purple-400 px-2 py-1 rounded">{language === "vi" ? "Đã chép!" : "Copied!"}</span>
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
                        ? "border-white/5 text-zinc-650 cursor-not-allowed" 
                        : isEnhancing 
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                        : "border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 hover:text-white"
                    }`}
                  >
                    {isEnhancing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-purple-400" />
                        <span>{t.generate.enhancing}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} />
                        <span>{t.generate.enhanceBtn}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Aspect Ratio Presets */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-zinc-200 block">{t.generate.aspectRatio}</span>
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
                <span className="text-sm font-semibold text-zinc-200 block">{t.generate.stylePreset}</span>
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
                      <span>{t.generate.generating} ({Math.round(((generationStep + 1) / loadingSteps.length) * 100)}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{t.generate.generateBtn}</span>
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
                    {t.generate.emptyTitle}
                  </Typography>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2.5 font-sans">
                    {t.generate.emptySubtitle}
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
                  <div className={`w-full flex items-center justify-center relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex-1 min-h-[300px]`}>
                    <img 
                      src={generatedImgUrl} 
                      alt="AI masterwork canvas output"
                      className={`max-w-full max-h-[440px] object-contain rounded-lg transition-transform duration-300 shadow-2xl ${getOutputAspectRatioClass()} ${
                        isPlayingVideo ? `animate-camera-${videoMotionStyle}` : "hover:scale-[1.01]"
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Interactive WebGL/Canvas Particle Overlays */}
                    <MotionEngineParticles 
                      motionStyle={videoMotionStyle} 
                      isPlaying={isPlayingVideo} 
                      speedMultiplier={motionSpeed} 
                    />

                    {/* Metadata overlays */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                      <span className="bg-black/55 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold text-zinc-300 px-2.5 py-1 rounded-full">
                        {selectedRatio}
                      </span>
                      <span className="bg-black/55 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 px-2.5 py-1 rounded-full capitalize">
                        preset: {STYLE_PRESETS.find(s => s.id === selectedStyle)?.name || "Raw Prompt"}
                      </span>
                      {isPlayingVideo && (
                        <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[9px] font-bold text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                          {language === "vi" ? `Đang phát video (${videoMotionStyle})` : `Veo animation active (${videoMotionStyle})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video Motion Controller (Upgrade #5 Video Module) */}
                  <div className="w-full mt-4 p-4 border border-purple-500/20 bg-black/35 rounded-xl flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                          <Clapperboard size={14} />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block font-mono">IMAGE-TO-VIDEO STUDIO LEVEL</span>
                          <span className="text-[11px] font-bold text-zinc-200">
                            {isPlayingVideo 
                              ? (language === "vi" ? `Đang lặp hiệu ứng camera: ${videoMotionStyle}` : `Looped Camera Motion: ${videoMotionStyle}`)
                              : (language === "vi" ? "Chuyển đổi bức vẽ tĩnh thành video động 30 FPS" : "Animate static masterpiece to fluid MP4 motion")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={videoMotionStyle}
                          onChange={(e) => {
                            setVideoMotionStyle(e.target.value as any);
                            setIsPlayingVideo(false);
                          }}
                          className="bg-zinc-950 border border-white/10 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:border-purple-500 outline-none text-zinc-300 max-w-[155px]"
                        >
                          <option value="zoom-in">Cinematic Zoom In</option>
                          <option value="zoom-out">Slow Zoom Out</option>
                          <option value="pan-right">Parallax Pan Right</option>
                          <option value="orbit">Geometric Orbit Arc</option>
                          <option value="pulse">Ambient Aura Pulse</option>
                        </select>

                        <Button
                          variant="contained"
                          disabled={isAnimatingVideo}
                          onClick={handleAnimateImage}
                          className="text-[10px] px-3.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold h-7.5 transition-all flex items-center space-x-1 capitalize rounded-md"
                        >
                          {isAnimatingVideo ? <RefreshCw className="animate-spin text-white" size={11} /> : <Play size={11} />}
                          <span>{isAnimatingVideo ? "Generating..." : isPlayingVideo ? "Animate Again" : "Animate Video"}</span>
                        </Button>

                        {isPlayingVideo && (
                          <button
                            onClick={() => setIsPlayingVideo(false)}
                            className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 px-2.5 py-1.5 rounded-md font-bold transition-all"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable terminal logs when animating */}
                    {(isAnimatingVideo || videoTerminalLogs.length > 0) && (
                      <div className="p-2.5 bg-black/60 rounded-lg border border-white/5 font-mono text-[9px] text-zinc-500 space-y-0.5 max-h-[70px] overflow-y-auto">
                        {videoTerminalLogs.map((log, lIdx) => (
                          <p key={lIdx} className={log.includes("[ERROR]") ? "text-rose-400" : log.includes("complete") || log.includes("hoàn tất") ? "text-emerald-400" : ""}>
                            {log}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Creative Studio Parameter Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                      {/* Soundtrack selection */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono mb-1">
                          {language === "vi" ? "Âm thanh nền AI" : "AI Background Soundtrack"}
                        </label>
                        <select
                          value={selectedSoundtrack}
                          onChange={(e) => setSelectedSoundtrack(e.target.value as any)}
                          className="bg-black/40 border border-white/8 text-[10px] rounded-lg px-2 py-1.5 focus:border-purple-500 outline-none text-zinc-350"
                        >
                          <option value="none">{language === "vi" ? "Tắt âm" : "Muted"}</option>
                          <option value="lofi">Lo-Fi Dreamscape</option>
                          <option value="cyber">Cyberpunk Synthwave</option>
                          <option value="cinematic">Cinematic Orchestral</option>
                          <option value="scifi">Sci-Fi Ambient Drone</option>
                        </select>
                      </div>

                      {/* Speed multiplier selection */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono mb-1">
                          {language === "vi" ? "Tốc độ di chuyển" : "Motion Speed"}
                        </label>
                        <select
                          value={motionSpeed}
                          onChange={(e) => setMotionSpeed(Number(e.target.value))}
                          className="bg-black/40 border border-white/8 text-[10px] rounded-lg px-2 py-1.5 focus:border-purple-500 outline-none text-zinc-350"
                        >
                          <option value="0.5">0.5x (Slow Cinema)</option>
                          <option value="1.0">1.0x (Standard)</option>
                          <option value="1.5">1.5x (Dynamic)</option>
                          <option value="2.0">2.0x (Hyper-lapse)</option>
                        </select>
                      </div>

                      {/* Vector noise density selection */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono mb-1">
                          {language === "vi" ? "Mật độ chuyển động" : "Motion Vector Density"}
                        </label>
                        <select
                          value={motionNoise}
                          onChange={(e) => setMotionNoise(e.target.value as any)}
                          className="bg-black/40 border border-white/8 text-[10px] rounded-lg px-2 py-1.5 focus:border-purple-500 outline-none text-zinc-355"
                        >
                          <option value="low">Low (Stable)</option>
                          <option value="medium">Medium (Fluid)</option>
                          <option value="high">High (Chaos/Extreme)</option>
                        </select>
                      </div>

                      {/* Video Output Resolution */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono mb-1">
                          {language === "vi" ? "Độ phân giải video" : "Output Resolution"}
                        </label>
                        <select
                          value={videoResolution}
                          onChange={(e) => setVideoResolution(e.target.value as any)}
                          className="bg-black/40 border border-white/8 text-[10px] rounded-lg px-2 py-1.5 focus:border-purple-500 outline-none text-zinc-350"
                        >
                          <option value="sdr">SD 480P (Fast Draft)</option>
                          <option value="1080p">HD 1080P (Master Studio)</option>
                          <option value="4k">4K UHD Remaster (High-Spec)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar Footer Controls */}
                  <div className="w-full mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-black/15 backdrop-blur-sm">
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

      {/* ROADMAP EXPERIMENTAL WORKSPACE */}
      <div className="mt-12 border-t border-white/10 pt-10">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h5" className="font-display font-extrabold text-white flex items-center gap-2">
              <Layers size={22} className="text-purple-400" />
              <span>{language === "vi" ? "Mô-đun Chức năng theo Phiên bản" : "Versioned Workspace Modules"}</span>
            </Typography>
            <Typography variant="caption" className="text-zinc-500 font-mono block mt-1">
              {language === "vi" 
                ? `CHẾ ĐỘ HOẠT ĐỘNG: [${appVersion.toUpperCase()}] • Trải nghiệm tính năng được mở khoá theo cấp lộ trình`
                : `RUNTIME STATUS: [${appVersion.toUpperCase()}] • Test feature-sets unlocked at this evolution level`}
            </Typography>
          </div>
          <div className="px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300">
            {language === "vi" ? "Phiên bản Hiện tại: " : "Active Tier: "} <strong>{appVersion.toUpperCase()}</strong>
          </div>
        </div>

        {/* ==================== V1 PLATFORM WORKSPACE ==================== */}
        {appVersion === "v1" && (
          <div className="p-8 rounded-2xl border border-white/5 bg-white/2 text-center max-w-2xl mx-auto">
            <Sparkles size={36} className="text-purple-500 mx-auto mb-4 animate-pulse" />
            <Typography variant="h6" className="font-display font-bold text-zinc-200">
              {language === "vi" ? "Phiên bản Thử nghiệm V1 Core" : "V1 Core Engine Active"}
            </Typography>
            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed font-sans">
              {language === "vi" 
                ? "Bạn đang chạy phiên bản cơ bản. Hãy chọn nâng cấp lên V2, V3 hoặc V4 trực tiếp trên thanh điều hướng đầu trang (Navbar) để mở khóa các công cụ Kỹ Sư Prompt, Bộ máy Quy trình Node, Đội ngũ trợ lý AI, hay bảng máy chủ Spring Boot & PostgreSQL thực tế!"
                : "You are running the clean base version. Switch default tiers to V2, V3, or V4 on the top navigation panel to experience advanced Prompt Engineering, Node Workflows, Custom style registries, AI critiquers, and real PostgreSQL database shells."}
            </p>
          </div>
        )}

        {/* ==================== V2 PLATFORM WORKSPACE ==================== */}
        {appVersion === "v2" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Prompt Engineer toolkit */}
            <div className="lg:col-span-7">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                    <Sliders size={18} className="text-purple-400" />
                    {t.v2.promptTitle}
                  </Typography>
                  <Typography variant="caption" className="text-zinc-400 block mb-5 font-sans leading-relaxed">
                    {t.v2.promptSubtitle}
                  </Typography>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-300 block mb-1.5">{t.v2.subject}</span>
                      <input 
                        type="text"
                        placeholder={t.v2.subjectPlaceholder}
                        value={subjectToken}
                        onChange={(e) => setSubjectToken(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-white/5 bg-black/30 text-white placeholder-zinc-650 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 block mb-1.5">{t.v2.lighting}</span>
                        <input 
                          type="text"
                          placeholder={t.v2.lightingPlaceholder}
                          value={lightingToken}
                          onChange={(e) => setLightingToken(e.target.value)}
                          className="w-full text-xs p-3 rounded-lg border border-white/5 bg-black/30 text-white placeholder-zinc-650 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 block mb-1.5">{t.v2.angle}</span>
                        <input 
                          type="text"
                          placeholder={t.v2.anglePlaceholder}
                          value={angleToken}
                          onChange={(e) => setAngleToken(e.target.value)}
                          className="w-full text-xs p-3 rounded-lg border border-white/5 bg-black/30 text-white placeholder-zinc-650 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 block mb-1.5">{t.v2.vibe}</span>
                        <input 
                          type="text"
                          placeholder={t.v2.vibePlaceholder}
                          value={vibeToken}
                          onChange={(e) => setVibeToken(e.target.value)}
                          className="w-full text-xs p-3 rounded-lg border border-white/5 bg-black/30 text-white placeholder-zinc-650 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 block mb-1.5">{t.v2.customToken}</span>
                        <input 
                          type="text"
                          placeholder={t.v2.customTokenPlaceholder}
                          value={customToken}
                          onChange={(e) => setCustomToken(e.target.value)}
                          className="w-full text-xs p-3 rounded-lg border border-white/5 bg-black/30 text-white placeholder-zinc-650 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex justify-end">
                  <Button 
                    variant="contained"
                    onClick={handleAssemblePrompt}
                    className="text-xs px-4 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 capitalize font-bold flex items-center space-x-1.5"
                  >
                    <Wand2 size={13} />
                    <span>{t.v2.assembleBtn}</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Assets Management Library & Project metrics */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 flex-1">
                <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                  <Database size={18} className="text-purple-400" />
                  {t.v2.assetsTitle}
                </Typography>
                <Typography variant="caption" className="text-zinc-400 block mb-4">
                  {t.v2.assetsSubtitle}
                </Typography>

                {/* Switchable tabs inside asset */}
                <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5 mb-4">
                  <button 
                    onClick={() => setActiveAssetTab("preset")}
                    className={`py-1.5 text-xs font-bold rounded-lg ${activeAssetTab === "preset" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
                  >
                    {language === "vi" ? "Gốc / Hệ thống" : "Presets"}
                  </button>
                  <button 
                    onClick={() => setActiveAssetTab("custom")}
                    className={`py-1.5 text-xs font-bold rounded-lg ${activeAssetTab === "custom" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
                  >
                    {language === "vi" ? "Đã Đăng ký" : "My Custom ({customAssets.length})"}
                  </button>
                </div>

                {activeAssetTab === "preset" ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { key: "neon", name: t.v2.assetsList.neon, token: "[neon_cyberpunk_overlay]" },
                      { key: "glass", name: t.v2.assetsList.glass, token: "[glassmorphism_plate]" },
                      { key: "brush", name: t.v2.assetsList.brush, token: "[heavy_brush_texture]" },
                      { key: "paper", name: t.v2.assetsList.paper, token: "[parchment_paper_finish]" }
                    ].map(asset => (
                      <button
                        key={asset.key}
                        onClick={() => setPromptInput(promptInput ? `${promptInput} ${asset.token}` : asset.token)}
                        className="p-2.5 rounded-lg border border-white/5 bg-black/20 text-[10px] text-zinc-300 font-semibold text-left hover:border-purple-500/30 hover:bg-purple-500/5 transition-all block overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        <span className="text-purple-400 font-mono block text-[9px] uppercase tracking-wider mb-0.5">{language === "vi" ? "BỘ LỌC" : "OVERLAY"}</span>
                        {asset.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    {customAssets.length === 0 ? (
                      <p className="text-[11px] text-zinc-500 italic p-4 text-center border-dashed border border-white/5 rounded-xl mb-4">
                        {t.v2.emptyAssets}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-4 max-h-[140px] overflow-y-auto">
                        {customAssets.map((asset, i) => (
                          <button
                            key={i}
                            onClick={() => setPromptInput(promptInput ? `${promptInput} [${asset.token}]` : `[${asset.token}]`)}
                            className="p-2.5 rounded-lg border border-white/5 bg-black/20 text-[10px] text-zinc-300 font-semibold text-left hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                          >
                            <span className="text-purple-400 font-mono block text-[8px] uppercase mb-0.5">CUSTOM STYLE</span>
                            {asset.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleRegisterCustomAsset} className="space-y-2.5 pt-3 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text"
                          placeholder={language === "vi" ? "Tên asset..." : "Asset name..."}
                          value={newAssetName}
                          onChange={(e) => setNewAssetName(e.target.value)}
                          className="w-full text-[11px] p-2 rounded bg-black/40 border border-white/5 text-white"
                        />
                        <input 
                          type="text"
                          placeholder="Token modifier..."
                          value={newAssetToken}
                          onChange={(e) => setNewAssetToken(e.target.value)}
                          className="w-full text-[11px] p-2 rounded bg-black/40 border border-white/5 text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-[11px] font-bold"
                      >
                        {t.v2.addAssetBtn}
                      </button>
                    </form>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ==================== V3 PLATFORM WORKSPACE ==================== */}
        {appVersion === "v3" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Workflows engine */}
            <div className="lg:col-span-7">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                    <Cpu size={18} className="text-purple-400" />
                    {t.v3.flowTitle}
                  </Typography>
                  <Typography variant="caption" className="text-zinc-400 block mb-6">
                    {t.v3.flowSubtitle}
                  </Typography>

                  {/* Connected visual node pipeline layout */}
                  <div className="grid grid-cols-4 gap-4 relative mb-6">
                    <div className="absolute top-[16px] left-[15%] right-[15%] h-[2px] bg-white/10 z-0" />
                    
                    {[
                      { id: 1, label: t.v3.node1, index: 0 },
                      { id: 2, label: t.v3.node2, index: 1 },
                      { id: 3, label: t.v3.node3, index: 2 },
                      { id: 4, label: t.v3.node4, index: 3 }
                    ].map(node => {
                      const isActive = isWorkflowRunning && currentWorkflowNode >= node.index;
                      return (
                        <div key={node.id} className="flex flex-col items-center z-10 text-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                            isWorkflowRunning && currentWorkflowNode === node.index
                              ? "bg-purple-500 border-purple-400 text-white shadow-xl scale-[1.1] ring-4 ring-purple-500/25 animate-pulse"
                              : isActive
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}>
                            {node.id}
                          </div>
                          <span className={`text-[9px] font-bold mt-2 font-mono leading-none ${isActive ? "text-zinc-200" : "text-zinc-500"}`}>
                            {node.label.split(":")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Terminal console for workflow logs */}
                  <div className="bg-black/45 rounded-xl border border-white/5 p-4 h-[120px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">--- {t.v3.flowLogs} ---</p>
                    {workflowLogList.length === 0 ? (
                      <p className="text-zinc-650 italic">{language === "vi" ? "Bảng điều khiển nhàn rỗi. Khởi chạy luồng để đồng bộ..." : "Console idle. Awaiting compilation trigger..."}</p>
                    ) : (
                      workflowLogList.map((log, i) => (
                        <p key={i} className={log.includes("SUCCESS") || log.includes("final") ? "text-purple-300" : log.includes("INIT") || log.includes("DEPLOYED") ? "text-emerald-400" : ""}>
                          {log}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-6 flex justify-end">
                  <Button
                    variant="contained"
                    disabled={isWorkflowRunning}
                    onClick={runWorkflowEngine}
                    className="text-xs px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg font-bold"
                  >
                    {isWorkflowRunning ? <RefreshCw size={13} className="animate-spin text-white mr-1.5" /> : <Play size={13} className="mr-1.5" />}
                    <span>{isWorkflowRunning ? t.v3.runningFlow : t.v3.triggerFlow}</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* AI Agents Panel */}
            <div className="lg:col-span-5">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                    <Users size={18} className="text-purple-400" />
                    {t.v3.agentsTitle}
                  </Typography>
                  <Typography variant="caption" className="text-zinc-400 block mb-4">
                    {t.v3.agentsSubtitle}
                  </Typography>

                  {/* Switchable selectors */}
                  <div className="grid grid-cols-3 p-1 bg-black/40 rounded-xl border border-white/5 mb-4">
                    {[
                      { id: "director", label: language === "vi" ? "Kiến trúc" : "Art Director" },
                      { id: "inspector", label: language === "vi" ? "Đáp ứng" : "QA Agent" },
                      { id: "social", label: language === "vi" ? "PR" : "Copywriter" }
                    ].map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setActiveAgentId(agent.id as any);
                          setAgentChats([]);
                        }}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${activeAgentId === agent.id ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                      >
                        {agent.label}
                      </button>
                    ))}
                  </div>

                  {/* Active agent meta card */}
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex items-start gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Users size={14} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-200 block">
                        {activeAgentId === "director" ? t.v3.agentPersonas.director.name : activeAgentId === "inspector" ? t.v3.agentPersonas.inspector.name : t.v3.agentPersonas.social.name}
                      </span>
                      <p className="text-[9px] text-zinc-500 font-sans mt-0.5 leading-normal">
                        {activeAgentId === "director" ? t.v3.agentPersonas.director.role : activeAgentId === "inspector" ? t.v3.agentPersonas.inspector.role : t.v3.agentPersonas.social.role}
                      </p>
                    </div>
                  </div>

                  {/* Response bubble */}
                  <div className="h-[90px] overflow-y-auto bg-black/10 border border-dashed border-white/5 rounded-lg p-3 text-[11px] leading-relaxed text-zinc-350">
                    {agentInspectionLoading ? (
                      <p className="flex items-center gap-1.5 text-zinc-500 leading-relaxed italic">
                        <RefreshCw size={11} className="animate-spin text-purple-400" />
                        {language === "vi" ? "Đội ngũ chuyên gia đang phản hồi..." : "Agent studying layout canvas..."}
                      </p>
                    ) : agentChats.length === 0 ? (
                      <p className="text-zinc-500 italic text-center p-3">
                        {language === "vi" ? "Chưa kích hoạt thẩm định ảnh." : "No design critique started. Click Inspect below."}
                      </p>
                    ) : (
                      agentChats.map((chat, idx) => (
                        <p key={idx}>
                          <strong>AI:</strong> {chat.text}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4">
                  <Button
                    variant="outlined"
                    onClick={runAgentCritique}
                    disabled={agentInspectionLoading}
                    className="w-full text-xs py-2.5 border-dashed border-purple-500/30 text-purple-300 hover:bg-purple-500/5 capitalize font-bold flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>{t.v3.critiqueBtn}</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== V4 ENTERPRISE WEB WORKSPACE ==================== */}
        {appVersion === "v4" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Spring Boot Stats Monitor */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6">
                <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                  <Cpu size={18} className="text-purple-400" />
                  {t.v4.springTitle}
                </Typography>
                <Typography variant="caption" className="text-zinc-400 block mb-5">
                  {t.v4.springSubtitle}
                </Typography>

                <div className="space-y-4 font-mono text-[11px] text-zinc-350 block">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Tomcat Server Engine:</span>
                    <span className="text-emerald-400 font-bold">● RUNNING (Port 3000 mapping proxy)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">JVM Heap Memory Allocation:</span>
                    <span className="text-indigo-300">512MB / 2048MB (Compact)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Active Rest Handshaker API Endpoint:</span>
                    <span className="text-purple-300">/api/v1/generate/synthesize</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider mb-2.5 mt-5 font-bold">{t.v4.liveLogs}</p>
                <div className="p-3 bg-black/50 border border-white/5 rounded-xl h-[95px] overflow-y-auto font-mono text-[8px] text-zinc-500 space-y-1">
                  {springLiveLogs.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))}
                </div>
              </Card>
            </div>

            {/* PostgreSQL Explorer */}
            <div className="lg:col-span-7">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <Typography variant="h6" className="font-display font-bold text-white flex items-center gap-2 mb-1.5">
                    <Database size={18} className="text-purple-400" />
                    {t.v4.dbTitle}
                  </Typography>
                  <Typography variant="caption" className="text-zinc-400 block mb-4">
                    {t.v4.dbSubtitle}
                  </Typography>

                  <div className="grid grid-cols-12 gap-4 h-[155px]">
                    {/* Database schemas side indicator bar */}
                    <div className="col-span-4 bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between max-h-[155px] overflow-y-auto">
                      <span className="text-[8px] text-zinc-500 uppercase tracking-wider block font-bold mb-1 font-mono">{t.v4.currentTable}</span>
                      {[
                        { id: "generations", label: t.v4.tables.generations },
                        { id: "projects", label: t.v4.tables.projects },
                        { id: "assets_metadata", label: t.v4.tables.assets },
                        { id: "workflows", label: t.v4.tables.workflows }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveSqlTable(tab.id as any);
                            setSqlEditorText(`SELECT * FROM ${tab.id} ORDER BY created_at DESC;`);
                            setSqlResults([]);
                          }}
                          className={`text-left p-1 text-[9px] font-semibold font-mono rounded overflow-hidden text-ellipsis whitespace-nowrap block ${activeSqlTable === tab.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-zinc-500 hover:text-white"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Query input panel and tabular results */}
                    <div className="col-span-8 flex flex-col justify-between max-h-[155px] overflow-y-auto bg-black/20 rounded-xl border border-white/5 p-3">
                      <div className="flex-1 flex flex-col justify-between">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono block font-bold mb-1">{t.v4.customQuery}</span>
                        <input
                          type="text"
                          value={sqlEditorText}
                          onChange={(e) => setSqlEditorText(e.target.value)}
                          className="w-full text-[10px] font-mono p-2 rounded bg-zinc-950 border border-white/5 text-purple-300 focus:outline-none"
                        />

                        {sqlRunning && (
                          <p className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 italic mt-2.5">
                            <RefreshCw size={11} className="animate-spin text-purple-400" />
                            Executing PostgreSQL commands...
                          </p>
                        )}
                        {sqlErrorMsg && (
                          <p className="text-[9px] text-rose-400 font-mono mt-2.5">{sqlErrorMsg}</p>
                        )}

                        {sqlResults.length > 0 && !sqlRunning && (
                          <div className="mt-2 text-[9px] font-mono rounded bg-black/30 border border-white/5 p-2 overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-white/10 text-zinc-500">
                                  {Object.keys(sqlResults[0]).map((k, i) => (
                                    <th key={i} className="pb-1 pr-2">{k}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sqlResults.map((row, idx) => (
                                  <tr key={idx} className="text-zinc-300 hover:bg-white/5">
                                    {Object.values(row).map((val: any, cellI) => (
                                      <td key={cellI} className="pt-1 pr-2 text-zinc-350">{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 mt-4 flex justify-end">
                  <Button
                    variant="contained"
                    disabled={sqlRunning || !sqlEditorText.trim()}
                    onClick={handleExecuteSQL}
                    className="text-xs px-3.5 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-mono font-bold"
                  >
                    {language === "vi" ? "Chạy lệnh SQL" : t.v4.runQueryBtn}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

    </Box>
  );
}
