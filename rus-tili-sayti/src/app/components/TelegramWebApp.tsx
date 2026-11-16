"use client";

import { useEffect } from "react";

type TelegramWebAppApi = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

// Sayt Telegram Mini App ichida ochilganmi? Telegram skripti yuklanmasdan oldin ham aniqlanadi:
// Telegram ochganda manzilga "#tgWebAppData=..." qo'shadi va WebView'ga o'z ko'prigini joylaydi.
export function isTelegramEnv(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { TelegramWebviewProxy?: unknown; Telegram?: { WebApp?: { initData?: string } } };
  if (w.Telegram?.WebApp?.initData) return true;
  if (w.TelegramWebviewProxy) return true;
  if (window.location.hash.includes("tgWebApp")) return true;
  try {
    // Telegram skripti ishga tushgach parametrlarni shu yerda saqlaydi (sahifa yangilansa ham qoladi)
    return !!sessionStorage.getItem("__telegram__initParams");
  } catch {
    return false;
  }
}

function setup() {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebAppApi } }).Telegram?.WebApp;
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#059669");
    tg.setBackgroundColor?.("#f8fafc");
  } catch {
    // Telegram WebApp API xato bersa ham saytning ishlashiga xalaqit bermasin
  }
}

// Telegram skripti (≈130 KB) faqat sayt Telegram ichida ochilganda yuklanadi —
// oddiy brauzer va o'rnatilgan ilovada sahifa ochilishini sekinlashtirmaydi.
export default function TelegramWebApp() {
  useEffect(() => {
    if (!isTelegramEnv()) return;
    const src = "https://telegram.org/js/telegram-web-app.js";
    if (document.querySelector(`script[src="${src}"]`)) {
      setup();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = setup;
    document.head.appendChild(s);
  }, []);

  return null;
}
