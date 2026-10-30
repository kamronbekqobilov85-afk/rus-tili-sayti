import type { ReactNode } from "react";

// Har bir bo'lim tepasidagi rangli sarlavha bloki (bosh sahifa uslubida)
export default function PageHero({
  icon,
  title,
  desc,
  children,
}: {
  icon: string;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 p-5 text-white shadow-lg sm:p-6">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-15"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        <path d="M0 60C80 20 160 100 240 60S360 30 400 50V100H0Z" fill="#fff" />
      </svg>
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25 sm:h-14 sm:w-14 sm:text-3xl">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-emerald-50/90 sm:text-base">{desc}</p>
          {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
        </div>
      </div>
    </section>
  );
}

// Mashq paytidagi yuqori qator: chiqish tugmasi, progress va hisoblagich
export function SessionBar({
  current,
  total,
  onExit,
}: {
  current: number;
  total: number;
  onExit?: () => void;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex w-full items-center gap-3">
      {onExit && (
        <button
          onClick={onExit}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          aria-label="Chiqish"
        >
          ✕
        </button>
      )}
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-extrabold text-slate-500">
        {current} / {total}
      </span>
    </div>
  );
}

export function HeroChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold ring-1 ring-white/25">
      {children}
    </span>
  );
}
