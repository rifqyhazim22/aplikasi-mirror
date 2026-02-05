"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const resolvedRemoteUrl = (_a = process.env.MIRROR_APP_URL) !== null && _a !== void 0 ? _a : "https://aplikasi-mirror.vercel.app";
const config = {
    appId: "id.mirror.app",
    appName: "Mirror",
    webDir: "out",
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
exports.default = config;
