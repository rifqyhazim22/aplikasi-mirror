"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { usePreferences } from "@/contexts/preferences-context";
import { onboardingCopy, type StepLiteral } from "@/lib/onboarding-i18n";

const FALLBACK_COPY = onboardingCopy.id;
const MOOD_VALUES = ["tenang", "bersemangat", "lelah"] as const;

const zodiacCatalog = [
  { id: "aries", label: "Aries ♈︎", start: [3, 21], end: [4, 19] },
  { id: "taurus", label: "Taurus ♉︎", start: [4, 20], end: [5, 20] },
  { id: "gemini", label: "Gemini ♊︎", start: [5, 21], end: [6, 20] },
  { id: "cancer", label: "Cancer ♋︎", start: [6, 21], end: [7, 22] },
  { id: "leo", label: "Leo ♌︎", start: [7, 23], end: [8, 22] },
  { id: "virgo", label: "Virgo ♍︎", start: [8, 23], end: [9, 22] },
  { id: "libra", label: "Libra ♎︎", start: [9, 23], end: [10, 22] },
  { id: "scorpio", label: "Scorpio ♏︎", start: [10, 23], end: [11, 21] },
  { id: "sagittarius", label: "Sagittarius ♐︎", start: [11, 22], end: [12, 21] },
  { id: "capricorn", label: "Capricorn ♑︎", start: [12, 22], end: [1, 19] },
  { id: "aquarius", label: "Aquarius ♒︎", start: [1, 20], end: [2, 18] },
  { id: "pisces", label: "Pisces ♓︎", start: [2, 19], end: [3, 20] },
] as const;

type StepId = StepLiteral;

const profileSchema = z.object({
  nickname: z.string().min(2),
  focusAreas: z.array(z.string()).min(1),
  consentCamera: z.boolean(),
  consentData: z.boolean(),
  moodBaseline: z.enum(MOOD_VALUES),
  mbtiType: z.string().min(3).max(4),
  enneagramType: z.string().min(1).max(2),
  primaryArchetype: z.string().min(3),
});

type ProfileForm = z.infer<typeof profileSchema>;

type RecentProfile = {
  id: string;
  nickname: string;
  focusAreas: string[];
  moodBaseline: string;
  createdAt: string;
};

type MoodForm = {
  profileId: string;
  mood: string;
  note: string;
};

const initialForm: ProfileForm = {
  nickname: "",
  focusAreas: [],
  consentCamera: true,
  consentData: true,
  moodBaseline: "tenang",
  mbtiType: "INFJ",
  enneagramType: "2",
  primaryArchetype: "caregiver",
};

function detectZodiac(date: string) {
  if (!date) return null;
  const [, monthStr, dayStr] = date.split("-");
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!month || !day) return null;
  for (const sign of zodiacCatalog) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    if (startMonth < endMonth) {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return sign;
      }
    } else if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      month > startMonth ||
      month < endMonth
    ) {
      return sign;
    }
  }
  return null;
}

