"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Gap } from "../data/gaplar";
import { recordActivity } from "../data/stats";

type ExType = "listen" | "ru-uz" | "uz-ru" | "build";
type Chip = { id: number; text: string };
type Exercise = {
  gap: Gap;
  review: boolean; // takrorlash gapi: jon olmaydi, foizga kirmaydi
  type: ExType;
  options: string[];
  chips: Chip[];
};

export const MAX_HEARTS = 5;

export function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // ovoz mavjud emas
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOptions(correct: string, pool: string[]): string[] {
  const candidates = Array.from(new Set(pool)).filter((t) => t !== correct);
  const wrong = candidates
    .map((t) => ({ t, score: Math.abs(t.length - correct.length) + Math.random() * 6 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.t);
  return shuffle([correct, ...wrong]);
}

function buildExercises(items: { gap: Gap; review: boolean }[], pool: Gap[]): Exercise[] {
  const order: ExType[] = ["listen", "ru-uz", "build", "uz-ru"];
  return shuffle(items).map(({ gap, review }, i) => {
    let type = order[i % order.length];
    const tokens = gap.ru.split(" ");
    if (type === "build" && tokens.length < 2) type = "uz-ru";
    let options: string[] = [];
    if (type === "listen" || type === "ru-uz") {
      options = pickOptions(gap.uz, pool.map((p) => p.uz));
    } else if (type === "uz-ru") {
      options = pickOptions(gap.ru, pool.map((p) => p.ru));
    }
    const chips: Chip[] =
      type === "build" ? shuffle(tokens.map((text, id) => ({ id, text }))) : [];
    return { gap, review, type, options, chips };
  });
}

export type SessionResult = {
  percent: number; // asosiy gaplar bo'yicha birinchi urinishdagi aniqlik
  firstTry: Record<number, boolean>; // gap id -> birinchi urinishda to'g'rimi
};

type Props = {
  gaps: Gap[]; // asosiy gaplar (foizga kiradi)
  review?: Gap[]; // takrorlash gaplari
  pool: Gap[]; // noto'g'ri variantlar uchun gaplar
  useHearts?: boolean;
  exitHref: string;
  onComplete: (r: SessionResult) => void;
  onFail: () => void;
};

const btn3d =
  "w-full rounded-2xl border-b-4 py-3 text-lg font-extrabold uppercase tracking-wide transition active:translate-y-1 active:border-b-0";

export default function GapSession({
  gaps,
  review = [],
  pool,
  useHearts = true,
  exitHref,
  onComplete,
  onFail,
}: Props) {
  const [queue, setQueue] = useState<Exercise[]>(() =>
    buildExercises(
      [
        ...gaps.map((gap) => ({ gap, review: false })),
        ...review.map((gap) => ({ gap, review: true })),
      ],
      pool
    )
  );
  const total = gaps.length + review.length;
  const [qi, setQi] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [doneCount, setDoneCount] = useState(0);
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({});

  const [selected, setSelected] = useState<string | null>(null);
  const [answerChips, setAnswerChips] = useState<Chip[]>([]);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const current: Exercise | undefined = queue[qi];

  useEffect(() => {
    if (current && current.type === "listen" && result === "idle") {
      speak(current.gap.ru);
    }
  }, [qi, current, result]);

  if (!current) return null;

  const userAnswer = (): string =>
    current.type === "build" ? answerChips.map((c) => c.text).join(" ") : selected || "";

  const correctAnswer = (): string =>
    current.type === "uz-ru" || current.type === "build" ? current.gap.ru : current.gap.uz;

  const canCheck =
    result === "idle" &&
    (current.type === "build" ? answerChips.length > 0 : selected !== null);

  const handleCheck = () => {
    if (!canCheck) return;
    const ok = userAnswer() === correctAnswer();
    const id = current.gap.id;
    if (ok) {
      setResult("correct");
      recordActivity("word");
      setFirstTry((f) => (id in f ? f : { ...f, [id]: true }));
    } else {
      setResult("wrong");
      if (useHearts && !current.review) setHearts((h) => h - 1);
      setFirstTry((f) => ({ ...f, [id]: false }));
    }
  };

  const handleContinue = () => {
    const wasWrong = result === "wrong";

    if (wasWrong && useHearts && !current.review && hearts <= 0) {
      onFail();
      return;
    }

    let newQueue = queue;
    if (wasWrong) {
      newQueue = [...queue, { ...current, chips: shuffle(current.chips) }];
      setQueue(newQueue);
    } else {
      setDoneCount((d) => d + 1);
    }

    setSelected(null);
    setAnswerChips([]);
    setResult("idle");

    if (qi + 1 < newQueue.length) {
      setQi(qi + 1);
    } else {
      const mainOk = gaps.filter((g) => firstTry[g.id] === true).length;
      const percent = gaps.length
        ? Math.round((mainOk / gaps.length) * 100)
        : 100;
      onComplete({ percent, firstTry });
    }
  };

  const moveChip = (chip: Chip, toAnswer: boolean) => {
    if (result !== "idle") return;
    if (toAnswer) setAnswerChips((a) => [...a, chip]);
    else setAnswerChips((a) => a.filter((c) => c.id !== chip.id));
  };

  const progress = Math.round((doneCount / total) * 100);

  const prompt =
    current.type === "listen"
      ? "Eshiting va tarjimasini toping"
      : current.type === "ru-uz"
      ? "Tarjimasini toping"
      : current.type === "uz-ru"
      ? "Ruscha variantini toping"
      : "Gapni ruscha tuzing";

  const availableChips = current.chips.filter(
    (c) => !answerChips.some((a) => a.id === c.id)
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={exitHref}
          className="text-2xl font-extrabold text-gray-400 hover:text-gray-600"
          aria-label="Chiqish"
        >
          ✕
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {useHearts ? (
          <span className="text-lg font-extrabold text-red-500">❤️ {Math.max(hearts, 0)}</span>
        ) : (
          <span className="text-lg font-extrabold text-sky-500">🔁</span>
        )}
      </div>

      {current.review && (
        <p
          className="mb-2 inline-block self-start rounded-lg px-2 py-1 text-xs font-extrabold uppercase tracking-wide"
          style={{ backgroundColor: "#ddf4ff", color: "#1899d6" }}
        >
          🔁 Takrorlash
        </p>
      )}
      <h2 className="mb-4 text-xl font-extrabold text-gray-700">{prompt}</h2>

      {current.type === "listen" && (
        <button
          onClick={() => speak(current.gap.ru)}
          className="mb-5 flex h-20 w-20 items-center justify-center self-center rounded-3xl border-b-8 border-sky-700 bg-sky-500 text-4xl text-white active:translate-y-1 active:border-b-4"
          aria-label="Tinglash"
        >
          🔊
        </button>
      )}
      {current.type === "ru-uz" && (
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => speak(current.gap.ru)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-2xl text-white active:translate-y-0.5 active:border-b-0"
            aria-label="Tinglash"
          >
            🔊
          </button>
          <p className="text-2xl font-extrabold text-gray-800 break-words">{current.gap.ru}</p>
        </div>
      )}
      {(current.type === "uz-ru" || current.type === "build") && (
        <p className="mb-5 rounded-2xl border-2 border-gray-200 p-4 text-xl font-extrabold text-gray-800 break-words">
          {current.gap.uz}
        </p>
      )}

      {current.type !== "build" ? (
        <div className="space-y-3">
          {current.options.map((opt) => {
            const isSel = selected === opt;
            const isCorrectOpt = opt === correctAnswer();
            let cls = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
            if (result === "idle" && isSel) cls = "border-sky-400 bg-sky-100 text-sky-700";
            if (result !== "idle" && isCorrectOpt) cls = "border-green-500 bg-green-100 text-green-700";
            if (result === "wrong" && isSel && !isCorrectOpt) cls = "border-red-500 bg-red-100 text-red-600";
            return (
              <button
                key={opt}
                disabled={result !== "idle"}
                onClick={() => setSelected(opt)}
                className={`w-full rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-lg font-bold transition active:translate-y-0.5 active:border-b-2 ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex min-h-[64px] flex-wrap gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-3">
            {answerChips.length === 0 && (
              <span className="text-sm font-bold text-gray-300">So'zlarni shu yerga bosing</span>
            )}
            {answerChips.map((c) => (
              <button
                key={c.id}
                onClick={() => moveChip(c, false)}
                className="rounded-xl border-2 border-b-4 border-gray-200 bg-white px-3 py-2 text-lg font-bold text-gray-800"
              >
                {c.text}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableChips.map((c) => (
              <button
                key={c.id}
                onClick={() => moveChip(c, true)}
                className="rounded-xl border-2 border-b-4 border-gray-200 bg-white px-3 py-2 text-lg font-bold text-gray-800 active:translate-y-0.5 active:border-b-2"
              >
                {c.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {result === "idle" ? (
          <button
            onClick={handleCheck}
            disabled={!canCheck}
            className={`${btn3d} border-green-700 bg-green-500 text-white hover:bg-green-400 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:active:translate-y-0 disabled:active:border-b-4`}
          >
            Tekshirish
          </button>
        ) : (
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: result === "correct" ? "#d7ffb8" : "#ffdfe0" }}
          >
            <p
              className="mb-1 text-xl font-extrabold"
              style={{ color: result === "correct" ? "#58a700" : "#ea2b2b" }}
            >
              {result === "correct" ? "✅ To'g'ri!" : "❌ Noto'g'ri"}
            </p>
            {result === "wrong" && (
              <p className="mb-2 font-bold text-red-600 break-words">
                To'g'ri javob: {correctAnswer()}
              </p>
            )}
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-600">
              <button
                onClick={() => speak(current.gap.ru)}
                className="rounded-lg bg-white px-2 py-1"
                aria-label="Tinglash"
              >
                🔊
              </button>
              <span className="break-words">
                {current.gap.ru} — {current.gap.uz}
              </span>
            </div>
            <button
              onClick={handleContinue}
              className={`${btn3d} ${
                result === "correct"
                  ? "border-green-700 bg-green-500 text-white"
                  : "border-red-700 bg-red-500 text-white"
              }`}
            >
              Davom etish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
