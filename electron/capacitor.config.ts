import type { CapacitorConfig } from "@capacitor/cli";

const resolvedRemoteUrl = process.env.MIRROR_APP_URL ?? "https://aplikasi-mirror.vercel.app";

const config: CapacitorConfig = {
  appId: "id.mirror.app",
  appName: "Mirror",
  webDir: process.env.CAP_WEB_DIR ?? "public",
  server: resolvedRemoteUrl
    ? {
        url: resolvedRemoteUrl,
        cleartext: resolvedRemoteUrl.startsWith("http://"),
      }
    : undefined,
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    allowsLinkPreview: false,
  },
};

export default config;
