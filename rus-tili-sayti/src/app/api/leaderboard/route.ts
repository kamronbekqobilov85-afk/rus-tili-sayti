import { auth } from "../../../auth";
import { prisma, daysAgo } from "../../../lib/prisma";

type Row = { id: string; name: string | null; image: string | null; xp: number };

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") === "week" ? "week" : "all";

  let items: Row[];

  if (period === "week") {
    const since = daysAgo(7).toISOString().slice(0, 10);
    const grouped = await prisma.dailyStat.groupBy({
      by: ["userId"],
      where: { date: { gte: since } },
      _sum: { xp: true },
      orderBy: { _sum: { xp: "desc" } },
      take: 20,
    });
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: { id: true, name: true, image: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    items = grouped
      .map((g) => {
        const u = byId.get(g.userId);
        return u ? { id: u.id, name: u.name, image: u.image, xp: g._sum.xp ?? 0 } : null;
      })
      .filter((r): r is Row => r !== null);
  } else {
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 20,
      select: { id: true, name: true, image: true, xp: true },
    });
    items = users;
  }

  const myId = session?.user?.id;
  const myRank = myId ? items.findIndex((r) => r.id === myId) : -1;

  return Response.json({
    ok: true,
    period,
    items,
    myRank: myRank >= 0 ? myRank + 1 : null,
  });
}
