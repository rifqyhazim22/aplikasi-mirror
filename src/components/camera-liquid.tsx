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

const emotionCopy: Record<string, { emoji: string; text: string }> = {
  happy: { emoji: "😊", text: "Terlihat ceria, cocok untuk afirmasi positif!" },
  surprised: { emoji: "😮", text: "Ada energi tinggi, ajak tarik napas dulu." },
  neutral: { emoji: "🙂", text: "Ekspresi seimbang, siap lanjut cerita." },
  tired: { emoji: "🥱", text: "Butuh grounding lembut sebelum chat." },
  sad: { emoji: "😢", text: "Sampaikan empati ekstra saat memulai." },
  angry: { emoji: "😡", text: "Gunakan nada menenangkan + CBT singkat." },
};

const statusCopy: Record<
  "idle" | "granted" | "denied",
  { label: string; detail: string; color: string }
> = {
  idle: {
    label: "Meminta izin kamera",
    detail: "Mirror perlu akses kamera depan untuk membaca ekspresi seperti demo lama.",
    color: "text-white",
  },
  granted: {
    label: "Menganalisis micro-expression",
    detail: "TensorFlow Lite mendeteksi bounding box lalu Mirror menyederhanakannya jadi bucket emosi.",
    color: "text-emerald-300",
  },
  denied: {
    label: "Izin ditolak",
    detail: "Tanpa kamera Mirror hanya mengandalkan mood teks. Refresh dan beri izin jika ingin demo penuh.",
    color: "text-rose-300",
  },
};

const defaultMood: MoodInfo = {
  label: "Memulai ritual",
  emoji: "👀",
  description: "Kamera siap membaca ekspresi",
  confidence: 0,
};

type WidgetVariant = "full" | "compact";

export function CameraLiquidWidget({ variant = "full" }: { variant?: WidgetVariant }) {
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

  const frameHeight = variant === "full" ? "h-[26rem]" : "h-72";
  const padding = variant === "full" ? "p-8" : "p-5";
  const statusTone = statusCopy[permission];

  return (
    <div className={`liquid-card ${padding} space-y-5`}>
      <div className="flex flex-col gap-2">
        <p className="emoji-heading">Mirror Cam</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-white">
            Kolom kamera + computer vision
          </h3>
          <span className="mirror-pill px-4 py-1 text-xs text-white/70">
            Realtime CV demo
          </span>
        </div>
        <p className="text-sm text-white/70">
          Bidikan kamera diperbesar seperti versi lama sehingga pengguna merasa sedang menatap cermin
          digital. Mirror hanya membaca micro-expression & cahaya, tidak menyimpan foto apa pun. Jelaskan
          hal ini saat demo supaya tester merasa aman. ✨
        </p>
      </div>
      <div className={`camera-frame relative ${frameHeight} w-full`}>
        {permission === "granted" ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {box && (
              <div
                className="pointer-events-none absolute rounded-3xl border-2 border-cyan-200/80 shadow-[0_0_40px_rgba(51,255,216,0.4)]"
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.w}px`,
                  height: `${box.h}px`,
                }}
              />
            )}
            <div className="pointer-events-none absolute left-6 top-6 flex flex-col text-xs text-white/80">
              <span className="text-sm font-semibold text-white">Mirror Vision</span>
              <span className="text-white/70">
                {mood.label} · {mood.confidence}% yakin
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-4xl">{permission === "denied" ? "🚫" : "🪞"}</span>
            <p className="text-lg font-semibold text-white">
              {permission === "denied" ? "Mirror butuh izin kamera" : "Memanggil cermin digital"}
            </p>
            <p className="text-sm text-white/70">
              {permission === "denied"
                ? "Aktifkan kamera lewat ikon di browser, lalu refresh halaman untuk menyalakan scanner."
                : "Tahan satu detik. Mirror sedang menyelaraskan cahaya & fokus sebelum menampilkan feed."}
            </p>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Status</p>
          <p className={`mt-2 text-lg font-semibold ${statusTone.color}`}>{statusTone.label}</p>
          <p className="text-xs text-white/60">{statusTone.detail}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Mood bucket</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">
            <span>{mood.emoji}</span> {mood.label}
          </p>
          <p className="text-xs text-white/60">{mood.description}</p>
          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300"
              style={{ width: `${Math.min(Math.max(mood.confidence, 5), 100)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-white/50">
            {permission === "granted" ? `${mood.confidence}% confidence` : "Menunggu kamera"}
          </p>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
