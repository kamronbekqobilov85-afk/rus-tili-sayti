"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
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
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="📖"
          title="Grammatika"
          desc="Har mavzuda qoida o'zbekcha tushuntirilgan, misollar va mashqlar bor. 70% dan yuqori natija — mavzu o'tildi."
        >
          <HeroChip>{totalCount} ta mavzu</HeroChip>
          <HeroChip>
            ✅ {completedCount} / {totalCount} o'tildi
          </HeroChip>
        </PageHero>

        <div className={`${card} mt-4 p-4`}>
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-600">Umumiy natija</span>
            <span className="text-emerald-700">{overallPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <h2 className="mt-8 text-lg font-extrabold text-slate-800">Mavzular</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {grammarTopics.map((topic, i) => {
            const score = progress[topic.slug];
            const isCompleted = score !== undefined && score >= 70;
            return (
              <Link
                key={topic.id}
                href={`/grammatika/${topic.slug}`}
                className={`${card} group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold ring-1 transition ${
                    isCompleted
                      ? "bg-emerald-500 text-white ring-emerald-500"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-200 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}
                >
                  {isCompleted ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold leading-snug text-slate-800">{topic.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500 line-clamp-2">
                    {topic.description}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
                      {topic.exercises.length} ta mashq
                    </span>
                    {score !== undefined ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 ${
                          isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        Eng yaxshi natija: {score}%
                      </span>
                    ) : (
                      <span className="text-emerald-600 group-hover:underline">Boshlash →</span>
                    )}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
