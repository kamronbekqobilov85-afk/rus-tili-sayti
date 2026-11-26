"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createEngine, levelName } from "../yugur/engine";
import type { Bank, Engine, Hud, Question, RunResult } from "../yugur/engine";
import RunnerLeaderboard from "./RunnerLeaderboard";
import { btnPrimary, btnSecondary, card } from "./ui";

const BEST_KEY = "yugur-best";

type Phase = "menu" | "loading" | "playing" | "over";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const bankRef = useRef<Bank | null>(null);
  const gateBarRef = useRef<HTMLDivElement>(null);
  const askBarRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("menu");
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState<Hud>({ score: 0, lives: 3, gates: 0 });
  const [question, setQuestion] = useState<Question | null>(null);
  const [reveal, setReveal] = useState<{ chosen: number; correct: number } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const phaseRef = useRef<Phase>("menu");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Eng yaxshi natija
  useEffect(() => {
    const t = setTimeout(() => setBest(readBest()), 0);
    return () => clearTimeout(t);
  }, []);

  // O'yinni ishga tushirish (runId o'zgarganda)
  useEffect(() => {
    if (runId === 0 || !canvasRef.current || !bankRef.current) return;
    const engine = createEngine(canvasRef.current, bankRef.current, {
      onHud: setHud,
      onQuestion: (q) => setQuestion(q),
      onReveal: (r) => setReveal(r),
      onGateBar: (f) => {
        if (gateBarRef.current) gateBarRef.current.style.transform = `scaleX(${f})`;
      },
      onAskBar: (f) => {
        if (askBarRef.current) askBarRef.current.style.transform = `scaleX(${f})`;
      },
      onOver: (r) => {
        setResult(r);
        const prev = readBest();
        if (r.score > prev) {
          try {
            localStorage.setItem(BEST_KEY, String(r.score));
          } catch {
            // saqlab bo'lmadi
          }
          setBest(r.score);
          setNewBest(prev > 0);
        } else {
          setNewBest(false);
        }
        // O'yin tugaganini biroz kechiktirib ko'rsatamiz — to'qnashuv ko'rinib tursin
        setTimeout(() => setPhase("over"), 650);
        // Natijani reytingga yuboramiz (serverda eng yaxshisi saqlanadi)
        if (r.score > 0) {
          fetch("/api/yugur/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              distance: r.distance,
              gates: r.gates,
              level: r.level,
              seconds: r.seconds,
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => {
              if (d?.ok && typeof d.rank === "number") setRank(d.rank);
            })
            .catch(() => {})
            .finally(() => setBoardKey((n) => n + 1));
        }
        if (r.gates > 0) {
          fetch("/api/xp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "run", gates: r.gates }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => setXpGain(d?.ok ? d.gained ?? null : null))
            .catch(() => setXpGain(null));
        }
      },
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [runId]);

  // O'lcham o'zgarishi va sahifadan chiqib ketganda to'xtatish
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => engineRef.current?.resize());
    ro.observe(box);
    const onVis = () => engineRef.current?.setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Klaviatura
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      const eng = engineRef.current;
      if (!eng) return;
      const k = e.key;
      let handled = true;
      if (k === "ArrowLeft" || k === "a" || k === "A") eng.input("left");
      else if (k === "ArrowRight" || k === "d" || k === "D") eng.input("right");
      else if (k === "ArrowUp" || k === "w" || k === "W" || k === " ") eng.input("jump");
      else if (k === "ArrowDown" || k === "s" || k === "S") eng.input("slide");
      else if (k >= "1" && k <= "4") eng.answer(Number(k) - 1);
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Surish (swipe)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    let active = false;
    const TH = 26;
    const down = (e: PointerEvent) => {
      active = true;
      sx = e.clientX;
      sy = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // e'tiborsiz
      }
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) < TH && Math.abs(dy) < TH) return;
      const eng = engineRef.current;
      if (eng) {
        if (Math.abs(dx) > Math.abs(dy)) eng.input(dx > 0 ? "right" : "left");
        else eng.input(dy > 0 ? "slide" : "jump");
      }
      sx = e.clientX;
      sy = e.clientY;
    };
    const up = () => {
      active = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  const start = useCallback(async () => {
    setPhase("loading");
    try {
      if (!bankRef.current) {
        // Katta ma'lumotlar faqat o'yin boshlanganda yuklanadi — sahifa tez ochiladi
        const [w, g] = await Promise.all([import("../data/words"), import("../data/gaplar")]);
        const cache = new Map<number, { ru: string; uz: string }[]>();
        bankRef.current = {
          words: w.words,
          gaps: (level: number) => {
            let list = cache.get(level);
            if (!list) {
              list = g.getLevelGaps(level).map((x) => ({ ru: x.ru, uz: x.uz }));
              cache.set(level, list);
            }
            return list;
          },
        };
      }
    } catch {
      setPhase("menu");
      return;
    }
    setQuestion(null);
    setReveal(null);
    setResult(null);
    setXpGain(null);
    setRank(null);
    setHud({ score: 0, lives: 3, gates: 0 });
    setPhase("playing");
    setRunId((n) => n + 1);
  }, []);

  const playing = phase === "playing";
  const isGap = question?.kind === "gap";

  return (
    <div className="mx-auto w-full max-w-md select-none">
      {/* O'yin maydoni */}
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-sky-200 shadow-sm"
        style={{ height: "clamp(300px, 46dvh, 520px)" }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" style={{ touchAction: "none" }} />

        {/* HUD */}
        {playing && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <div className="rounded-xl bg-black/35 px-2.5 py-1 text-base leading-none text-white backdrop-blur-sm">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i < hud.lives ? "" : "opacity-25 grayscale"}>
                  ❤️
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="rounded-xl bg-black/35 px-2.5 py-1 text-sm font-extrabold text-white backdrop-blur-sm">
                🚪 {hud.gates}
              </div>
              <div className="min-w-[4.5rem] rounded-xl bg-black/35 px-2.5 py-1 text-right text-sm font-extrabold tabular-nums text-white backdrop-blur-sm">
                {hud.score}
              </div>
            </div>
          </div>
        )}

        {/* Menyu */}
        {phase !== "playing" && phase !== "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/55 p-5 text-center text-white backdrop-blur-[2px]">
            <p className="text-5xl">🏁</p>
            <h2 className="text-2xl font-extrabold leading-tight">So&apos;z Poygasi</h2>
            <p className="-mt-1 text-xs font-bold uppercase tracking-widest text-amber-300">yugur · o&apos;rgan · g&apos;olib bo&apos;l</p>
            <ul className="space-y-1 text-sm font-semibold text-white/90">
              <li>⬅️ ➡️ yo&apos;lakni almashtiring</li>
              <li>⬆️ sakrang (pastdagi to&apos;siq) · ⬇️ egiling (tepadagi to&apos;siq)</li>
              <li>🚪 Har ~10 soniyada eshik: to&apos;g&apos;ri tarjimani tanlang</li>
            </ul>
            <p className="text-xs text-white/70">Telefonda — barmoq bilan suring · Kompyuterda — strelkalar yoki WASD</p>
            <button onClick={start} disabled={phase === "loading"} className={`${btnPrimary} mt-1 px-10`}>
              {phase === "loading" ? "Yuklanmoqda..." : "Boshlash"}
            </button>
            {best > 0 && <p className="text-sm font-bold text-amber-300">🏅 Eng yaxshi: {best}</p>}
          </div>
        )}

        {/* Natija */}
        {phase === "over" && result && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-900/70 p-4 text-white backdrop-blur-[2px]">
            <div className="mx-auto flex min-h-full max-w-xs flex-col items-center justify-center gap-2 text-center">
              <p className="text-4xl">{newBest ? "🏆" : "🏁"}</p>
              <h2 className="text-xl font-extrabold">{newBest ? "Yangi rekord!" : "O'yin tugadi"}</h2>
              <p className="text-4xl font-extrabold tabular-nums text-amber-300">{result.score}</p>
              <p className="text-sm font-semibold text-white/85">
                {result.distance} m · 🚪 {result.gates} ta eshik ochildi
              </p>
              <p className="text-xs font-bold text-sky-200">
                {result.level}-daraja · {levelName(result.level)}
              </p>
              {rank !== null && <p className="text-sm font-extrabold text-amber-200">🏅 Reytingda {rank}-o&apos;rin</p>}
              {xpGain !== null && xpGain > 0 && <p className="text-lg font-extrabold text-emerald-300">+{xpGain} ball</p>}
              {best > 0 && <p className="text-xs font-bold text-white/70">Eng yaxshi: {best}</p>}
              {result.mistakes.length > 0 && (
                <div className="mt-1 w-full rounded-xl bg-white/10 p-2.5 text-left text-sm">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-white/60">Xatolar — eslab qoling</p>
                  <ul className="space-y-1.5">
                    {result.mistakes.slice(0, 4).map((m, i) => (
                      <li key={i}>
                        <span className="font-bold">{m.prompt}</span>
                        <span className="text-white/60"> → </span>
                        <span className="font-semibold text-emerald-300">{m.correct}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button onClick={start} className={`${btnPrimary} mt-2 w-full`}>
                Yana o&apos;ynash
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pastki panel: savol yoki ko'rsatma */}
      <div className={`${card} mt-3 p-3.5`} style={{ minHeight: 168 }}>
        {playing && question ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                ref={askBarRef}
                className="h-full origin-left rounded-full bg-amber-400"
                style={{ transform: "scaleX(1)" }}
              />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <p className={`font-extrabold text-slate-800 break-words ${isGap ? "text-lg leading-snug" : "text-2xl"}`}>
                {question.prompt}
              </p>
              {question.hint && <span className="shrink-0 text-xs font-bold text-slate-400">[{question.hint}]</span>}
            </div>
            <div className={`mt-2.5 grid gap-2 ${isGap ? "grid-cols-1" : "grid-cols-2"}`}>
              {question.options.map((opt, i) => {
                let cls = "border-slate-200 bg-white text-slate-700 active:bg-slate-100";
                if (reveal) {
                  if (i === reveal.correct) cls = "border-emerald-500 bg-emerald-50 text-emerald-700";
                  else if (i === reveal.chosen) cls = "border-rose-500 bg-rose-50 text-rose-600";
                  else cls = "border-slate-200 bg-white text-slate-400";
                }
                return (
                  <button
                    key={i}
                    disabled={!!reveal}
                    onClick={() => engineRef.current?.answer(i)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition ${cls}`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-extrabold text-slate-500">
                      {i + 1}
                    </span>
                    <span className="min-w-0 break-words">{opt}</span>
                  </button>
                );
              })}
            </div>
            {reveal && (
              <p className={`mt-2 text-sm font-extrabold ${reveal.chosen === reveal.correct ? "text-emerald-600" : "text-rose-600"}`}>
                {reveal.chosen === reveal.correct
                  ? "✅ To'g'ri! Eshik ochilmoqda..."
                  : reveal.chosen < 0
                    ? "⏰ Vaqt tugadi — bitta jon ketdi"
                    : "❌ Xato — bitta jon ketdi"}
              </p>
            )}
          </div>
        ) : playing ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Keyingi eshik</p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                ref={gateBarRef}
                className="h-full origin-left rounded-full bg-sky-500"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500">
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-xl">↔️</p>
                <p>Yo&apos;lak</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-xl">⬆️</p>
                <p>Sakrash</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-xl">⬇️</p>
                <p>Egilish</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[140px] flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-slate-500">
              Eshikda ruscha so&apos;z yoki gap chiqadi — o&apos;zbekcha tarjimasini toping.
            </p>
            <p className="mt-1 text-xs text-slate-400">Avval oson so&apos;zlar, keyin qiyinroq, oxirida gaplar. Har bir to&apos;g&apos;ri javob uchun ball beriladi.</p>
            <button onClick={start} className={`${btnSecondary} mt-3 px-6 py-2 text-sm`} disabled={phase === "loading"}>
              Boshlash
            </button>
          </div>
        )}
      </div>

      <RunnerLeaderboard refreshKey={boardKey} />
    </div>
  );
}
