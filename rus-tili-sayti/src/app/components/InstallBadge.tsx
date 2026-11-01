"use client";

import { useState } from "react";
import { useInstallPrompt } from "./useInstallPrompt";

// Header logotipi tagida ko'rinadigan kichik "Yuklab olish" tugmasi
export default function InstallBadge() {
  const { available, install } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  if (!available) return null;

  const handleClick = async () => {
    const result = await install();
    if (result === "ios") setShowIosHint(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="mt-0.5 flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-100"
      >
        ⬇️ Yuklab olish
      </button>

      {showIosHint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setShowIosHint(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setShowIosHint(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-slate-100"
              aria-label="Yopish"
            >
              ✕
            </button>
            <p className="text-3xl">📲</p>
            <p className="mt-3 text-lg font-extrabold text-slate-800">Ilovani o'rnatish</p>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                1. Pastdagi <strong>Ulashish</strong> (kvadrat ichida yuqoriga qarab turgan strelka) tugmasini bosing
              </li>
              <li>
                2. <strong>"Bosh ekranga qo'shish"</strong> (Add to Home Screen) bandini tanlang
              </li>
              <li>
                3. Yuqori o'ngdagi <strong>"Qo'shish"</strong> tugmasini bosing
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
