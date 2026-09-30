"use client";

import { useState } from "react";
import Header from "../components/Header";
import Flashcard from "../components/Flashcard";
import { words } from "../data/words";
import { recordActivity } from "../data/stats";

export default function SozlarPage() {
  const [index, setIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const isFirst = index === 0;

  const checkpoints: number[] = [];
  for (let i = 0; i * 100 < words.length; i++) {
    checkpoints.push(i * 100);
  }

  const handleAnswer = (known: boolean) => {
    if (known) setKnownCount((prev) => prev + 1);
    recordActivity("word");

    if (index + 1 < words.length) {
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

  const word = words[index];
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        {finished ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Tugatdingiz! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {words.length} so'zdan {knownCount} tasini bilasiz
            </p>
            <button
              onClick={restart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-full text-lg transition"
            >
              Qaytadan boshlash
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              So'zlarni yodlash
            </h1>
            <p className="text-gray-500 mb-4">
              {index + 1} / {words.length}
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-2xl">
              {checkpoints.map((cp) => (
                <button
                  key={cp}
                  onClick={() => handleJump(cp)}
                  className={`py-1 px-3 rounded-full text-sm font-semibold transition ${
                    index >= cp && index < cp + 100
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-900 border border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {cp + 1}
                </button>
              ))}
            </div>

            <Flashcard key={word.id} word={word} />

            <div className="flex gap-4 mt-8 items-center">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full text-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Oldingi
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
              >
                Bilmadim
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
              >
                Bilaman
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
