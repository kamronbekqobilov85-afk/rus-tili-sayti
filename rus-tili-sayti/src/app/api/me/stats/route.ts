import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { ensureReferralCode } from "../../../../lib/gamification";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const userId = session.user.id;
  const today = todayStr();

  const [user, todayStat, achievements, referralCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, dailyGoal: true, referralCode: true },
    }),
    prisma.dailyStat.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { xp: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { key: true },
    }),
    prisma.user.count({ where: { referredBy: userId } }),
  ]);

  if (!user) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const referralCode = user.referralCode ?? (await ensureReferralCode(userId));

  return Response.json({
    ok: true,
    xp: user.xp,
    dailyGoal: user.dailyGoal,
    todayXp: todayStat?.xp ?? 0,
    achievements: achievements.map((a) => a.key),
    referralCode,
    referralCount,
  });
}
