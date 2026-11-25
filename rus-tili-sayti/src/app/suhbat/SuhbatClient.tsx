"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, btnPrimary, btnSecondary } from "../components/ui";
import { speak, shuffle } from "../components/GapSession";
import { recordActivity } from "../data/stats";
import type { Scenario, Phrase, Line } from "../data/suhbat";

const DONE_KEY = "rus-tili-suhbat-done";

function loadDone(): string[] {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDone(ids: string[]) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(ids));
  } catch {
    // saqlab bo'lmasa ham ishlayveradi
  }
}

// Ball: har bir bo'lim uchun kuniga bir marta (qayta-qayta mashq qilib ball yig'ib bo'lmaydi)
const XP_KEY = "rus-tili-suhbat-xp";
const BACKFILL_KEY = "rus-tili-suhbat-backfill";

function xpToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function canEarn(id: string): boolean {
  try {
    const m = JSON.parse(localStorage.getItem(XP_KEY) || "{}") as Record<string, string>;
    return m[id] !== xpToday();
  } catch {
    return true;
  }
}

function markEarned(id: string) {
  try {
    const m = JSON.parse(localStorage.getItem(XP_KEY) || "{}") as Record<string, string>;
    m[id] = xpToday();
    localStorage.setItem(XP_KEY, JSON.stringify(m));
  } catch {
    // ignore
  }
}

type View = { kind: "list" } | { kind: "phrases" } | { kind: "scenario"; id: string; mode: "read" | "quiz" };

export type LockedScenario = { id: string; icon: string; title: string; daysLeft: number };

function stopSpeech() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ovoz mavjud emas
  }
}

