"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Saytga kirganda "Ilovani yuklab olish" (PWA o'rnatish) tugmasini ko'rsatadi
export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (sessionStorage.getItem("installDismissed")) return;
    } catch {
      // e'tiborsiz qoldiramiz
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari "beforeinstallprompt"ni umuman chaqirmaydi — alohida yo'riqnoma kerak
    if (isIos()) setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    try {
      sessionStorage.setItem("installDismissed", "1");
    } catch {
      // e'tiborsiz qoldiramiz
    }
  };

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
      return;
    }
    setShowIosHint(true);
  };

  return (
    <>
      <div
        className="fixed inset-x-3 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl bottom-24 md:bottom-6"
        role="status"
      >
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <span className="shrink-0 text-lg">📲</span>
          <span className="truncate">Ilovani telefoningizga o'rnating</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-xl border-b-4 border-emerald-700 bg-emerald-500 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2"
          >
            Yuklab olish
          </button>
          <button
            onClick={close}
            aria-label="Yopish"
            className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-400 transition hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

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
