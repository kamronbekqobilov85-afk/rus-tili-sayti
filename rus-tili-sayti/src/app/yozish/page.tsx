"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import PageHero, { SessionBar } from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { words } from "../data/words";
import { recordActivity } from "../data/stats";

const SESSION_SIZE = 20;

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function YozishPage() {
  const [sessionWords, setSessionWords] = useState(() =>
    shuffle(words).slice(0, SESSION_SIZE)
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const word = sessionWords[index];
  const isLast = index === sessionWords.length - 1;

  const handleCheck = () => {
    if (feedback) return;
    if (input.trim() === "") return;
    const isCorrect = normalize(input) === normalize(word.russian);
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    recordActivity("word");
  };

  const handleNext = () => {
    setInput("");
    setFeedback(null);
    if (!isLast) {
      setIndex((prev) => prev + 1);
    } else {
      setFinished(true);
      recordActivity("test");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (feedback) {
        handleNext();
      } else {
        handleCheck();
      }
    }
  };

  const restart = () => {
    setSessionWords(shuffle(words).slice(0, SESSION_SIZE));
    setIndex(0);
    setInput("");
    setFeedback(null);
    setCorrectCount(0);
    setFinished(false);
  };

  const percentage = useMemo(
    () => Math.round((correctCount / sessionWords.length) * 100),
    [correctCount, sessionWords.length]
  );

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="✍️"
          title="Yozish mashqi"
          desc="O'zbekcha so'zni o'qing va uning ruscha tarjimasini kirill harflarida yozing. Har mashqda 20 ta so'z."
        />

        {!finished ? (
          <div className={`${card} mt-4 p-5 sm:p-6`}>
            <SessionBar current={index + 1} total={sessionWords.length} />

            <p className="mt-6 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
              Ruschasini yozing
            </p>
            <p className="mt-1 mb-6 text-center text-3xl font-extrabold text-slate-800">{word.uzbek}</p>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!!feedback}
              autoFocus
              lang="ru"
              placeholder="Ruscha yozing..."
              className={`w-full rounded-xl border-2 px-4 py-3 text-center text-xl outline-none transition ${
                feedback === "correct"
                  ? "border-emerald-500 bg-emerald-50"
                  : feedback === "incorrect"
                  ? "border-rose-500 bg-rose-50"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            <p className="mt-2 text-center text-xs text-slate-400">
              Klaviaturani rus tiliga o'tkazing (Alt+Shift) · Enter — tekshirish
            </p>

            {feedback === "incorrect" && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-center ring-1 ring-rose-200">
                <p className="text-sm font-bold text-rose-700">Noto'g'ri</p>
                <p className="text-slate-600">
                  To'g'ri javob: <span className="text-lg font-extrabold text-slate-800">{word.russian}</span>
                </p>
              </div>
            )}
            {feedback === "correct" && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                To'g'ri! 🎉
              </div>
            )}

            {!feedback ? (
              <button onClick={handleCheck} disabled={input.trim() === ""} className={`${btnPrimary} mt-4 w-full`}>
                Tekshirish
              </button>
            ) : (
              <button onClick={handleNext} className={`${btnPrimary} mt-4 w-full`}>
                {isLast ? "Natijani ko'rish" : "Keyingisi →"}
              </button>
            )}
          </div>
        ) : (
          <div className={`${card} mt-4 p-8 text-center`}>
            <p className="text-5xl">{percentage >= 70 ? "🎉" : "💪"}</p>
            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-400">Sizning natijangiz</p>
            <p className={`text-6xl font-extrabold ${percentage >= 70 ? "text-emerald-600" : "text-amber-500"}`}>
              {percentage}%
            </p>
            <p className="mt-2 mb-8 text-lg text-slate-600">
              {sessionWords.length} ta so'zdan {correctCount} tasini to'g'ri yozdingiz
            </p>
            <button onClick={restart} className={`${btnPrimary} w-full sm:w-auto`}>
              Yangi mashq boshlash
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
