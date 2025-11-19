"use client";

import type { VisionSignal } from "@/types/vision";

type Props = {
  signal: VisionSignal | null;
};

export function VisionAnalyticsPanel({ signal }: Props) {
  if (!signal) {
    return (
      <section className="glass-card p-6 text-sm text-white/70">
        <p className="emoji-heading">Vision analytics</p>
        <p>Kamera belum aktif atau sinyalnya tua. Buka Mirror Cam supaya panel ini menampilkan data realtime.</p>
      </section>
    );
  }

  const expressions = signal.metrics.expressions ?? [];
  const headPose = signal.metrics.headPose;
  const attention = signal.metrics.attention;
  const cues = signal.metrics.cues;

  return (
    <section className="glass-card grid gap-6 p-6 text-sm text-white/80 lg:grid-cols-2">
      <div className="space-y-3">
        <div>
          <p className="emoji-heading">Realtime mood signal</p>
          <p className="text-lg font-semibold text-white">
            {signal.emotion.toUpperCase()} · {signal.confidence}%
          </p>
          <p className="text-xs text-white/60">
            Valence {formatPercent((signal.metrics.valence + 1) / 2)} • Energi {formatPercent(signal.metrics.energy)}
          </p>
        </div>
        <ExpressionList expressions={expressions} />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">Cues kamera</p>
          {cues.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {cues.slice(-4).map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">Belum ada cues spesifik dari deteksi terakhir.</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">Head pose</p>
          {headPose ? (
            <div className="mt-2 flex gap-4 text-white">
              <PosePill label="Pitch" value={headPose.pitch} />
              <PosePill label="Yaw" value={headPose.yaw} />
              <PosePill label="Roll" value={headPose.roll} />
            </div>
          ) : (
            <p className="mt-2">Belum ada estimasi kemiringan kepala.</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">Fokus kamera</p>
          {attention !== null && attention !== undefined ? (
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400"
                  style={{ width: `${Math.min(Math.max(attention, 0), 1) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-white">
                Attention {formatPercent(attention)}{" "}
                <span className="text-white/60">({attention > 0.7 ? "sangat fokus" : attention < 0.3 ? "perlu dirilekskan" : "seimbang"})</span>
              </p>
            </div>
          ) : (
            <p className="mt-2">Human CV belum membaca perhatian visual.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ExpressionList({ expressions }: { expressions: VisionSignal["metrics"]["expressions"] }) {
  if (!expressions || expressions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
        <p className="text-white font-semibold">Ekspresi dominan</p>
        <p className="mt-2">Belum ada data dari engine Human.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
      <p className="text-white font-semibold">Ekspresi dominan</p>
      <ul className="mt-2 space-y-1">
        {expressions.map((expr) => (
          <li key={expr.label} className="flex items-center justify-between text-white">
            <span className="capitalize">{expr.label}</span>
            <span>{formatPercent(expr.score)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PosePill({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === null) {
    return (
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
        {label}: –
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white">
      {label}: {value.toFixed(1)}°
    </span>
  );
}

function formatPercent(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return `${Math.round(clamped * 100)}%`;
}
