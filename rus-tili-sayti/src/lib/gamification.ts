import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { XP_REFERRAL_BONUS, XP_THRESHOLDS, REFERRAL_THRESHOLDS } from "../app/data/achievements";

export { XP_REFERRAL_BONUS };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Mavjud foydalanuvchilarda referralCode bo'lmasligi mumkin (ustun ixtiyoriy
// qilib qo'shilgan) — shu yerda birinchi so'ralganda hosil qilib beramiz
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;
  const code = randomUUID();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
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
