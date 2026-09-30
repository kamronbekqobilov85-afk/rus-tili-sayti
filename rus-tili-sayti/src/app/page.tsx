"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import StatsPanel from "./components/StatsPanel";
import { quotes } from "./data/quotes";

const QUOTE_INDEX_KEY = "rus-tili-quote-index";

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const handleStart = () => {
    let index = 0;
    const saved = localStorage.getItem(QUOTE_INDEX_KEY);
    if (saved !== null) {
      index = parseInt(saved, 10);
    }
    if (isNaN(index) || index < 0 || index >= quotes.length) {
      index = 0;
    }
    setCurrentQuote(quotes[index]);
    const nextIndex = (index + 1) % quotes.length;
    localStorage.setItem(QUOTE_INDEX_KEY, nextIndex.toString());
    setShowModal(true);
  };

  const handleContinue = () => {
    setShowModal(false);
    router.push("/sozlar");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <h1 className="text-5xl font-bold text-blue-900 mb-4">
          Rus tilini o'rganing
        </h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
          Noldan boshlab, tez va samarali tarzda rus tilini o'rganing —
          so'zlar, grammatika, testlar va tinglash mashqlari bilan.
        </p>

        <StatsPanel />

        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
        >
          Boshlash
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
            <p className="text-xl font-semibold text-blue-900 mb-3 text-center">
              {currentQuote.russian}
            </p>
            <p className="text-lg text-gray-600 mb-6 text-center">
              {currentQuote.uzbek}
            </p>
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full text-lg transition"
            >
              Davom etish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
