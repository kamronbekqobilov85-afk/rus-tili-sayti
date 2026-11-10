import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { awardXp } from "../../../../lib/gamification";
import { XP_TELEGRAM_BONUS } from "../../../data/achievements";

// Bir martalik: reytinglarni qayta hisoblash/admin ballni cheklash jarayonida
// o'chib ketgan Telegram obuna balini joriy admin hisobiga qaytarib beradi.
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ ok: false }, { status: 403 });
  }

  const link = await prisma.telegramLink.findUnique({ where: { userId: session.user.id } });
  if (!link?.verifiedAt) {
    return Response.json({ ok: false, error: "not_verified" }, { status: 400 });
  }

  const result = await awardXp(session.user.id, XP_TELEGRAM_BONUS, { isReferral: true });

  return Response.json({ ok: true, ...result });
}
