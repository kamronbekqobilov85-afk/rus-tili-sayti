import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type Row = {
  id: string;
  name: string | null;
  image: string | null;
  score: number;
  level: number;
  gates: number;
  distance: number;
  plays: number;
};

const SELECT = {
  userId: true,
  bestScore: true,
  bestLevel: true,
  bestGates: true,
  bestDistance: true,
  plays: true,
  user: { select: { name: true, image: true } },
} as const;

// "Yugur va o'rgan" reytingi: eng yuqori ball, yetib borilgan daraja va eshiklar soni
export async function GET() {
  const session = await auth();
  const myId = session?.user?.id;

  const top = await prisma.runScore.findMany({
    where: { bestScore: { gt: 0 } },
    orderBy: [{ bestScore: "desc" }, { updatedAt: "asc" }],
    take: 20,
    select: SELECT,
  });

  const toRow = (r: (typeof top)[number]): Row => ({
    id: r.userId,
    name: r.user.name,
    image: r.user.image,
    score: r.bestScore,
    level: r.bestLevel,
    gates: r.bestGates,
    distance: r.bestDistance,
    plays: r.plays,
  });

  const items = top.map(toRow);
  let me: (Row & { rank: number }) | null = null;

  if (myId) {
    const idx = items.findIndex((r) => r.id === myId);
    if (idx >= 0) {
      me = { ...items[idx], rank: idx + 1 };
    } else {
      const mine = await prisma.runScore.findUnique({ where: { userId: myId }, select: SELECT });
      if (mine && mine.bestScore > 0) {
        const rank = (await prisma.runScore.count({ where: { bestScore: { gt: mine.bestScore } } })) + 1;
        me = { ...toRow(mine), rank };
      }
    }
  }

  return Response.json({ ok: true, items, me });
}
