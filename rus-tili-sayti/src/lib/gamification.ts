import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { XP_PER_TEST, XP_PER_WORD, XP_REFERRAL_BONUS, XP_THRESHOLDS, REFERRAL_THRESHOLDS } from "../app/data/achievements";

export { XP_PER_WORD, XP_PER_TEST, XP_REFERRAL_BONUS };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const SHORT_CODE_LENGTH = 7;
// Adashtiradigan belgilarsiz (0/o, 1/l/i) — havolani qo'lda yozish ham oson
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function shortCode(): string {
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  let out = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

// Qisqa (7 belgili) taklif kodini qaytaradi. Kodi yo'q foydalanuvchiga yangisini
// yaratadi; eski uzun (UUID) kodi borlarniki qisqasiga almashtiriladi, eskisi esa
// legacyReferralCode'da saqlanadi — avval tarqatilgan havolalar ishlayveradi.
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, legacyReferralCode: true },
  });
  const current = user?.referralCode ?? null;
  if (current && current.length <= SHORT_CODE_LENGTH) return current;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = shortCode();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          referralCode: code,
          ...(current && !user?.legacyReferralCode ? { legacyReferralCode: current } : {}),
        },
      });
      return code;
    } catch (e) {
      // P2002 — kod band (juda kam uchraydi), boshqasini sinab ko'ramiz
      if ((e as { code?: string })?.code !== "P2002") throw e;
    }
  }
  throw new Error("Taklif kodini yaratib bo'lmadi");
}

async function unlockXpAchievements(userId: string, xp: number): Promise<string[]> {
  const toUnlock = XP_THRESHOLDS.filter((t) => xp >= t.xp).map((t) => t.key);
  if (toUnlock.length === 0) return [];
  const existing = await prisma.userAchievement.findMany({
    where: { userId, key: { in: toUnlock } },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((e) => e.key));
  const fresh = toUnlock.filter((k) => !existingKeys.has(k));
  if (fresh.length === 0) return [];
  await prisma.userAchievement.createMany({
    data: fresh.map((key) => ({ userId, key })),
    skipDuplicates: true,
  });
  return fresh;
}

export async function unlockReferralAchievements(userId: string): Promise<string[]> {
  const count = await prisma.user.count({ where: { referredBy: userId } });
  const toUnlock = REFERRAL_THRESHOLDS.filter((t) => count >= t.count).map((t) => t.key);
  if (toUnlock.length === 0) return [];
  const existing = await prisma.userAchievement.findMany({
    where: { userId, key: { in: toUnlock } },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((e) => e.key));
  const fresh = toUnlock.filter((k) => !existingKeys.has(k));
  if (fresh.length === 0) return [];
  await prisma.userAchievement.createMany({
    data: fresh.map((key) => ({ userId, key })),
    skipDuplicates: true,
  });
  return fresh;
}

export async function awardXp(userId: string, amount: number, opts?: { isReferral?: boolean }) {
  const date = todayStr();
  const isReferral = opts?.isReferral ?? false;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
    select: { xp: true },
  });

  const stat = await prisma.dailyStat.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, xp: amount, referralXp: isReferral ? amount : 0 },
    update: { xp: { increment: amount }, ...(isReferral ? { referralXp: { increment: amount } } : {}) },
    select: { xp: true },
  });

  const newAchievements = await unlockXpAchievements(userId, user.xp);

  return { xp: user.xp, todayXp: stat.xp, newAchievements };
}
