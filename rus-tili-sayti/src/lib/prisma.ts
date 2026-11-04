import { PrismaClient } from "@prisma/client";

// Next.js serverda har bir so'rovda qayta ulanib ketmaslik uchun global nusxa
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Alohida funksiyaga chiqarilgan — server komponent ichida to'g'ridan-to'g'ri
// `Date.now()` chaqirish React'ning "purity" linter qoidasiga ilinadi
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Joriy haftaning dushanba kuni 00:00 (Toshkent vaqti) — haftalik challenge chegarasi
export function currentWeekStart(now: Date = new Date()): Date {
  const tashkentNow = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  const day = tashkentNow.getUTCDay(); // 0=yakshanba..6=shanba
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(tashkentNow.getUTCFullYear(), tashkentNow.getUTCMonth(), tashkentNow.getUTCDate() - diffToMonday)
  );
  return new Date(monday.getTime() - TASHKENT_OFFSET_MS);
}

// O'tgan haftaning dushanba va yakshanbasi (Toshkent vaqti) — g'olibni aniqlash uchun
export function previousWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  const thisMonday = currentWeekStart(now);
  const start = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const end = thisMonday;
  return { start, end };
}
