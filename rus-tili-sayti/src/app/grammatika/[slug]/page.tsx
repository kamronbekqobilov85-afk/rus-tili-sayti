"use client";

import { useState, use } from "react";
import { grammarTopics } from "../../data/grammar";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";

export default function GrammarTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const topic = grammarTopics.find((t) => t.slug === slug);

  if (!topic) {
    notFound();
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const exercise = topic.exercises[currentIndex];
  const isLast = currentIndex === topic.exercises.length - 1;
  const isFirst = currentIndex === 0;

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
  };

  const handleNext = () => {
    setSelected(null);
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setSelected(null);
    if (!isFirst) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-xl mx-auto py-12 px-4">
        <Link href="/grammatika" className="text-blue-600 text-sm mb-6 block">
          ← Mavzular ro'yxatiga qaytish
        </Link>

        <h1 className="text-2xl font-bold text-blue-900 mb-2">{topic.title}</h1>
        <p className="text-gray-500 text-sm mb-8">
          Mashq {currentIndex + 1} / {topic.exercises.length}
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-lg font-semibold mb-6">{exercise.question}</p>

          <div className="flex flex-col gap-3">
            {exercise.options.map((option) => {
              const isCorrect = option === exercise.correctAnswer;
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
                  className={`border-2 rounded-xl py-3 px-4 text-left transition ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="bg-gray-200 text-gray-700 rounded-xl py-3 px-6 hover:bg-gray-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Oldingi
            </button>

            {!isLast && (
              <button
                onClick={handleNext}
                disabled={!selected}
                className="bg-blue-600 text-white rounded-xl py-3 px-6 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Keyingisi
              </button>
            )}
          </div>

          {selected && isLast && (
            <p className="mt-6 text-green-700 font-semibold">
              Mavzu tugadi! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}