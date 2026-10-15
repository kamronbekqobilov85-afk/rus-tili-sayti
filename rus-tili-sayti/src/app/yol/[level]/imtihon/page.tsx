"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import GapSession, { SessionResult, shuffle } from "../../../components/GapSession";
import {
  Gap,
  LESSONS_PER_LEVEL,
  getLessonGaps,
  getLevelGaps,
  getLevelInfo,
} from "../../../data/gaplar";
import {
  EXAM_PASS,
  getExamPercent,
  getProgress,
  isExamUnlocked,
  saveExamResult,
} from "../../../data/yol";
import { recordGapResults } from "../../../data/gapSrs";
import { recordActivity } from "../../../data/stats";

const PER_LESSON = 4; // har darsdan 4 ta gap = jami 20 ta
const btn3d =
  "w-full rounded-2xl border-b-4 py-3 text-lg font-extrabold uppercase tracking-wide transition active:translate-y-1 active:border-b-0";

function pickExamGaps(level: number): Gap[] {
  const out: Gap[] = [];
  for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
    out.push(...shuffle(getLessonGaps(level, lesson)).slice(0, PER_LESSON));
  }
  return out;
}

export default function ExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: levelStr } = use(params);
  const level = parseInt(levelStr, 10);
  const info = getLevelInfo(level);

  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<"intro" | "play" | "done" | "failed">("intro");
  const [attempt, setAttempt] = useState(0);
  const [examGaps, setExamGaps] = useState<Gap[]>([]);
  const [percent, setPercent] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const p = getProgress();
    setUnlocked(isExamUnlocked(p, level));
    setBest(getExamPercent(p, level));
  }, [level]);

  if (!info) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="p-8 text-center">
          <p className="mb-4 text-lg font-bold text-gray-600">Daraja topilmadi.</p>
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
            Imtihon uchun avval {level}-darajaning 5 ta darsini tugating.
          </p>
          <Link href="/yol" className="font-extrabold text-sky-600">← Yo'lga qaytish</Link>
        </div>
      </div>
    );
  }

  const start = () => {
    setExamGaps(pickExamGaps(level));
    setAttempt((a) => a + 1);
    setPhase("play");
  };

  const handleComplete = (r: SessionResult) => {
    const ok = saveExamResult(level, r.percent);
    recordGapResults(r.firstTry);
    recordActivity("test");
    setPercent(r.percent);
    setPassed(ok);
    setBest((b) => Math.max(b, r.percent));
    setPhase("done");
  };

  const hasNext = getLevelInfo(level + 1) !== undefined;

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-xl px-4 py-6">
          <Link href="/yol" className="text-sm font-extrabold text-sky-600">← Yo'l</Link>
          <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-gray-400">
            {level}-daraja
          </p>
          <h1 className="mb-1 text-3xl font-extrabold text-gray-800">🏆 Daraja imtihoni</h1>
          <p className="mb-5 font-medium text-gray-500">
            {info.icon} {info.title}: barcha darslardan aralash 20 ta gap. Keyingi daraja ochilishi uchun
            kamida {EXAM_PASS}% kerak. Ruxsat etilgan xatolar: ❤️ 5 ta jon.
          </p>
          {best > 0 && (
            <p className="mb-4 text-lg font-extrabold text-yellow-500">
              Eng yaxshi natija: {best}%
            </p>
          )}
          <button
            onClick={start}
            className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400`}
          >
            Imtihonni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">{passed ? "🏆" : "💪"}</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">
            {passed ? "Imtihondan o'tdingiz!" : "Biroz yetmadi"}
          </h1>
          <p className="mb-6 text-xl font-extrabold text-gray-500">
            Aniqlik:{" "}
            <span className={passed ? "text-green-600" : "text-red-500"}>{percent}%</span>
          </p>
          {passed ? (
            <p className="mb-6 font-bold text-gray-500">
              {hasNext
                ? `${level + 1}-daraja ochildi!`
                : "Siz hamma darajalarni tugatdingiz. Tabriklaymiz! 🎉"}
            </p>
          ) : (
            <p className="mb-6 font-bold text-gray-500">
              O'tish uchun {EXAM_PASS}% kerak. Darslarni yana bir bor takrorlab, qayta urinib ko'ring.
            </p>
          )}
          <div className="space-y-3">
            {passed && hasNext && (
              <Link
                href={`/yol/${level + 1}/1`}
                className={`${btn3d} block border-green-700 bg-green-500 text-white hover:bg-green-400`}
              >
                {level + 1}-darajani boshlash
              </Link>
            )}
            <button
              onClick={start}
              className={`${btn3d} border-sky-700 bg-sky-500 text-white hover:bg-sky-400`}
            >
              {passed ? "Qayta topshirish" : "Qayta urinish"}
            </button>
            <Link href="/yol" className="block text-sm font-extrabold uppercase tracking-wide text-gray-400">
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
            Imtihon bu safar o'tmadi. Darslarni takrorlab, qayta urinib ko'ring.
          </p>
          <div className="space-y-3">
            <button
              onClick={start}
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
        gaps={examGaps}
        pool={getLevelGaps(level)}
        exitHref="/yol"
        onComplete={handleComplete}
        onFail={() => setPhase("failed")}
      />
    </div>
  );
}
