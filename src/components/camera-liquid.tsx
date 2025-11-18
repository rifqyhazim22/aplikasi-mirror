"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { mapAverageToEmotion } from "@/lib/emotion";

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

const emotionCopy: Record<string, { emoji: string; text: string }> = {
  happy: { emoji: "😊", text: "Terlihat ceria, cocok untuk afirmasi positif!" },
  surprised: { emoji: "😮", text: "Ada energi tinggi, ajak tarik napas dulu." },
  neutral: { emoji: "🙂", text: "Ekspresi seimbang, siap lanjut cerita." },
  tired: { emoji: "🥱", text: "Butuh grounding lembut sebelum chat." },
  sad: { emoji: "😢", text: "Sampaikan empati ekstra saat memulai." },
  angry: { emoji: "😡", text: "Gunakan nada menenangkan + CBT singkat." },
};

export function CameraLiquidWidget({ compact = false }: { compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [mood, setMood] = useState<MoodInfo>(defaultMood);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    let stream: MediaStream;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        tf.setBackend("webgl");
        await tf.ready();
        modelRef.current = await blazeface.load();
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
    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const model = modelRef.current;
      if (!video || !canvas || !model) return;
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      const predictions = await model.estimateFaces(video, false);
      let faceBox = null;
      if (predictions.length > 0 && predictions[0].topLeft && predictions[0].bottomRight) {
        const [x1, y1] = predictions[0].topLeft as [number, number];
        const [x2, y2] = predictions[0].bottomRight as [number, number];
        faceBox = { x1, y1, x2, y2 };
        setBox({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
      } else {
        setBox(null);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);
      let imageData;
      if (faceBox) {
        const boxW = faceBox.x2 - faceBox.x1;
        const boxH = faceBox.y2 - faceBox.y1;
        imageData = ctx.getImageData(faceBox.x1, faceBox.y1, boxW, boxH);
      } else {
        imageData = ctx.getImageData(0, 0, width, height);
      }
      const data = imageData.data;
      let total = 0;
      const step = 4 * 8;
      for (let i = 0; i < data.length; i += step) {
        total += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avg = total / (data.length / step);
      const emotion = mapAverageToEmotion(avg);
      const copy = emotionCopy[emotion.value];
      setMood({
        label: emotion.value.toUpperCase(),
        emoji: copy.emoji,
        description: copy.text,
        confidence: Math.round(emotion.confidence * 100),
      });
      const now = Date.now();
      if (now - lastSentRef.current > 10000) {
        lastSentRef.current = now;
        fetch("/api/emotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotion: emotion.value,
            confidence: Math.round(emotion.confidence * 100),
          }),
        }).catch((err) => console.error("emotion log", err));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [permission]);

  return (
    <div className={`liquid-card ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70">Scanner kamera (demo)</p>
          <span className="text-2xl">{mood.emoji}</span>
        </div>
        <div className="relative mx-auto h-72 w-72 max-w-full overflow-hidden rounded-[48px] border border-white/20 bg-white/5 shadow-2xl">
          {permission === "granted" ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {box && (
                <span
                  className="absolute border-2 border-cyan-300/70"
                  style={{
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    width: `${box.w}px`,
                    height: `${box.h}px`,
                  }}
                />
              )}
            </>
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
            <p className="mt-2 text-xs text-white/50">Confidence ~{mood.confidence}%</p>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
