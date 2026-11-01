"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { getLevelGaps } from "../data/gaplar";
import { LEVELS } from "../data/gaplarMeta";
import { saveLessonResult, saveExamResult } from "../data/yol";
import { LESSONS_PER_LEVEL } from "../data/gaplarMeta";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOptions(correct: string, pool: string[]): string[] {
  const candidates = Array.from(new Set(pool)).filter((t) => t !== correct);
  const wrong = shuffle(candidates).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

const SAMPLE_LEVELS = [1, 7, 13, 19, 25];

type Question = {
  level: number;
  ru: string;
  correct: string;
  options: string[];
};

function buildQuestions(): Question[] {
  const questions: Question[] = [];
  for (const level of SAMPLE_LEVELS) {
    if (!LEVELS.some((l) => l.level === level)) continue;
    const gaps = getLevelGaps(level);
    if (gaps.length < 4) continue;
    const pick = gaps[Math.floor(Math.random() * gaps.length)];
    questions.push({
      level,
      ru: pick.ru,
      correct: pick.uz,
      options: pickOptions(
        pick.uz,
        gaps.map((g) => g.uz)
      ),
    });
  }
  return questions;
}

// To'g'ri javoblar soniga qarab qaysi darajadan boshlash kerakligini aniqlaydi
function scoreToLevel(correctCount: number, maxLevel: number): number {
  const ratio = correctCount / SAMPLE_LEVELS.length;
  const target = Math.round(ratio * (maxLevel - 1)) + 1;
  return Math.min(maxLevel, Math.max(1, target));
}

export default function DarajaTestiPage() {
  const router = useRouter();
  const [questions] = useState<Question[]>(() => buildQuestions());
  const [qi, setQi] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"idle" | "answered">("idle");
  const [finished, setFinished] = useState(false);
  const [startLevel, setStartLevel] = useState(1);

  const maxLevel = useMemo(() => LEVELS[LEVELS.length - 1]?.level ?? 1, []);
  const current = questions[qi];

  if (questions.length === 0) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center text-slate-400">
          Test hozircha mavjud emas.
        </main>
      </div>
    );
  }

  const handleAnswer = (opt: string) => {
    if (result !== "idle") return;
    setSelected(opt);
    setResult("answered");
    if (opt === current.correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1);
      setSelected(null);
      setResult("idle");
      return;
    }

    const level = scoreToLevel(correctCount, maxLevel);
    // levellarni 1..level-1 to'liq (darslar + imtihon) o'tilgan deb belgilaymiz
    for (let lv = 1; lv < level; lv++) {
      for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
        saveLessonResult(lv, lesson, 100);
      }
      saveExamResult(lv, 100);
    }
    setStartLevel(level);
    setFinished(true);
  };

  if (finished) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-800">
            Siz {startLevel}-darajadan boshlaysiz!
          </h1>
          <p className="mt-2 text-slate-500">
            {correctCount} / {questions.length} savolga to'g'ri javob berdingiz. Yo'lingiz shu darajaga
            moslab sozlandi.
          </p>
          <button onClick={() => router.push("/yol")} className={`${btnPrimary} mt-6 w-full`}>
            Gaplar yo'liga o'tish
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:py-8">
        <PageHero icon="🎯" title="Darajangizni aniqlang" desc="5 ta qisqa savol — hammasi bir necha soniya." />

        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${((qi + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-400">
            {qi + 1} / {questions.length}
          </p>

          <div className={`${card} mt-4 p-5`}>
            <p className="text-sm font-bold text-slate-400">Tarjimasini toping</p>
            <p className="mt-1 text-xl font-extrabold text-slate-800 break-words">{current.ru}</p>

            <div className="mt-4 space-y-2.5">
              {current.options.map((opt) => {
                const isSel = selected === opt;
                const isCorrectOpt = opt === current.correct;
                let cls = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                if (result === "idle" && isSel) cls = "border-sky-400 bg-sky-50 text-sky-700";
                if (result === "answered" && isCorrectOpt) cls = "border-emerald-500 bg-emerald-50 text-emerald-700";
                if (result === "answered" && isSel && !isCorrectOpt) cls = "border-rose-500 bg-rose-50 text-rose-600";
                return (
                  <button
                    key={opt}
                    disabled={result !== "idle"}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left font-bold transition ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {result === "answered" && (
              <button onClick={handleNext} className={`${btnPrimary} mt-5 w-full`}>
                {qi + 1 < questions.length ? "Keyingisi" : "Natijani ko'rish"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
