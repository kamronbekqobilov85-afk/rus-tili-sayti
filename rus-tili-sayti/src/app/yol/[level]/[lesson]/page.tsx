"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import GapSession, { MAX_HEARTS, SessionResult, shuffle, speak } from "../../../components/GapSession";
import {
  Gap,
  LESSONS_PER_LEVEL,
  getGapById,
  getLessonGaps,
  getLevelGaps,
  getLevelInfo,
} from "../../../data/gaplar";
import { getProgress, getStars, isLessonUnlocked, saveLessonResult } from "../../../data/yol";
import { getDueIds, recordGapResults } from "../../../data/gapSrs";
import { recordActivity } from "../../../data/stats";

const MAX_REVIEW = 6;
const btn3d =
  "w-full rounded-2xl border-b-4 py-3 text-lg font-extrabold uppercase tracking-wide transition active:translate-y-1 active:border-b-0";

export default function LessonPage({
  params,
}: {
  params: Promise<{ level: string; lesson: string }>;
}) {
  const { level: levelStr, lesson: lessonStr } = use(params);
  const level = parseInt(levelStr, 10);
  const lesson = parseInt(lessonStr, 10);

  const info = getLevelInfo(level);
  const gaps = getLessonGaps(level, lesson);

  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [bestStars, setBestStars] = useState(0);
  const [phase, setPhase] = useState<"intro" | "play" | "done" | "failed">("intro");
  const [showList, setShowList] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [reviewGaps, setReviewGaps] = useState<Gap[]>([]);
  const [dueReview, setDueReview] = useState(0);

  const [finalPercent, setFinalPercent] = useState(0);
  const [finalStars, setFinalStars] = useState(0);

  useEffect(() => {
    const p = getProgress();
    setUnlocked(isLessonUnlocked(p, level, lesson));
    setBestStars(getStars(p, level, lesson));
    setDueReview(countReview(level, lesson));
  }, [level, lesson]);

  if (!info || gaps.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="p-8 text-center">
          <p className="mb-4 text-lg font-bold text-gray-600">Dars topilmadi.</p>
          <Link href="/yol" className="font-extrabold text-sky-600">← Yo'lga qaytish</Link>
        </div>
      </div>
    );
  }

  if (unlocked === false) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="p-8 text-center">
          <p className="mb-2 text-5xl">🔒</p>
          <p className="mb-4 text-lg font-bold text-gray-600">
            Bu dars hali yopiq. Avval oldingi darsni tugating.
          </p>
          <Link href="/yol" className="font-extrabold text-sky-600">← Yo'lga qaytish</Link>
        </div>
      </div>
    );
  }

  const startLesson = () => {
    setReviewGaps(pickReview(level, lesson));
    setAttempt((a) => a + 1);
    setPhase("play");
  };

  const handleComplete = (r: SessionResult) => {
    const stars = saveLessonResult(level, lesson, r.percent);
    recordGapResults(r.firstTry);
    recordActivity("test");
    setFinalPercent(r.percent);
    setFinalStars(stars);
    setBestStars((b) => Math.max(b, stars));
    setPhase("done");
  };

  const title = info.lessonTitles[lesson - 1];

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-xl px-4 py-6">
          <Link href="/yol" className="text-sm font-extrabold text-sky-600">← Yo'l</Link>
          <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-gray-400">
            {level}-daraja · {lesson}-dars
          </p>
          <h1 className="mb-1 text-3xl font-extrabold text-gray-800">{title}</h1>
          <p className="mb-3 font-medium text-gray-500">
            {gaps.length} ta gap · ❤️ {MAX_HEARTS} jon · 70% dan keyingi dars ochiladi
          </p>
          {dueReview > 0 && (
            <p
              className="mb-4 rounded-2xl px-3 py-2 text-sm font-extrabold"
              style={{ backgroundColor: "#ddf4ff", color: "#1899d6" }}
            >
              🔁 Dars boshida oldingi darslardan {Math.min(dueReview, MAX_REVIEW)} ta gap takrorlanadi
            </p>
          )}

          {bestStars > 0 && (
            <p className="mb-4 text-lg font-extrabold text-yellow-500">
              Eng yaxshi natija: {"★".repeat(bestStars)}{"☆".repeat(3 - bestStars)}
            </p>
          )}

          <button
            onClick={startLesson}
            className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400`}
          >
            Boshlash
          </button>

          <button
            onClick={() => setShowList((v) => !v)}
            className="mt-4 w-full text-center text-sm font-extrabold uppercase tracking-wide text-sky-600"
          >
            {showList ? "Gaplar ro'yxatini yashirish" : "📋 Avval gaplarni ko'rib chiqish"}
          </button>

          {showList && (
            <ul className="mt-3 space-y-2">
              {gaps.map((g, i) => (
                <li
                  key={g.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3"
                >
                  <button
                    onClick={() => speak(g.ru)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-sky-700 bg-sky-500 text-lg text-white active:translate-y-0.5 active:border-b-0"
                    aria-label="Tinglash"
                  >
                    🔊
                  </button>
                  <div className="min-w-0">
                    <p className="font-extrabold text-gray-800 break-words">{i + 1}. {g.ru}</p>
                    <p className="text-sm font-medium text-gray-500 break-words">{g.uz}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const passed = finalStars >= 1;
    const nextHref = lesson < LESSONS_PER_LEVEL ? `/yol/${level}/${lesson + 1}` : `/yol/${level}/imtihon`;
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">{passed ? "🎉" : "💪"}</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">
            {passed ? "Dars tugadi!" : "Deyarli bo'ldi!"}
          </h1>
          <p className="mb-2 text-4xl text-yellow-400">
            {"★".repeat(finalStars)}
            <span className="text-gray-300">{"★".repeat(3 - finalStars)}</span>
          </p>
          <p className="mb-6 text-xl font-extrabold text-gray-500">
            Aniqlik: <span className={passed ? "text-green-600" : "text-red-500"}>{finalPercent}%</span>
          </p>
          {!passed && (
            <p className="mb-6 font-bold text-gray-500">
              Keyingi dars ochilishi uchun kamida 70% kerak. Qayta urinib ko'ring!
            </p>
          )}
          <div className="space-y-3">
            {passed && (
              <Link
                href={nextHref}
                className={`${btn3d} block border-green-700 bg-green-500 text-white hover:bg-green-400`}
              >
                {lesson < LESSONS_PER_LEVEL ? "Keyingi dars" : "🏆 Daraja imtihoni"}
              </Link>
            )}
            <button
              onClick={startLesson}
              className={`${btn3d} border-sky-700 bg-sky-500 text-white hover:bg-sky-400`}
            >
              Qayta o'ynash
            </button>
            <Link
              href="/yol"
              className="block text-sm font-extrabold uppercase tracking-wide text-gray-400"
            >
              ← Yo'l
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">💔</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">Jonlar tugadi</h1>
          <p className="mb-6 font-bold text-gray-500">
            Xavotir olmang, xatolar o'rganishning bir qismi. Gaplarni qayta ko'rib, yana urinib ko'ring.
          </p>
          <div className="space-y-3">
            <button
              onClick={startLesson}
              className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400`}
            >
              Qayta urinish
            </button>
            <Link href="/yol" className="block text-sm font-extrabold uppercase tracking-wide text-gray-400">
              ← Yo'l
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <GapSession
        key={attempt}
        gaps={gaps}
        review={reviewGaps}
        pool={getLevelGaps(level)}
        exitHref="/yol"
        onComplete={handleComplete}
        onFail={() => setPhase("failed")}
      />
    </div>
  );
}

// Oldingi darslardan takrorlash vaqti kelgan gaplar
function dueEarlier(level: number, lesson: number): Gap[] {
  const out: Gap[] = [];
  for (const id of getDueIds()) {
    const g = getGapById(id);
    if (!g) continue;
    if (g.level < level || (g.level === level && g.lesson < lesson)) out.push(g);
  }
  return out;
}

function countReview(level: number, lesson: number): number {
  return dueEarlier(level, lesson).length;
}

function pickReview(level: number, lesson: number): Gap[] {
  return shuffle(dueEarlier(level, lesson)).slice(0, MAX_REVIEW);
}
