"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import {
  LEVELS,
  LESSONS_PER_LEVEL,
  TOTAL_PLANNED_LEVELS,
  totalGapCount,
} from "../data/gaplar";
import {
  getProgress,
  getStars,
  EXAM_PASS,
  areLessonsDone,
  isExamPassed,
  isLessonUnlocked,
  isLevelComplete,
  levelStars,
  totalStarsAll,
  YolProgress,
} from "../data/yol";

const OFFSETS = [0, 40, 0, -40, 0]; // yo'l egri-bugri ko'rinishi uchun

export default function YolPage() {
  const [progress, setProgress] = useState<YolProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const p: YolProgress = progress || { lessons: {} };

  const totalLessons = LEVELS.length * LESSONS_PER_LEVEL;
  let doneLessons = 0;
  let currentKey: string | null = null; // navbatdagi dars
  for (const lv of LEVELS) {
    for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
      const stars = getStars(p, lv.level, lesson);
      if (stars > 0) doneLessons++;
      if (!currentKey && stars === 0 && isLessonUnlocked(p, lv.level, lesson)) {
        currentKey = `${lv.level}-${lesson}`;
      }
    }
  }

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🛤️"
          title="Gaplar yo'li"
          desc="Oddiy birikmalardan murakkab gaplargacha. Darsdan kamida 70% olsangiz, keyingi dars ochiladi."
        >
          <HeroChip>📝 {totalGapCount().toLocaleString("ru-RU")} ta gap</HeroChip>
          <HeroChip>
            📘 {doneLessons} / {totalLessons} dars
          </HeroChip>
          <HeroChip>
            ⭐ {totalStarsAll(p)} / {totalLessons * 3}
          </HeroChip>
        </PageHero>

        <Link
          href="/yol/takrorlash"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
        >
          <span className="text-3xl">🔁</span>
          <span className="flex-1">
            <span className="block font-extrabold text-amber-900">Gaplarni takrorlash</span>
            <span className="block text-sm text-amber-800/80">
              O'tilgan gaplar o'z vaqtida qayta so'raladi — shunda esdan chiqmaydi
            </span>
          </span>
          <span className="text-xl font-bold text-amber-700">→</span>
        </Link>

        <div className="mt-6 space-y-4">
          {LEVELS.map((lv) => {
            const levelUnlocked = lv.level === 1 || isLevelComplete(p, lv.level - 1);
            const complete = isLevelComplete(p, lv.level);
            const stars = levelStars(p, lv.level);
            return (
              <section key={lv.level} className={`${card} overflow-hidden`}>
                <div
                  className={`flex items-center gap-4 p-4 ${
                    levelUnlocked ? "border-b border-slate-100" : "opacity-60"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-1 ${
                      levelUnlocked ? "bg-emerald-50 ring-emerald-200" : "bg-slate-100 ring-slate-200 grayscale"
                    }`}
                  >
                    {lv.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {lv.level}-daraja
                      {complete && <span className="ml-2 text-emerald-600">✓ Tugallandi</span>}
                    </p>
                    <p className="font-extrabold text-slate-800">{lv.title}</p>
                    <p className="text-sm leading-snug text-slate-500">{lv.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-extrabold text-amber-600 ring-1 ring-amber-200">
                    ⭐ {stars}/{LESSONS_PER_LEVEL * 3}
                  </span>
                </div>

                {!levelUnlocked ? (
                  <p className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">
                    🔒 {lv.level - 1}-darajani tugatsangiz ochiladi · {LESSONS_PER_LEVEL} ta dars va imtihon
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-5 px-4 py-6">
                    {lv.lessonTitles.map((title, i) => {
                      const lesson = i + 1;
                      const unlocked = isLessonUnlocked(p, lv.level, lesson);
                      const lessonStars = getStars(p, lv.level, lesson);
                      const done = lessonStars >= 1;
                      const isCurrent = currentKey === `${lv.level}-${lesson}`;

                      const circle = (
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full border-b-[6px] text-2xl font-extrabold transition active:translate-y-0.5 active:border-b-2 ${
                            !unlocked
                              ? "border-slate-300 bg-slate-200 text-slate-400"
                              : done
                              ? "border-amber-500 bg-amber-400 text-white"
                              : "border-emerald-700 bg-emerald-500 text-white"
                          } ${isCurrent ? "ring-4 ring-emerald-200" : ""}`}
                        >
                          {!unlocked ? "🔒" : done ? "★" : lesson}
                        </div>
                      );

                      return (
                        <div
                          key={lesson}
                          className="flex w-44 flex-col items-center text-center"
                          style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}
                        >
                          {isCurrent && (
                            <span className="mb-1.5 rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
                              Shu yerdan
                            </span>
                          )}
                          {unlocked ? (
                            <Link href={`/yol/${lv.level}/${lesson}`} aria-label={`${lesson}-dars: ${title}`}>
                              {circle}
                            </Link>
                          ) : (
                            circle
                          )}
                          <p className={`mt-2 text-sm font-extrabold ${unlocked ? "text-slate-700" : "text-slate-400"}`}>
                            {lesson}. {title}
                          </p>
                          <p className="text-xs font-bold tracking-widest text-amber-500">
                            {unlocked ? (
                              "★".repeat(lessonStars) + "☆".repeat(3 - lessonStars)
                            ) : (
                              <span className="tracking-normal text-slate-400">Yopiq</span>
                            )}
                          </p>
                        </div>
                      );
                    })}

                    {(() => {
                      const open = areLessonsDone(p, lv.level);
                      const passed = isExamPassed(p, lv.level);
                      const circle = (
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full border-b-[6px] text-2xl transition active:translate-y-0.5 active:border-b-2 ${
                            !open
                              ? "border-slate-300 bg-slate-200 grayscale"
                              : passed
                              ? "border-amber-500 bg-amber-400"
                              : "border-orange-600 bg-orange-500"
                          }`}
                        >
                          🏆
                        </div>
                      );
                      return (
                        <div className="flex w-44 flex-col items-center text-center">
                          {open ? <Link href={`/yol/${lv.level}/imtihon`}>{circle}</Link> : circle}
                          <p className={`mt-2 text-sm font-extrabold ${open ? "text-slate-700" : "text-slate-400"}`}>
                            Daraja imtihoni
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            {passed
                              ? "O'tildi ✓"
                              : open
                              ? `O'tish uchun ${EXAM_PASS}% kerak`
                              : "Barcha darslardan keyin"}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </section>
            );
          })}

          {LEVELS.length < TOTAL_PLANNED_LEVELS && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center">
              <p className="text-2xl">🚧</p>
              <p className="font-extrabold text-slate-600">
                Yana {TOTAL_PLANNED_LEVELS - LEVELS.length} ta daraja tayyorlanmoqda
              </p>
              <p className="text-sm font-medium text-slate-400">Gaplar asta-sekin murakkablashib boradi</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
