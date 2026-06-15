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
