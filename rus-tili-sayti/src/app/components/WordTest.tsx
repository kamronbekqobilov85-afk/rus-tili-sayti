"use client";

import { useMemo, useRef, useState } from "react";
import { card, btnPrimary, btnSecondary } from "./ui";
import { speak, shuffle } from "./GapSession";
import { words, Word } from "../data/words";
import { getCategoryLabel } from "../data/categories";
import { recordActivity, syncXp } from "../data/stats";

const QUESTIONS = 10;
const OPTIONS = 5;
const HALF_KEY = "rus-tili-sozlar-half"; // 0,5 balllik toq javob (ikkitasi 1 ball bo'ladi)

function buildOptions(w: Word, pool: Word[]): string[] {
  const used = new Set<string>([w.uzbek]);
  const picks: string[] = [];
  const sameCat = shuffle(pool.filter((x) => x.category === w.category && x.id !== w.id));
  const others = shuffle(pool.filter((x) => x.category !== w.category));
  for (const x of [...sameCat, ...others]) {
    if (picks.length >= OPTIONS - 1) break;
    if (used.has(x.uzbek)) continue;
    used.add(x.uzbek);
    picks.push(x.uzbek);
  }
  return shuffle([w.uzbek, ...picks]);
}

type Q = { word: Word; options: string[] };

function buildQuiz(cat: string | null): Q[] {
  const base = cat ? words.filter((w) => w.category === cat) : words;
  return shuffle(base)
    .slice(0, QUESTIONS)
    .map((w) => ({ word: w, options: buildOptions(w, words) }));
}

// Har bir to'g'ri javob uchun 0,5 ball. Server butun ball saqlaydi, shuning uchun har ikkita to'g'ri javobga 1 ball yuboriladi.
function addHalfPoint() {
  let half = 0;
  try {
    half = parseInt(localStorage.getItem(HALF_KEY) || "0", 10) || 0;
  } catch {
    // ignore
  }
  half += 1;
  if (half >= 2) {
    half = 0;
    syncXp({ type: "pair" });
  }
  try {
    localStorage.setItem(HALF_KEY, String(half));
  } catch {
    // ignore
  }
}

export default function WordTest({ onExit }: { onExit: () => void }) {
  const [cat, setCat] = useState<string | null | undefined>(undefined); // undefined = hali tanlanmagan
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const lock = useRef(false);

  const topics = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of words) counts[w.category] = (counts[w.category] || 0) + 1;
    return Object.entries(counts)
      .filter(([, n]) => n >= 10)
      .sort((a, b) => b[1] - a[1]);
  }, []);

  const start = (c: string | null) => {
    setCat(c);
    setQs(buildQuiz(c));
    setI(0);
    setPicked(null);
    setCorrect(0);
    setFinished(false);
    lock.current = false;
  };

  if (cat === undefined) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
        <button onClick={onExit} className="text-sm font-extrabold text-indigo-600">
          ← Orqaga
        </button>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-800">🧪 So&apos;z testi</h1>
        <p className="mt-1 text-slate-500">
          Ruscha so&apos;z beriladi, 5 ta variantdan to&apos;g&apos;ri tarjimasini toping.{" "}
          <strong className="text-amber-600">Har bir to&apos;g&apos;ri javob = +0,5 ball</strong> (noto&apos;g&apos;ri javobga ball
          berilmaydi).
        </p>

        <button
          onClick={() => start(null)}
          className={`${card} mt-5 flex w-full items-center justify-between p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
        >
          <span className="font-extrabold text-slate-800">🎲 Barcha mavzulardan aralash</span>
          <span className="text-indigo-500">→</span>
        </button>

        <h2 className="mt-6 text-lg font-extrabold text-slate-800">Yoki mavzuni tanlang</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {topics.map(([c, n]) => (
            <button
              key={c}
              onClick={() => start(c)}
              className={`${card} flex items-center justify-between gap-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <span className="min-w-0">
                <span className="block truncate font-extrabold text-slate-700">{getCategoryLabel(c)}</span>
                <span className="block text-xs font-bold text-slate-400">{n} ta so&apos;z</span>
              </span>
              <span className="text-slate-300">→</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const total = qs.length;

  if (finished) {
    const earned = correct * 0.5;
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-6">
        <div className={`${card} mt-6 w-full p-8 text-center`}>
          <div className="mb-3 text-7xl">{correct === total ? "🎉" : "💪"}</div>
          <h1 className="mb-2 text-3xl font-extrabold text-slate-800">Test tugadi!</h1>
          <p className="mb-2 text-lg font-bold text-slate-500">
            {total} tadan <span className="text-green-600">{correct}</span> ta to&apos;g&apos;ri
          </p>
          <p className="mb-6 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-700">
            ⭐ +{String(earned).replace(".", ",")} ball
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => start(cat)} className={btnPrimary}>
              Yana test
            </button>
            <button onClick={() => setCat(undefined)} className={btnSecondary}>
              Mavzu tanlash
            </button>
            <button onClick={onExit} className={btnSecondary}>
              Chiqish
            </button>
          </div>
        </div>
      </main>
    );
  }

  const q = qs[i];
  if (!q) return null;

  const choose = (opt: string) => {
    if (picked || lock.current) return;
    lock.current = true;
    setPicked(opt);
    recordActivity("word", { noXp: true }); // faqat statistika va seriya
    if (opt === q.word.uzbek) {
      setCorrect((c) => c + 1);
      addHalfPoint(); // faqat to'g'ri topsa: +0,5
    }
  };

  const next = () => {
    lock.current = false;
    if (i + 1 >= total) {
      setFinished(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setCat(undefined)} className="text-2xl font-extrabold text-slate-400" aria-label="Chiqish">
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
            style={{ width: `${Math.round((i / total) * 100)}%` }}
          />
        </div>
        <span className="text-sm font-extrabold text-slate-500">
          {i + 1} / {total}
        </span>
      </div>

      <p className="mt-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-400">
        {cat ? getCategoryLabel(cat) : "Aralash"} · to&apos;g&apos;ri javob = +0,5 ball
      </p>

      <div className={`${card} mt-3 p-6 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => speak(q.word.russian)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 text-xl text-white active:translate-y-0.5 active:border-b-0"
            aria-label="Tinglash"
          >
            🔊
          </button>
          <p className="text-3xl font-extrabold text-slate-800 break-words">{q.word.russian}</p>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-400">{q.word.transcription}</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {q.options.map((opt) => {
          const isCorrect = opt === q.word.uzbek;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50";
          if (picked && isCorrect) cls = "border-green-500 bg-green-100 text-green-700";
          if (picked && picked === opt && !isCorrect) cls = "border-red-500 bg-red-100 text-red-600";
          return (
            <button
              key={opt}
              disabled={!!picked}
              onClick={() => choose(opt)}
              className={`w-full rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-bold transition active:translate-y-0.5 active:border-b-2 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4">
          <p
            className="mb-2 text-center text-lg font-extrabold"
            style={{ color: picked === q.word.uzbek ? "#16a34a" : "#dc2626" }}
          >
            {picked === q.word.uzbek ? "✅ To'g'ri! +0,5 ball" : `❌ To'g'ri javob: ${q.word.uzbek}`}
          </p>
          <button onClick={next} className={`${btnPrimary} w-full py-3 text-lg`}>
            {i + 1 >= total ? "Natijani ko'rish" : "Keyingisi"}
          </button>
        </div>
      )}
    </main>
  );
}
