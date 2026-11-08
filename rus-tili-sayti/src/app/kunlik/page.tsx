"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { words } from "../data/words";
import { DAILY_CHALLENGE_XP } from "../data/achievements";

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

type Question = { ru: string; correct: string; options: string[] };

function buildQuestions(): Question[] {
  const picked = shuffle(words).slice(0, 5);
  const pool = words.map((w) => w.uzbek);
  return picked.map((w) => ({
    ru: w.russian,
    correct: w.uzbek,
    options: pickOptions(w.uzbek, pool),
  }));
}

type Status = "loading" | "done-today" | "playing" | "finished";

export default function KunlikPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [questions] = useState<Question[]>(() => buildQuestions());
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    fetch("/api/daily-challenge")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) setStatus(d.done ? "done-today" : "playing");
        else setStatus("playing");
      })
      .catch(() => setStatus("playing"));
  }, []);

  const current = questions[qi];

  const handleAnswer = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    if (qi + 1 < questions.length) {
      setQi((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    const res = await fetch("/api/daily-challenge", { method: "POST" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setXpEarned(data?.alreadyDone ? 0 : DAILY_CHALLENGE_XP);
    setStatus("finished");
  };

  const progressPct = useMemo(() => ((qi + 1) / questions.length) * 100, [qi, questions.length]);

  if (status === "loading") {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center text-slate-400">
          Yuklanmoqda...
        </main>
      </div>
    );
  }

  if (status === "done-today") {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">⏳</p>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Bugungi mashq bajarildi!</h1>
          <p className="mt-2 text-slate-500">Ertaga yana +{DAILY_CHALLENGE_XP} bonus ball uchun qaytib keling.</p>
        </main>
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-800">
            {correctCount} / {questions.length} to'g'ri!
          </h1>
          {xpEarned > 0 ? (
            <p className="mt-2 text-lg font-extrabold text-emerald-600">+{xpEarned} bonus ball</p>
          ) : (
            <p className="mt-2 text-slate-500">Bugungi bonus allaqachon olingan edi.</p>
          )}
          <p className="mt-1 text-slate-500">Ertaga yangi savollar bilan qaytib keling.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="⚡"
          title="Kunlik mini-mashq"
          desc={`5 ta tezkor savol — to'g'ri yakunlasangiz +${DAILY_CHALLENGE_XP} bonus ball.`}
        />

        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-400">
            {qi + 1} / {questions.length}
          </p>

          <div className={`${card} mt-4 p-5`}>
            <p className="text-sm font-bold text-slate-400">Tarjimasini toping</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800 break-words">{current.ru}</p>

            <div className="mt-4 space-y-2.5">
              {current.options.map((opt) => {
                const isSel = selected === opt;
                const isCorrectOpt = opt === current.correct;
                let cls = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                if (!answered && isSel) cls = "border-sky-400 bg-sky-50 text-sky-700";
                if (answered && isCorrectOpt) cls = "border-emerald-500 bg-emerald-50 text-emerald-700";
                if (answered && isSel && !isCorrectOpt) cls = "border-rose-500 bg-rose-50 text-rose-600";
                return (
                  <button
                    key={opt}
                    disabled={answered}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left font-bold transition ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <button onClick={handleNext} className={`${btnPrimary} mt-5 w-full`}>
                {qi + 1 < questions.length ? "Keyingisi" : "Yakunlash"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
