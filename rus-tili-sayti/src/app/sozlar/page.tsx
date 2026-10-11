"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import Flashcard from "../components/Flashcard";
import { words, Word } from "../data/words";
import { recordActivity } from "../data/stats";
import { getCategoryLabel } from "../data/categories";
import { recordResult, getDueWordIds, getSrsStats } from "../data/srs";
import { getMistakeIds, addMistake, removeMistake } from "../data/mistakes";

type Mode = "srs" | "mistakes" | "all" | string; // string = category slug

export default function SozlarPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [srsWords, setSrsWords] = useState<Word[]>([]);
  const [srsStats, setSrsStats] = useState<{
    dueCount: number;
    newCount: number;
    learnedCount: number;
  } | null>(null);
  const [mistakeWords, setMistakeWords] = useState<Word[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const allWordIds = useMemo(() => words.map((w) => w.id), []);

  useEffect(() => {
    setSrsStats(getSrsStats(allWordIds));
    setMistakeCount(getMistakeIds().length);
  }, [allWordIds]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of words) {
      counts[w.category] = (counts[w.category] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const activeWords = useMemo(() => {
    if (mode === "srs") return srsWords;
    if (mode === "mistakes") return mistakeWords;
    if (mode === "all" || mode === null) return words;
    return words.filter((w) => w.category === mode);
  }, [mode, srsWords, mistakeWords]);

  const isFirst = index === 0;

  const checkpoints: number[] = [];
  for (let i = 0; i * 100 < activeWords.length; i++) {
    checkpoints.push(i * 100);
  }

  const handleAnswer = (known: boolean) => {
    if (known) setKnownCount((prev) => prev + 1);
    recordActivity("word");

    const word = activeWords[index];
    if (known) {
      removeMistake(word.id);
    } else {
      addMistake(word.id);
    }
    if (mode === "srs") {
      recordResult(word.id, known);
    }

    if (index + 1 < activeWords.length) {
      setIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setIndex((prev) => prev - 1);
    }
  };

  const handleJump = (targetIndex: number) => {
    setIndex(targetIndex);
    setFinished(false);
  };

  const restart = () => {
    setIndex(0);
    setKnownCount(0);
    setFinished(false);
  };

  const selectMode = (m: Mode | null) => {
    if (m === "srs") {
      const { dueIds, newIds } = getDueWordIds(allWordIds);
      const idsToStudy = [...dueIds, ...newIds];
      const wordsToStudy = words.filter((w) => idsToStudy.includes(w.id));
      setSrsWords(wordsToStudy);
    }
    if (m === "mistakes") {
      const ids = getMistakeIds();
      setMistakeWords(words.filter((w) => ids.includes(w.id)));
    }
    if (m === null) {
      setMistakeCount(getMistakeIds().length);
    }
    setMode(m);
    setIndex(0);
    setKnownCount(0);
    setFinished(false);
  };

  const btn =
    "w-full rounded-2xl border-b-4 py-4 text-lg font-extrabold uppercase tracking-wide transition active:translate-y-1 active:border-b-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4";

  // Mode tanlanmagan bo'lsa, tanlash ekranini ko'rsatamiz
  if (mode === null) {
    const srsTotal = srsStats ? srsStats.dueCount + srsStats.newCount : 0;
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-2xl px-4 py-8">
          <h1 className="mb-1 text-center text-3xl font-extrabold text-gray-800">
            So'zlarni yodlash
          </h1>
          <p className="mb-8 text-center font-medium text-gray-500">
            Har kuni takrorlang, barchasini ko'rib chiqing yoki mavzu tanlang
          </p>

          <div className="space-y-3">
            <button
              onClick={() => selectMode("srs")}
              disabled={srsTotal === 0}
              className={`${btn} text-white hover:opacity-90`}
              style={{ backgroundColor: "#f97316", borderColor: "#c2410c", color: "#ffffff" }}
            >
              🔥 Bugungi takrorlash {srsStats ? `(${srsTotal})` : ""}
            </button>
            <p className="text-center text-xs font-medium text-gray-400">
              Aqlli takrorlash: unutilayotgan so'zlar o'z vaqtida qayta ko'rsatiladi
            </p>

            <button
              onClick={() => selectMode("mistakes")}
              disabled={mistakeCount === 0}
              className={`${btn} border-2 border-b-4 border-red-200 bg-white text-red-500 hover:bg-red-50`}
            >
              ❌ Xatolarim ({mistakeCount})
            </button>
            <p className="text-center text-xs font-medium text-gray-400">
              "Bilmadim" bosgan so'zlaringiz shu yerga tushadi. "Bilaman" desangiz, ro'yxatdan chiqadi
            </p>

            <button
              onClick={() => selectMode("all")}
              className={`${btn} border-sky-700 bg-sky-500 text-white hover:bg-sky-400`}
            >
              Barcha so'zlar ({words.length})
            </button>
          </div>

          <p className="mb-3 mt-8 text-sm font-extrabold uppercase tracking-wide text-gray-400">
            Mavzu bo'yicha
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryCounts.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => selectMode(cat)}
                className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 text-left transition hover:border-sky-300 hover:bg-sky-50 active:translate-y-0.5 active:border-b-2"
              >
                <p className="font-extrabold text-gray-700">
                  {getCategoryLabel(cat)}
                </p>
                <p className="text-xs font-bold text-gray-400">{count} ta so'z</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeWords.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 text-6xl">🎉</div>
          <p className="mb-6 text-xl font-bold text-gray-600">
            Hozircha bu bo'limda so'z yo'q.
          </p>
          <button
            onClick={() => selectMode(null)}
            className="rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-8 py-3 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-sky-400 active:translate-y-1 active:border-b-0"
          >
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  const word = activeWords[index];
  const displayTitle =
    mode === "srs"
      ? "Bugungi takrorlash"
      : mode === "mistakes"
      ? "Xatolarim"
      : mode === "all"
      ? "Barcha so'zlar"
      : getCategoryLabel(mode as string);
  const progress = finished
    ? 100
    : Math.round((index / activeWords.length) * 100);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-6">
        {finished ? (
          <div className="mt-10 text-center">
            <div className="mb-3 text-7xl">🎉</div>
            <h1 className="mb-2 text-3xl font-extrabold text-gray-800">
              Tugatdingiz!
            </h1>
            <p className="mb-8 text-xl font-bold text-gray-500">
              {activeWords.length} so'zdan{" "}
              <span className="text-green-600">{knownCount}</span> tasini bilasiz
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={restart}
                className="rounded-2xl border-b-4 border-green-700 bg-green-500 px-8 py-3 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-green-400 active:translate-y-1 active:border-b-0"
              >
                Qaytadan
              </button>
              <button
                onClick={() => selectMode(null)}
                className="rounded-2xl border-b-4 border-gray-300 bg-gray-200 px-8 py-3 text-lg font-extrabold uppercase tracking-wide text-gray-600 transition hover:bg-gray-100 active:translate-y-1 active:border-b-0"
              >
                Boshqa rejim
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex w-full items-center gap-3">
              <button
                onClick={() => selectMode(null)}
                className="text-2xl font-extrabold text-gray-400 hover:text-gray-600"
                aria-label="Orqaga"
              >
                ✕
              </button>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-extrabold text-gray-400">
                {index + 1}/{activeWords.length}
              </span>
            </div>

            <h1 className="mb-4 text-lg font-extrabold uppercase tracking-wide text-gray-400">
              {displayTitle}
            </h1>

            {checkpoints.length > 1 && (
              <div className="mb-5 flex max-w-xl flex-wrap justify-center gap-2">
                {checkpoints.map((cp) => (
                  <button
                    key={cp}
                    onClick={() => handleJump(cp)}
                    className={`rounded-xl border-2 px-3 py-1 text-sm font-extrabold transition ${
                      index >= cp && index < cp + 100
                        ? "border-sky-300 bg-sky-100 text-sky-600"
                        : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {cp + 1}
                  </button>
                ))}
              </div>
            )}

            <Flashcard key={word.id} word={word} />

            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(false)}
                className="rounded-2xl border-b-4 border-red-700 bg-red-500 py-4 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-red-400 active:translate-y-1 active:border-b-0"
              >
                Bilmadim
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="rounded-2xl border-b-4 border-green-700 bg-green-500 py-4 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-green-400 active:translate-y-1 active:border-b-0"
              >
                Bilaman
              </button>
            </div>
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="mt-3 w-full rounded-2xl border-b-4 border-gray-300 bg-gray-200 py-3 font-extrabold uppercase tracking-wide text-gray-600 transition hover:bg-gray-100 active:translate-y-1 active:border-b-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Oldingi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
