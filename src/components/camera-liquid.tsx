"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import type * as FaceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { mapAverageToEmotion } from "@/lib/emotion";
import type { SensorMetrics, VisionSignal, ExpressionScore } from "@/types/vision";
import { broadcastVisionSignal } from "@/lib/vision-channel";

type MoodInfo = {
  label: string;
  emoji: string;
  description: string;
  confidence: number;
};

type PermissionState = "idle" | "granted" | "denied" | "paused";

const emotionCopy: Record<string, { emoji: string; text: string }> = {
  happy: { emoji: "😊", text: "Terlihat ceria, cocok untuk afirmasi positif!" },
  surprised: { emoji: "😮", text: "Ada energi tinggi, ajak tarik napas dulu." },
  neutral: { emoji: "🙂", text: "Ekspresi seimbang, siap lanjut cerita." },
  tired: { emoji: "🥱", text: "Butuh grounding lembut sebelum chat." },
  sad: { emoji: "😢", text: "Sampaikan empati ekstra saat memulai." },
  angry: { emoji: "😡", text: "Gunakan nada menenangkan + CBT singkat." },
};

const statusCopy: Record<PermissionState, { label: string; detail: string; color: string }> = {
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
  paused: {
    label: "Kamera dinonaktifkan",
    detail: "Aktifkan kembali kamera jika ingin memperlihatkan computer vision Mirror.",
    color: "text-white/70",
  },
};

const defaultMood: MoodInfo = {
  label: "Memulai ritual",
  emoji: "👀",
  description: "Kamera siap membaca ekspresi",
  confidence: 0,
};

type WidgetVariant = "full" | "compact";

type FaceBox = { x1: number; y1: number; x2: number; y2: number };

const defaultMetrics: SensorMetrics = {
  valence: 0,
  energy: 0.5,
  tension: 0.3,
  focus: 0.5,
  tilt: null,
  cues: [],
  attention: null,
  headPose: null,
  expressions: [],
};

type FaceMeshModule = typeof import("@tensorflow-models/face-landmarks-detection");

