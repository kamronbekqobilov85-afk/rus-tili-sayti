"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { sentences, Sentence } from "../data/sentences";
import { recordActivity } from "../data/stats";

const SESSION_SIZE = 10;

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

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence.ru);
    utterance.lang = "ru-RU";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [sentence]);

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

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <p className="text-gray-500 mb-2">Sizning natijangiz</p>
          <p className="text-6xl font-bold text-blue-900 mb-4">{percentage}%</p>
          <p className="text-xl text-gray-600 mb-8">
            {sessionSentences.length} tadan {correctCount} tasini to'g'ri
            topdingiz
          </p>
          <button
            onClick={restart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
          >
            Qaytadan boshlash
          </button>
        </div>
      </div>
    );
  }

  if (!speechSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <p className="text-xl text-gray-600">
            Kechirasiz, brauzeringiz ovozli o'qishni (Text-to-Speech)
            qo'llab-quvvatlamaydi. Boshqa brauzerda (Chrome, Edge) urinib
            ko'ring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="max-w-2xl mx-auto py-12 px-4 w-full flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-1">
          Tinglab tushunish
        </h1>
        <p className="text-gray-500 mb-8">
          {index + 1} / {sessionSentences.length}
        </p>

        <button
          onClick={speak}
          className="w-28 h-28 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-5xl transition mb-4 shadow-lg"
          aria-label="Qayta tinglash"
        >
          🔊
        </button>
        <p className="text-gray-400 text-sm mb-8">
          Jumlani tinglang va to'g'ri tarjimani tanlang
        </p>

        <div className="flex flex-col gap-3 w-full">
          {options.map((option) => {
            const isCorrect = option === sentence.uz;
            const isSelected = option === selected;
            let style = "border-gray-200 hover:border-blue-400";
            if (selected) {
              if (isCorrect) {
                style = "border-green-500 bg-green-50";
              } else if (isSelected) {
                style = "border-red-500 bg-red-50";
              }
            }
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`border-2 rounded-xl py-3 px-4 text-left transition bg-white ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-3">
              To'g'ri javob: <span className="font-semibold">{sentence.ru}</span>
            </p>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition"
            >
              {isLast ? "Natijani ko'rish" : "Keyingisi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
