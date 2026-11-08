"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "verified";

// Telegram kanalga obunani tasdiqlab, bir martalik +500 ball olish tugmasi
export default function TelegramVerifyButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    fetch("/api/telegram/link")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.verified) setStatus("verified");
      })
      .catch(() => {});
  }, []);

  const start = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/telegram/link");
      const data = await res.json();
      if (data?.verified) {
        setStatus("verified");
        return;
      }
      if (data?.url) {
        window.open(data.url, "_blank");
      }
      setStatus("idle");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "verified") {
    return <p className={className}>✅ Telegram obunasi tasdiqlangan — +500 ball olindi</p>;
  }

  return (
    <button onClick={start} disabled={status === "loading"} className={className}>
      📢 Telegram'ga obuna bo'lib +500 ball oling
    </button>
  );
}
