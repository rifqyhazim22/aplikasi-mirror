import type { VisionSignal } from "@/types/vision";

const CHANNEL_NAME = "mirror-vision-signal";
type Listener = (signal: VisionSignal) => void;

export function broadcastVisionSignal(signal: VisionSignal) {
  if (typeof window === "undefined") return;
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
