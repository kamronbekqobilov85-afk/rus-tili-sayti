"use client";

import { useEffect, useState } from "react";

// Sahifalar almashganda ham eslab qolish uchun modul darajasida saqlaymiz
let initialVersion: string | null = null;

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let stopped = false;

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const v = data && data.v;
        if (typeof v !== "string" || v === "dev") return;
        if (initialVersion === null) {
          initialVersion = v;
        } else if (initialVersion !== v && !stopped) {
          setShow(true);
        }
      } catch {
        // internet yo'q bo'lsa e'tibor bermaymiz
      }
    };

    check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(check, 5 * 60 * 1000);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-3 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-xl bottom-24 md:bottom-6"
      role="status"
    >
      <span className="text-sm font-bold">🎉 Yangi versiya tayyor!</span>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-green-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white border-b-4 border-green-700 active:translate-y-0.5 active:border-b-2"
      >
        Yangilash
      </button>
    </div>
  );
}
