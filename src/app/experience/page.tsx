"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { BackButton } from "@/components/back-button";
import { usePreferences } from "@/contexts/preferences-context";
import { onboardingCopy, type StepLiteral } from "@/lib/onboarding-i18n";
import { resolveApiUrl } from "@/lib/api";

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
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  isDay: boolean; // retained for signature compatibility but ignored
}) {
  return (
    <button type="button" onClick={onClick} className={`w-full text-left transition ${active ? 'glass-pill active' : 'glass-pill'} flex flex-col justify-center !rounded-2xl px-5 py-4 min-h-[5rem]`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs opacity-70 mt-1">{subtitle}</p>
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
      const response = await fetch(resolveApiUrl("/api/profiles"));
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
      const response = await fetch(resolveApiUrl("/api/profiles"), {
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
      const response = await fetch(resolveApiUrl("/api/moods"), {
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

  const fieldClass = "glass-input mt-2 w-full rounded-2xl h-12 px-5 text-sm transition focus:outline-none placeholder:text-white/40";
  const selectClass = fieldClass + " appearance-none";

  const textareaClass = "glass-input mt-2 w-full rounded-2xl p-5 text-sm transition focus:outline-none placeholder:text-white/40 resize-none";
  const mutedText = "text-white/50";
  const subText = "text-white/70";

  const primaryButtonClass = "px-6 py-3 rounded-full font-medium tracking-wide transition-all bg-sky-400 hover:bg-sky-400/90 text-slate-900 shadow-[0_0_20px_rgba(54,198,226,0.3)] hover:shadow-[0_0_30px_rgba(54,198,226,0.5)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const secondaryButtonClass = "glass-pill rounded-full px-6 py-3 text-sm transition flex items-center justify-center font-medium";

  const navButtonClass = (state: "active" | "completed" | "idle") => {
    if (state === "active") return "glass-pill active !rounded-3xl shadow-lg border-sky-400/30";
    if (state === "completed") return "glass-pill !rounded-3xl border-emerald-400/30 text-emerald-100/80";
    return "glass-pill !rounded-3xl text-white/60 hover:text-white";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[1100px] flex-col gap-10 px-6 py-16 text-white relative z-10 w-full">
      <BackButton />
      <header className="flex flex-col gap-4 text-center md:text-left z-10 relative">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <span className="text-2xl">{copy.tagline.split(' ')[0] || '✨'}</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">{copy.heroTitle}</h1>
        </div>
        <p className="text-white/60 text-lg font-light max-w-2xl mx-auto md:mx-0">{copy.heroDescription}</p>
      </header>

      <nav className="glass-card flex flex-col gap-4 p-5 text-sm z-10">
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
                className={`flex min-w-[160px] flex-1 flex-col px-5 py-4 text-left transition ${navButtonClass(state)}`}
              >
                <span className={`text-xs uppercase tracking-[0.4em] mb-1 font-semibold ${isActive ? 'text-sky-400/80' : 'text-white/40'}`}>
                  {navBadgePrefix} {index + 1}
                </span>
                <span className="text-base font-semibold text-white tracking-wide">{step.title}</span>
                <span className={`text-xs mt-1 ${isActive ? 'text-sky-100' : 'text-white/60'}`}>{step.subtitle}</span>
              </button>
            );
          })}
        </div>
        <p className={`text-xs text-center md:text-left mt-2 ${mutedText}`}>{copy.stepOverview}</p>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[6fr,4fr] z-10">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeStep === "persona" && (
              <section className="glass-card space-y-8 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-sky-400/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sky-400 text-3xl font-light">1</span>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-medium tracking-wide">{copy.personaHeading}</h2>
                    <p className={`text-sm ${subText}`}>{copy.personaSub}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.nicknameLabel}</label>
                  <input
                    className={fieldClass}
                    value={form.nickname}
                    onChange={(event) => updateField("nickname", event.target.value)}
                    placeholder={copy.nicknamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-semibold tracking-wider uppercase px-1 flex items-center gap-2 ${subText}`}>
                    {copy.focusLabel} <span className="opacity-60 lowercase font-normal">({copy.focusHint})</span>
                  </label>
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
                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-white/5">
                  {consentFields.map(({ key, label }) => (
                    <label
                      key={key}
                      className="glass-pill flex items-center gap-3 !rounded-2xl p-4 text-sm cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(event) => updateField(key, event.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400 focus:ring-offset-slate-900"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors">{label}</span>
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
              <section className="glass-card space-y-8 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-400/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-purple-400 text-3xl font-light">2</span>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-medium tracking-wide">{copy.traitsHeading}</h2>
                    <p className={`text-sm ${subText}`}>{copy.traitsSub}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.moodLabel}</label>
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
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.mbtiLabel}</label>
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
                  <div className="space-y-3">
                    <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.enneagramLabel}</label>
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
                <div className="space-y-3 mt-6">
                  <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.archetypeLabel}</label>
                  <div className="grid gap-3 sm:grid-cols-3">
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
                <div className="space-y-2 mt-6">
                  <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.birthHint}</label>
                  <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className={fieldClass} />
                  {zodiacInsight && (
                    <p className={`mt-2 text-sm text-purple-400`}>
                      {(copy.birthNote ?? "Zodiak: {sign}").replace("{sign}", zodiacInsight.label)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-white/5">
                  <button type="button" onClick={() => setActiveStep("persona")} className={secondaryButtonClass}>
                    {copy.backToStepOne}
                  </button>
                  <button type="submit" disabled={!isComplete || status === "saving"} className={primaryButtonClass}>
                    {status === "saving" ? copy.saveProfileSaving : copy.saveProfileCta}
                  </button>
                </div>
                {message && (
                  <p
                    className={`text-sm ${status === "success"
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

          {
            activeStep === "ritual" && (
              <section className="glass-card space-y-8 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-emerald-400 text-3xl font-light">3</span>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-medium tracking-wide">{copy.ritualHeading}</h2>
                    <p className={`text-sm ${subText}`}>{copy.ritualSub}</p>
                  </div>
                </div>
                <form onSubmit={handleMoodSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold tracking-wider uppercase px-1 ${subText}`}>{copy.moodSelectLabel}</label>
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
                        className={`text-xs ${moodStatus === "success"
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
            )
          }
        </div >

        <aside className="space-y-6">
          <section className="glass-card space-y-4 p-6">
            <p className="emoji-heading">{copy.flowHeading}</p>
            <h2 className="text-xl font-semibold text-white">{copy.flowSubheading}</h2>
            <div className="space-y-3">
              {copy.flowModules.map((module) => (
                <Link
                  href={module.href}
                  key={module.href}
                  className={`flex items-center justify-between rounded-3xl border px-4 py-3 text-sm transition ${isDay
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
      </div >
    </main >
  );
}
