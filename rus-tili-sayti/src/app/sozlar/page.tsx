"use client";

import { useState } from "react";
import Header from "../components/Header";
import Flashcard from "../components/Flashcard";
import { words } from "../data/words";

export default function SozlarPage() {
  const [index, setIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const isFirst = index === 0;

  const handleAnswer = (known: boolean) => {
    if (known) setKnownCount((prev) => prev + 1);

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
            <p className="text-gray-500 mb-8">
              {index + 1} / {words.length}
            </p>

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