import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.mirror.app",
  appName: "Mirror",
  webDir: process.env.CAP_WEB_DIR ?? "public",
  server: process.env.MIRROR_APP_URL
    ? {
        url: process.env.MIRROR_APP_URL,
        cleartext: true,
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
