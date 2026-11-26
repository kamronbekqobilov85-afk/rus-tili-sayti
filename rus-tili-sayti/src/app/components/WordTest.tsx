"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { card, btnPrimary, btnSecondary } from "./ui";
import { speak, shuffle } from "./GapSession";
import { words, Word } from "../data/words";
import { getCategoryLabel } from "../data/categories";
import { recordActivity, syncXp } from "../data/stats";

const OPTIONS = 5;
const HALF_KEY = "rus-tili-sozlar-half"; // 0,5 balllik toq javob (ikkitasi 1 ball bo'ladi)
const LETTERS = ["A", "B", "C", "D", "E"];

type TestType = "ru-uz" | "uz-ru" | "listen";

const TYPES: {
  key: TestType;
  icon: string;
  title: string;
  desc: string;
  grad: string;
}[] = [
  {
    key: "ru-uz",
    icon: "🇷🇺",
    title: "Ruscha → O'zbekcha",
    desc: "Ruscha so'zni ko'rasiz, tarjimasini topasiz",
    grad: "from-indigo-500 to-violet-600",
  },
  {
    key: "uz-ru",
    icon: "🇺🇿",
    title: "O'zbekcha → Ruscha",
    desc: "O'zbekcha so'zning ruschasini topasiz",
    grad: "from-fuchsia-500 to-pink-600",
  },
  {
    key: "listen",
    icon: "🎧",
    title: "Eshitib top",
    desc: "Rus ovozini tinglab, tarjimasini toping",
    grad: "from-amber-500 to-orange-600",
  },
];

type Q = { word: Word; options: string[]; answer: string };

function buildQuestion(w: Word, type: TestType, pool: Word[]): Q {
  const field: "russian" | "uzbek" = type === "uz-ru" ? "russian" : "uzbek";
  const answer = w[field];
  const used = new Set<string>([answer]);
  const picks: string[] = [];
  const sameCat = shuffle(pool.filter((x) => x.category === w.category && x.id !== w.id));
  const others = shuffle(pool.filter((x) => x.category !== w.category));
  for (const x of [...sameCat, ...others]) {
    if (picks.length >= OPTIONS - 1) break;
    const v = x[field];
    if (used.has(v)) continue;
    used.add(v);
    picks.push(v);
  }
  return { word: w, options: shuffle([answer, ...picks]), answer };
}

function buildQuiz(cat: string | null, type: TestType, count: number): Q[] {
  const base = cat ? words.filter((w) => w.category === cat) : words;
  return shuffle(base)
    .slice(0, count)
    .map((w) => buildQuestion(w, type, words));
}

// Har bir to'g'ri javob uchun 0,5 ball. Server butun ball saqlaydi, shuning uchun har ikkita to'g'ri javobga 1 ball yuboriladi.
function addHalfPoint() {
  let half = 0;
  try {
    half = parseInt(localStorage.getItem(HALF_KEY) || "0", 10) || 0;
  } catch {
    // ignore
  }
  half += 1;
  if (half >= 2) {
    half = 0;
    syncXp({ type: "pair" });
  }
  try {
    localStorage.setItem(HALF_KEY, String(half));
  } catch {
    // ignore
  }
}

const fmt = (n: number) => String(n).replace(".", ",");

