/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeneratedImage {
  id: string;
  url: string; // Base64 image data URL 'data:image/png;base64,...'
  prompt: string;
  originalPrompt: string;
  style: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  createdAt: string;
  isFavorite: boolean;
}

export interface GenerationSettings {
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  style: string;
  quality: string;
  enhancePrompt: boolean;
}

export type AppView = "home" | "generate" | "gallery" | "settings";

export interface StylePreset {
  id: string;
  name: string;
  promptAdditive: string;
  description: string;
  iconName: string;
}
