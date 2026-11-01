"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { card, btnPrimary, btnSecondary, btnDanger } from "./ui";

type Member = { id: string; name: string | null; image: string | null; xp: number };
type GroupInfo = { id: string; name: string; code: string } | null;

export default function GroupSection({ myId }: { myId?: string }) {
  const [group, setGroup] = useState<GroupInfo>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/group")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setGroup(d.group);
          setMembers(d.members);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createGroup() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    }).catch(() => null);
    if (res?.ok) {
      setName("");
      load();
    } else {
      setError("Guruh yaratilmadi, qayta urinib ko'ring.");
    }
    setBusy(false);
  }

  async function joinGroup() {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    }).catch(() => null);
    if (res?.ok) {
      setCode("");
      load();
    } else {
      setError("Bunday kod bilan guruh topilmadi.");
    }
    setBusy(false);
  }

  async function leaveGroup() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/group", { method: "DELETE" }).catch(() => {});
    setBusy(false);
    load();
  }

  async function copyCode() {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // e'tiborsiz qoldiramiz
    }
  }

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-slate-800">Guruh</h2>
        <div className={`${card} mt-3 h-24 animate-pulse`} />
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold text-slate-800">Guruh</h2>

      {!group ? (
        <div className={`${card} mt-3 p-4`}>
          <p className="text-sm text-slate-500">
            Do'stlaringiz, sinfdoshlaringiz yoki oila a'zolaringiz bilan kichik guruh tuzing va o'zaro
            reyting qiling.
          </p>
          {error && <p className="mt-2 text-sm font-bold text-rose-600">{error}</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Yangi guruh</p>
              <div className="mt-1 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Guruh nomi"
                  className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
                />
                <button disabled={busy} onClick={createGroup} className={`${btnPrimary} px-4 py-2 text-sm`}>
                  Yaratish
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Kod bilan qo'shilish</p>
              <div className="mt-1 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Masalan: AB12CD"
                  className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold uppercase text-slate-700 outline-none focus:border-emerald-400"
                />
                <button disabled={busy} onClick={joinGroup} className={`${btnSecondary} px-4 py-2 text-sm`}>
                  Qo'shilish
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${card} mt-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
            <div>
              <p className="font-extrabold text-slate-800">{group.name}</p>
              <p className="text-xs text-slate-400">
                Taklif kodi: <span className="font-bold text-slate-600">{group.code}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className={`${btnSecondary} px-3 py-1.5 text-xs`}>
                {copied ? "✅ Nusxalandi" : "Kodni nusxalash"}
              </button>
              <button disabled={busy} onClick={leaveGroup} className={`${btnDanger} px-3 py-1.5 text-xs`}>
                Chiqish
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((m, i) => (
              <div key={m.id} className={`flex items-center gap-3 p-4 ${m.id === myId ? "bg-emerald-50" : ""}`}>
                <span className="w-6 shrink-0 text-center text-sm font-extrabold text-slate-400">{i + 1}</span>
                {m.image ? (
                  <Image src={m.image} alt="" width={28} height={28} className="shrink-0 rounded-full" />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-extrabold text-white">
                    {(m.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">
                  {m.name || "Noma'lum"} {m.id === myId && <span className="text-emerald-600">(siz)</span>}
                </span>
                <span className="shrink-0 text-sm font-extrabold text-emerald-600">{m.xp} ball</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
