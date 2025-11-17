import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.mirror.app",
  appName: "Mirror",
  webDir: "out",
  server: {
    url: process.env.MIRROR_APP_URL ?? "https://aplikasi-mirror.vercel.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    allowsLinkPreview: false,
  },
};

export default config;
