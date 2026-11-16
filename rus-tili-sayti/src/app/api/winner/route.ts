import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// Oxirgi mavsum g'olibi — e'lon oynasi uchun. Faqat so'nggi 14 kun ichidagisi ko'rsatiladi.
const SHOW_DAYS = 14;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const since = new Date(Date.now() - SHOW_DAYS * 24 * 60 * 60 * 1000);
  const winner = await prisma.seasonWinner.findFirst({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { id: true, userId: true, name: true, image: true, xp: true },
  });

  if (!winner) {
    return Response.json({ ok: true, winner: null });
  }

  return Response.json({
    ok: true,
    winner: {
      id: winner.id,
      name: winner.name,
      image: winner.image,
      xp: winner.xp,
      isMe: winner.userId === session.user.id,
    },
  });
}
