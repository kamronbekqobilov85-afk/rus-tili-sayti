"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import GapSession, { SessionResult, shuffle } from "../../components/GapSession";
import { Gap, getGapById, getLevelGaps } from "../../data/gaplar";
import { getDueIds, recordGapResults } from "../../data/gapSrs";
import { recordActivity } from "../../data/stats";

const SESSION_SIZE = 15;
const btn3d =
  "w-full rounded-2xl border-b-4 py-3 text-lg font-extrabold uppercase tracking-wide transition active:translate-y-1 active:border-b-0";

export default function ReviewPage() {
  const [phase, setPhase] = useState<"loading" | "empty" | "intro" | "play" | "done">("loading");
  const [due, setDue] = useState<Gap[]>([]);
  const [batch, setBatch] = useState<Gap[]>([]);
  const [pool, setPool] = useState<Gap[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const gaps: Gap[] = [];
    for (const id of getDueIds()) {
      const g = getGapById(id);
      if (g) gaps.push(g);
    }
    setDue(gaps);
    setPhase(gaps.length === 0 ? "empty" : "intro");
  }, []);

  const start = () => {
    const picked = shuffle(due).slice(0, SESSION_SIZE);
    const levels = Array.from(new Set(picked.map((g) => g.level)));
    const p: Gap[] = [];
    levels.forEach((l) => p.push(...getLevelGaps(l)));
    setBatch(picked);
    setPool(p);
    setAttempt((a) => a + 1);
    setPhase("play");
  };

  const handleComplete = (r: SessionResult) => {
    recordGapResults(r.firstTry);
    recordActivity("test");
    setPercent(r.percent);
    const left = due.filter((g) => !(g.id in r.firstTry));
    setDue(left);
    setPhase("done");
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">✅</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">Bugun takrorlash yo'q</h1>
          <p className="mb-6 font-bold text-gray-500">
            Yangi darslarni tugatgan sari, gaplar takrorlash uchun shu yerga qo'shiladi.
          </p>
          <Link
            href="/yol"
            className={`${btn3d} block border-green-700 bg-green-500 text-white hover:bg-green-400`}
          >
            Yo'lga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">🔁</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">Gaplarni takrorlash</h1>
          <p className="mb-6 font-bold text-gray-500">
            Bugun takrorlash kerak: {due.length} ta gap. Bu safar {Math.min(due.length, SESSION_SIZE)} tasi so'raladi.
            Jon yo'qotmaysiz.
          </p>
          <div className="space-y-3">
            <button
              onClick={start}
              className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400`}
            >
              Boshlash
            </button>
            <Link href="/yol" className="block text-sm font-extrabold uppercase tracking-wide text-gray-400">
              ← Yo'l
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-md px-4 py-10 text-center">
          <div className="mb-2 text-7xl">🎉</div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800">Takrorlash tugadi!</h1>
          <p className="mb-6 text-xl font-extrabold text-gray-500">
            Birinchi urinishda to'g'ri: <span className="text-green-600">{percent}%</span>
          </p>
          <div className="space-y-3">
            {due.length > 0 && (
              <button
                onClick={start}
                className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400`}
              >
                Yana takrorlash ({due.length})
              </button>
            )}
            <Link
              href="/yol"
              className={`${btn3d} block border-sky-700 bg-sky-500 text-white hover:bg-sky-400`}
            >
              Yo'lga qaytish
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
        gaps={batch}
        pool={pool}
        useHearts={false}
        exitHref="/yol"
        onComplete={handleComplete}
        onFail={() => setPhase("done")}
      />
    </div>
  );
}
