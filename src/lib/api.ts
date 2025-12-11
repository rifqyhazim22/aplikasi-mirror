const apiBase =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.MIRROR_APP_URL ??
  "https://aplikasi-mirror.vercel.app";

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return apiBase ? `${apiBase}${path}` : path;
}
