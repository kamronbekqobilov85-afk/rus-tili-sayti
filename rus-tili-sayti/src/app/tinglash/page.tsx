"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header";
import PageHero, { SessionBar } from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { sentences, Sentence } from "../data/sentences";
import { recordActivity } from "../data/stats";

const SESSION_SIZE = 10;
const LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TinglashPage() {
  const [sessionSentences] = useState<Sentence[]>(() =>
    shuffle(sentences).slice(0, SESSION_SIZE)
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const sentence = sessionSentences[index];
  const isLast = index === sessionSentences.length - 1;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const speak = useCallback(
    (rate = 0.85) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.ru);
      utterance.lang = "ru-RU";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    },
    [sentence]
  );

  // Har bir yangi jumlada avtomatik bir marta ovoz chiqadi
  useEffect(() => {
    if (speechSupported) {
      speak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, speechSupported]);

  const options = useMemo(() => {
    const wrongPool = sentences.filter((s) => s.id !== sentence.id);
    const wrongs = shuffle(wrongPool).slice(0, 3).map((s) => s.uz);
    return shuffle([sentence.uz, ...wrongs]);
  }, [sentence]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === sentence.uz) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    if (!isLast) {
      setIndex((prev) => prev + 1);
    } else {
      setFinished(true);
      recordActivity("test");
    }
  };

  const restart = () => {
    window.location.reload();
  };

  const percentage = Math.round((correctCount / sessionSentences.length) * 100);

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🎧"
          title="Tinglab tushunish"
          desc="Ruscha gapni eshiting va to'g'ri tarjimasini tanlang. Har mashqda 10 ta gap."
        />

        {!speechSupported ? (
          <div className={`${card} mt-4 p-8 text-center`}>
            <p className="mb-2 text-4xl">🔇</p>
            <p className="text-lg text-slate-600">
              Kechirasiz, brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi. Chrome yoki Edge brauzerida urinib
              ko'ring.
            </p>
          </div>
        ) : finished ? (
          <div className={`${card} mt-4 p-8 text-center`}>
            <p className="text-5xl">{percentage >= 70 ? "🎉" : "💪"}</p>
            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-400">Sizning natijangiz</p>
            <p className={`text-6xl font-extrabold ${percentage >= 70 ? "text-emerald-600" : "text-amber-500"}`}>
              {percentage}%
            </p>
            <p className="mt-2 mb-8 text-lg text-slate-600">
              {sessionSentences.length} ta gapdan {correctCount} tasini to'g'ri topdingiz
            </p>
            <button onClick={restart} className={`${btnPrimary} w-full sm:w-auto`}>
              Yangi mashq boshlash
            </button>
          </div>
        ) : (
          <div className={`${card} mt-4 p-5 sm:p-6`}>
            <SessionBar current={index + 1} total={sessionSentences.length} />

            <div className="mt-6 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => speak()}
                  className="flex h-24 w-24 items-center justify-center rounded-full border-b-[6px] border-blue-800 bg-blue-600 text-5xl text-white shadow-lg transition hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
                  aria-label="Qayta tinglash"
                >
                  🔊
                </button>
                <button
                  onClick={() => speak(0.55)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-b-4 border-slate-300 bg-white text-2xl ring-1 ring-slate-200 transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
                  aria-label="Sekin tinglash"
                  title="Sekin tinglash"
                >
                  🐢
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Tugmani bosib qayta eshiting · 🐢 — sekinroq
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {options.map((option, i) => {
                const isCorrect = option === sentence.uz;
                const isSelected = option === selected;
                let style = "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40";
                let badge = "bg-slate-100 text-slate-500";
                if (selected) {
                  if (isCorrect) {
                    style = "border-emerald-500 bg-emerald-50";
                    badge = "bg-emerald-500 text-white";
                  } else if (isSelected) {
                    style = "border-rose-500 bg-rose-50";
                    badge = "bg-rose-500 text-white";
                  } else {
                    style = "border-slate-200 opacity-60";
                  }
                }
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`flex items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 text-left font-medium text-slate-700 transition ${style}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${badge}`}>
                      {LETTERS[i]}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div
                className={`mt-5 rounded-xl p-4 ${
                  selected === sentence.uz ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-rose-50 ring-1 ring-rose-200"
                }`}
              >
                <p className={`font-extrabold ${selected === sentence.uz ? "text-emerald-700" : "text-rose-700"}`}>
                  {selected === sentence.uz ? "To'g'ri! 🎉" : "Noto'g'ri"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Ruscha: <span className="font-bold text-slate-800">{sentence.ru}</span>
                </p>
                <button onClick={handleNext} className={`${btnPrimary} mt-4 w-full`}>
                  {isLast ? "Natijani ko'rish" : "Keyingisi →"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
