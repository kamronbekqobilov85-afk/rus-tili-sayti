"use client";

import { useEffect, useState } from "react";

// Android telefonlarda: o'rnatiladigan ilova (APK) faylini yuklab olish tugmasi.
// Brauzer/Telegram ichida o'rnatib bo'lmaydigan foydalanuvchilar uchun ishonchli yo'l.
export default function ApkDownload({ variant }: { variant: "gate" | "card" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const android = /Android/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      document.referrer.startsWith("android-app://");
    setShow(android && !standalone);
  }, []);

  if (!show) return null;

  if (variant === "gate") {
    return (
      <div className="mt-5 max-w-sm">
        <a
          href="/rus-tili.apk"
          download="Rus-tili.apk"
          className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-950 bg-emerald-900/70 px-6 py-3 text-base font-extrabold text-white ring-1 ring-white/30 transition active:translate-y-0.5 active:border-b-2"
        >
          🤖 Android ilovasini yuklab olish
        </a>
        <p className="mt-2 text-xs text-white/70">
          Fayl yuklangach oching va «O&apos;rnatish»ni bosing. Agar telefon so&apos;rasa, «Shu manbadan o&apos;rnatishga ruxsat berish»ni yoqing.
        </p>
      </div>
    );
  }

  return (
    <a
      href="/rus-tili.apk"
      download="Rus-tili.apk"
      className="mt-3 flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3.5 transition active:scale-[0.98]"
    >
      <span className="text-3xl">🤖</span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-green-900">Android ilovasini yuklab oling</span>
        <span className="block text-sm text-green-800/80">Tez ochiladi va bosh ekranda turadi</span>
      </span>
      <span className="text-xl font-bold text-green-700">⬇️</span>
    </a>
  );
}
