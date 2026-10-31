import { prisma } from "./prisma";
import { XP_PER_TEST, XP_PER_WORD, XP_REFERRAL_BONUS, XP_THRESHOLDS, REFERRAL_THRESHOLDS } from "../app/data/achievements";

export { XP_PER_WORD, XP_PER_TEST, XP_REFERRAL_BONUS };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
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

export async function awardXp(userId: string, amount: number) {
  const date = todayStr();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
    select: { xp: true },
  });

  const stat = await prisma.dailyStat.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, xp: amount },
    update: { xp: { increment: amount } },
    select: { xp: true },
  });

  const newAchievements = await unlockXpAchievements(userId, user.xp);

  return { xp: user.xp, todayXp: stat.xp, newAchievements };
}
