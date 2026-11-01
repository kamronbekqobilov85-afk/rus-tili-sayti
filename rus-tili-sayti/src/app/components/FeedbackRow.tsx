"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Feedback = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  status: string;
  createdAtLabel: string;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  new: { label: "Yangi", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  read: { label: "O'qildi", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  resolved: { label: "Hal qilindi", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

export default function FeedbackRow({ feedback }: { feedback: Feedback }) {
  const router = useRouter();
  const [status, setStatus] = useState(feedback.status);
  const [saving, setSaving] = useState(false);

  async function changeStatus(next: string) {
    if (saving || next === status) return;
    setSaving(true);
    const res = await fetch("/api/admin/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: feedback.id, status: next }),
    }).catch(() => null);
    if (res?.ok) {
      setStatus(next);
      router.refresh();
    }
    setSaving(false);
  }

  const badge = STATUS_LABEL[status] ?? STATUS_LABEL.new;

  return (
    <details className="group p-4" open={status === "new"}>
      <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">{feedback.name || "Noma'lum"}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ring-1 ${badge.cls}`}>
              {badge.label}
            </span>
          </span>
          <span className="block truncate text-xs text-slate-400">
            {feedback.email} · {feedback.createdAtLabel}
          </span>
          <span className="mt-1 block text-sm text-slate-600 group-open:hidden truncate">
            {feedback.message}
          </span>
        </span>
        <span className="shrink-0 text-slate-300 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="whitespace-pre-wrap text-sm text-slate-700">{feedback.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            disabled={saving}
            onClick={() => changeStatus("read")}
            className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-700 transition hover:bg-sky-100 disabled:opacity-40"
          >
            O'qildi deb belgilash
          </button>
          <button
            disabled={saving}
            onClick={() => changeStatus("resolved")}
            className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
          >
            Hal qilindi deb belgilash
          </button>
          {feedback.email && (
            <a
              href={`mailto:${feedback.email}`}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              Javob yozish
            </a>
          )}
        </div>
      </div>
    </details>
  );
}
