"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import UpdateBanner from "./UpdateBanner";
import UserMenu from "./UserMenu";

const links = [
  { href: "/", label: "Bosh sahifa", short: "Bosh", icon: "🏠" },
  { href: "/yol", label: "Gaplar yo'li", short: "Gaplar", icon: "🛤️" },
  { href: "/sozlar", label: "So'zlar", short: "So'zlar", icon: "📚" },
  { href: "/grammatika", label: "Grammatika", short: "Qoida", icon: "📖" },
  { href: "/tinglash", label: "Tinglash", short: "Tinglash", icon: "🎧" },
  { href: "/yozish", label: "Yozish", short: "Yozish", icon: "✍️" },
  { href: "/video", label: "Video", short: "Video", icon: "🎬" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname() || "/";

  return (
    <>
      <ServiceWorkerRegister />
      <UpdateBanner />

      {/* Telefonda pastki menyu uchun joy qoldiramiz */}
      <style>{`@media (max-width: 767px) { body { padding-bottom: calc(76px + env(safe-area-inset-bottom)); } }`}</style>

      {/* Yuqori panel */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-200">
        <nav className="max-w-5xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon-192.png" alt="" width={36} height={36} priority />
            <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-emerald-600">
              Rus tili
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`whitespace-nowrap rounded-xl px-2 py-2 text-[11px] lg:px-2.5 lg:text-xs font-extrabold uppercase tracking-wide border-2 transition ${
                    active
                      ? "bg-sky-100 text-sky-600 border-sky-300"
                      : "border-transparent text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <UserMenu />
        </nav>
      </header>

      {/* Telefonda pastki menyu */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex bg-white border-t-2 border-gray-200 px-1 pt-1"
        style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
      >
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition ${
                active
                  ? "bg-sky-100 text-sky-600"
                  : "text-gray-400 active:bg-gray-100"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              <span>{l.short}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
