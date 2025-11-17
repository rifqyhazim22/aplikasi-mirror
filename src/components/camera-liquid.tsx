"use client";

import { useEffect, useRef, useState } from "react";

const moodMap = [
  { label: "Energi penuh ⚡️", emoji: "⚡️", description: "Cahaya terang, ekspresi bersemangat" },
  { label: "Seimbang 🙂", emoji: "🙂", description: "Pencahayaan stabil, ekspresi netral" },
  { label: "Kontemplatif 🤔", emoji: "🤔", description: "Sedikit redup, ekspresi fokus" },
  { label: "Butuh istirahat 😴", emoji: "😴", description: "Sangat redup, ekspresi kelelahan" },
];

type MoodInfo = {
  label: string;
  emoji: string;
  description: string;
  confidence: number;
};

const defaultMood: MoodInfo = {
  label: "Memulai ritual",
  emoji: "👀",
  description: "Kamera siap membaca ekspresi",
  confidence: 0,
};

export function CameraLiquidWidget({ compact = false }: { compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [mood, setMood] = useState<MoodInfo>(defaultMood);

  useEffect(() => {
    let stream: MediaStream;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermission("granted");
      } catch (error) {
        console.error(error);
        setPermission("denied");
      }
    };
    init();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height).data;
      let total = 0;
      const step = 4 * 4;
      for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        total += (r + g + b) / 3;
      }
      const avg = total / (data.length / step);
      let nextMood = moodMap[1];
      if (avg >= 190) nextMood = moodMap[0];
      else if (avg >= 130) nextMood = moodMap[1];
      else if (avg >= 90) nextMood = moodMap[2];
      else nextMood = moodMap[3];
      setMood({ ...nextMood, confidence: Math.min(100, Math.round((avg / 255) * 100)) });
    }, 2500);
    return () => clearInterval(interval);
  }, [permission]);

  return (
    <div className={`liquid-card ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70">Scanner kamera (demo)</p>
          <span className="text-2xl">{mood.emoji}</span>
        </div>
        <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-[32px] border border-white/20 bg-white/5">
          {permission === "granted" ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-white/60">
              {permission === "denied"
                ? "Izin kamera ditolak. Buka ulang halaman ini dan berikan izin."
                : "Meminta izin kamera..."}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
          <p className="font-semibold text-white">{mood.label}</p>
          <p className="text-xs text-white/60">{mood.description}</p>
          {permission === "granted" && (
            <p className="mt-2 text-xs text-white/50">Brightness index: {mood.confidence}%</p>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
