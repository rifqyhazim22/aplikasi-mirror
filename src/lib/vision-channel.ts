import type { VisionSignal } from "@/types/vision";

const CHANNEL_NAME = "mirror-vision-signal";
const STORAGE_KEY = "mirror:last-vision";
type Listener = (signal: VisionSignal) => void;

function cacheSignal(signal: VisionSignal) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(signal));
  } catch (error) {
    console.warn("Tidak bisa menyimpan cache vision", error);
  }
}

export function readCachedVisionSignal(): VisionSignal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisionSignal;
  } catch (error) {
    console.warn("Tidak bisa membaca cache vision", error);
    return null;
  }
}

export function broadcastVisionSignal(signal: VisionSignal) {
  if (typeof window === "undefined") return;
  cacheSignal(signal);
  if ("BroadcastChannel" in window) {
    try {
      const channel = getChannel();
      channel.postMessage(signal);
    } catch (error) {
      console.warn("BroadcastChannel error", error);
    }
  }
  window.dispatchEvent(new CustomEvent<VisionSignal>("mirror:vision-signal", { detail: signal }));
}

export function subscribeVisionSignal(listener: Listener): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<VisionSignal>;
    listener(custom.detail);
  };
  window.addEventListener("mirror:vision-signal", handler);
  const cached = readCachedVisionSignal();
  if (cached) {
    try {
      const age = Date.now() - cached.timestamp;
      if (!Number.isNaN(age) && age < 15000) {
        listener(cached);
      }
    } catch (error) {
      console.warn("Cache vision invalid", error);
    }
  }
  let channel: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    try {
      channel = getChannel();
      channel.addEventListener("message", (event) => {
        listener(event.data as VisionSignal);
      });
    } catch (error) {
      console.warn("BroadcastChannel subscribe error", error);
    }
  }
  return () => {
    window.removeEventListener("mirror:vision-signal", handler);
    channel?.close();
  };
}

function getChannel() {
  return new BroadcastChannel(CHANNEL_NAME);
}
