import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// Oxirgi mavsum g'olibi — e'lon oynasi uchun. Faqat so'nggi 14 kun ichidagisi ko'rsatiladi.
const SHOW_DAYS = 14;

// Maxsus e'lon: ballarni nollamasdan g'olibni ko'rsatish va sovg'a berilganini xabar qilish.
// Foydalanuvchilarga ANNOUNCE_FROM dan boshlab ANNOUNCE_DAYS kun davomida, har qurilmada bir martadan chiqadi.
const ANNOUNCE = {
  key: "premium-2026-11-23",
  nameContains: "Fayoza",
  prize: "Telegram Premium",
  from: "2026-11-23T00:00:00+05:00",
  days: 14,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const from = new Date(ANNOUNCE.from).getTime();
  if (Date.now() >= from && Date.now() < from + ANNOUNCE.days * 24 * 60 * 60 * 1000) {
    const star = await prisma.user.findFirst({
      where: { name: { contains: ANNOUNCE.nameContains, mode: "insensitive" } },
      orderBy: { xp: "desc" },
      select: { id: true, name: true, image: true, xp: true },
    });
    if (star) {
      return Response.json({
        ok: true,
        winner: {
          id: ANNOUNCE.key,
          name: star.name,
          image: star.image,
          xp: star.xp,
          isMe: star.id === session.user.id,
          prize: ANNOUNCE.prize,
        },
      });
    }
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
