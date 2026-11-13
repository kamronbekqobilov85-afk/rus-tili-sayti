"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type Phase = "loading" | "ready" | "opening" | "opened";

function formatLeft(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} soat ${m} daqiqa` : `${m} daqiqa`;
}

function rewardTier(xp: number): { label: string; emoji: string; color: string } {
  if (xp >= 500) return { label: "JEKPOT!", emoji: "💎", color: "text-fuchsia-500" };
  if (xp >= 200) return { label: "Kamyob sovg'a!", emoji: "🌟", color: "text-amber-500" };
  if (xp >= 100) return { label: "Zo'r omad!", emoji: "✨", color: "text-sky-500" };
  return { label: "Sovg'angiz", emoji: "🎉", color: "text-emerald-600" };
}

export default function MysteryChest() {
  const { status } = useSession();
  const [phase, setPhase] = useState<Phase>("loading");
  const [reward, setReward] = useState<number | null>(null);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [left, setLeft] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setPhase("ready");
      return;
    }
    fetch("/api/chest")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setReward(d.reward);
          setNextAt(Date.now() + d.nextInMs);
          setPhase(d.opened ? "opened" : "ready");
        } else {
          setPhase("ready");
        }
      })
      .catch(() => setPhase("ready"));
  }, [status]);

  // Keyingi sandiqqacha qolgan vaqt; vaqt tugasa sandiq yana ochiladigan bo'ladi
  useEffect(() => {
    if (phase !== "opened" || !nextAt) return;
    const update = () => {
      const ms = nextAt - Date.now();
      if (ms <= 0) {
        setReward(null);
        setPhase("ready");
      } else {
        setLeft(formatLeft(ms));
      }
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [phase, nextAt]);

  const open = async () => {
    if (status !== "authenticated") {
      signIn("google");
      return;
    }
    if (phase !== "ready") return;
    setPhase("opening");
    setError(false);
    try {
      const [res] = await Promise.all([
        fetch("/api/chest", { method: "POST" }),
        new Promise((r) => setTimeout(r, 1200)), // sandiq "silkinishi" uchun
      ]);
      const d = res.ok ? await res.json() : null;
      if (!d?.ok) throw new Error("fail");
      setReward(d.reward);
      setNextAt(Date.now() + d.nextInMs);
      setPhase("opened");
      if (!d.alreadyOpened) setShowModal(true);
    } catch {
      setError(true);
      setPhase("ready");
    }
  };

  const tier = rewardTier(reward ?? 0);
  const isOpened = phase === "opened";

  return (
    <>
      <style>{`
        @keyframes chest-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-12deg) scale(1.1); }
          40% { transform: rotate(12deg) scale(1.15); }
          60% { transform: rotate(-10deg) scale(1.2); }
          80% { transform: rotate(10deg) scale(1.15); }
        }
        @keyframes chest-pop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chest-wiggle {
          0%, 86%, 100% { transform: rotate(0deg); }
          90% { transform: rotate(-8deg); }
          94% { transform: rotate(8deg); }
          98% { transform: rotate(-4deg); }
        }
      `}</style>

      <button
        type="button"
        onClick={open}
        disabled={phase === "loading" || phase === "opening" || isOpened}
        className={`mt-4 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
          isOpened
            ? "cursor-default border-slate-200 bg-slate-100"
            : "border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 shadow-sm hover:shadow-md"
        }`}
      >
        <span
          className="text-4xl"
          style={{
            animation:
              phase === "opening"
                ? "chest-shake 0.5s ease-in-out infinite"
                : phase === "ready"
                  ? "chest-wiggle 2.5s ease-in-out infinite"
                  : undefined,
            display: "inline-block",
            filter: isOpened ? "grayscale(0.6)" : undefined,
          }}
        >
          🎁
        </span>
        <span className="flex-1">
          {isOpened ? (
            <>
              <span className="block font-extrabold text-slate-600">
                Bugungi sandiq ochildi{reward ? ` — +${reward} ball` : ""}
              </span>
              <span className="block text-sm text-slate-500">Keyingi sandiq {left} dan keyin</span>
            </>
          ) : (
            <>
              <span className="block font-extrabold text-amber-900">
                {phase === "opening" ? "Sandiq ochilmoqda..." : "Sirli sandiq sizni kutmoqda!"}
              </span>
              <span className="block text-sm text-amber-800/80">
                {error
                  ? "Xatolik yuz berdi, qayta urinib ko'ring"
                  : status === "unauthenticated"
                    ? "Ochish uchun hisobingizga kiring — 10 dan 500 gacha ball"
                    : "Kuniga bir marta oching — ichida 10 dan 500 gacha ball"}
              </span>
            </>
          )}
        </span>
        {!isOpened && (
          <span className="shrink-0 rounded-xl border-b-4 border-amber-600 bg-amber-500 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white">
            Ochish
          </span>
        )}
      </button>

      {showModal && reward !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            style={{ animation: "chest-pop 0.45s ease-out" }}
          >
            <p className="text-6xl">{tier.emoji}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">{tier.label}</p>
            <p className={`mt-1 text-5xl font-extrabold ${tier.color}`}>+{reward}</p>
            <p className="text-lg font-extrabold text-slate-700">ball</p>
            <p className="mt-3 text-sm text-slate-500">
              Ertaga yana keling — yangi sandiqda 500 ballgacha yutishingiz mumkin!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-2.5 font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2"
            >
              Ajoyib!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
