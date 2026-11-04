"use client";

import { useEffect } from "react";

type TelegramWebAppApi = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

// Sayt Telegram Mini App sifatida ochilganda (BotFather orqali sozlangan
// Web App ichida) ekranni to'liq kengaytiradi va Telegram interfeysiga moslaydi.
// Oddiy brauzerda ochilganda hech narsa qilmaydi — window.Telegram mavjud bo'lmaydi.
export default function TelegramWebApp() {
  useEffect(() => {
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
  }, []);

  return null;
}
