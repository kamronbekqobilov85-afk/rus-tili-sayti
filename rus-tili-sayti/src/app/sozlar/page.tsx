"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import Flashcard from "../components/Flashcard";
import PageHero, { HeroChip, SessionBar } from "../components/PageHero";
import { card, pageShell, btnPrimary, btnSecondary, btnDanger } from "../components/ui";
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

  // Mode tanlanmagan bo'lsa, tanlash ekranini ko'rsatamiz
  if (mode === null) {
    const srsTotal = srsStats ? srsStats.dueCount + srsStats.newCount : 0;
    const modes = [
      {
        key: "srs" as Mode,
        icon: "🔥",
        title: "Bugungi takrorlash",
        count: srsStats ? srsTotal : null,
        hint: srsStats
          ? `${srsStats.dueCount} ta takrorlash va ${srsStats.newCount} ta yangi so'z`
          : "Unutilayotgan so'zlar o'z vaqtida qayta chiqadi",
        disabled: srsTotal === 0,
        tint: "bg-orange-50 ring-orange-200",
        accent: "text-orange-600",
      },
      {
        key: "mistakes" as Mode,
        icon: "❌",
        title: "Xatolarim",
        count: mistakeCount,
        hint: "«Bilmadim» bosgan so'zlar. «Bilaman» desangiz, ro'yxatdan chiqadi",
        disabled: mistakeCount === 0,
        tint: "bg-rose-50 ring-rose-200",
        accent: "text-rose-600",
      },
      {
        key: "all" as Mode,
        icon: "📚",
        title: "Barcha so'zlar",
        count: words.length,
        hint: "Hammasini tartib bilan, 100 tadan bo'lib ko'rib chiqing",
        disabled: false,
        tint: "bg-sky-50 ring-sky-200",
        accent: "text-sky-600",
      },
    ];

    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
          <PageHero
            icon="📚"
            title="So'zlarni yodlash"
            desc="Kartochkadagi so'zni o'qing, tarjimasini eslang va tekshiring. Har kuni ozgina — eng samarali usul."
          >
            <HeroChip>{words.length.toLocaleString("ru-RU")} ta so'z</HeroChip>
            {srsStats && <HeroChip>✅ {srsStats.learnedCount} ta o'rganilgan</HeroChip>}
          </PageHero>

          <h2 className="mt-8 text-lg font-extrabold text-slate-800">Qanday mashq qilasiz?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {modes.map((m) => (
              <button
                key={m.key}
                onClick={() => selectMode(m.key)}
                disabled={m.disabled}
                className={`${card} flex flex-col p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ring-1 ${m.tint}`}>
                    {m.icon}
                  </span>
                  <span className="font-extrabold text-slate-800">{m.title}</span>
                </span>
                <span className={`mt-3 text-3xl font-extrabold ${m.accent}`}>
                  {m.count ?? "–"}
                  <span className="ml-1 text-sm font-semibold text-slate-400">ta so'z</span>
                </span>
                <span className="mt-1 text-sm leading-snug text-slate-500">{m.hint}</span>
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-extrabold text-slate-800">Mavzu bo'yicha</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryCounts.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => selectMode(cat)}
                className={`${card} group flex items-center justify-between gap-2 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-extrabold text-slate-700">{getCategoryLabel(cat)}</span>
                  <span className="block text-xs font-bold text-slate-400">{count} ta so'z</span>
                </span>
                <span className="text-slate-300 transition group-hover:text-emerald-500">→</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (activeWords.length === 0) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-8">
          <div className={`${card} w-full p-8 text-center`}>
            <div className="mb-3 text-6xl">🎉</div>
            <p className="mb-6 text-xl font-bold text-slate-600">Hozircha bu bo'limda so'z yo'q.</p>
            <button onClick={() => selectMode(null)} className={btnPrimary}>
              Orqaga
            </button>
          </div>
        </main>
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

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-6">
        {finished ? (
          <div className={`${card} mt-6 w-full p-8 text-center`}>
            <div className="mb-3 text-7xl">🎉</div>
            <h1 className="mb-2 text-3xl font-extrabold text-slate-800">Tugatdingiz!</h1>
            <p className="mb-8 text-lg font-bold text-slate-500">
              {activeWords.length} ta so'zdan{" "}
              <span className="text-emerald-600">{knownCount}</span> tasini bilasiz
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={restart} className={btnPrimary}>
                Qaytadan
              </button>
              <button onClick={() => selectMode(null)} className={btnSecondary}>
                Boshqa mashq
              </button>
            </div>
          </div>
        ) : (
          <>
            <SessionBar
              current={index + 1}
              total={activeWords.length}
              onExit={() => selectMode(null)}
            />

            <p className="mt-4 text-sm font-extrabold uppercase tracking-wide text-slate-400">
              {displayTitle}
            </p>

            {checkpoints.length > 1 && (
              <div className="mt-3 flex max-w-xl flex-wrap justify-center gap-1.5">
                {checkpoints.map((cp) => (
                  <button
                    key={cp}
                    onClick={() => handleJump(cp)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ring-1 transition ${
                      index >= cp && index < cp + 100
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-300"
                        : "bg-white text-slate-400 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cp + 1}–{Math.min(cp + 100, activeWords.length)}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex w-full justify-center">
              <Flashcard key={word.id} word={word} />
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <button onClick={() => handleAnswer(false)} className={`${btnDanger} py-4 text-lg`}>
                Bilmadim
              </button>
              <button onClick={() => handleAnswer(true)} className={`${btnPrimary} py-4 text-lg`}>
                Bilaman
              </button>
            </div>
            <button onClick={handlePrev} disabled={isFirst} className={`${btnSecondary} mt-3 w-full`}>
              ← Oldingi so'z
            </button>
          </>
        )}
      </main>
    </div>
  );
}
