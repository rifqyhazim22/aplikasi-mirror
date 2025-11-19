export type DownloadEntry = {
  platform: string;
  filename: string;
  href: string;
  size: string;
  notes: string;
  status?: "ready" | "simulator" | "beta";
};

export const downloadCatalog: DownloadEntry[] = [
  {
    platform: "macOS (.dmg)",
    filename: "Mirror-macOS.dmg",
    href: "/downloads/Mirror-macOS.dmg",
    size: "95 MB",
    notes: "Electron shell yang langsung memuat https://aplikasi-mirror.vercel.app dengan fallback offline jika koneksi putus.",
    status: "ready",
  },
  {
    platform: "Windows (.exe)",
    filename: "Mirror-Windows-Setup.exe",
    href: "/downloads/Mirror-Windows-Setup.exe",
    size: "80 MB",
    notes: "Installer NSIS hasil electron-builder. Gunakan pada Windows 10/11, tetap butuh koneksi internet untuk fitur kamera + chat.",
    status: "ready",
  },
  {
    platform: "Android (.apk)",
    filename: "Mirror-Android-debug.apk",
    href: "/downloads/Mirror-Android-debug.apk",
    size: "3.9 MB",
    notes: "Capacitor Android debug build. Aktifkan instalasi dari sumber tak dikenal, lalu login ke koneksi agar camera widget hidup.",
    status: "beta",
  },
  {
    platform: "iOS Simulator (.zip)",
    filename: "Mirror-iOS-simulator.zip",
    href: "/downloads/Mirror-iOS-simulator.zip",
    size: "1.1 MB",
    notes:
      "Bundle untuk iOS Simulator. Ekstrak lalu jalankan `xcrun simctl install booted App.app`. Untuk perangkat fisik perlu signing Apple ID.",
    status: "simulator",
  },
];
