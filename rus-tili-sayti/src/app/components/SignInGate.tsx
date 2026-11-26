"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useInstallPrompt } from "./useInstallPrompt";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import { isTelegramEnv } from "./TelegramWebApp";
import ApkDownload from "./ApkDownload";
import InstallGuide from "./InstallGuide";

const SKIP_KEY = "rus-tili-install-step-done";

type Step = "loading" | "install" | "signin";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Telegram Mini App ichida ilovani o'rnatib bo'lmaydi — u yerda to'g'ridan-to'g'ri kirish ko'rsatiladi.
// Tizimga kirmagan foydalanuvchiga butun ilova o'rniga shu ekran ko'rsatiladi.
// Yangi kelgan odam avval ilovani o'rnatishga taklif qilinadi, o'rnatgandan keyin hisob bilan kiradi.
export default function SignInGate() {
  const { available, install } = useInstallPrompt();
  const [step, setStep] = useState<Step>("loading");
  const [justInstalled, setJustInstalled] = useState(false);
  const [, setHint] = useState<"ios" | "manual" | null>(null);
  const [inTelegram, setInTelegram] = useState(false);

  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(SKIP_KEY) === "1";
    } catch {
      // localStorage mavjud emas
    }
    setInTelegram(isTelegramEnv());
    setStep(isStandalone() || done ? "signin" : "install");

    const onInstalled = () => {
      try {
        localStorage.setItem(SKIP_KEY, "1");
      } catch {
        // e'tiborsiz
      }
      setJustInstalled(true);
      setStep("signin");
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const handleInstall = async () => {
    // Telegram ichida o'rnatib bo'lmaydi — havolani telefon brauzerida ochamiz
    if (inTelegram) {
      const url = window.location.origin;
      const tg = (window as unknown as { Telegram?: { WebApp?: { openLink?: (u: string, o?: object) => void } } }).Telegram?.WebApp;
      if (tg?.openLink) tg.openLink(url, { try_browser: true });
      else window.open(url, "_blank");
      return;
    }
    const result = await install();
    if (result === "ios") setHint("ios");
    else if (result === null) setHint("manual");
  };

  const skip = () => {
    try {
      localStorage.setItem(SKIP_KEY, "1");
    } catch {
      // e'tiborsiz
    }
    setStep("signin");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-10 text-center text-white">
      <ServiceWorkerRegister />
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl ring-1 ring-white/25">
        🐻
      </span>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Rus tilini o'rganing</h1>

      {step === "install" && (
        <>
          <p className="mt-3 max-w-sm text-emerald-50/90">
            {inTelegram
              ? "Telegramdan ochildi. Ilovani telefoningizga o'rnatish uchun brauzerda oching — bepul va bir bosishda ochiladi."
              : "Avval ilovani telefoningizga o'rnating — bepul, joy olmaydi va bir bosishda ochiladi. Keyin hisobingiz bilan kirasiz."}
          </p>

          <button
            onClick={handleInstall}
            className="mt-8 flex items-center gap-3 rounded-2xl border-b-4 border-emerald-800 bg-white px-7 py-3.5 text-lg font-extrabold text-emerald-700 shadow-lg transition hover:bg-emerald-50 active:translate-y-0.5 active:border-b-2"
          >
            {inTelegram ? "🌐 Brauzerda ochib o'rnatish" : "📲 Ilovani o'rnatish"}
          </button>

          <ApkDownload variant="gate" />

          <InstallGuide />

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-100/80">
            <span className="rounded-full bg-white px-2 py-0.5 text-emerald-700">1</span> O'rnatish
            <span className="opacity-50">→</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5">2</span> Hisob bilan kirish
          </div>

          <button onClick={skip} className="mt-8 text-xs text-emerald-100/70 underline underline-offset-2">
            {available || inTelegram ? "O'rnatmasdan davom etish" : "Ilova o'rnatilgan yoki o'rnatib bo'lmayaptimi? Davom etish"}
          </button>
        </>
      )}

      {step === "signin" && (
        <>
          {justInstalled && (
            <p className="mt-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-extrabold ring-1 ring-white/30">
              ✅ Ilova o'rnatildi!
            </p>
          )}
          <p className="mt-3 max-w-sm text-emerald-50/90">
            Davom etish uchun Google hisobingiz bilan kiring. Progressingiz va yutuqlaringiz
            hisobingizga saqlanadi.
          </p>

          <button
            onClick={() => signIn("google")}
            className="mt-8 flex items-center gap-3 rounded-2xl border-b-4 border-emerald-800 bg-white px-6 py-3 text-base font-extrabold text-slate-800 shadow-lg transition hover:bg-emerald-50 active:translate-y-0.5 active:border-b-2"
          >
            <GoogleIcon />
            Google bilan kirish
          </button>

          <p className="mt-6 max-w-xs text-xs text-emerald-100/70">
            Bepul va faqat bir necha soniya ketadi. Ma'lumotlaringiz faqat sizga tegishli bo'ladi.
          </p>
        </>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-13.9 4.3-17.1 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.8 14.1-5l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.3 36.1 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
