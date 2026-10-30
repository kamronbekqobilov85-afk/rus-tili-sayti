"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-b-4 border-emerald-700 bg-emerald-500 px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2"
      >
        <span className="hidden sm:inline">Google bilan kirish</span>
        <span className="sm:hidden">Kirish</span>
      </button>
    );
  }

  const { user } = session;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-emerald-200 transition hover:ring-emerald-400"
        aria-label="Hisob menyusi"
      >
        {user.image ? (
          <Image src={user.image} alt="" width={36} height={36} />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-emerald-500 text-sm font-extrabold text-white">
            {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate font-extrabold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          {user.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
            >
              🛡️ Admin panel
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
          >
            Chiqish
          </button>
        </div>
      )}
    </div>
  );
}
