import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

// Mavsumni yakunlash (faqat admin): 1-o'rindagi foydalanuvchi g'olib sifatida saqlanadi,
// keyin barcha foydalanuvchilarning ballari 0 ga tushiriladi.

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

function findTopUser() {
  return prisma.user.findFirst({
    where: { xp: { gt: 0 } },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, image: true, xp: true },
  });
}

// Oldindan ko'rish: kim g'olib bo'ladi va nechta foydalanuvchining bali nollanadi
export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const [top, affected] = await Promise.all([
    findTopUser(),
    prisma.user.count({ where: { xp: { gt: 0 } } }),
  ]);

  return Response.json({
    ok: true,
    winner: top ? { name: top.name, xp: top.xp } : null,
    affected,
  });
}

export async function POST() {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const top = await findTopUser();
  if (!top) {
    return Response.json({ ok: false, error: "no-winner" }, { status: 400 });
  }

  const [, reset] = await prisma.$transaction([
    prisma.seasonWinner.create({
      data: { userId: top.id, name: top.name, image: top.image, xp: top.xp },
    }),
    prisma.user.updateMany({ where: { xp: { not: 0 } }, data: { xp: 0 } }),
    // Haftalik va challenge reytinglari ham 0 dan boshlanishi uchun
    prisma.dailyStat.deleteMany({}),
  ]);

  return Response.json({
    ok: true,
    winner: { name: top.name, xp: top.xp },
    reset: reset.count,
  });
}
