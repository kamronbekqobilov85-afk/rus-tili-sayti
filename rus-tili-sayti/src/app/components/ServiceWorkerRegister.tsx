"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Mahalliy sinovda (localhost) service worker kerak emas
    if (location.hostname === "localhost") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // ro'yxatdan o'tmasa ham sayt ishlayveradi
    });
  }, []);

  return null;
}
