"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
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

const OFFSETS = [0, 36, 0, -36, 0]; // yo'l egri-bugri ko'rinishi uchun

export default function YolPage() {
  const [progress, setProgress] = useState<YolProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const p: YolProgress = progress || { lessons: {} };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Gaplar yo'li</h1>
          <p className="mt-1 font-medium text-gray-500">
            Oddiy birikmalardan murakkab gaplargacha. Darsni yaxshi o'zlashtirsangiz, keyingisi ochiladi.
          </p>
          <div className="mt-3 flex justify-center gap-3 text-sm font-extrabold">
            <span className="rounded-xl border-2 border-gray-200 px-3 py-1 text-gray-500">
              ⭐ {totalStarsAll(p)}
            </span>
            <span className="rounded-xl border-2 border-gray-200 px-3 py-1 text-gray-500">
              📝 {totalGapCount()} ta gap
            </span>
          </div>
        </div>

        <Link
          href="/yol/takrorlash"
          className="mb-8 block rounded-2xl border-b-4 px-4 py-3 text-center text-lg font-extrabold uppercase tracking-wide text-white transition active:translate-y-1 active:border-b-0"
          style={{ backgroundColor: "#f97316", borderColor: "#c2410c" }}
        >
          🔁 Gaplarni takrorlash
        </Link>

        {LEVELS.map((lv) => {
          const levelUnlocked = lv.level === 1 || isLevelComplete(p, lv.level - 1);
          return (
            <section key={lv.level} className="mb-10">
              <div
                className="mb-5 flex items-center justify-between rounded-2xl border-b-4 px-4 py-3 text-white"
                style={{
                  backgroundColor: levelUnlocked ? "#58cc02" : "#afafaf",
                  borderColor: levelUnlocked ? "#46a302" : "#8a8a8a",
                }}
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide opacity-90">
                    {lv.level}-daraja
                  </p>
                  <p className="text-lg font-extrabold">
                    {lv.icon} {lv.title}
                  </p>
                  <p className="text-xs font-bold opacity-90">{lv.desc}</p>
                </div>
                <div className="text-right text-sm font-extrabold">
                  ⭐ {levelStars(p, lv.level)}/{LESSONS_PER_LEVEL * 3}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                {lv.lessonTitles.map((title, i) => {
                  const lesson = i + 1;
                  const unlocked = isLessonUnlocked(p, lv.level, lesson);
                  const stars = getStars(p, lv.level, lesson);
                  const done = stars >= 1;

                  const circle = (
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full border-b-8 text-3xl font-extrabold text-white transition active:translate-y-1 active:border-b-4"
                      style={{
                        backgroundColor: !unlocked
                          ? "#e5e5e5"
                          : done
                          ? "#ffc800"
                          : "#58cc02",
                        borderColor: !unlocked
                          ? "#cfcfcf"
                          : done
                          ? "#cc9f00"
                          : "#46a302",
                      }}
                    >
                      {!unlocked ? "🔒" : done ? "⭐" : lesson}
                    </div>
                  );

                  return (
                    <div
                      key={lesson}
                      className="flex flex-col items-center"
                      style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}
                    >
                      {unlocked ? (
                        <Link href={`/yol/${lv.level}/${lesson}`}>{circle}</Link>
                      ) : (
                        circle
                      )}
                      <p className="mt-2 text-sm font-extrabold text-gray-600">
                        {title}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        {unlocked
                          ? "★".repeat(stars) + "☆".repeat(3 - stars)
                          : "Yopiq"}
                      </p>
                    </div>
                  );
                })}
                {(() => {
                  const open = areLessonsDone(p, lv.level);
                  const passed = isExamPassed(p, lv.level);
                  const circle = (
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full border-b-8 text-3xl font-extrabold text-white transition active:translate-y-1 active:border-b-4"
                      style={{
                        backgroundColor: !open ? "#e5e5e5" : passed ? "#ffc800" : "#ff9600",
                        borderColor: !open ? "#cfcfcf" : passed ? "#cc9f00" : "#cc7800",
                      }}
                    >
                      {!open ? "🔒" : "🏆"}
                    </div>
                  );
                  return (
                    <div className="flex flex-col items-center">
                      {open ? <Link href={`/yol/${lv.level}/imtihon`}>{circle}</Link> : circle}
                      <p className="mt-2 text-sm font-extrabold text-gray-600">Daraja imtihoni</p>
                      <p className="text-xs font-bold text-gray-400">
                        {passed ? "O'tildi ✓" : open ? `${EXAM_PASS}% kerak` : "Yopiq"}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </section>
          );
        })}

        {LEVELS.length < TOTAL_PLANNED_LEVELS && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center">
            <p className="text-2xl">🚧</p>
            <p className="font-extrabold text-gray-600">
              Yana {TOTAL_PLANNED_LEVELS - LEVELS.length} ta daraja tayyorlanmoqda
            </p>
            <p className="text-sm font-medium text-gray-400">
              Gaplar asta-sekin murakkablashib boradi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
