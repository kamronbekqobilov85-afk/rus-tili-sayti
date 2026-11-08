import { auth } from "../../../auth";
import { prisma, daysAgo, currentWeekStart } from "../../../lib/prisma";

type Row = { id: string; name: string | null; image: string | null; xp: number };
type Period = "week" | "friends" | "challenge" | "all";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period");
  const period: Period =
    periodParam === "week"
      ? "week"
      : periodParam === "friends"
        ? "friends"
        : periodParam === "challenge"
          ? "challenge"
          : "all";

  let items: Row[];

  if (period === "friends") {
    if (!session?.user?.id) {
      return Response.json({ ok: false }, { status: 401 });
    }
    items = await prisma.user.findMany({
      where: { OR: [{ id: session.user.id }, { referredBy: session.user.id }] },
      orderBy: { xp: "desc" },
      select: { id: true, name: true, image: true, xp: true },
    });
  } else if (period === "week") {
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
  } else if (period === "challenge") {
    // Haftalik Challenge: faqat do'st taklif qilib olingan ball hisoblanadi —
    // har dushanba 0'dan boshlanadi
    const since = currentWeekStart().toISOString().slice(0, 10);
    const grouped = await prisma.dailyStat.groupBy({
      by: ["userId"],
      where: { date: { gte: since } },
      _sum: { referralXp: true },
      having: { referralXp: { _sum: { gt: 0 } } },
      orderBy: { _sum: { referralXp: "desc" } },
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
        return u ? { id: u.id, name: u.name, image: u.image, xp: g._sum.referralXp ?? 0 } : null;
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
