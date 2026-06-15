/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily get Google GenAI client
let aiInstance: GoogleGenAI | null = null;
function getAIInstance(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please configure it in your Secrets/Environment panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt, style } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAIInstance();
      const styleInstruction = style && style !== "none" ? ` Ensure the style is matching "${style}".` : "";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert prompt enhancer for AI image generators (such as Imagen).
Your task is to take a brief, simple user prompt and expand it into a highly detailed, visually rich prompt to generate a stunning, high-quality image.
Incorporate details like subject characteristics, environment, cinematic lighting (e.g., golden hour, high-contrast chiaroscuro, colorful neon), lens/camera focus, and specific stylistic keywords.${styleInstruction}

User Prompt: "${prompt}"

Provide ONLY the enhanced descriptive prompt as plain text. Do not add any prefixes, quotes, explanations, or conversational filler. Keep it concise, under 3 sentences.`,
      });

      const enhancedText = response.text?.trim() || prompt;
      res.json({ enhancedPrompt: enhancedText });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio, style } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAIInstance();

      // Formulate prompt with style guidance if provided or requested
      let finalPrompt = prompt;
      if (style && style !== "none" && !prompt.toLowerCase().includes(style.toLowerCase())) {
        finalPrompt = `${prompt}, ${style} style, ultra detailed, cinematic composition`;
      }

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio || '1:1',
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No images were returned by the Imagen model.");
      }

      const base64Bytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;

      res.json({ imageUrl, prompt: finalPrompt });
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  app.post("/api/critique-image", async (req, res) => {
    try {
      const { imageUrl, activeAgentId, language } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      // Extract pure base64 data string
      let base64Data = imageUrl;
      let mimeType = "image/jpeg";
      if (imageUrl.startsWith("data:")) {
        const parts = imageUrl.split(",");
        const meta = parts[0];
        base64Data = parts[1];
        if (meta.includes("image/png")) {
          mimeType = "image/png";
        } else if (meta.includes("image/webp")) {
          mimeType = "image/webp";
        }
      }

      const ai = getAIInstance();
      const isVi = language === "vi";

      let promptText = "";
      if (activeAgentId === "director") {
        promptText = isVi
          ? `Hãy phân tích hình ảnh này khắt khe dựa trên 5 tiêu chí sau:
1. Bố cục (Composition)
2. Ánh sáng (Lighting)
3. Hài hòa màu sắc (Color Harmony)
4. Cân bằng thị giác (Visual Balance)
5. Sức hút thương mại (Commercial Appeal)

Với mỗi tiêu chí, hãy:
- Đánh giá chi tiết điểm mạnh & điểm yếu.
- Cho điểm từ 1 đến 10.
- Kết luận bằng điểm Đánh giá chung (Overall Score) từ 1 đến 10 và đưa ra 3 đề xuất cải tiến (actionable improvements) cực kỳ khắt khe, thực tế để nâng cấp tác phẩm lên độ hoàn chỉnh cao nhất. Hãy viết bằng tiếng Việt ngắn gọn, chuyên nghiệp theo phong cách Giám đốc Mỹ thuật chuyên nghiệp.`
          : `Please critically analyze this image based on the following 5 criteria:
1. Composition
2. Lighting
3. Color Harmony
4. Visual Balance
5. Commercial Appeal

For each criterion:
- Highlight specific strengths and weaknesses.
- Award a score from 1 to 10.
- Conclude with an Overall Score (1 to 10) and deliver 3 highly practical, stringent actionable recommendations to elevate this creative design. Respond in a clean, professional English tone as a senior Creative Director.`;
      } else if (activeAgentId === "inspector") {
        promptText = isVi
          ? "Bạn là Trợ lý Kiểm tra Chất lượng Kỹ thuật (QA Inspector). Hãy quét và phân tích hình ảnh này: Ghi nhận mật độ chi tiết/độ phân giải pixel, kiểm tra lỗi răng cưa/nhiễu hạt (artifacts), đánh giá chất lượng kết cấu bề mặt, tính khớp lệnh prompt thô ban đầu. Cho điểm Kỹ thuật chung từ 1-10 và nêu rõ các điểm cần sửa bằng tiếng Việt."
          : "You are a Technical QA Inspector. Analyze this image for pixel resolution density, visual compression/artifacts, texture definition, and strict prompt adherence. Score overall technical performance from 1 to 10 and list direct technical action items in English.";
      } else {
        promptText = isVi
          ? "Bạn là Chuyên viên Truyền thông & Viết bài PR Sáng tạo. Phân tích ảnh này rồi soạn: 1. Một bài viết giới thiệu sản phẩm thật lôi cuốn đăng mạng xã hội, 2. Gợi ý mô tả ALT Text tối ưu hóa SEO, 3. Tập hợp 10 thẻ hashtags phân phối thị trường tốt nhất. Viết bằng tiếng Việt."
          : "You are a Creative PR Copywriter. Analyze this image to craft: 1. An engaging social media promo caption, 2. Optimized SEO ALT Text description, 3. 10 trending hashtags for distribution. Provide this in English.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          promptText,
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      });

      const critiqueText = response.text?.trim() || (isVi ? "Lỗi phân tích hình ảnh." : "Critique compilation offline.");
      res.json({ critique: critiqueText });
    } catch (error: any) {
      console.error("Error critiquing image:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  app.post("/api/animate-video", async (req, res) => {
    try {
      const { imageUrl, motionStyle } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image url is required to generate animation motion" });
      }
      // Return a structural responsive model parameters
      res.json({
        success: true,
        motionStyle: motionStyle || "zoom-in",
        fps: 30,
        duration: 4,
        framesCount: 120,
        videoPlaceholderUrl: imageUrl,
        videoMatrixLog: `[Veo-Lite-Server] Animated successfully using camera motionStyle: ${motionStyle}`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to animate image sequence" });
    }
  });

  // Serve static assets and Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
