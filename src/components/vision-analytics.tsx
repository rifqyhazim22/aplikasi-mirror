"use client";

import type { VisionSignal } from "@/types/vision";

type VisionAnalyticsCopy = {
  idleHeading: string;
  idleDescription: string;
  signalHeading: string;
  metricsLabel: string;
  cuesTitle: string;
  cuesEmpty: string;
  headPoseTitle: string;
  headPoseEmpty: string;
  focusTitle: string;
  attentionHigh: string;
  attentionLow: string;
  attentionBalanced: string;
  attentionLabel: string;
  attentionEmpty: string;
  expressionTitle: string;
  expressionEmpty: string;
};

const defaultCopy: VisionAnalyticsCopy = {
  idleHeading: "Vision analytics",
  idleDescription: "Kamera belum aktif atau sinyalnya tua. Buka Mirror Cam supaya panel ini menampilkan data realtime.",
  signalHeading: "Realtime mood signal",
  metricsLabel: "Valence {valence} • Energi {energy}",
  cuesTitle: "Cues kamera",
  cuesEmpty: "Belum ada cues spesifik dari deteksi terakhir.",
  headPoseTitle: "Head pose",
  headPoseEmpty: "Belum ada estimasi kemiringan kepala.",
  focusTitle: "Fokus kamera",
  attentionHigh: "sangat fokus",
  attentionLow: "perlu dirilekskan",
  attentionBalanced: "seimbang",
  attentionLabel: "Attention {percent} ({state})",
  attentionEmpty: "Human CV belum membaca perhatian visual.",
  expressionTitle: "Ekspresi dominan",
  expressionEmpty: "Belum ada data dari engine Human.",
};

type Props = {
  signal: VisionSignal | null;
  copy?: Partial<VisionAnalyticsCopy>;
};

export function VisionAnalyticsPanel({ signal, copy: copyOverride }: Props) {
  const copy = { ...defaultCopy, ...(copyOverride ?? {}) };
  if (!signal) {
    return (
      <section className="glass-card p-6 text-sm text-white/70">
        <p className="emoji-heading">{copy.idleHeading}</p>
        <p>{copy.idleDescription}</p>
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
          <p className="emoji-heading">{copy.signalHeading}</p>
          <p className="text-lg font-semibold text-white">
            {signal.emotion.toUpperCase()} · {signal.confidence}%
          </p>
          <p className="text-xs text-white/60">
            {copy.metricsLabel
              .replace("{valence}", formatPercent((signal.metrics.valence + 1) / 2))
              .replace("{energy}", formatPercent(signal.metrics.energy))}
          </p>
        </div>
        <ExpressionList expressions={expressions} copy={copy} />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">{copy.cuesTitle}</p>
          {cues.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {cues.slice(-4).map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">{copy.cuesEmpty}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">{copy.headPoseTitle}</p>
          {headPose ? (
            <div className="mt-2 flex gap-4 text-white">
              <PosePill label="Pitch" value={headPose.pitch} />
              <PosePill label="Yaw" value={headPose.yaw} />
              <PosePill label="Roll" value={headPose.roll} />
            </div>
          ) : (
            <p className="mt-2">{copy.headPoseEmpty}</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="text-white font-semibold">{copy.focusTitle}</p>
          {attention !== null && attention !== undefined ? (
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400"
                  style={{ width: `${Math.min(Math.max(attention, 0), 1) * 100}%` }}
                />
              </div>
              {(() => {
                const state =
                  attention > 0.7 ? copy.attentionHigh : attention < 0.3 ? copy.attentionLow : copy.attentionBalanced;
                return (
                  <p className="mt-1 text-white">
                    {copy.attentionLabel
                      .replace("{percent}", formatPercent(attention))
                      .replace("{state}", state)}
                  </p>
                );
              })()}
            </div>
          ) : (
            <p className="mt-2">{copy.attentionEmpty}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ExpressionList({
  expressions,
  copy,
}: {
  expressions: VisionSignal["metrics"]["expressions"];
  copy: VisionAnalyticsCopy;
}) {
  if (!expressions || expressions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
        <p className="text-white font-semibold">{copy.expressionTitle}</p>
        <p className="mt-2">{copy.expressionEmpty}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
      <p className="text-white font-semibold">{copy.expressionTitle}</p>
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
