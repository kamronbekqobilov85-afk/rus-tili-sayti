import { prisma } from "./prisma";
import { awardXp } from "./gamification";
import { gradeExam } from "../app/data/imtihon";

// Tugatilgan imtihonni (qayta) baholaydi va darajalar uchun ballni hisobga qo'shadi.
// Idempotent: har bir ball faqat bir marta qo'shiladi (xpAwarded orqali), shuning uchun
// uni xohlagancha chaqirish mumkin. Baholash qoidasi o'zgargan bo'lsa (yoki imtihon
// avvalgi qoida bilan topshirilgan bo'lsa), saqlangan javoblar bo'yicha qayta hisoblanadi
// va farqi qo'shiladi.
export async function settleExam(userId: string) {
  const exam = await prisma.levelExam.findUnique({ where: { userId } });
  if (!exam?.finishedAt) return exam;

  const g = gradeExam((exam.answers as number[]) ?? []);

  if (exam.score !== g.score || exam.level !== g.level || exam.correct !== g.correct) {
    await prisma.levelExam.update({
      where: { userId },
      data: { score: g.score, level: g.level, correct: g.correct },
    });
  }

  const diff = g.score - exam.xpAwarded;
  if (diff > 0) {
    // Atomik "egalik": faqat bitta so'rov ball qo'sha oladi
    const claimed = await prisma.levelExam.updateMany({
      where: { userId, xpAwarded: exam.xpAwarded },
      data: { xpAwarded: g.score },
    });
    if (claimed.count === 1) {
      await awardXp(userId, diff, { source: "exam" });
    }
  }

  return prisma.levelExam.findUnique({ where: { userId } });
}

// Reytingda o'rin: ball, keyin to'g'ri javoblar, keyin kim oldin tugatgani
export async function examRank(score: number, correct: number, finishedAt: Date): Promise<number> {
  const better = await prisma.levelExam.count({
    where: {
      finishedAt: { not: null },
      OR: [
        { score: { gt: score } },
        { score, correct: { gt: correct } },
        { score, correct, finishedAt: { lt: finishedAt } },
      ],
    },
  });
  return better + 1;
}
