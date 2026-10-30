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
