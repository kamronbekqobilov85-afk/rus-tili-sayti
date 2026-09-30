"use client";

import { useState, useMemo, use } from "react";
import { grammarTopics } from "../../data/grammar";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { recordActivity } from "../../data/stats";
import { saveTopicScore } from "../../data/grammarProgress";

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

  // "lesson" -> dars qismi, "test" -> test qismi, "result" -> natija
  const [phase, setPhase] = useState<"lesson" | "test" | "result">("lesson");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const exercise = topic.exercises[currentIndex];
  const isLast = currentIndex === topic.exercises.length - 1;
  const isFirst = currentIndex === 0;

  const shuffledOptions = useMemo(() => {
    const arr = [...exercise.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [currentIndex, slug]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === exercise.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase("result");
      recordActivity("test");
      const finalPercentage = Math.round(
        (correctCount / topic.exercises.length) * 100
      );
      saveTopicScore(topic.slug, finalPercentage);
    }
  };

  const handlePrev = () => {
    setSelected(null);
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const startTest = () => {
    setPhase("test");
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
  };

  const retryTest = () => {
    setPhase("test");
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
  };

  const backToLesson = () => {
    setPhase("lesson");
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
  };

  const percentage = Math.round((correctCount / topic.exercises.length) * 100);

  let resultMessage = "";
  let resultColor = "";
  if (percentage >= 90) {
    resultMessage = "Ajoyib! Mavzuni juda yaxshi o'zlashtirdingiz! 🎉";
    resultColor = "text-green-600";
  } else if (percentage >= 70) {
    resultMessage = "Yaxshi natija! Yana bir oz mashq qilsangiz mukammal bo'ladi. 👍";
    resultColor = "text-blue-600";
  } else if (percentage >= 50) {
    resultMessage = "Yomon emas, lekin darsni qayta ko'rib chiqqan ma'qul. 📖";
    resultColor = "text-yellow-600";
  } else {
    resultMessage = "Darsni qayta o'qib, testni qayta ishlab ko'ring. 💪";
    resultColor = "text-red-600";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Link
          href="/grammatika"
          className="text-blue-600 text-sm mb-6 block hover:underline"
        >
          ← Mavzular ro'yxatiga qaytish
        </Link>

        <h1 className="text-3xl font-bold text-blue-900 mb-2">{topic.title}</h1>

        {phase === "lesson" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              {topic.lesson.intro}
            </p>

            <h2 className="text-xl font-bold text-blue-900 mb-3">Qoidalar</h2>
            <div className="flex flex-col gap-3 mb-6">
              {topic.lesson.rules.map((rule, i) => (
                <div
                  key={i}
                  className="border-l-4 border-blue-500 bg-blue-50 rounded-r-xl p-4"
                >
                  <p className="font-semibold text-blue-900">{rule.title}</p>
                  <p className="text-gray-700">{rule.text}</p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-blue-900 mb-3">Jadval</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    {topic.lesson.table.headers.map((h, i) => (
                      <th key={i} className="py-2 px-4 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topic.lesson.table.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="py-2 px-4 border-b border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-blue-900 mb-3">Misollar</h2>
            <div className="flex flex-col gap-3 mb-8">
              {topic.lesson.examples.map((ex, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium text-gray-900">{ex.ru}</p>
                  <p className="text-gray-500 text-sm">{ex.uz}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startTest}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Testni boshlash →
            </button>
          </div>
        )}

        {phase === "test" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-500 text-sm mb-8">
              Mashq {currentIndex + 1} / {topic.exercises.length}
            </p>
            <p className="text-lg font-semibold mb-6">{exercise.question}</p>
            <div className="flex flex-col gap-3">
              {shuffledOptions.map((option) => {
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
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 disabled:opacity-40"
              >
                ← Oldingi
              </button>
              <button
                onClick={handleNext}
                disabled={!selected}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-40"
              >
                {isLast ? "Natijani ko'rish" : "Keyingisi"}
              </button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6 text-center">
            <p className="text-gray-500 mb-2">Sizning natijangiz</p>
            <p className="text-6xl font-bold text-blue-900 mb-2">{percentage}%</p>
            <p className="text-gray-600 mb-4">
              {topic.exercises.length} tadan {correctCount} tasini to'g'ri
              topdingiz
            </p>
            <p className={`font-semibold mb-8 ${resultColor}`}>{resultMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={backToLesson}
                className="px-6 py-3 rounded-xl border border-blue-300 text-blue-700 font-semibold hover:bg-blue-50"
              >
                Darsni qayta ko'rish
              </button>
              <button
                onClick={retryTest}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Testni qayta ishlash
              </button>
              <Link
                href="/grammatika"
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                Boshqa mavzu
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