export default function WordTest({ onExit }: { onExit: () => void }) {
  // ---- tanlov ekrani holati ----
  const [type, setType] = useState<TestType>("ru-uz");
  const [count, setCount] = useState(10);
  const [cat, setCat] = useState<string | null>(null);
  const [stage, setStage] = useState<"pick" | "play" | "done">("pick");

  // ---- test holati ----
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [wrongs, setWrongs] = useState<Q[]>([]);
  const lock = useRef(false);

  const topics = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of words) counts[w.category] = (counts[w.category] || 0) + 1;
    return Object.entries(counts)
      .filter(([, n]) => n >= 20)
      .sort((a, b) => b[1] - a[1]);
  }, []);

  const start = () => {
    setQs(buildQuiz(cat, type, count));
    setI(0);
    setPicked(null);
    setCorrect(0);
    setCombo(0);
    setBestCombo(0);
    setWrongs([]);
    lock.current = false;
    setStage("play");
  };

  const q = qs[i];

  // "Eshitib top": savol ko'rinishi bilan ovoz o'zi chiqadi
  useEffect(() => {
    if (stage === "play" && type === "listen" && q) speak(q.word.russian);
  }, [stage, type, i, q]);

  // ======================= TANLOV EKRANI =======================
  if (stage === "pick") {
    const activeType = TYPES.find((t) => t.key === type)!;
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:py-8">
        <button onClick={onExit} className="text-sm font-extrabold text-indigo-600">
          ← Orqaga
        </button>

        <div className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-xl">
          <div aria-hidden className="pointer-events-none absolute -right-6 -top-8 text-[120px] opacity-15">🧪</div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-200">So&apos;zlar · Test</p>
          <h1 className="mt-1 text-3xl font-extrabold">So&apos;z testi</h1>
          <p className="mt-2 max-w-md text-sm text-indigo-100">
            5 ta variantdan to&apos;g&apos;risini toping. Har bir <strong className="text-amber-300">to&apos;g&apos;ri javob +0,5 ball</strong>,
            noto&apos;g&apos;ri javobga ball yo&apos;q. Ketma-ket to&apos;g&apos;ri javoblar 🔥 seriya hosil qiladi.
          </p>
        </div>

        <h2 className="mt-6 text-lg font-extrabold text-slate-800">1. Test turi</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TYPES.map((t) => {
            const on = t.key === type;
            return (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`rounded-2xl p-4 text-left transition active:scale-[0.98] ${
                  on ? `bg-gradient-to-br ${t.grad} text-white shadow-lg ring-2 ring-white` : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-3xl">{t.icon}</span>
                <span className="mt-2 block font-extrabold">{t.title}</span>
                <span className={`mt-0.5 block text-xs ${on ? "text-white/90" : "text-slate-500"}`}>{t.desc}</span>
              </button>
            );
          })}
        </div>

        <h2 className="mt-6 text-lg font-extrabold text-slate-800">2. Savollar soni</h2>
        <div className="mt-3 flex gap-2">
          {[10, 20, 30].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 rounded-2xl py-3 text-center font-extrabold transition active:scale-[0.97] ${
                count === n ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {n} ta
              <span className={`block text-xs font-bold ${count === n ? "text-indigo-100" : "text-slate-400"}`}>
                eng ko&apos;pi +{fmt(n * 0.5)} ball
              </span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-lg font-extrabold text-slate-800">3. Mavzu</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
              cat === null ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            🎲 Aralash
          </button>
          {topics.map(([c, n]) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                cat === c ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {getCategoryLabel(c)} <span className={cat === c ? "text-indigo-200" : "text-slate-400"}>{n}</span>
            </button>
          ))}
        </div>

        <div className="sticky bottom-3 mt-8">
          <button
            onClick={start}
            className={`w-full rounded-2xl border-b-4 border-indigo-900 bg-gradient-to-r ${activeType.grad} py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-xl transition active:translate-y-0.5 active:border-b-2`}
          >
            {activeType.icon} Testni boshlash
          </button>
        </div>
      </main>
    );
  }

  const total = qs.length;

  // ======================= NATIJA EKRANI =======================
  if (stage === "done") {
    const percent = Math.round((correct / total) * 100);
    const stars = percent >= 90 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;
    const msg =
      percent === 100
        ? "Mukammal! Xatosiz!"
        : percent >= 70
        ? "Juda yaxshi natija!"
        : percent >= 40
        ? "Yomon emas, davom eting!"
        : "Hech qisi yo'q, mashq qiling!";
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-7 text-center text-white shadow-xl">
          <p className="text-6xl">{stars === 3 ? "🏆" : stars >= 1 ? "🎉" : "💪"}</p>
          <p className="mt-2 text-3xl tracking-widest">
            {"★".repeat(stars)}
            <span className="text-white/30">{"★".repeat(3 - stars)}</span>
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">{msg}</h1>
          <p className="mt-1 text-white/90">
            {total} tadan <strong>{correct}</strong> ta to&apos;g&apos;ri · {percent}%
          </p>
          <p className="mt-4 inline-block rounded-full bg-amber-300 px-5 py-2 text-base font-extrabold text-amber-950">
            ⭐ +{fmt(correct * 0.5)} ball
          </p>
          {bestCombo >= 3 && <p className="mt-3 text-sm font-bold text-white/90">🔥 Eng uzun seriya: {bestCombo} ta ketma-ket</p>}
        </div>

        {wrongs.length > 0 && (
          <div className={`${card} mt-4 p-4`}>
            <p className="font-extrabold text-slate-800">❌ Xato qilgan so&apos;zlaringiz ({wrongs.length})</p>
            <ul className="mt-2 divide-y divide-slate-100">
              {wrongs.map((w, idx) => (
                <li key={idx} className="flex items-center gap-2 py-2">
                  <button
                    onClick={() => speak(w.word.russian)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm"
                    aria-label="Tinglash"
                  >
                    🔊
                  </button>
                  <span className="min-w-0 break-words text-sm">
                    <strong className="text-slate-800">{w.word.russian}</strong>
                    <span className="text-slate-400"> — </span>
                    <span className="text-slate-600">{w.word.uzbek}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 grid gap-2.5">
          <button onClick={start} className={`${btnPrimary} w-full py-3 text-lg`}>
            🔁 Yana test
          </button>
          <button onClick={() => setStage("pick")} className={`${btnSecondary} w-full`}>
            Sozlamalarni o&apos;zgartirish
          </button>
          <button onClick={onExit} className="mt-1 text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Chiqish
          </button>
        </div>
      </main>
    );
  }

  // ======================= SAVOL EKRANI =======================
  if (!q) return null;
  const t = TYPES.find((x) => x.key === type)!;
  const isCorrect = picked === q.answer;

  const choose = (opt: string) => {
    if (picked || lock.current) return;
    lock.current = true;
    setPicked(opt);
    recordActivity("word", { noXp: true }); // faqat statistika va seriya
    if (opt === q.answer) {
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setBestCombo((b) => Math.max(b, n));
        return n;
      });
      addHalfPoint(); // faqat to'g'ri topsa: +0,5
    } else {
      setCombo(0);
      setWrongs((w) => [...w, q]);
    }
  };

  const next = () => {
    lock.current = false;
    if (i + 1 >= total) {
      setStage("done");
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-5">
      {/* Yuqori panel */}
      <div className="flex items-center gap-3">
        <button onClick={() => setStage("pick")} className="text-2xl font-extrabold text-slate-400" aria-label="Chiqish">
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${t.grad} transition-all`}
            style={{ width: `${Math.round(((i + (picked ? 1 : 0)) / total) * 100)}%` }}
          />
        </div>
        <span className="text-sm font-extrabold text-slate-500">
          {i + 1}/{total}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm font-extrabold">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">⭐ {fmt(correct * 0.5)} ball</span>
        <span className={`rounded-full px-3 py-1 transition ${combo >= 2 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
          🔥 {combo}
        </span>
      </div>

      {/* Savol kartasi */}
      <div className={`mt-3 rounded-3xl bg-gradient-to-br ${t.grad} p-6 text-center text-white shadow-lg`}>
        <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">
          {t.title} · {cat ? getCategoryLabel(cat) : "Aralash"}
        </p>
        {type === "listen" ? (
          <button
            onClick={() => speak(q.word.russian)}
            className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/25 text-5xl ring-4 ring-white/40 transition active:scale-95"
            aria-label="Tinglash"
          >
            🔊
          </button>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-3">
            {type === "ru-uz" && (
              <button
                onClick={() => speak(q.word.russian)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-xl ring-2 ring-white/40 active:scale-95"
                aria-label="Tinglash"
              >
                🔊
              </button>
            )}
            <p className="break-words text-3xl font-extrabold">{type === "ru-uz" ? q.word.russian : q.word.uzbek}</p>
          </div>
        )}
        {type === "ru-uz" && <p className="mt-1 text-sm font-bold text-white/80">{q.word.transcription}</p>}
        {type === "listen" && <p className="mt-2 text-sm font-bold text-white/90">Tinglang va tarjimasini toping</p>}
      </div>

      {/* Variantlar */}
      <div className="mt-4 space-y-2.5">
        {q.options.map((opt, idx) => {
          const right = opt === q.answer;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60";
          let badge = "bg-slate-100 text-slate-500";
          if (picked && right) {
            cls = "border-green-500 bg-green-50 text-green-800";
            badge = "bg-green-500 text-white";
          } else if (picked && picked === opt) {
            cls = "border-red-500 bg-red-50 text-red-700";
            badge = "bg-red-500 text-white";
          } else if (picked) {
            cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={opt}
              disabled={!!picked}
              onClick={() => choose(opt)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 px-3 py-2.5 text-left text-base font-bold transition active:translate-y-0.5 active:border-b-2 ${cls}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${badge}`}>
                {picked && right ? "✓" : picked && picked === opt ? "✕" : LETTERS[idx]}
              </span>
              <span className="min-w-0 break-words">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Natija paneli */}
      {picked && (
        <div className="mt-4">
          <div
            className={`rounded-2xl p-3 text-center font-extrabold ${
              isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isCorrect ? (
              <>✅ To&apos;g&apos;ri! +0,5 ball{combo >= 3 ? ` · 🔥 ${combo} ta ketma-ket` : ""}</>
            ) : (
              <>❌ To&apos;g&apos;ri javob: {q.answer}</>
            )}
          </div>
          <button onClick={next} className={`${btnPrimary} mt-3 w-full py-3 text-lg`}>
            {i + 1 >= total ? "Natijani ko'rish" : "Keyingisi →"}
          </button>
        </div>
      )}
    </main>
  );
}
