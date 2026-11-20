"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./Header";
import MysteryChest from "./MysteryChest";
import ApkDownload from "./ApkDownload";
import SuhbatBanner from "./SuhbatBanner";
import { quotes, quoteOfTheDay } from "../data/quotes";
import { getDisplayStats, DisplayStats } from "../data/stats";
import { getDueIds } from "../data/gapSrs";
import { LEVELS, LESSONS_PER_LEVEL } from "../data/gaplarMeta";
import {
  getProgress,
  getStars,
  isLessonUnlocked,
  areLessonsDone,
  isExamPassed,
  totalStarsAll,
  MAX_STARS,
} from "../data/yol";

type Counts = {
  words: number;
  grammar: number;
  videos: number;
  gaps: number;
  levels: number;
};

type NextStep = {
  href: string;
  level: number;
  levelTitle: string;
  title: string;
  isExam: boolean;
  isNew: boolean;
};

type YolSummary = {
  next: NextStep | null; // null — hammasi tugagan
  doneLessons: number;
  totalLessons: number;
  stars: number;
};

function getYolSummary(): YolSummary {
  const p = getProgress();
  const totalLessons = LEVELS.length * LESSONS_PER_LEVEL;
  let doneLessons = 0;
  let next: NextStep | null = null;

  for (const lv of LEVELS) {
    for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
      const stars = getStars(p, lv.level, lesson);
      if (stars > 0) doneLessons++;
      if (!next && stars === 0 && isLessonUnlocked(p, lv.level, lesson)) {
        next = {
          href: `/yol/${lv.level}/${lesson}`,
          level: lv.level,
          levelTitle: lv.title,
          title: `${lesson}-dars: ${lv.lessonTitles[lesson - 1]}`,
          isExam: false,
          isNew: false,
        };
      }
    }
    if (!next && areLessonsDone(p, lv.level) && !isExamPassed(p, lv.level)) {
      next = {
        href: `/yol/${lv.level}/imtihon`,
        level: lv.level,
        levelTitle: lv.title,
        title: "Daraja imtihoni",
        isExam: true,
        isNew: false,
      };
    }
  }
  if (next) next.isNew = doneLessons === 0;

  return { next, doneLessons, totalLessons, stars: totalStarsAll(p) };
}