export default function SuhbatClient({
  scenarios,
  locked,
  phrases,
}: {
  scenarios: Scenario[];
  locked: LockedScenario[];
  phrases: Phrase[];
}) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [done, setDone] = useState<string[]>([]);
  const [bonus, setBonus] = useState(0);

  useEffect(() => {
    const loaded = loadDone();
    setDone(loaded);

    // Bir martalik: oldin tugatilgan bo'limlar uchun ball (har biriga +20)
    const timers: ReturnType<typeof setTimeout>[] = [];
    try {
      if (!localStorage.getItem(BACKFILL_KEY)) {
        const n = loaded.filter((id) => scenarios.some((s) => s.id === id)).length;
        localStorage.setItem(BACKFILL_KEY, "1");
        if (n > 0) {
          for (let k = 0; k < n; k++) {
            // server so'rovlar orasida kamida ~0,6 soniya kutadi
            timers.push(setTimeout(() => recordActivity("test"), k * 800));
          }
          setBonus(n * 20);
        }
      }
    } catch {
      // ignore
    }
    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boshqa ekranga o'tganda ovoz to'xtaydi
  useEffect(() => {
    stopSpeech();
  }, [view]);

  const markDone = (id: string) => {
    setDone((d) => {
      if (d.includes(id)) return d;
      const next = [...d, id];
      saveDone(next);
      return next;
    });
  };

  if (view.kind === "phrases") {
    return <Phrases phrases={phrases} onBack={() => setView({ kind: "list" })} />;
  }

  if (view.kind === "scenario") {
    const sc = scenarios.find((s) => s.id === view.id);
    if (!sc) return null;
    const pool = scenarios.flatMap((s) => s.lines.filter((l) => l.who === "you"));
    return view.mode === "read" ? (
      <Reader
        sc={sc}
        onBack={() => setView({ kind: "list" })}
        onQuiz={() => setView({ kind: "scenario", id: sc.id, mode: "quiz" })}
      />
    ) : (
      <Quiz
        key={sc.id}
        sc={sc}
        pool={pool}
        onBack={() => setView({ kind: "scenario", id: sc.id, mode: "read" })}
        onFinish={(perfect) => {
          if (perfect) markDone(sc.id);
        }}
        onExit={() => setView({ kind: "list" })}
      />
    );
  }

  return (
    <>
      <PageHero
        icon="💬"
        title="Ko'cha suhbati"
        desc="Ruslar bilan hayotda eng ko'p kerak bo'ladigan suhbatlar. O'qing, tinglang va mashq qiling."
      >
        <HeroChip>
          ✅ {done.length} / {scenarios.length + locked.length}
        </HeroChip>
        <HeroChip>🔓 Ochiq</HeroChip>
      </PageHero>

      {bonus > 0 && (
        <p className="mt-4 rounded-2xl bg-amber-100 p-3 text-center text-sm font-extrabold text-amber-800">
          ⭐ Oldin tugatgan bo&apos;limlaringiz uchun +{bonus} ball qo&apos;shildi!
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {scenarios.map((s) => {
          const isDone = done.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => setView({ kind: "scenario", id: s.id, mode: "read" })}
              className={`${card} relative flex flex-col items-start p-3.5 text-left transition active:scale-[0.98]`}
            >
              {isDone && (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-extrabold text-green-700">
                  ✓ Tayyor
                </span>
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-2xl">
                {s.icon}
              </span>
              <span className="mt-2 font-extrabold text-slate-800">{s.title}</span>
              <span className="mt-0.5 text-xs text-slate-500">{s.lines.length} ta gap</span>
            </button>
          );
        })}
      </div>

      {locked.length > 0 && (
        <>
          <h3 className="mb-2 mt-5 flex flex-wrap items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-500">
            🔒 Tez orada ochiladi
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-amber-700">
              har kuni 1 ta yangisi
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {locked.map((l) => (
              <div
                key={l.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900 p-3.5 text-white shadow-sm"
              >
                <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-fuchsia-500/25 blur-xl" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15">
                  <span className="opacity-50 blur-[1.5px]">{l.icon}</span>
                  <span className="absolute inset-0 flex items-center justify-center text-lg">🔒</span>
                </span>
                <span className="mt-2 block font-extrabold">{l.title}</span>
                <span className="mt-1 inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-300/30">
                  {l.daysLeft === 1 ? "Ertaga ochiladi" : `${l.daysLeft} kundan keyin`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setView({ kind: "phrases" })}
        className={`${card} mt-3 flex w-full items-center gap-3 p-3.5 text-left transition active:scale-[0.99]`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-2xl">
          🗣️
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold text-slate-800">Ruslar ko&apos;p aytadigan iboralar</span>
          <span className="block text-xs text-slate-500">{phrases.length} ta qisqa ibora — hayotiy va oddiy</span>
        </span>
        <span className="text-xl text-slate-300">→</span>
      </button>
    </>
  );
}

function SpeakBtn({ text, small }: { text: string; small?: boolean }) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label="Tinglash"
      className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 transition active:scale-95 ${
        small ? "h-8 w-8 text-sm" : "h-10 w-10"
      }`}
    >
      🔊
    </button>
  );
}

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-extrabold text-slate-500 shadow-sm ring-1 ring-slate-200 active:scale-95"
        aria-label="Orqaga"
      >
        ←
      </button>
      <span className="truncate font-extrabold text-slate-700">{title}</span>
    </div>
  );
}

function Reader({ sc, onBack, onQuiz }: { sc: Scenario; onBack: () => void; onQuiz: () => void }) {
  const [showUz, setShowUz] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const cancelled = useRef(false);

  // Ovoz hozir eshittirilayotganini kuzatamiz (bitta gap yoki hammasi)
  useEffect(() => {
    const t = setInterval(() => {
      try {
        setSpeaking(window.speechSynthesis.speaking);
      } catch {
        // e'tiborsiz
      }
    }, 250);
    return () => {
      clearInterval(t);
      cancelled.current = true;
      stopSpeech();
    };
  }, []);

  const stopAll = () => {
    cancelled.current = true;
    stopSpeech();
    setPlaying(false);
    setSpeaking(false);
  };

  const playAll = async () => {
    if (playing) return;
    cancelled.current = false;
    setPlaying(true);
    try {
      for (const l of sc.lines) {
        if (cancelled.current) break;
        await new Promise<void>((resolve) => {
          try {
            const u = new SpeechSynthesisUtterance(l.ru);
            u.lang = "ru-RU";
            u.rate = 0.9;
            u.onend = () => resolve();
            u.onerror = () => resolve();
            window.speechSynthesis.speak(u);
          } catch {
            resolve();
          }
        });
      }
    } finally {
      setPlaying(false);
    }
  };

  const active = playing || speaking;

  return (
    <>
      <BackBar onBack={onBack} title={`${sc.icon} ${sc.title}`} />

      <div className={`${card} p-4`}>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Vaziyat</p>
        <p className="mt-1 text-sm text-slate-700">{sc.situation}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {active ? (
            <button
              onClick={stopAll}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-extrabold text-white transition active:scale-95"
            >
              ⏹ To&apos;xtatish
            </button>
          ) : (
            <button
              onClick={playAll}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-extrabold text-white transition active:scale-95"
            >
              ▶️ Hammasini tinglash
            </button>
          )}
          <button
            onClick={() => setShowUz((v) => !v)}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600 transition active:scale-95"
          >
            {showUz ? "Tarjimani yashirish" : "Tarjimani ko'rsatish"}
          </button>
        </div>
      </div>

      {/* Ovoz ketayotganda ekran pastida ham to'xtatish tugmasi turadi */}
      {active && (
        <button
          onClick={stopAll}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-500/30 active:scale-95 md:bottom-6"
        >
          ⏹ To&apos;xtatish
        </button>
      )}

      <div className="mt-4 space-y-3">
        {sc.lines.map((l, i) => (
          <Bubble key={i} line={l} showUz={showUz} />
        ))}
      </div>

      <div className={`${card} mt-5 p-4`}>
        <h3 className="font-extrabold text-slate-800">💡 Foydali iboralar</h3>
        <ul className="mt-2 space-y-2">
          {sc.tips.map((t) => (
            <li key={t.ru} className="flex items-center gap-2">
              <SpeakBtn text={t.ru} small />
              <span className="min-w-0">
                <span className="block font-bold text-slate-800">{t.ru}</span>
                <span className="block text-sm text-slate-500">{t.uz}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onQuiz} className={`${btnPrimary} mt-5 w-full`}>
        Mashq qilish
      </button>
    </>
  );
}

function Bubble({ line, showUz }: { line: Line; showUz: boolean }) {
  const you = line.who === "you";
  return (
    <div className={`flex ${you ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
          you ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
        }`}
      >
        <p className={`mb-0.5 text-[10px] font-extrabold uppercase tracking-wide ${you ? "text-indigo-200" : "text-slate-400"}`}>
          {you ? "Siz" : "Suhbatdosh"}
        </p>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-snug">{line.ru}</p>
            {showUz && (
              <p className={`mt-1 text-sm leading-snug ${you ? "text-indigo-100" : "text-slate-500"}`}>{line.uz}</p>
            )}
          </div>
          <button
            onClick={() => speak(line.ru)}
            aria-label="Tinglash"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm active:scale-95 ${
              you ? "bg-white/20" : "bg-indigo-100"
            }`}
          >
            🔊
          </button>
        </div>
      </div>
    </div>
  );
}

type Q = { prompt: Line; correct: string; correctUz: string; options: string[] };

function buildQuiz(sc: Scenario, pool: Line[]): Q[] {
  const qs: Q[] = [];
  sc.lines.forEach((l, i) => {
    if (l.who !== "you") return;
    const prev = sc.lines[i - 1];
    const wrong = shuffle(pool.filter((p) => p.ru !== l.ru).map((p) => p.ru)).slice(0, 2);
    qs.push({
      prompt: prev ?? { who: "ru", ru: "…", uz: "Suhbatni siz boshlaysiz" },
      correct: l.ru,
      correctUz: l.uz,
      options: shuffle([l.ru, ...wrong]),
    });
  });
  return qs;
}

function Quiz({
  sc,
  pool,
  onBack,
  onFinish,
  onExit,
}: {
  sc: Scenario;
  pool: Line[];
  onBack: () => void;
  onFinish: (perfect: boolean) => void;
  onExit: () => void;
}) {
  const [qs, setQs] = useState<Q[]>(() => buildQuiz(sc, pool));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  // Bu mashqda ball olish mumkinmi (bugun bu bo'limdan hali ball olinmagan bo'lsa)
  const earn = useRef(canEarn(sc.id));
  const [earned, setEarned] = useState(0);

  const q = qs[i];
  const total = qs.length;
  const pct = useMemo(() => Math.round((i / total) * 100), [i, total]);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt !== q.correct) {
      setMistakes((m) => m + 1);
    } else if (earn.current) {
      recordActivity("word"); // +5 ball
      setEarned((e) => e + 5);
      markEarned(sc.id); // chiqib qayta kirib ball yig'ib bo'lmaydi
    }
  };

  const next = () => {
    if (i + 1 >= total) {
      setFinished(true);
      if (earn.current) {
        recordActivity("test"); // +20 ball
        setEarned((e) => e + 20);
        markEarned(sc.id);
        earn.current = false;
      }
      onFinish(mistakes === 0);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setQs(buildQuiz(sc, pool));
    setI(0);
    setPicked(null);
    setMistakes(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = mistakes === 0;
    return (
      <div className={`${card} p-6 text-center`}>
        <p className="text-6xl">{perfect ? "🎉" : "💪"}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-800">
          {perfect ? "Ajoyib! Xatosiz!" : "Yaxshi urinish!"}
        </h2>
        <p className="mt-1 text-slate-500">
          {sc.title}: {total - mistakes} / {total} to&apos;g&apos;ri
          {perfect ? "" : ". Xatosiz o'tsangiz, bo'lim «Tayyor» deb belgilanadi."}
        </p>
        {earned > 0 ? (
          <p className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-700">
            ⭐ +{earned} ball qo&apos;shildi!
          </p>
        ) : (
          <p className="mt-3 text-xs font-bold text-slate-400">
            Bu bo&apos;limdan bugun ball olingan. Ertaga yana ball olasiz.
          </p>
        )}
        <div className="mt-5 grid gap-2">
          <button onClick={restart} className={btnPrimary}>
            Qayta mashq qilish
          </button>
          <button onClick={onBack} className={btnSecondary}>
            Dialogni qayta o&apos;qish
          </button>
          <button onClick={onExit} className="mt-1 text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Bo&apos;limlar ro&apos;yxati
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackBar onBack={onBack} title={`${sc.icon} ${sc.title} — mashq`} />
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-sm font-bold text-slate-500">Suhbatdosh aytdi:</p>
      <div className="mt-2 flex items-start gap-2 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-slate-800">{q.prompt.ru}</p>
          <p className="text-sm text-slate-500">{q.prompt.uz}</p>
        </div>
        {q.prompt.ru !== "…" && <SpeakBtn text={q.prompt.ru} />}
      </div>

      <h2 className="mb-2 mt-5 font-extrabold text-slate-700">Siz nima deb javob berasiz?</h2>
      <div className="space-y-3">
        {q.options.map((opt) => {
          const isCorrect = opt === q.correct;
          let cls = "border-slate-200 bg-white text-slate-700";
          if (picked) {
            if (isCorrect) cls = "border-green-500 bg-green-50 text-green-700";
            else if (opt === picked) cls = "border-red-500 bg-red-50 text-red-600";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={opt}
              disabled={!!picked}
              onClick={() => choose(opt)}
              className={`w-full rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-bold transition active:translate-y-0.5 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className={`mt-4 rounded-2xl p-4 ${picked === q.correct ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`font-extrabold ${picked === q.correct ? "text-green-700" : "text-red-600"}`}>
            {picked === q.correct ? "✅ To'g'ri!" : "❌ Noto'g'ri"}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">{q.correct}</p>
          <p className="text-sm text-slate-500">{q.correctUz}</p>
          <button onClick={() => speak(q.correct)} className="mt-2 text-sm font-extrabold text-indigo-700">
            🔊 Tinglash
          </button>
          <button onClick={next} className={`${btnPrimary} mt-3 w-full`}>
            {i + 1 >= total ? "Natijani ko'rish" : "Davom etish"}
          </button>
        </div>
      )}
    </>
  );
}

function Phrases({ phrases, onBack }: { phrases: Phrase[]; onBack: () => void }) {
  return (
    <>
      <BackBar onBack={onBack} title="🗣️ Ruslar ko'p aytadigan iboralar" />
      <div className="space-y-2">
        {phrases.map((p) => (
          <div key={p.ru} className={`${card} flex items-center gap-3 p-3`}>
            <SpeakBtn text={p.ru} />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-800">{p.ru}</p>
              <p className="text-sm text-slate-500">{p.uz}</p>
              {p.note && <p className="mt-0.5 text-xs font-semibold text-indigo-600">{p.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
