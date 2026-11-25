"use client";

import { useEffect, useState } from "react";

type Platform = "android" | "ios" | "desktop";

// Ilova ichidagi brauzerlar (Instagram, Facebook, TikTok, Telegram...) ilovani o'rnatishga yo'l qo'ymaydi
function detectInApp(ua: string): string | null {
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "TikTok";
  if (/Telegram/i.test(ua)) return "Telegram";
  if (/Line\//i.test(ua)) return "Line";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/\bwv\b/i.test(ua) && /Android/i.test(ua)) return "ilova ichidagi brauzer";
  return null;
}

function detectPlatform(ua: string): Platform {
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

const TABS: { key: Platform; label: string }[] = [
  { key: "android", label: "🤖 Android" },
  { key: "ios", label: "🍎 iPhone" },
  { key: "desktop", label: "💻 Kompyuter" },
];

// Barcha qurilmalar uchun o'rnatish yo'riqnomasi: Android, iPhone va kompyuter + ilova ichidagi brauzer ogohlantirishi
export default function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("android");
  const [inApp, setInApp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(detectPlatform(ua));
    setInApp(detectInApp(ua));
  }, []);

  const copyLink = async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mt-6 w-full max-w-sm text-left">
      {inApp && (
        <div className="mb-3 rounded-2xl bg-amber-300/95 p-3.5 text-sm font-bold text-amber-950 shadow-lg">
          <p>
            ⚠️ Siz hozir <strong>{inApp}</strong> ichidasiz. Bu yerda ilovani o&apos;rnatib bo&apos;lmaydi.
          </p>
          <p className="mt-1.5 font-semibold">
            Yuqoridagi yoki pastdagi <strong>⋮</strong> / <strong>•••</strong> tugmasini bosing va{" "}
            <strong>«Brauzerda ochish»</strong> (Open in Chrome / Safari) ni tanlang. Yoki havolani nusxalab,
            brauzerga qo&apos;ying:
          </p>
          <button
            onClick={copyLink}
            className="mt-2 w-full rounded-xl bg-amber-950 px-3 py-2 text-sm font-extrabold text-white active:scale-[0.98]"
          >
            {copied ? "✅ Nusxalandi!" : "🔗 Havolani nusxalash"}
          </button>
        </div>
      )}

      <p className="mb-2 text-center text-xs font-extrabold uppercase tracking-wide text-white/80">
        Qanday o&apos;rnatiladi?
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPlatform(t.key)}
            className={`rounded-xl px-1 py-2 text-xs font-extrabold transition ${
              platform === t.key ? "bg-white text-indigo-700" : "bg-white/15 text-white ring-1 ring-white/25"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ol className="mt-2 space-y-2 rounded-2xl bg-white/15 p-4 text-sm ring-1 ring-white/25">
        {platform === "android" && (
          <>
            <li>
              <strong>1-usul (eng oson):</strong> yuqoridagi <strong>«🤖 Android ilovasini yuklab olish»</strong>{" "}
              tugmasini bosing, fayl yuklangach oching va «O&apos;rnatish»ni bosing.
            </li>
            <li>Telefon so&apos;rasa, «Shu manbadan o&apos;rnatishga ruxsat berish»ni yoqing.</li>
            <li>
              <strong>2-usul:</strong> Chrome&apos;da saytni oching → <strong>⋮</strong> → <strong>«Ilovani o&apos;rnatish»</strong>{" "}
              yoki «Bosh ekranga qo&apos;shish».
            </li>
          </>
        )}
        {platform === "ios" && (
          <>
            <li>
              1. Saytni <strong>Safari</strong> brauzerida oching (Telegram/Instagram ichida emas).
            </li>
            <li>
              2. Pastdagi <strong>Ulashish</strong> (⬆︎ kvadrat ichidagi strelka) tugmasini bosing.
            </li>
            <li>
              3. Pastga suring va <strong>«Bosh ekranga qo&apos;shish»</strong> (Add to Home Screen) ni tanlang.
            </li>
            <li>
              4. <strong>«Qo&apos;shish»</strong>ni bosing, so&apos;ng bosh ekrandagi «Rus tili» ni oching.
            </li>
          </>
        )}
        {platform === "desktop" && (
          <>
            <li>
              1. Saytni <strong>Chrome</strong> yoki <strong>Edge</strong> brauzerida oching.
            </li>
            <li>
              2. Manzil qatorining o&apos;ng chetidagi <strong>⊕ / «O&apos;rnatish»</strong> belgisini bosing (yoki{" "}
              <strong>⋮</strong> → «Rus tili&apos;ni o&apos;rnatish»).
            </li>
            <li>3. «O&apos;rnatish»ni bosing, ilova alohida oynada ochiladi.</li>
            <li className="text-white/80">
              Xohlamasangiz, o&apos;rnatmasdan ham to&apos;g&apos;ridan-to&apos;g&apos;ri ishlatishingiz mumkin.
            </li>
          </>
        )}
      </ol>
    </div>
  );
}