export default function HomeClient({ counts }: { counts: Counts }) {
  const [stats, setStats] = useState<DisplayStats | null>(null);
  const [yol, setYol] = useState<YolSummary | null>(null);
  const [due, setDue] = useState(0);
  const [quote, setQuote] = useState(quotes[0]);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    setStats(getDisplayStats());
    setYol(getYolSummary());
    setDue(getDueIds().length);
    setQuote(quoteOfTheDay());

    try {
      if (!sessionStorage.getItem("quotePopupShown")) {
        sessionStorage.setItem("quotePopupShown", "1");
        setShowQuote(true);
      }
    } catch {
      setShowQuote(true);
    }
  }, []);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const sections = [
    {
      href: "/yol",
      icon: "🛤️",
      title: "Gaplar yo'li",
      desc: "Oddiydan murakkabga: darslar, yulduzlar va daraja imtihonlari",
      badge: `${fmt(counts.gaps)} ta gap · ${counts.levels} daraja`,
      grad: "from-indigo-500 to-violet-500",
      featured: true,
    },
    {
      href: "/sozlar",
      icon: "📚",
      title: "So'zlar",
      desc: "Kartochkalar bilan yodlang, mavzular bo'yicha tanlang",
      badge: `${fmt(counts.words)} ta so'z`,
      grad: "from-sky-500 to-cyan-500",
    },
    {
      href: "/grammatika",
      icon: "📖",
      title: "Grammatika",
      desc: "Qoidalar o'zbekcha tushuntirilgan, har mavzuda mashq bor",
      badge: `${counts.grammar} ta mavzu`,
      grad: "from-orange-500 to-amber-400",
    },
    {
      href: "/tinglash",
      icon: "🎧",
      title: "Tinglash",
      desc: "Ruscha gapni eshiting va ma'nosini toping",
      badge: "Quloqni o'rgatish",
      grad: "from-fuchsia-500 to-pink-500",
    },
    {
      href: "/yozish",
      icon: "✍️",
      title: "Yozish",
      desc: "So'zning ruscha tarjimasini o'zingiz yozing",
      badge: "Imlo mashqi",
      grad: "from-rose-500 to-red-400",
    },
    {
      href: "/video",
      icon: "🎬",
      title: "Video",
      desc: "Ruscha qo'shiqlar subtitr bilan",
      badge: `${counts.videos} ta video`,
      grad: "from-amber-500 to-yellow-400",
    },
    {
      href: "/gapirish",
      icon: "🎙️",
      title: "Gapirish",
      desc: "Gapni talaffuz qilib yozib yuboring",
      badge: "Og'zaki mashq",
      grad: "from-teal-500 to-emerald-400",
    },
  ];

  const progressPct = yol ? Math.round((yol.doneLessons / yol.totalLessons) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      {showQuote && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 sm:items-center"
          onClick={() => setShowQuote(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-slate-800 to-indigo-950 p-6 text-white shadow-2xl"
          >
            <button
              onClick={() => setShowQuote(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Yopish"
            >
              ✕
            </button>
            <p className="text-3xl">💡</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-indigo-300">Kun hikmati</p>
            <p className="mt-2 text-xl font-extrabold leading-snug">«{quote.russian}»</p>
            <p className="mt-2 text-slate-300">{quote.uzbek}</p>
            <button
              onClick={() => setShowQuote(false)}
              className="mt-5 w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 py-3 text-center font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-6 pt-4 sm:py-8">
        {/* Asosiy blok: keyingi dars */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-indigo-500/20 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10" />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-3 select-none text-[120px] font-extrabold leading-none text-white/10 sm:text-[170px]"
          >
            Я
          </span>

          <div className="relative grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20">
                Bepul · O&apos;zbek tilida
              </p>
              <h1 className="mt-3 text-[26px] font-extrabold leading-tight sm:text-4xl">
                Rus tilini qadamma-qadam o&apos;rganing
              </h1>
              <p className="mt-2 max-w-md text-sm text-indigo-50/90 sm:text-lg">
                Kuniga 10–15 daqiqa yetarli. Gaplar, so&apos;zlar, grammatika va tinglash — bir joyda.
              </p>
              {yol && yol.doneLessons === 0 && (
                <Link
                  href="/daraja-testi"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/25 transition active:bg-white/25"
                >
                  🎯 Darajangizni bilmaysizmi? Test →
                </Link>
              )}
            </div>

            <div className="rounded-3xl bg-white p-4 text-slate-800 shadow-xl sm:p-5">
              {!yol ? (
                <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
              ) : yol.next ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {yol.next.isNew ? "Shu yerdan boshlang" : "Keyingi qadam"}
                    </p>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700">
                      {progressPct}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-indigo-600">
                    {yol.next.level}-daraja · {yol.next.levelTitle}
                  </p>
                  <p className="text-lg font-extrabold leading-snug">{yol.next.title}</p>

                  <div className="mt-3">
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                        style={{ width: `${Math.max(progressPct, 3)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {yol.doneLessons} / {yol.totalLessons} dars
                    </p>
                  </div>

                  <Link
                    href={yol.next.href}
                    className="mt-3 block rounded-2xl border-b-4 border-indigo-800 bg-indigo-600 py-3.5 text-center text-base font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2"
                  >
                    {yol.next.isNew ? "Boshlash" : yol.next.isExam ? "Imtihonni topshirish" : "Davom etish"}
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-lg font-extrabold">🏆 Barcha darajalar tugadi!</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ajoyib natija. Endi takrorlash bilan bilimni mustahkamlang.
                  </p>
                  <Link
                    href="/yol/takrorlash"
                    className="mt-4 block rounded-2xl border-b-4 border-indigo-800 bg-indigo-600 py-3.5 text-center font-extrabold uppercase tracking-wide text-white"
                  >
                    Takrorlash
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Natijalar — ixcham qator */}
        <section className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
          <StatTile icon="🔥" value={stats?.streak} label="Kun ketma-ket" color="text-orange-500" />
          <StatTile icon="📚" value={stats?.todayWords} label="Bugungi so'z" color="text-sky-600" />
          <StatTile icon="✅" value={stats?.todayTests} label="Bugungi test" color="text-green-600" />
          <StatTile
            icon="⭐"
            value={yol?.stars}
            label={yol ? `/ ${yol.totalLessons * MAX_STARS} yulduz` : "Yulduz"}
            color="text-amber-500"
          />
        </section>

        {/* Takrorlash eslatmasi */}
        {due > 0 && (
          <Link
            href="/yol/takrorlash"
            className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 transition active:bg-amber-100"
          >
            <span className="text-3xl">🔁</span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold text-amber-900">{due} ta gapni takrorlang</span>
              <span className="block text-sm text-amber-800/80">Vaqti keldi — esda qolishi uchun</span>
            </span>
            <span className="text-xl font-bold text-amber-700">→</span>
          </Link>
        )}

        {/* Ko'cha suhbati */}
        <SuhbatBanner />

        {/* Sirli sandiq — kuniga bir marta */}
        <MysteryChest />

        {/* Kunlik vazifalar */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/kunlik"
            className="flex flex-col rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-3.5 transition active:scale-[0.98]"
          >
            <span className="text-3xl">⚡</span>
            <span className="mt-2 font-extrabold text-violet-900">Kunlik mini-mashq</span>
            <span className="mt-0.5 text-xs leading-snug text-violet-800/80">5 ta tezkor savol — bonus ball</span>
          </Link>
          <Link
            href="/challenge"
            className="flex flex-col rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3.5 transition active:scale-[0.98]"
          >
            <span className="text-3xl">🏆</span>
            <span className="mt-2 font-extrabold text-rose-900">Haftalik Challenge</span>
            <span className="mt-0.5 text-xs leading-snug text-rose-800/80">1-o&apos;rin — Telegram Premium!</span>
          </Link>
        </div>

        {/* Bo'limlar */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-slate-800">Bo&apos;limlar</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:shadow-md ${
                  s.featured ? "col-span-2 lg:col-span-1" : ""
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-sm ${s.grad}`}
                >
                  {s.icon}
                </span>
                <span className="mt-2.5 font-extrabold text-slate-800">{s.title}</span>
                <span
                  className={`mt-0.5 text-xs leading-snug text-slate-500 sm:text-sm ${
                    s.featured ? "" : "hidden sm:block"
                  }`}
                >
                  {s.desc}
                </span>
                <span className="mt-2 inline-block self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  {s.badge}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <ApkDownload variant="card" />

        {/* Ilovani Telegram orqali do'stlarga yuborish */}
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent("https://rus-tili-sayti.vercel.app")}&text=${encodeURIComponent("📲 Rus tilini o'zbek tilida bepul o'rganing — ilovani telefoningizga o'rnating!")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 p-3.5 transition active:scale-[0.98]"
        >
          <span className="text-3xl">📤</span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-indigo-900">Ilovani Telegramda yuboring</span>
            <span className="block text-sm text-indigo-800/80">Do&apos;stlaringiz havolani bosib o&apos;rnatib oladi</span>
          </span>
          <span className="text-xl font-bold text-indigo-700">→</span>
        </a>

        {/* Telegram kanal */}
        <a
          href="https://t.me/rustili24soat"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white shadow-md transition active:scale-[0.98]"
        >
          <span className="text-3xl">📢</span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold">Telegram kanalimiz</span>
            <span className="block text-sm text-sky-50/90">Yangiliklar va challenge — biz bilan o&apos;rganing</span>
          </span>
          <span className="text-xl font-bold">→</span>
        </a>

        {/* Qanday o'rganish + kun hikmati */}
        <section className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-extrabold text-slate-800">Qanday o&apos;rganish kerak?</h2>
            <ol className="mt-3 space-y-3">
              {[
                ["Gaplar yo'lida dars o'ting", "Har dars 20 ta gap. 70% dan yuqori natija keyingi darsni ochadi."],
                ["So'zlarni yodlang", "Kartochkalarda bilgan so'zingizni «Bilaman», bilmaganini «Bilmadim» deb belgilang."],
                ["Takrorlashni unutmang", "Ilova gapni qachon takrorlash kerakligini o'zi eslatadi."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold text-slate-800">{t}</span>
                    <span className="block text-sm text-slate-500">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-950 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">💡 Kun hikmati</p>
            <p className="mt-2 text-xl font-extrabold leading-snug">«{quote.russian}»</p>
            <p className="mt-2 text-slate-300">{quote.uzbek}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number | undefined;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-1 py-2.5 text-center shadow-sm">
      <span className="text-lg leading-none">{icon}</span>
      <span className={`mt-1 text-xl font-extrabold leading-none ${color}`}>{value ?? "–"}</span>
      <span className="mt-1 text-[10px] font-semibold leading-tight text-slate-400">{label}</span>
    </div>
  );
}
