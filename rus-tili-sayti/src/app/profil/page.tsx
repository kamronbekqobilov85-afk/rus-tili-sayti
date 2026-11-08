"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell, btnPrimary, btnSecondary } from "../components/ui";
import { ACHIEVEMENTS } from "../data/achievements";
import GroupSection from "../components/GroupSection";

type Stats = {
  xp: number;
  dailyGoal: number;
  todayXp: number;
  achievements: string[];
  referralCode: string;
  referralCount: number;
};

const GOAL_OPTIONS = [10, 20, 30, 50, 100];

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.ok && setStats(d))
      .catch(() => {});
  }, [status]);

  if (status === "loading" || (status === "authenticated" && !stats)) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 text-center text-slate-400">
          Yuklanmoqda...
        </main>
      </div>
    );
  }

  if (status !== "authenticated" || !stats) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">🔒</p>
          <p className="mt-3 text-lg font-bold text-slate-600">
            Profilni ko'rish uchun Google hisobingiz bilan kiring.
          </p>
        </main>
      </div>
    );
  }

  const referralLink =
    typeof window !== "undefined" ? `${window.location.origin}/?ref=${stats.referralCode}` : "";

  const sharePercent = Math.min(100, Math.round((stats.todayXp / stats.dailyGoal) * 100));

  async function changeGoal(goal: number) {
    setSavingGoal(true);
    await fetch("/api/me/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoal: goal }),
    }).catch(() => {});
    setStats((s) => (s ? { ...s, dailyGoal: goal } : s));
    setSavingGoal(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard mavjud emas
    }
  }

  async function shareResult() {
    if (!stats) return;
    const text = `Men "Rus tilini bepul o'rganing" saytida ${stats.xp} ball to'pladim! 🎉 Sen ham urinib ko'r:`;
    if (navigator.share) {
      try {
        await navigator.share({ text, url: referralLink });
        return;
      } catch {
        // foydalanuvchi bekor qildi — pastdagi fallback shart emas
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // e'tiborsiz qoldiramiz
    }
  }

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        <PageHero icon="👤" title="Mening hisobim" desc={`${session?.user?.name || "Siz"} — ${stats.xp} ball`}>
          <HeroChip>⭐ {stats.xp} ball</HeroChip>
          {stats.referralCount > 0 && <HeroChip>🤝 {stats.referralCount} do'st taklif qilindi</HeroChip>}
        </PageHero>

        {/* Kunlik maqsad */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-slate-800">Kunlik maqsad</h2>
          <div className={`${card} mt-3 p-4`}>
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span>{stats.todayXp} / {stats.dailyGoal} ball</span>
              <span>{sharePercent}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${sharePercent}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  disabled={savingGoal}
                  onClick={() => changeGoal(g)}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition ${
                    stats.dailyGoal === g
                      ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {g} ball
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Yutuqlar */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-slate-800">Yutuqlar</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = stats.achievements.includes(a.key);
              return (
                <div
                  key={a.key}
                  className={`${card} flex flex-col items-center gap-1 p-4 text-center ${
                    unlocked ? "" : "opacity-40"
                  }`}
                >
                  <span className="text-3xl">{unlocked ? a.icon : "🔒"}</span>
                  <p className="text-sm font-extrabold text-slate-700">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
              );
            })}
          </div>
          <Link
            href="/sertifikat"
            className="mt-4 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
          >
            <span className="text-3xl">🏆</span>
            <span className="flex-1">
              <span className="block font-extrabold text-amber-900">Sertifikatlar</span>
              <span className="block text-sm text-amber-800/80">
                Har 1000 ballda yangi, o'ziga xos sertifikat ochiladi
              </span>
            </span>
            <span className="text-xl font-bold text-amber-700">→</span>
          </Link>
        </section>

        <GroupSection myId={session?.user?.id} />

        {/* Do'stlarni taklif qilish */}
        <section className="mt-8 mb-10">
          <h2 className="text-lg font-extrabold text-slate-800">Do'stlarni taklif qilish</h2>
          <div className={`${card} mt-3 p-4`}>
            <p className="text-sm text-slate-500">
              Havolangiz orqali kirgan har bir do'stingiz uchun sizga{" "}
              <span className="font-extrabold text-emerald-600">100 ball</span> beriladi.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={referralLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600"
              />
              <button onClick={copyLink} className={`${btnSecondary} shrink-0 px-4 py-2 text-sm`}>
                {copied ? "✅ Nusxalandi" : "Nusxalash"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                  "Men rus tilini bu saytda o'rganyapman, sen ham urinib ko'r:"
                )}`}
                target="_blank"
                rel="noreferrer"
                className={`${btnSecondary} px-4 py-2 text-sm`}
              >
                Telegram
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Men rus tilini bu saytda o'rganyapman, sen ham urinib ko'r: ${referralLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className={`${btnSecondary} px-4 py-2 text-sm`}
              >
                WhatsApp
              </a>
              <button onClick={shareResult} className={`${btnPrimary} px-4 py-2 text-sm`}>
                🎉 Natijamni ulashish
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
