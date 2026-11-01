"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

// Istalgan sahifada ko'rinadigan "Fikr-mulohaza" tugmasi — bosilganda
// kichik forma ochiladi, yuborilgan xabar adminga email orqali ham boradi
export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setMessage("");
      setStatus("idle");
    }, 200);
  };

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("sent");
      setTimeout(close, 1800);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border-b-4 border-sky-700 bg-sky-500 text-xl text-white shadow-lg transition hover:bg-sky-400 active:translate-y-0.5 active:border-b-0 md:bottom-6"
        aria-label="Fikr yoki taklif yuborish"
      >
        💬
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-400 transition hover:bg-slate-100"
              aria-label="Yopish"
            >
              ✕
            </button>

            {status === "sent" ? (
              <div className="py-6 text-center">
                <p className="text-4xl">✅</p>
                <p className="mt-3 text-lg font-extrabold text-slate-800">Rahmat!</p>
                <p className="mt-1 text-sm text-slate-500">Xabaringiz adminga yuborildi.</p>
              </div>
            ) : (
              <>
                <p className="text-3xl">💬</p>
                <p className="mt-3 text-lg font-extrabold text-slate-800">Fikr yoki taklif</p>
                <p className="mt-1 text-sm text-slate-500">
                  Savolingiz, taklifingiz yoki topgan xatoingizni yozing — to'g'ridan-to'g'ri adminga boradi.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Masalan: 5-darsda tovush chiqmayapti..."
                  className="mt-3 w-full resize-none rounded-2xl border-2 border-slate-200 p-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                />
                {status === "error" && (
                  <p className="mt-2 text-sm font-bold text-rose-600">
                    Yuborilmadi, internetni tekshirib qayta urinib ko'ring.
                  </p>
                )}
                <button
                  onClick={submit}
                  disabled={!message.trim() || status === "sending"}
                  className="mt-4 w-full rounded-xl border-b-4 border-sky-700 bg-sky-500 py-2.5 text-center font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 disabled:active:border-b-4"
                >
                  {status === "sending" ? "Yuborilmoqda..." : "Yuborish"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
