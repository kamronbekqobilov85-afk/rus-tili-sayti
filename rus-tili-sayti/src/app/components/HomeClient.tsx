"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./Header";
import { quotes } from "../data/quotes";
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

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
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
    setQuote(randomQuote());

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
      tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    {
      href: "/sozlar",
      icon: "📚",
      title: "So'zlar",
      desc: "Kartochkalar bilan yodlang, mavzular bo'yicha tanlang",
      badge: `${fmt(counts.words)} ta so'z`,
      tint: "bg-sky-50 text-sky-700 ring-sky-200",
    },
    {
      href: "/grammatika",
      icon: "📖",
      title: "Grammatika",
      desc: "Qoidalar o'zbekcha tushuntirilgan, har mavzuda mashq bor",
      badge: `${counts.grammar} ta mavzu`,
      tint: "bg-orange-50 text-orange-700 ring-orange-200",
    },
    {
      href: "/tinglash",
      icon: "🎧",
      title: "Tinglash",
      desc: "Ruscha gapni eshiting va ma'nosini toping",
      badge: "Quloqni o'rgatish",
      tint: "bg-violet-50 text-violet-700 ring-violet-200",
    },
    {
      href: "/yozish",
      icon: "✍️",
      title: "Yozish",
      desc: "So'zning ruscha tarjimasini o'zingiz yozing",
      badge: "Imloni mustahkamlash",
      tint: "bg-rose-50 text-rose-700 ring-rose-200",
    },
    {
      href: "/video",
      icon: "🎬",
      title: "Video",
      desc: "Ruscha qo'shiqlar subtitr bilan",
      badge: `${counts.videos} ta video`,
      tint: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    {
      href: "/gapirish",
      icon: "🎙️",
      title: "Gapirish",
      desc: "Gapni talaffuz qilib yozib yuboring",
      badge: "Og'zaki mashq",
      tint: "bg-rose-50 text-rose-700 ring-rose-200",
    },
  ];

  const progressPct = yol ? Math.round((yol.doneLessons / yol.totalLessons) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      {showQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setShowQuote(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-slate-800 p-6 text-white shadow-2xl"
          >
            <button
              onClick={() => setShowQuote(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Yopish"
            >
              ✕
            </button>
            <p className="text-3xl">💡</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-emerald-300">Kun hikmati</p>
            <p className="mt-2 text-xl font-extrabold leading-snug">«{quote.russian}»</p>
            <p className="mt-2 text-slate-300">{quote.uzbek}</p>
            <button
              onClick={() => setShowQuote(false)}
              className="mt-5 w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-2.5 text-center font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Asosiy blok: kirish va keyingi dars */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 p-6 text-white shadow-lg sm:p-8">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-20"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path d="M0 60C80 20 160 100 240 60S360 30 400 50V100H0Z" fill="#fff" />
          </svg>

          <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-100">
                Bepul · O'zbek tilida
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                Rus tilini qadamma-qadam o'rganing
              </h1>
              <p className="mt-3 max-w-md text-base text-emerald-50/90 sm:text-lg">
                Har kuni 10–15 daqiqa yetarli. Gaplar, so'zlar, grammatika va tinglash — hammasi bir joyda.
              </p>
              {yol && yol.doneLessons === 0 && (
                <Link
                  href="/daraja-testi"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25"
                >
                  🎯 Darajangizni bilmaysizmi? Qisqa test oling →
                </Link>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-md">
              {!yol ? (
                <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
              ) : yol.next ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {yol.next.isNew ? "Shu yerdan boshlang" : "Keyingi qadam"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    {yol.next.level}-daraja · {yol.next.levelTitle}
                  </p>
                  <p className="text-lg font-extrabold">{yol.next.title}</p>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Umumiy yo'l</span>
                      <span>
                        {yol.doneLessons} / {yol.totalLessons} dars
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(progressPct, 2)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={yol.next.href}
                    className="mt-4 block rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 text-center text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2"
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
                    className="mt-4 block rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 text-center font-extrabold uppercase tracking-wide text-white"
                  >
                    Takrorlash
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Takrorlash eslatmasi */}
        {due > 0 && (
          <Link
            href="/yol/takrorlash"
            className="mt-4 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
          >
            <span className="text-3xl">🔁</span>
            <span className="flex-1">
              <span className="block font-extrabold text-amber-900">
                {due} ta gapni takrorlash vaqti keldi
              </span>
              <span className="block text-sm text-amber-800/80">
                Takrorlash so'zlarni uzoq vaqt eslab qolishga yordam beradi
              </span>
            </span>
            <span className="text-xl font-bold text-amber-700">→</span>
          </Link>
        )}

        {/* Kunlik mini-mashq */}
        <Link
          href="/kunlik"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 transition hover:bg-violet-100"
        >
          <span className="text-3xl">⚡</span>
          <span className="flex-1">
            <span className="block font-extrabold text-violet-900">Kunlik mini-mashq</span>
            <span className="block text-sm text-violet-800/80">
              5 ta tezkor savol — bonus ball uchun har kuni yangi
            </span>
          </span>
          <span className="text-xl font-bold text-violet-700">→</span>
        </Link>

        {/* Haftalik Challenge */}
        <Link
          href="/challenge"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 transition hover:bg-rose-100"
        >
          <span className="text-3xl">🏆</span>
          <span className="flex-1">
            <span className="block font-extrabold text-rose-900">Haftalik Challenge</span>
            <span className="block text-sm text-rose-800/80">
              1-o'rin — Telegram Premium yutib oling!
            </span>
          </span>
          <span className="text-xl font-bold text-rose-700">→</span>
        </Link>

        {/* Telegram kanal */}
        <a
          href="https://t.me/rustili24soat"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 transition hover:bg-sky-100"
        >
          <span className="text-3xl">📢</span>
          <span className="flex-1">
            <span className="block font-extrabold text-sky-900">Telegram kanalimizga qo'shiling</span>
            <span className="block text-sm text-sky-800/80">
              Challenge haqida batafsil bilib oling va rus tilini biz bilan birgalikda o'rganing
            </span>
          </span>
          <span className="text-xl font-bold text-sky-700">→</span>
        </a>

        {/* Bugungi natijalar */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-slate-800">Sizning natijalaringiz</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon="🔥"
              value={stats?.streak}
              unit="kun"
              label="Ketma-ket o'qish"
              hint="Har kuni kamida bitta mashq qiling"
              color="text-orange-500"
            />
            <StatTile
              icon="📚"
              value={stats?.todayWords}
              unit="ta"
              label="Bugun ko'rilgan so'zlar"
              hint={stats ? `Jami: ${fmt(stats.totalWords)} ta` : ""}
              color="text-sky-600"
            />
            <StatTile
              icon="✅"
              value={stats?.todayTests}
              unit="ta"
              label="Bugun yechilgan testlar"
              hint={stats ? `Jami: ${fmt(stats.totalTests)} ta` : ""}
              color="text-emerald-600"
            />
            <StatTile
              icon="⭐"
              value={yol?.stars}
              unit={yol ? `/ ${yol.totalLessons * 3}` : ""}
              label="Yulduzlar"
              hint="Har bir darsdan 3 tagacha yulduz"
              color="text-amber-500"
            />
          </div>
        </section>

        {/* Bo'limlar */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-slate-800">Bo'limlar</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-1 ${s.tint}`}>
                  {s.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-800">{s.title}</span>
                    <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500">
                      →
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-500">{s.desc}</span>
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${s.tint}`}>
                    {s.badge}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Qanday o'rganish + kun hikmati */}
        <section className="mt-8 grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-800">Qanday o'rganish kerak?</h2>
            <ol className="mt-3 space-y-3">
              {[
                ["Gaplar yo'lida dars o'ting", "Har dars 20 ta gap. 70% dan yuqori natija keyingi darsni ochadi."],
                ["So'zlarni yodlang", "Kartochkalarda bilgan so'zingizni «Bilaman», bilmaganini «Bilmadim» deb belgilang."],
                ["Takrorlashni unutmang", "Ilova gapni qachon takrorlash kerakligini o'zi eslatadi."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">
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

          <div className="flex flex-col justify-center rounded-2xl bg-slate-800 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Hikmat</p>
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
  unit,
  label,
  hint,
  color,
}: {
  icon: string;
  value: number | undefined;
  unit: string;
  label: string;
  hint: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <p className="mt-2">
        <span className={`text-3xl font-extrabold ${color}`}>{value ?? "–"}</span>
        <span className="ml-1 text-sm font-semibold text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
