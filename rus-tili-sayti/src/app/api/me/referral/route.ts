import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { awardXp, unlockReferralAchievements, XP_REFERRAL_BONUS } from "../../../../lib/gamification";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referredBy: true },
  });
  if (!me || me.referredBy) {
    // Allaqachon taklif qilingan yoki topilmadi — jim o'tkazib yuboramiz
    return Response.json({ ok: true, applied: false });
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });
  if (!referrer || referrer.id === session.user.id) {
    return Response.json({ ok: true, applied: false });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { referredBy: referrer.id },
  });

  await awardXp(referrer.id, XP_REFERRAL_BONUS);
  await unlockReferralAchievements(referrer.id);

  return Response.json({ ok: true, applied: true });
}