function OptionCard({
  title,
  subtitle,
  active,
  onClick,
  isDay,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  isDay: boolean;
}) {
  const nightClasses = active
    ? "border-white bg-white/10 text-white shadow-lg"
    : "border-white/20 text-white/70 hover:border-white/40";
  const dayClasses = active
    ? "border-[rgba(19,4,41,0.35)] bg-white text-[var(--mirror-ink)] shadow-lg"
    : "border-[rgba(19,4,41,0.2)] bg-white/80 text-[var(--mirror-ink)] hover:border-[rgba(19,4,41,0.4)]";
  const palette = isDay ? dayClasses : nightClasses;
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-3xl border px-4 py-3 text-left transition ${palette}`}>
      <p className={`text-sm font-semibold ${isDay ? "text-[var(--mirror-ink)]" : "text-white"}`}>{title}</p>
      <p className={`text-xs ${isDay ? "text-[rgba(19,4,41,0.65)]" : "text-white/60"}`}>{subtitle}</p>
    </button>
  );
}

export default function ExperiencePage() {
  const { language, theme } = usePreferences();
  const isDay = theme === "day";
  const copy = onboardingCopy[language] ?? FALLBACK_COPY;
  const steps = copy.steps ?? FALLBACK_COPY.steps;
  const focusOptions = copy.focusCatalog ?? FALLBACK_COPY.focusCatalog;
  const moodOptions = copy.moodCatalog ?? FALLBACK_COPY.moodCatalog;
  const mbtiOptions = copy.mbtiCatalog ?? FALLBACK_COPY.mbtiCatalog;
  const enneagramOptions = copy.enneagramCatalog ?? FALLBACK_COPY.enneagramCatalog;
  const archetypeOptions = copy.archetypeCatalog ?? FALLBACK_COPY.archetypeCatalog;
  const locale = language === "en" ? "en-US" : "id-ID";
  const consentFields: Array<{ key: "consentData" | "consentCamera"; label: string }> = [
    { key: "consentData", label: copy.consentPrivacy },
    { key: "consentCamera", label: copy.consentCamera },
  ];

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [moodForm, setMoodForm] = useState<MoodForm>({ profileId: "", mood: "", note: "" });
  const [moodStatus, setMoodStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [moodMessage, setMoodMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepId>("persona");
  const [birthDate, setBirthDate] = useState("");

  const focusLookup = useMemo(() => {
    const map = new Map<string, string>();
    focusOptions.forEach((option) => {
      map.set(option.id, `${option.emoji} ${option.label}`.trim());
    });
    return map;
  }, [focusOptions]);

  const formatFocusAreas = useCallback(
    (values: string[]) => values.map((value) => focusLookup.get(value) ?? value),
    [focusLookup],
  );

  const isComplete = useMemo(
    () => form.nickname.trim().length >= 2 && form.focusAreas.length > 0 && form.consentData,
    [form],
  );

  const activeIndex = steps.findIndex((step) => step.id === activeStep);
  const navBadgePrefix = copy.stepBadge ?? (language === "en" ? "Step" : "Langkah");
  const zodiacInsight = useMemo(() => detectZodiac(birthDate), [birthDate]);

  const toggleFocus = (optionId: string) => {
    setForm((prev) => {
      const exists = prev.focusAreas.includes(optionId);
      const next = exists ? prev.focusAreas.filter((item) => item !== optionId) : [...prev.focusAreas, optionId];
      return { ...prev, focusAreas: next.slice(0, 3) };
    });
  };

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchProfiles = async () => {
    try {
      setRecentLoading(true);
      const response = await fetch("/api/profiles");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const payload = (await response.json()) as RecentProfile[];
      setRecentProfiles(payload);
      setMoodForm((prev) => ({ ...prev, profileId: prev.profileId || payload[0]?.id || "" }));
    } catch (error) {
      console.error(error);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;
    setStatus("saving");
    setMessage(null);
    try {
      profileSchema.parse(form);
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(copy.profileSaveError);
      setStatus("success");
      setMessage(copy.profileSaved);
      fetchProfiles();
      setActiveStep("ritual");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : copy.profileSaveError);
    }
  };

  const handleMoodSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!moodForm.profileId || moodForm.mood.trim().length < 2) {
      setMoodMessage(copy.moodValidation);
      setMoodStatus("error");
      return;
    }
    setMoodStatus("saving");
    setMoodMessage(null);
    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: moodForm.profileId,
          mood: moodForm.mood,
          note: moodForm.note || undefined,
          source: "sandbox",
        }),
      });
      if (!response.ok) throw new Error(copy.moodSaveError);
      setMoodStatus("success");
      setMoodMessage(copy.moodSaved);
      setMoodForm((prev) => ({ ...prev, mood: "", note: "" }));
    } catch (error) {
      console.error(error);
      setMoodStatus("error");
      setMoodMessage(error instanceof Error ? error.message : copy.moodSaveError);
    }
  };

  const fieldClass = `mt-2 w-full rounded-3xl border px-4 py-3 text-sm transition focus:outline-none ${
    isDay
      ? "border-[rgba(19,4,41,0.18)] bg-white text-[var(--mirror-ink)] placeholder:text-[rgba(19,4,41,0.55)] shadow-[0_15px_35px_rgba(19,4,41,0.08)] focus:border-[rgba(19,4,41,0.45)]"
      : "border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-white/60"
  }`;

  const textareaClass = `${fieldClass} resize-none`;
  const selectClass = fieldClass;
  const mutedText = isDay ? "text-[rgba(19,4,41,0.55)]" : "text-white/50";
  const subText = isDay ? "text-[rgba(19,4,41,0.7)]" : "text-white/70";
  const primaryButtonClass = `white-pill rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${
    isDay ? "bg-[var(--mirror-ink)] text-white shadow-lg" : "bg-white text-purple-900"
  }`;
  const secondaryButtonClass = `rounded-full border px-6 py-3 text-sm transition ${
    isDay
      ? "border-[rgba(19,4,41,0.25)] text-[var(--mirror-ink)] hover:border-[rgba(19,4,41,0.45)]"
      : "border-white/30 text-white/70 hover:border-white hover:text-white"
  }`;

  const navButtonClass = (state: "active" | "completed" | "idle") => {
    if (isDay) {
      if (state === "active") return "border-[rgba(19,4,41,0.45)] bg-white text-[var(--mirror-ink)] shadow-lg";
      if (state === "completed") return "border-[rgba(19,4,41,0.18)] bg-white/80 text-[var(--mirror-ink)]";
      return "border-[rgba(19,4,41,0.18)] text-[rgba(19,4,41,0.6)] hover:border-[rgba(19,4,41,0.4)]";
    }
    if (state === "active") return "border-white bg-white/10 text-white shadow-lg";
    if (state === "completed") return "border-emerald-300/40 text-emerald-100 hover:border-emerald-200/70";
    return "border-white/15 text-white/60 hover:text-white";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 text-white">
      <header className="space-y-4">
        <p className="emoji-heading">{copy.tagline}</p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{copy.heroTitle}</h1>
        <p className="text-lg text-white/80">{copy.heroDescription}</p>
      </header>

      <nav className="glass-card flex flex-col gap-4 p-5 text-sm">
        <div className="flex flex-wrap gap-4">
          {steps.map((step, index) => {
            const completed = index < activeIndex;
            const isActive = step.id === activeStep;
            const state = isActive ? "active" : completed ? "completed" : "idle";
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex min-w-[160px] flex-1 flex-col rounded-3xl border px-4 py-3 text-left transition ${navButtonClass(state)}`}
              >
                <span className="text-xs uppercase tracking-[0.4em] text-white/40">
                  {navBadgePrefix} {index + 1}
                </span>
                <span className="text-base font-semibold text-white">{step.title}</span>
                <span className="text-[11px] text-white/60">{step.subtitle}</span>
              </button>
            );
          })}
        </div>
        <p className={`text-xs ${mutedText}`}>{copy.stepOverview}</p>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeStep === "persona" && (
              <section className="glass-card space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <p className="emoji-heading">{navBadgePrefix} 1</p>
                  <h2 className="text-2xl font-semibold text-white">{copy.personaHeading}</h2>
                  <p className={`text-sm ${subText}`}>{copy.personaSub}</p>
                </div>
                <div>
                  <label className={`text-sm ${subText}`}>{copy.nicknameLabel}</label>
                  <input
                    className={fieldClass}
                    value={form.nickname}
                    onChange={(event) => updateField("nickname", event.target.value)}
                    placeholder={copy.nicknamePlaceholder}
                  />
                </div>
                <div>
                  <p className={`text-sm ${subText}`}>{copy.focusLabel}</p>
                  <p className={`text-xs ${mutedText}`}>{copy.focusHint}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {focusOptions.map((option) => (
                      <OptionCard
                        key={option.id}
                        title={`${option.emoji} ${option.label}`}
                        subtitle={option.blurb}
                        active={form.focusAreas.includes(option.id)}
                        onClick={() => toggleFocus(option.id)}
                        isDay={isDay}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {consentFields.map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 rounded-3xl border p-4 text-sm ${
                        isDay
                          ? "border-[rgba(19,4,41,0.18)] bg-white text-[var(--mirror-ink)]"
                          : "border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(event) => updateField(key, event.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setActiveStep("traits")} disabled={!isComplete} className={primaryButtonClass}>
                    {copy.nextStep}
                  </button>
                  <p className={`text-xs ${mutedText}`}>{copy.checklistHint}</p>
                </div>
              </section>
            )}

            {activeStep === "traits" && (
              <section className="glass-card space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <p className="emoji-heading">{navBadgePrefix} 2</p>
                  <h2 className="text-2xl font-semibold text-white">{copy.traitsHeading}</h2>
                  <p className={`text-sm ${subText}`}>{copy.traitsSub}</p>
                </div>
                <div>
                  <p className={`text-sm ${subText}`}>{copy.moodLabel}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {moodOptions.map((mood) => (
                      <OptionCard
                        key={mood.id}
                        title={`${mood.emoji} ${mood.label}`}
                        subtitle={mood.blurb}
                        active={form.moodBaseline === mood.id}
                        onClick={() => updateField("moodBaseline", mood.id)}
                        isDay={isDay}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className={`text-sm ${subText}`}>{copy.mbtiLabel}</p>
                    <div className="grid gap-2">
                      {mbtiOptions.map((item) => (
                        <OptionCard
                          key={item.code}
                          title={`${item.code} • ${item.name}`}
                          subtitle={item.spark}
                          active={form.mbtiType === item.code}
                          onClick={() => updateField("mbtiType", item.code)}
                          isDay={isDay}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm ${subText}`}>{copy.enneagramLabel}</p>
                    <div className="grid gap-2">
                      {enneagramOptions.map((item) => (
                        <OptionCard
                          key={item.code}
                          title={`Type ${item.code} • ${item.title}`}
                          subtitle={item.spark}
                          active={form.enneagramType === item.code}
                          onClick={() => updateField("enneagramType", item.code)}
                          isDay={isDay}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${subText}`}>{copy.archetypeLabel}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {archetypeOptions.map((item) => (
                      <OptionCard
                        key={item.id}
                        title={item.label}
                        subtitle={item.spark}
                        active={form.primaryArchetype === item.id}
                        onClick={() => updateField("primaryArchetype", item.id)}
                        isDay={isDay}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${subText}`}>{copy.birthHint}</p>
                  <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className={fieldClass} />
                  {zodiacInsight && (
                    <p className={`mt-2 text-sm ${subText}`}>
                      {(copy.birthNote ?? "{sign}").replace("{sign}", zodiacInsight.label)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setActiveStep("persona")} className={secondaryButtonClass}>
                    {copy.backToStepOne}
                  </button>
                  <button type="submit" disabled={!isComplete || status === "saving"} className={primaryButtonClass}>
                    {status === "saving" ? copy.saveProfileSaving : copy.saveProfileCta}
                  </button>
                </div>
                {message && (
                  <p
                    className={`text-sm ${
                      status === "success"
                        ? isDay ? "text-emerald-600" : "text-emerald-300"
                        : isDay ? "text-rose-500" : "text-rose-300"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </section>
            )}
          </form>

          {activeStep === "ritual" && (
            <section className="glass-card space-y-5 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="emoji-heading">{navBadgePrefix} 3</p>
                <h2 className="text-2xl font-semibold text-white">{copy.ritualHeading}</h2>
                <p className={`text-sm ${subText}`}>{copy.ritualSub}</p>
              </div>
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                <div>
                  <label className={`text-sm ${subText}`}>{copy.moodSelectLabel}</label>
                  <select
                    className={selectClass}
                    value={moodForm.profileId}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, profileId: event.target.value }))}
                  >
                    <option value="">{copy.moodSelectPlaceholder}</option>
                    {recentProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-sm ${subText}`}>{copy.moodField}</label>
                  <input
                    className={fieldClass}
                    value={moodForm.mood}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, mood: event.target.value }))}
                    placeholder={copy.moodPlaceholder}
                  />
                </div>
                <div>
                  <label className={`text-sm ${subText}`}>{copy.noteField}</label>
                  <textarea
                    className={textareaClass}
                    rows={3}
                    value={moodForm.note}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder={copy.notePlaceholder}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className={primaryButtonClass} disabled={!moodForm.profileId || moodStatus === "saving"}>
                    {moodStatus === "saving" ? copy.ritualSaving : copy.ritualCta}
                  </button>
                  {moodMessage && (
                    <span
                      className={`text-xs ${
                        moodStatus === "success"
                          ? isDay ? "text-emerald-600" : "text-emerald-300"
                          : isDay ? "text-rose-500" : "text-rose-300"
                      }`}
                    >
                      {moodMessage}
                    </span>
                  )}
                </div>
              </form>
              <p className={`text-xs ${mutedText}`}>
                {copy.postRitualHint}{" "}
                <Link href="/camera" className="underline">
                  Lab Kamera
                </Link>
                {" "}
                ·
                {" "}
                <Link href="/studio" className="underline">
                  Studio
                </Link>
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="glass-card space-y-4 p-6">
            <p className="emoji-heading">{copy.flowHeading}</p>
            <h2 className="text-xl font-semibold text-white">{copy.flowSubheading}</h2>
            <div className="space-y-3">
              {copy.flowModules.map((module) => (
                <Link
                  href={module.href}
                  key={module.href}
                  className={`flex items-center justify-between rounded-3xl border px-4 py-3 text-sm transition ${
                    isDay
                      ? "border-[rgba(19,4,41,0.15)] bg-white/85 text-[var(--mirror-ink)] hover:border-[rgba(19,4,41,0.35)]"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white hover:text-white"
                  }`}
                >
                  <span>
                    <span className="mr-2 text-lg">{module.emoji}</span>
                    {module.title}
                  </span>
                  <span className={`text-xs ${mutedText}`}>{module.blurb}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="glass-card space-y-3 p-6">
            <p className="emoji-heading">{copy.playbookHeading}</p>
            <p className="text-lg font-semibold text-white">{copy.playbookTitle}</p>
            <ul className={`space-y-2 text-sm ${subText}`}>
              {copy.demoGuide.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
          <section className="glass-card space-y-3 p-6">
            <p className="emoji-heading">{copy.historyTitle}</p>
            <p className={`text-sm ${subText}`}>{copy.historyDescription}</p>
            {recentLoading ? (
              <p className={`text-sm ${subText}`}>{copy.historyLoading}</p>
            ) : recentProfiles.length === 0 ? (
              <p className={`text-sm ${subText}`}>{copy.historyEmpty}</p>
            ) : (
              <ul className="divide-y divide-white/5 text-sm text-white/80">
                {recentProfiles.map((profile) => (
                  <li key={profile.id} className="py-3">
                    <p className="font-semibold text-white">{profile.nickname}</p>
                    <p className={`text-xs uppercase tracking-[0.3em] ${mutedText}`}>Mood • {profile.moodBaseline}</p>
                    <p className={`${subText}`}>
                      {copy.historyFocusLabel}: {formatFocusAreas(profile.focusAreas).join(", ") || "-"} ·{" "}
                      {new Date(profile.createdAt).toLocaleString(locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
