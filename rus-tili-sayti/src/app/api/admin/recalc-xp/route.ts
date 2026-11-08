import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { XP_REFERRAL_BONUS, XP_TELEGRAM_BONUS } from "../../../data/achievements";

// Bir martalik: barcha foydalanuvchilarning ballarini qayta hisoblaydi —
// endi ball faqat do'st taklif qilish (har biriga XP_REFERRAL_BONUS) va
// Telegram kanalga tasdiqlangan obuna (XP_TELEGRAM_BONUS) orqali bo'ladi,
// mashq (so'z/test/dars/ovoz) orqali to'plangan eski ballar bekor qilinadi.
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ ok: false }, { status: 403 });
  }

  const [users, referralCounts, verifiedLinks] = await Promise.all([
    prisma.user.findMany({ select: { id: true } }),
    prisma.user.groupBy({
      by: ["referredBy"],
      where: { referredBy: { not: null } },
      _count: { referredBy: true },
    }),
    prisma.telegramLink.findMany({
      where: { verifiedAt: { not: null } },
      select: { userId: true },
    }),
  ]);

  const referralCountByUser = new Map(
    referralCounts.map((r) => [r.referredBy as string, r._count.referredBy])
  );
  const telegramVerified = new Set(verifiedLinks.map((l) => l.userId));

  let updated = 0;
  for (const u of users) {
    const refCount = referralCountByUser.get(u.id) ?? 0;
    const xp = refCount * XP_REFERRAL_BONUS + (telegramVerified.has(u.id) ? XP_TELEGRAM_BONUS : 0);
    await prisma.user.update({ where: { id: u.id }, data: { xp } });
    updated++;
  }

  await prisma.dailyStat.deleteMany({});

  return Response.json({ ok: true, updated });
}
