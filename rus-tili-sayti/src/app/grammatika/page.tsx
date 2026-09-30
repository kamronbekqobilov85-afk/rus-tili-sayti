"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { grammarTopics } from "../data/grammar";
import { getProgress, ProgressMap } from "../data/grammarProgress";

export default function GrammatikaPage() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completedCount = Object.values(progress).filter((p) => p >= 70).length;
  const totalCount = grammarTopics.length;
  const overallPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">
          Grammatika
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Mavzuni tanlang, darsni o'qing va testdan o'ting
        </p>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">
              Umumiy progress
            </p>
            <p className="text-sm font-semibold text-blue-700">
              {completedCount} / {totalCount} mavzu
            </p>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {grammarTopics.map((topic, i) => {
            const score = progress[topic.slug];
            const isCompleted = score !== undefined && score >= 70;
            return (
              <Link
                key={topic.id}
                href={`/grammatika/${topic.slug}`}
                className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 hover:shadow-lg hover:ring-blue-200 hover:-translate-y-0.5 transition-all duration-200 block"
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-blue-900 mb-1.5 leading-snug pr-6">
                      {topic.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                      {topic.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600">
                      <span>{topic.exercises.length} ta mashq</span>
                      <span className="text-gray-300">•</span>
                      {score !== undefined ? (
                        <span>Eng yaxshi natija: {score}%</span>
                      ) : (
                        <span className="group-hover:underline">
                          Boshlash →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