export function CameraLiquidWidget({
  variant = "full",
  profileId = null,
  onVisionSignal,
}: {
  variant?: WidgetVariant;
  profileId?: string | null;
  onVisionSignal?: (signal: VisionSignal) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [mood, setMood] = useState<MoodInfo>(defaultMood);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const meshDetectorRef = useRef<FaceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const lastUploadRef = useRef<{ timestamp: number; metrics: SensorMetrics } | null>(null);
  const metricsRef = useRef<SensorMetrics>(defaultMetrics);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [brightnessHistory, setBrightnessHistory] = useState<number[]>([]);
  const brightnessRef = useRef<number[]>([]);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sensorMetrics, setSensorMetrics] = useState<SensorMetrics>(defaultMetrics);
  const humanRef = useRef<HumanInstance | null>(null);
  const [humanStatus, setHumanStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as typeof window & { tf?: typeof tf }).tf = tf;
    }
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!isCameraOn) {
      return;
    }
    let cancelled = false;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
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
      cancelled = true;
      stopStream();
    };
  }, [isCameraOn]);

  useEffect(() => {
    let cancelled = false;
    if (!isCameraOn) {
      meshDetectorRef.current?.dispose?.();
      meshDetectorRef.current = null;
      return;
    }
    const loadDetector = async () => {
      try {
        const faceModule = await loadFaceMeshModule();
        if (!faceModule) {
          return;
        }
        const detector = await faceModule.createDetector(faceModule.SupportedModels.MediaPipeFaceMesh, {
          runtime: "mediapipe",
          solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh`,
          refineLandmarks: true,
        });
        if (!cancelled) {
          meshDetectorRef.current = detector;
        } else {
          detector.dispose();
        }
      } catch (error) {
        console.error("Gagal memuat face mesh detector", error);
      }
    };
    loadDetector();
    return () => {
      cancelled = true;
      meshDetectorRef.current?.dispose?.();
      meshDetectorRef.current = null;
    };
  }, [isCameraOn]);

  useEffect(() => {
    metricsRef.current = sensorMetrics;
  }, [sensorMetrics]);

  useEffect(() => {
    brightnessRef.current = brightnessHistory;
  }, [brightnessHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const bootHuman = async () => {
      try {
        setHumanStatus("loading");
        const namespace = await loadHumanNamespace();
        if (!namespace || cancelled) {
          if (!cancelled) setHumanStatus("error");
          return;
        }
        const human = new namespace.Human({
          modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human@3.3.6/models",
          backend: "webgl",
          warmup: "face",
          face: {
            enabled: true,
            detector: { enabled: true, rotation: true, maxDetected: 1 },
            mesh: { enabled: true },
            iris: { enabled: false },
            attention: { enabled: true },
            emotion: { enabled: true },
          },
          hand: { enabled: false },
          body: { enabled: false },
          object: { enabled: false },
        });
        await human.load();
        if (human.initialize) {
          await human.initialize();
        }
        if (cancelled) {
          human.terminate?.();
          return;
        }
        humanRef.current = human;
        setHumanStatus("ready");
      } catch (error) {
        console.error("Gagal menginisiasi Human CV", error);
        if (!cancelled) setHumanStatus("error");
      }
    };
    bootHuman();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    const videoElement = videoRef.current;
    const stream = streamRef.current;
    if (!videoElement || !stream) return;
    videoElement.srcObject = stream;
    const playVideo = () =>
      videoElement
        .play()
        .catch((error) => console.warn("Mirror cam gagal autoplay, menunggu interaksi", error));
    if (videoElement.readyState >= 2) {
      playVideo();
    } else {
      videoElement.onloadedmetadata = playVideo;
    }
  }, [permission, profileId, onVisionSignal]);

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
      let faceBox: FaceBox | null = null;
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
      const avg = averageBrightness(imageData.data);
      const emotion = mapAverageToEmotion(avg);
      const copy = emotionCopy[emotion.value];
      setMood({
        label: emotion.value.toUpperCase(),
        emoji: copy.emoji,
        description: copy.text,
        confidence: Math.round(emotion.confidence * 100),
      });
      const nextHistory = [...brightnessRef.current.slice(-19), Math.round(avg)];
      brightnessRef.current = nextHistory;
      setBrightnessHistory(nextHistory);
      const boxForMetric = faceBox
        ? { w: faceBox.x2 - faceBox.x1, h: faceBox.y2 - faceBox.y1 }
        : null;
      let computedMetrics = deriveMetrics(avg, nextHistory, boxForMetric, video);
      const meshDetector = meshDetectorRef.current;
      if (meshDetector) {
        try {
          const faces = await meshDetector.estimateFaces(video, { flipHorizontal: true });
          if (faces.length > 0 && faces[0].keypoints) {
            computedMetrics = analyzeLandmarks(faces[0].keypoints as Landmark[]);
          }
        } catch (error) {
          console.warn("Gagal menganalisis landmark wajah", error);
        }
      }
      const human = humanRef.current;
      if (human) {
        try {
          const advanced = await human.detect(video);
          const humanFace = advanced?.face?.[0];
          if (humanFace) {
            const result = applyHumanInsights(humanFace, computedMetrics);
            computedMetrics = result.metrics;
            if (result.boundingBox) {
              setBox(result.boundingBox);
              faceBox = {
                x1: result.boundingBox.x,
                y1: result.boundingBox.y,
                x2: result.boundingBox.x + result.boundingBox.w,
                y2: result.boundingBox.y + result.boundingBox.h,
              };
            }
            if (result.overrideMood) {
              setMood(result.overrideMood);
            }
          }
        } catch (error) {
          console.warn("Human detect error", error);
        }
      }
      metricsRef.current = computedMetrics;
      setSensorMetrics(computedMetrics);
      const timestamp = Date.now();
      const signalPayload: VisionSignal = {
        emotion: emotion.value,
        confidence: Math.round(emotion.confidence * 100),
        metrics: computedMetrics,
        timestamp,
        profileId,
      };
      if (onVisionSignal) {
        onVisionSignal(signalPayload);
      }
      broadcastVisionSignal(signalPayload);
      const shouldSync = shouldUploadVision(lastUploadRef.current, computedMetrics, timestamp);
      if (shouldSync) {
        lastUploadRef.current = { timestamp, metrics: computedMetrics };
        fetch("/api/emotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotion: emotion.value,
            confidence: Math.round(emotion.confidence * 100),
            profileId: profileId ?? undefined,
            metrics: metricsRef.current,
          }),
        }).catch((err) => console.error("emotion log", err));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [permission, profileId, onVisionSignal]);

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || canvas.width;
    canvas.height = video.videoHeight || canvas.height;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setLastCapture(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        captureFrame();
        setCountdown(null);
      } else {
        setCountdown((prev) => (prev ?? 1) - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleToggleCamera = () => {
    setIsCameraOn((prev) => {
      const next = !prev;
      if (!next) {
        stopStream();
        setPermission("paused");
        setMood(defaultMood);
        setBox(null);
        setBrightnessHistory([]);
        setLastCapture(null);
      } else {
        setPermission("idle");
      }
      return next;
    });
  };

  const startCountdown = () => {
    if (permission !== "granted" || countdown !== null) return;
    setCountdown(3);
  };

  const frameHeight = variant === "full" ? "h-[30rem] lg:h-[32rem]" : "h-72";
  const padding = variant === "full" ? "p-8" : "p-5";
  const statusTone = statusCopy[permission];
  const connectionBadge = profileId
    ? { text: "Profil tersambung", tone: "text-emerald-200" }
    : { text: "Mode demo (belum pilih profil)", tone: "text-amber-200" };

  return (
    <div className={`liquid-card ${padding} space-y-5`}>
      <div className="flex flex-col gap-2">
        <p className="emoji-heading">Mirror Cam</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-white">
            Kolom kamera + computer vision
          </h3>
          <span className="mirror-pill flex items-center gap-2 px-4 py-1 text-xs text-white/70">
            Realtime CV demo
            <span className={`text-[10px] ${connectionBadge.tone}`}>{connectionBadge.text}</span>
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/70 sm:max-w-xl">
            Bidikan kamera diperbesar seperti versi lama sehingga pengguna merasa sedang menatap cermin
            digital. Mirror hanya membaca micro-expression & cahaya, tidak menyimpan foto apa pun.
            Jelaskan hal ini saat demo supaya tester merasa aman. ✨
          </p>
          <button
            type="button"
            onClick={handleToggleCamera}
            className="white-pill rounded-full bg-white px-5 py-2 text-xs transition hover:-translate-y-0.5"
          >
            {isCameraOn ? "Matikan kamera" : "Nyalakan kamera"}
          </button>
        </div>
      </div>
      <div className={`camera-frame relative ${frameHeight} w-full`}>
        {permission === "granted" ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mirror-video h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-semibold text-white drop-shadow-lg">
                {countdown === 0 ? "✨" : countdown}
              </div>
            )}
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
            {!profileId && (
              <div className="pointer-events-none absolute bottom-6 left-1/2 w-[90%] -translate-x-1/2 rounded-2xl bg-black/45 p-3 text-center text-xs text-white">
                Sambungkan kamera ke profil onboarding supaya chat otomatis menyesuaikan persona.
              </div>
            )}
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
          <p className="mt-2 text-[11px] text-white/40">
            CV lanjutan:{" "}
            {humanStatus === "ready"
              ? "Human AI aktif"
              : humanStatus === "loading"
                ? "Memuat engine Human..."
                : humanStatus === "error"
                  ? "Eksperimental off"
                  : "Menunggu aktivasi"}
          </p>
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
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Brightness trend</p>
          <div className="mt-3 flex h-24 items-end gap-1">
            {brightnessHistory.length === 0 ? (
              <p className="text-xs text-white/60">Belum ada data. Kamera perlu aktif beberapa detik.</p>
            ) : (
              brightnessHistory.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className="block w-2 rounded-full bg-gradient-to-t from-cyan-400 via-purple-400 to-pink-400"
                  style={{ height: `${Math.max((value / 255) * 100, 5)}%` }}
                />
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-white/60">
            Rata-rata brightness ~{brightnessHistory.length ? Math.round(brightnessHistory.at(-1) ?? 0) : 0}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Freeze frame</p>
          <button
            type="button"
            onClick={startCountdown}
            disabled={permission !== "granted" || countdown !== null}
            className="white-pill rounded-full bg-white px-4 py-2 text-xs text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {countdown !== null ? `Menangkap dalam ${countdown}` : "Ambil snapshot"}
          </button>
          {lastCapture && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lastCapture} alt="Snapshot Mirror" className="h-32 w-full rounded-2xl object-cover" />
            </>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Tips demo</p>
          <p>
            Pakai grafik brightness buat jelasin perubahan ekspresi. Snapshot bisa kamu tunjukkan ke tim riset tanpa
            menyimpan apa pun ke server.
          </p>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Valence & energy</p>
          <div className="mt-3 space-y-3">
            <MetricBar
              label="Valence"
              value={(sensorMetrics.valence + 1) / 2}
              description={
                sensorMetrics.valence > 0.2
                  ? "Nada optimis"
                  : sensorMetrics.valence < -0.2
                    ? "Nada mellow"
                    : "Netral"
              }
            />
            <MetricBar
              label="Energy"
              value={sensorMetrics.energy}
              description={sensorMetrics.energy > 0.6 ? "Semangat tinggi" : "Energi cenderung lembut"}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Focus & tension</p>
          <div className="mt-3 space-y-3">
            <MetricBar
              label="Focus"
              value={sensorMetrics.focus}
              description={sensorMetrics.focus > 0.5 ? "Mata terbuka lebar" : "Kelopak mata berat"}
            />
            <MetricBar
              label="Tension"
              value={sensorMetrics.tension}
              description={sensorMetrics.tension > 0.6 ? "Alis menegang" : "Rahang cukup rileks"}
            />
            <p className="text-xs text-white/60">
              Tilt kepala: {sensorMetrics.tilt ? `${sensorMetrics.tilt.toFixed(1)}°` : "stabil"}
            </p>
            {sensorMetrics.cues.length > 0 ? (
              <ul className="list-disc pl-4 text-xs text-white/70">
                {sensorMetrics.cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/60">Belum ada cues khusus dari kamera.</p>
            )}
          </div>
        </div>
      </section>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function MetricBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{label}</span>
        <span>{Math.round(clamped * 100)}%</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-white/10">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      <p className="text-[11px] text-white/60">{description}</p>
    </div>
  );
}

type Landmark = FaceLandmarksDetection.Keypoint;

function shouldUploadVision(
  previous: { timestamp: number; metrics: SensorMetrics } | null,
  next: SensorMetrics,
  timestamp: number,
) {
  if (!previous) return true;
  const elapsed = timestamp - previous.timestamp;
  if (elapsed > 15000) return true;
  const deltas = [
    Math.abs(next.valence - previous.metrics.valence),
    Math.abs(next.energy - previous.metrics.energy),
    Math.abs(next.tension - previous.metrics.tension),
    Math.abs(next.focus - previous.metrics.focus),
  ];
  const cuesChanged = (next.cues || []).join('|') !== (previous.metrics.cues || []).join('|');
  return deltas.some((delta) => delta > 0.12) || cuesChanged;
}

function analyzeLandmarks(points: Landmark[]): SensorMetrics {
  if (!points || points.length < 400) {
    return { ...defaultMetrics };
  }
  const dist = (a: Landmark, b: Landmark) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z ?? 0) - (b.z ?? 0)) ** 2);
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const mouthWidth = dist(points[61], points[291]);
  const mouthHeight = dist(points[13], points[14]);
  const smileRaw = mouthWidth / (mouthHeight || 0.001);
  const smileScore = clamp((smileRaw - 1.6) / 1.2, 0, 1);

  const leftBrowGap = dist(points[70], points[159]);
  const rightBrowGap = dist(points[300], points[386]);
  const browGap = (leftBrowGap + rightBrowGap) / 2;
  const tension = clamp(1 - (browGap - 0.01) * 180, 0, 1);

  const leftEyeOpen = dist(points[159], points[145]);
  const rightEyeOpen = dist(points[386], points[374]);
  const eyeOpenness = (leftEyeOpen + rightEyeOpen) / 2;
  const focus = clamp((eyeOpenness - 0.008) * 140, 0, 1);

  const valence = clamp(smileScore * 1.2 - tension * 0.4, -1, 1);
  const energy = clamp(focus * 0.4 + smileScore * 0.6, 0, 1);

  const leftEye = points[33];
  const rightEye = points[263];
  const tilt =
    (Math.atan2(leftEye.y - rightEye.y, leftEye.x - rightEye.x) * 180) / Math.PI || null;

  const cues: string[] = [];
  if (smileScore > 0.55) cues.push("Senyum hangat terdeteksi.");
  if (tension > 0.65) cues.push("Alis menegang, bantu relaksasi.");
  if (focus < 0.3) cues.push("Kelopak mata berat, tawarkan jeda.");
  if (tilt && Math.abs(tilt) > 8) cues.push("Kepala miring, ajak stabilisasi postur.");

  return {
    valence: Number(valence.toFixed(2)),
    energy: Number(energy.toFixed(2)),
    tension: Number(tension.toFixed(2)),
    focus: Number(focus.toFixed(2)),
    tilt: tilt ? Number(tilt.toFixed(1)) : null,
    cues,
    attention: null,
    headPose: tilt ? { pitch: 0, yaw: 0, roll: Number(tilt.toFixed(1)) } : null,
    expressions: [],
  };
}
function averageBrightness(data: Uint8ClampedArray) {
  let total = 0;
  const step = 4 * 8;
  for (let i = 0; i < data.length; i += step) {
    total += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return total / (data.length / step);
}

function deriveMetrics(
  brightness: number,
  history: number[],
  box: { w: number; h: number } | null,
  video: HTMLVideoElement | null,
): SensorMetrics {
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const normalized = clamp(brightness / 255, 0, 1);
  const previous = history.length > 0 ? (history.at(-1) ?? brightness) / 255 : normalized;
  const delta = Math.abs(normalized - previous);
  const area =
    box && video
      ? clamp((box.w * box.h) / ((video.videoWidth || 1) * (video.videoHeight || 1)), 0, 1)
      : 0;
  const valence = clamp(normalized * 2 - 1, -1, 1);
  const energy = clamp(delta * 8 + area * 0.4, 0, 1);
  const focus = clamp(area * 1.5 + (1 - delta) * 0.2, 0, 1);
  const tension = clamp(1 - focus * 0.7 - (normalized - 0.35), 0, 1);
  const cues: string[] = [];
  if (valence > 0.3) cues.push("Senyum hangat terdeteksi.");
  if (valence < -0.3) cues.push("Nada mellow / butuh validasi tenang.");
  if (tension > 0.6) cues.push("Rahang terlihat kaku, ajak relaksasi.");
  if (energy > 0.65) cues.push("Energi tinggi, tawarkan grounding.");
  if (delta < 0.04 && focus < 0.35) cues.push("Kelopak mata berat, tawarkan jeda.");
  return {
    valence: Number(valence.toFixed(2)),
    energy: Number(energy.toFixed(2)),
    tension: Number(tension.toFixed(2)),
    focus: Number(focus.toFixed(2)),
    tilt: null,
    cues,
    attention: null,
    headPose: null,
    expressions: [],
  };
}

type HumanNamespace = {
  Human: new (config?: Record<string, unknown>) => HumanInstance;
};

type HumanInstance = {
  load(): Promise<void>;
  initialize?(): Promise<void>;
  terminate?(): void;
  detect(
    input: HTMLVideoElement | HTMLCanvasElement,
    options?: Record<string, unknown>,
  ): Promise<HumanResult>;
};

type HumanResult = {
  face?: HumanFaceResult[];
};

type HumanFaceResult = {
  box?: { raw?: [number, number, number, number] };
  emotion?: Array<{ emotion?: string; score?: number }>;
  attention?: number;
  rotation?: { angle?: { pitch?: number; yaw?: number; roll?: number } };
};

type HumanInsightResult = {
  metrics: SensorMetrics;
  overrideMood?: MoodInfo | null;
  boundingBox?: { x: number; y: number; w: number; h: number };
};

function applyHumanInsights(face: HumanFaceResult, baseline: SensorMetrics): HumanInsightResult {
  const expressions = normalizeExpressions(face.emotion);
  const attention =
    typeof face.attention === "number"
      ? Number(face.attention.toFixed(2))
      : baseline.attention ?? null;
  const headPose = face.rotation?.angle
    ? {
        pitch: Number((face.rotation.angle.pitch ?? baseline.headPose?.pitch ?? 0).toFixed(1)),
        yaw: Number((face.rotation.angle.yaw ?? baseline.headPose?.yaw ?? 0).toFixed(1)),
        roll: Number((face.rotation.angle.roll ?? baseline.headPose?.roll ?? baseline.tilt ?? 0).toFixed(1)),
      }
    : baseline.headPose ?? null;
  const cues = [...baseline.cues];
  if (attention !== null) {
    if (attention < 0.35) cues.push("Perhatian visual turun, ajak fokus ke napas.");
    if (attention > 0.75) cues.push("Mata sangat fokus, bantu relaksasi rahang.");
  }
  if (headPose?.pitch && headPose.pitch < -5) cues.push("Dagu menurun, ingatkan postur terbuka.");
  if (headPose?.pitch && headPose.pitch > 5) cues.push("Dagu terangkat, cek kenyamanan leher.");
  if (expressions[0]?.label === "disgust") cues.push("Ekspresi jengah, validasi perasaan.");

  const metrics: SensorMetrics = {
    ...baseline,
    attention,
    headPose,
    expressions,
    cues: Array.from(new Set(cues)).slice(-6),
  };

  let overrideMood: MoodInfo | null = null;
  const dominant = expressions[0];
  if (dominant && dominant.score > 0.35) {
    const mapped = mapExpressionToMoodKey(dominant.label);
    if (mapped) {
      const copy = emotionCopy[mapped];
      overrideMood = {
        label: dominant.label.toUpperCase(),
        emoji: copy.emoji,
        description: copy.text,
        confidence: Math.round(dominant.score * 100),
      };
    }
  }

  const boundingBox =
    face.box?.raw && face.box.raw.length === 4
      ? {
          x: face.box.raw[0],
          y: face.box.raw[1],
          w: face.box.raw[2],
          h: face.box.raw[3],
        }
      : undefined;

  return { metrics, overrideMood, boundingBox };
}

function normalizeExpressions(
  raw?: Array<{ emotion?: string; score?: number }>,
): ExpressionScore[] {
  if (!raw) return [];
  return raw
    .filter((item): item is { emotion: string; score: number } => Boolean(item.emotion))
    .map((item) => ({
      label: item.emotion.trim().toLowerCase(),
      score: Number((item.score ?? 0).toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function mapExpressionToMoodKey(
  label: string,
): keyof typeof emotionCopy | null {
  const normalized = label.toLowerCase();
  const mapping: Record<string, keyof typeof emotionCopy> = {
    happy: "happy",
    joy: "happy",
    neutral: "neutral",
    sad: "sad",
    disgust: "angry",
    angry: "angry",
    fear: "surprised",
    surprised: "surprised",
    surprise: "surprised",
    tired: "tired",
  };
  return mapping[normalized] ?? null;
}

declare global {
  interface Window {
    faceLandmarksDetection?: FaceMeshModule;
    Human?: HumanNamespace;
  }
}

let faceMeshModulePromise: Promise<FaceMeshModule | null> | null = null;
let humanNamespacePromise: Promise<HumanNamespace | null> | null = null;

async function loadFaceMeshModule(): Promise<FaceMeshModule | null> {
  if (typeof window === "undefined") return null;
  if (window.faceLandmarksDetection) {
    return window.faceLandmarksDetection as FaceMeshModule;
  }
  if (!faceMeshModulePromise) {
    faceMeshModulePromise = loadScript(
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@1.0.6/dist/face-landmarks-detection.min.js",
    )
      .then(() => window.faceLandmarksDetection ?? null)
      .catch((error) => {
        console.error("Gagal memuat modul face-landmarks-detection", error);
        return null;
      });
  }
  const loadedModule = await faceMeshModulePromise;
  if (!loadedModule) {
    faceMeshModulePromise = null;
  }
  return loadedModule;
}

async function loadHumanNamespace(): Promise<HumanNamespace | null> {
  if (typeof window === "undefined") return null;
  if (window.Human) {
    return window.Human as HumanNamespace;
  }
  if (!humanNamespacePromise) {
    humanNamespacePromise = loadScript(
      "https://cdn.jsdelivr.net/npm/@vladmandic/human@3.3.6/dist/human.js",
    )
      .then(() => window.Human ?? null)
      .catch((error) => {
        console.error("Gagal memuat Human bundle", error);
        return null;
      });
  }
  const namespace = await humanNamespacePromise;
  if (!namespace) {
    humanNamespacePromise = null;
  }
  return namespace;
}

function loadScript(src: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", (event) => reject(event), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = (event) => reject(event);
    document.body.appendChild(script);
  });
}
