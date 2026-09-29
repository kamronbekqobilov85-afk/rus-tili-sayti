"use client";

import { useState } from "react";
import { Word } from "../data/words";

export default function Flashcard({ word }: { word: Word }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.russian);
    utterance.lang = "ru-RU";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      onClick={() => setShowAnswer(!showAnswer)}
      className="bg-white rounded-2xl shadow-lg p-12 w-full max-w-md text-center cursor-pointer select-none hover:shadow-xl transition"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <p className="text-4xl font-bold text-blue-900">{word.russian}</p>
        <button
          onClick={handleSpeak}
          className="text-2xl hover:scale-110 transition"
          aria-label="Tinglash"
        >
          🔊
        </button>
      </div>
      <p className="text-gray-400 mb-6">{word.transcription}</p>

      {showAnswer ? (
        <p className="text-2xl text-green-600 font-semibold">
          {word.uzbek}
        </p>
      ) : (
        <p className="text-gray-400 italic">
          Tarjimani ko'rish uchun bosing
        </p>
      )}
    </div>
  );
}