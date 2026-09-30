"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import Flashcard from "../components/Flashcard";
import { words } from "../data/words";
import { recordActivity } from "../data/stats";
import { getCategoryLabel } from "../data/categories";

export default function SozlarPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of words) {
      counts[w.category] = (counts[w.category] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const activeWords = useMemo(
    () => (category ? words.filter((w) => w.category === category) : words),
    [category]
  );

  const isFirst = index === 0;

  const checkpoints: number[] = [];
  for (let i = 0; i * 100 < activeWords.length; i++) {
    checkpoints.push(i * 100);
  }

  const handleAnswer = (known: boolean) => {
    if (known) setKnownCount((prev) => prev + 1);
    recordActivity("word");

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

  const selectCategory = (cat: string | null) => {
    setCategory(cat);
    setIndex(0);
    setKnownCount(0);
    setFinished(false);
  };

  // Kategoriya tanlanmagan bo'lsa, tanlash ekranini ko'rsatamiz
  if (category === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto py-12 px-4 w-full">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">
            So'zlarni yodlash
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Barcha so'zlarni ketma-ket o'rganing yoki mavzu tanlang
          </p>

          <button
            onClick={() => selectCategory("__all__")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition mb-8"
          >
            Barcha so'zlar ({words.length} ta)
          </button>

          <p className="text-gray-500 font-semibold mb-3">Yoki mavzu bo'yicha:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryCounts.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 text-left hover:ring-blue-300 hover:shadow-md transition"
              >
                <p className="font-semibold text-blue-900">
                  {getCategoryLabel(cat)}
                </p>
                <p className="text-xs text-gray-500">{count} ta so'z</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const word = activeWords[index];
  const displayCategory =
    category === "__all__" ? "Barcha so'zlar" : getCategoryLabel(category);

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
              {activeWords.length} so'zdan {knownCount} tasini bilasiz
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={restart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
              >
                Qaytadan boshlash
              </button>
              <button
                onClick={() => selectCategory(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-full text-lg transition"
              >
                Boshqa mavzu
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => selectCategory(null)}
              className="text-blue-600 text-sm mb-3 hover:underline"
            >
              ← Mavzu tanlashga qaytish
            </button>
            <h1 className="text-3xl font-bold text-blue-900 mb-1">
              {displayCategory}
            </h1>
            <p className="text-gray-500 mb-4">
              {index + 1} / {activeWords.length}
            </p>

            {checkpoints.length > 1 && (
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
            )}

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
