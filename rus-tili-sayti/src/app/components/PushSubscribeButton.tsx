"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0))).buffer;
}

type Status = "idle" | "asking" | "on" | "denied" | "unsupported";

// Bildirishnomani yoqish tugmasi — bosilganda ruxsat so'raydi va obunani serverga yuboradi
export default function PushSubscribeButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("denied");
    else if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setStatus("on");
        })
      );
    }
  }, []);

  const enable = async () => {
    if (!VAPID_PUBLIC_KEY) return;
    setStatus("asking");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus("on");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "unsupported" || status === "on") return null;

  return (
    <button
      onClick={enable}
      disabled={status === "asking" || status === "denied"}
      className={className}
    >
      {status === "denied"
        ? "🔕 Bildirishnomalar bloklangan"
        : status === "asking"
          ? "So'ralmoqda..."
          : "🔔 Bildirishnomalarni yoqish"}
    </button>
  );
}
