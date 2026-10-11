"use client";
import { useState } from "react";
import Link from "next/link";
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

  const shortcuts = [
    { href: "/sozlar", icon: "📚", title: "So'zlar", bg: "#e0f2fe", border: "#bae6fd", text: "#0369a1" },
    { href: "/tinglash", icon: "🎧", title: "Tinglash", bg: "#f3e8ff", border: "#e9d5ff", text: "#7e22ce" },
    { href: "/grammatika", icon: "📖", title: "Grammatika", bg: "#ffedd5", border: "#fed7aa", text: "#c2410c" },
    { href: "/yozish", icon: "✍️", title: "Yozish", bg: "#dcfce7", border: "#bbf7d0", text: "#15803d" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
        <div className="mb-2 text-7xl">🐻</div>
        <h1 className="mb-2 text-center text-4xl font-extrabold text-gray-800 sm:text-5xl">
          Rus tilini o'rganing
        </h1>
        <p className="mb-8 max-w-md text-center text-lg font-medium text-gray-500">
          Kuniga bir necha daqiqa, har kuni. So'zlar, grammatika, tinglash va yozish mashqlari.
        </p>

        <StatsPanel />

        <button
          onClick={handleStart}
          className="mb-8 w-full max-w-md rounded-2xl border-b-4 border-green-700 bg-green-500 py-4 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-green-400 active:translate-y-1 active:border-b-0"
        >
          Boshlash
        </button>

        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {shortcuts.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border-2 border-b-4 p-4 text-center transition active:translate-y-0.5 active:border-b-2"
              style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-1 text-sm font-extrabold uppercase tracking-wide">
                {c.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border-2 border-b-4 border-gray-200 bg-white p-6 shadow-xl">
            <p className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-green-600">
              Kun hikmati
            </p>
            <p className="mb-3 text-center text-xl font-extrabold text-gray-800">
              {currentQuote.russian}
            </p>
            <p className="mb-6 text-center text-lg font-medium text-gray-500">
              {currentQuote.uzbek}
            </p>
            <button
              onClick={handleContinue}
              className="w-full rounded-2xl border-b-4 border-green-700 bg-green-500 py-3 text-lg font-extrabold uppercase tracking-wide text-white transition hover:bg-green-400 active:translate-y-1 active:border-b-0"
            >
              Davom etish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
