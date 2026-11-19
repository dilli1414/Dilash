import { useEffect, useRef } from "react";
import type { VoiceConnectionStatus } from "../hooks/useLiveVoice";
import { computeAnalyserLevel } from "../utils/audio";

interface AcousticCanvasProps {
  status: VoiceConnectionStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  inputAnalyserRef: React.RefObject<AnalyserNode | null>;
  outputAnalyserRef: React.RefObject<AnalyserNode | null>;
}

const BAR_COUNT = 29;

export function AcousticCanvas({
  status,
  isSpeaking,
  isMuted,
  inputAnalyserRef,
  outputAnalyserRef,
}: AcousticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedLevelRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(240, rect.width);
      const height = Math.max(160, rect.height);

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const outputLevel = computeAnalyserLevel(outputAnalyserRef.current);
      const inputLevel = isMuted ? 0 : computeAnalyserLevel(inputAnalyserRef.current);
      const targetLevel =
        status === "connected"
          ? Math.max(outputLevel, inputLevel * 0.85)
          : status === "connecting"
            ? 0.14
            : 0;

      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.16;
      const level = smoothedLevelRef.current;

      if (!prefersReducedMotion) {
        phaseRef.current += isSpeaking ? 0.085 : status === "connected" ? 0.045 : 0.015;
      }
      const phase = phaseRef.current;

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.31;

      // Subtle concentric architectural hairline rings
      const rings = [1, 1.24, 1.48];
      rings.forEach((scale, index) => {
        const pulse =
          status === "idle"
            ? 0
            : level * (10 + index * 7) + Math.sin(phase + index * 0.9) * (status === "connecting" ? 2.5 : 1.5);
        const radius = baseRadius * scale + pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(12, radius), 0, Math.PI * 2);
        const alpha =
          status === "idle"
            ? 0.1 - index * 0.025
            : isSpeaking
              ? 0.24 - index * 0.06 + level * 0.14
              : 0.16 - index * 0.04 + level * 0.1;
        ctx.strokeStyle = `rgba(24, 24, 27, ${Math.max(0.03, alpha).toFixed(3)})`;
        ctx.lineWidth = index === 0 ? 1.15 : 0.85;
        ctx.stroke();
      });

      // Central precision harmonic ticks
      const spanWidth = Math.min(width * 0.56, 196);
      const step = spanWidth / (BAR_COUNT - 1);
      const startX = cx - spanWidth / 2;
      const centerIndex = (BAR_COUNT - 1) / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const distFromCenter = Math.abs(i - centerIndex) / centerIndex;
        const envelope = Math.cos(distFromCenter * Math.PI * 0.5);
        const wave = Math.sin(phase * 1.4 + i * 0.42) * 0.5 + 0.5;
        const secondaryWave = Math.cos(phase * 0.9 - i * 0.28) * 0.5 + 0.5;

        const restHeight = 3 + envelope * 5;
        const dynamicHeight =
          status === "idle"
            ? restHeight
            : status === "connecting"
              ? restHeight + envelope * (6 + wave * 8)
              : restHeight + envelope * (6 + level * 46 * (0.45 + 0.55 * wave * secondaryWave));

        const x = startX + i * step;
        const halfH = dynamicHeight / 2;

        ctx.beginPath();
        ctx.moveTo(x, cy - halfH);
        ctx.lineTo(x, cy + halfH);
        ctx.lineCap = "round";
        ctx.lineWidth = 1.65;

        const barAlpha =
          status === "idle"
            ? 0.22 + envelope * 0.22
            : isSpeaking
              ? 0.35 + envelope * 0.62
              : 0.28 + envelope * 0.48;
        ctx.strokeStyle = `rgba(24, 24, 27, ${barAlpha.toFixed(3)})`;
        ctx.stroke();
      }

      ctx.restore();
      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frameId);
  }, [inputAnalyserRef, isMuted, isSpeaking, outputAnalyserRef, status]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full h-48 sm:h-52 block select-none"
    />
  );
}
