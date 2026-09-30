"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import { words } from "../data/words";

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
  };

  const handleNext = () => {
    setInput("");
    setFeedback(null);
    if (!isLast) {
      setIndex((prev) => prev + 1);
    } else {
      setFinished(true);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">
          Yozish mashqi
        </h1>
        <p className="text-gray-500 text-center mb-8">
          So'zning ruscha tarjimasini yozing
        </p>

        {!finished ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-500 text-sm mb-6">
              {index + 1} / {sessionWords.length}
            </p>

            <p className="text-2xl font-bold text-blue-900 mb-6 text-center">
              {word.uzbek}
            </p>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!!feedback}
              autoFocus
              placeholder="Ruscha yozing..."
              className={`w-full border-2 rounded-xl py-3 px-4 text-lg text-center mb-4 outline-none transition ${
                feedback === "correct"
                  ? "border-green-500 bg-green-50"
                  : feedback === "incorrect"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-blue-400"
              }`}
            />

            {feedback === "incorrect" && (
              <p className="text-red-600 text-center mb-4">
                To'g'ri javob:{" "}
                <span className="font-bold">{word.russian}</span>
              </p>
            )}
            {feedback === "correct" && (
              <p className="text-green-600 text-center mb-4 font-semibold">
                To'g'ri! 🎉
              </p>
            )}

            {!feedback ? (
              <button
                onClick={handleCheck}
                disabled={input.trim() === ""}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-40"
              >
                Tekshirish
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                {isLast ? "Natijani ko'rish" : "Keyingisi"}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Sizning natijangiz</p>
            <p className="text-6xl font-bold text-blue-900 mb-2">
              {percentage}%
            </p>
            <p className="text-gray-600 mb-8">
              {sessionWords.length} tadan {correctCount} tasini to'g'ri
              yozdingiz
            </p>
            <button
              onClick={restart}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Yangi mashq boshlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}