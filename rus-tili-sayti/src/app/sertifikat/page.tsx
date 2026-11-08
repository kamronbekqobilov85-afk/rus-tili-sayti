"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { CERTIFICATE_TIERS } from "../data/certificates";

export default function SertifikatPage() {
  const [xp, setXp] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/me/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.ok && setXp(d.xp))
      .catch(() => {});
  }, []);

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🏆"
          title="Sertifikatlar"
          desc="Har 1000 ball to'plaganingizda yangi, o'ziga xos dizaynli sertifikat ochiladi — yuklab oling va ulashing!"
        />

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CERTIFICATE_TIERS.map((t) => {
            const unlocked = xp !== null && xp >= t.tier;
            return (
              <div key={t.tier} className={`${card} overflow-hidden`}>
                <div
                  className="relative flex aspect-[3/2] items-center justify-center text-center"
                  style={{
                    background: unlocked
                      ? `linear-gradient(135deg, ${t.colors.from}, ${t.colors.via}, ${t.colors.to})`
                      : "#e2e8f0",
                  }}
                >
                  {unlocked ? (
                    <div className="px-4">
                      <p className="text-4xl">🏆</p>
                      <p className="mt-2 text-lg font-extrabold" style={{ color: t.colors.text }}>
                        {t.title}
                      </p>
                      <p className="text-sm font-medium opacity-80" style={{ color: t.colors.text }}>
                        {t.subtitle}
                      </p>
                    </div>
                  ) : (
                    <div className="px-4">
                      <p className="text-4xl opacity-40">🔒</p>
                      <p className="mt-2 text-sm font-bold text-slate-400">
                        {t.tier.toLocaleString("ru-RU")} ballda ochiladi
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {unlocked ? (
                    <a
                      href={`/api/certificate?tier=${t.tier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnPrimary} block w-full text-center text-sm`}
                    >
                      Yuklab olish / Ulashish →
                    </a>
                  ) : xp !== null ? (
                    <p className="text-center text-sm text-slate-400">
                      Yana {(t.tier - xp).toLocaleString("ru-RU")} ball kerak
                    </p>
                  ) : (
                    <p className="text-center text-sm text-slate-300">Yuklanmoqda...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
