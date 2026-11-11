"use client";

import { useState } from "react";

export default function ShareRankButton({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const share = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/share-card");
      if (!res.ok) throw new Error("fail");
      const blob = await res.blob();
      const file = new File([blob], "rus-tili-reyting.png", { type: "image/png" });

      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Rus tili reytingi",
          text: "Men rus tilini o'rganyapman! Sen ham sinab ko'r: rus-tili-sayti.vercel.app",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rus-tili-reyting.png";
        a.click();
        URL.revokeObjectURL(url);
      }
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  return (
    <button
      onClick={share}
      disabled={state === "loading"}
      className={
        className ??
        "flex items-center justify-center gap-1.5 rounded-xl border-b-4 border-violet-700 bg-violet-500 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-violet-400 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
      }
    >
      {state === "loading" ? "Tayyorlanmoqda..." : state === "error" ? "Xatolik" : "📤 Reytingni ulashish"}
    </button>
  );
}
