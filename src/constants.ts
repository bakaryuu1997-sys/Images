/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StylePreset } from "./types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "none",
    name: "Standard / Raw Prompt",
    promptAdditive: "",
    description: "Follows your prompt exactly without additive-style keywords.",
    iconName: "Sparkles",
  },
  {
    id: "photorealistic",
    name: "Cinematic Photorealistic",
    promptAdditive: "Cinematic photograph, 35mm camera, realistic textures, volumetric lighting, rich range of shadows, sharp focus, award-winning composition",
    description: "Ultra-realistic texture, lens effects, and cinematic movie-grade lighting.",
    iconName: "Camera",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Digital Art",
    promptAdditive: "Futuristic cyberpunk environment, glowing neon lights, holographic billboards, dark moody alleys, wet asphalt reflections, hyper-detailed tech",
    description: "Vibrant neon, high-tech accents, and dark futuristic atmospheres.",
    iconName: "Zap",
  },
  {
    id: "anime",
    name: "Aesthetic Anime Concept",
    promptAdditive: "Modern anime studio key visual, gorgeous skies, cell-shaded detail, clean linework, vibrant pastel color palettes, Kyoto Animation style",
    description: "Clean lines, hand-painted skies, and cinematic anime composition.",
    iconName: "Image",
  },
  {
    id: "pixel",
    name: "Retro Pixel Art",
    promptAdditive: "16-bit vintage retro pixel art style, detailed shading, vibrant limited color palette, nostalgic game mockup, clean pixel grid",
    description: "Nostalgic indie-game style pixel precision with full depth.",
    iconName: "Grid",
  },
  {
    id: "watercolor",
    name: "Whimsical Watercolor",
    promptAdditive: "Delicate watercolor painting, textured cold-press paper, wet-on-wet flows, elegant pastel pigments, ink wash accents, hand-drawn",
    description: "Flowing pigments, soft textures, and whimsical artistic strokes.",
    iconName: "Paintbrush",
  },
  {
    id: "3d_chibi",
    name: "Cute 3D Character",
    promptAdditive: "Chibi 3D character, stylized toy aesthetic, octane render, soft clay textures, warm cozy studio rim lighting, cute proportions",
    description: "Friendly, soft render, cute character design ideal for avatars.",
    iconName: "Smile",
  },
  {
    id: "synthwave",
    name: "Retro-Synthwave",
    promptAdditive: "1980s synthwave neon wireframe grid landscape, retro-futurism sunset, glowing vector grids, magenta and cyan color palette, VHS glare",
    description: "Outrun aesthetic, vector grids, chrome sunsets, and retro-futuristic vibes.",
    iconName: "Tv",
  },
];

export const INSPIRATION_PROMPTS = [
  "An astronaut riding a glowing Lavender mechanical horse in deep space, under soft starry nebulas",
  "A cozy minimalist wooden glass cabin tucked deep under towering pine trees during the autumn peak, morning fog",
  "A futuristic steampunk pocket-watch sitting on a detailed work table, intricate details, glowing gears",
  "A golden cute baby phoenix sleeping curled inside a soft wooden nest, fantasy digital art, warm core glow",
  "An ancient library with high arched walls, dusty floating spellbooks, cosmic celestial spirits orbiting near a stained glass dome",
  "A majestic neon-accented whale gliding slowly through dense cyberpunk sky clouds, holographic rain reflections below",
  "A mischievous gray kitten dressed in a warm tiny knitted yellow wizard hat, sitting next to a steaming crystal ball",
  "A lush terrarium inside a spherical crystal vial, containing a complete miniature glowing magical rainforest with tiny waterfalls"
];
