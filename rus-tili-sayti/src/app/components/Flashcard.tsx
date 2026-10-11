"use client";

import { useState } from "react";
import { Word } from "../data/words";

export default function Flashcard({ word }: { word: Word }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.russian);
    utterance.lang = "ru-RU";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      onClick={() => setShowAnswer(!showAnswer)}
      className="w-full max-w-md cursor-pointer select-none rounded-3xl border-2 border-b-4 border-gray-200 bg-white px-6 py-10 text-center transition active:translate-y-0.5 active:border-b-2"
    >
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleSpeak}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-2xl text-white transition hover:bg-sky-400 active:translate-y-0.5 active:border-b-0"
          aria-label="Tinglash"
        >
          🔊
        </button>
        <p className="text-4xl font-extrabold text-gray-800 break-words">
          {word.russian}
        </p>
      </div>
      <p className="mt-3 text-base font-bold text-gray-400">
        {word.transcription}
      </p>

      <div className="mt-6 min-h-[64px]">
        {showAnswer ? (
          <p className="rounded-2xl bg-green-100 px-4 py-3 text-2xl font-extrabold text-green-700">
            {word.uzbek}
          </p>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-gray-200 px-4 py-4 text-sm font-bold text-gray-400">
            👆 Tarjimani ko'rish uchun bosing
          </p>
        )}
      </div>
    </div>
  );
}
