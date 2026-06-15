/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";

interface MotionEngineParticlesProps {
  motionStyle: "zoom-in" | "zoom-out" | "pan-right" | "orbit" | "pulse";
  isPlaying: boolean;
  speedMultiplier?: number;
}

export default function MotionEngineParticles({ 
  motionStyle, 
  isPlaying, 
  speedMultiplier = 1.0 
}: MotionEngineParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 500);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth || 500;
        height = canvas.height = canvas.offsetHeight || 500;
      }
    };
    window.addEventListener("resize", handleResize);

    // Particle object blueprint
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
      angle?: number;
      orbitSpeed?: number;
      orbitRadius?: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.size = Math.random() * 2 + 1;
        this.maxLife = Math.random() * 120 + 60;
        this.life = this.maxLife;
        this.alpha = Math.random() * 0.6 + 0.1;
        
        if (motionStyle === "zoom-in") {
          // Radiating out from center
          this.x = width / 2;
          this.y = height / 2;
          const a = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 1.5 + 0.8) * speedMultiplier;
          this.vx = Math.cos(a) * speed;
          this.vy = Math.sin(a) * speed;
          this.color = Math.random() > 0.5 ? "168, 85, 247" : "34, 211, 238"; // Purple neon / cyan sparkles
        } else if (motionStyle === "zoom-out") {
          // Inward target from boundaries
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * (width / 2) + 50;
          this.x = width / 2 + Math.cos(a) * r;
          this.y = height / 2 + Math.sin(a) * r;
          const speed = -(Math.random() * 0.8 + 0.4) * speedMultiplier;
          this.vx = Math.cos(a) * speed;
          this.vy = Math.sin(a) * speed;
          this.color = "244, 63, 94"; // rose gold
        } else if (motionStyle === "pan-right") {
          // Continuous streaming horizontal stars
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() * 1.8 + 1.2) * speedMultiplier;
          this.vy = (Math.random() * 0.3 - 0.15) * speedMultiplier;
          this.color = "250, 204, 21"; // solar system golden dust
        } else if (motionStyle === "orbit") {
          // Geometric ring rotation
          this.angle = Math.random() * Math.PI * 2;
          this.orbitRadius = Math.random() * (Math.min(width, height) * 0.4) + 20;
          this.orbitSpeed = (Math.random() * 0.012 + 0.004) * speedMultiplier;
          this.x = width / 2 + Math.cos(this.angle) * this.orbitRadius;
          this.y = height / 2 + Math.sin(this.angle) * this.orbitRadius;
          this.vx = 0;
          this.vy = 0;
          this.color = "56, 189, 248"; // hyper electric blue
        } else {
          // pulse: soft hovering organic clouds
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() * 0.3 - 0.15) * speedMultiplier;
          this.vy = -(Math.random() * 0.6 + 0.3) * speedMultiplier;
          this.color = "16, 185, 129"; // matrix aura green
        }
      }

      update() {
        this.life--;
        if (this.life <= 0) {
          this.reset();
          return;
        }

        if (motionStyle === "orbit" && this.angle !== undefined && this.orbitRadius !== undefined && this.orbitSpeed !== undefined) {
          this.angle += this.orbitSpeed;
          this.x = width / 2 + Math.cos(this.angle) * this.orbitRadius;
          this.y = height / 2 + Math.sin(this.angle) * this.orbitRadius;
        } else {
          this.x += this.vx;
          this.y += this.vy;
        }
        
        this.alpha = (this.life / this.maxLife) * 0.65;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        c.shadowBlur = motionStyle === "pulse" ? 10 : 5;
        c.shadowColor = `rgba(${this.color}, ${this.alpha})`;
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        c.fill();
        c.restore();
      }
    }

    const particlePoolSize = 75;
    const particles = Array.from({ length: particlePoolSize }, () => new Particle());

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Organic low brightness ambient background pulse
      if (motionStyle === "pulse") {
        const pulse = Math.sin(Date.now() / 800) * 0.05 + 0.06;
        ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Add architectural guidelines (Rule: Architectural Honesty, stylized creative canvas borders)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Corner outlines
      ctx.strokeStyle = "rgba(147, 51, 234, 0.25)";
      ctx.lineWidth = 2;
      const corner = 20;
      // top-left
      ctx.beginPath(); ctx.moveTo(corner, 8); ctx.lineTo(8, 8); ctx.lineTo(8, corner); ctx.stroke();
      // top-right
      ctx.beginPath(); ctx.moveTo(width - corner, 8); ctx.lineTo(width - 8, 8); ctx.lineTo(8, corner); // wait, fixed typing error here
      ctx.stroke();
      // Corrected top-right
      ctx.beginPath(); ctx.moveTo(width - corner, 8); ctx.lineTo(width - 8, 8); ctx.lineTo(width - 8, corner); ctx.stroke();
      // bottom-left
      ctx.beginPath(); ctx.moveTo(corner, height - 8); ctx.lineTo(8, height - 8); ctx.lineTo(8, height - corner); ctx.stroke();
      // bottom-right
      ctx.beginPath(); ctx.moveTo(width - corner, height - 8); ctx.lineTo(width - 8, height - 8); ctx.lineTo(width - 8, height - corner); ctx.stroke();

      // Update and render particles
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, motionStyle, speedMultiplier]);

  if (!isPlaying) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen"
    />
  );
}
