import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { EXAM_TOTAL } from "../../../data/imtihonMeta";
import { examRank, settleExam } from "../../../../lib/imtihon";

type Row = {
  id: string;
  name: string | null;
  image: string | null;
  level: number;
  correct: number;
  score: number;
};

const SELECT = {
  userId: true,
  level: true,
  correct: true,
  score: true,
  finishedAt: true,
  user: { select: { name: true, image: true } },
} as const;

// Daraja imtihoni reytingi: kim qaysi darajani ko'rsatdi va nechanchi o'rinda
export async function GET() {
  const session = await auth();
  const myId = session?.user?.id;

  // Ball hisobga hali qo'shilmagan (masalan, avvalgi baholash qoidasi bilan topshirilgan)
  // tugatilgan imtihonlarni yangi qoida bo'yicha qayta hisoblab, ballini qo'shib chiqamiz
  const unsettled = await prisma.levelExam.findMany({
    where: { finishedAt: { not: null }, xpAwarded: 0 },
    select: { userId: true },
    take: 200,
  });
  await Promise.all(unsettled.map((u) => settleExam(u.userId).catch(() => null)));

  const top = await prisma.levelExam.findMany({
    where: { finishedAt: { not: null } },
    orderBy: [{ score: "desc" }, { correct: "desc" }, { finishedAt: "asc" }],
    take: 50,
    select: SELECT,
  });

  const toRow = (r: (typeof top)[number]): Row => ({
    id: r.userId,
    name: r.user.name,
    image: r.user.image,
    level: r.level,
    correct: r.correct,
    score: r.score,
  });

  const items = top.map(toRow);
  const total = await prisma.levelExam.count({ where: { finishedAt: { not: null } } });
  let me: (Row & { rank: number }) | null = null;

  if (myId) {
    const idx = items.findIndex((r) => r.id === myId);
    if (idx >= 0) {
      me = { ...items[idx], rank: idx + 1 };
    } else {
      const mine = await prisma.levelExam.findUnique({ where: { userId: myId }, select: SELECT });
      if (mine?.finishedAt) {
        me = { ...toRow(mine), rank: await examRank(mine.score, mine.correct, mine.finishedAt) };
      }
    }
  }

  return Response.json({ ok: true, items, me, total, examTotal: EXAM_TOTAL });
}
