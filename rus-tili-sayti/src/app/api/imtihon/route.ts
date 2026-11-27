import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { EXAM, gradeExam } from "../../data/imtihon";
import { EXAM_TOTAL } from "../../data/imtihonMeta";
import type { ExamQuestionPublic, ExamResult } from "../../data/imtihonMeta";

// Daraja imtihoni: har bir foydalanuvchi faqat BIR marta topshiradi.
// Savollar bittadan beriladi, to'g'ri javoblar mijozga hech qachon yuborilmaydi,
// har bir javob serverda saqlanadi (sahifa yopilsa ham davom ettirish mumkin,
// lekin berilgan javobni o'zgartirib bo'lmaydi).

function publicQuestion(index: number): ExamQuestionPublic {
  const q = EXAM[index];
  return { index, tier: q.tier, instruction: q.instruction, text: q.text, options: [...q.options] };
}

async function rankOf(score: number, finishedAt: Date): Promise<number> {
  const better = await prisma.levelExam.count({
    where: {
      finishedAt: { not: null },
      OR: [{ score: { gt: score } }, { score, finishedAt: { lt: finishedAt } }],
    },
  });
  return better + 1;
}

async function stateFor(userId: string) {
  const exam = await prisma.levelExam.findUnique({ where: { userId } });
  if (!exam) return { ok: true, state: "new" as const, total: EXAM_TOTAL };

  if (exam.finishedAt) {
    const answers = (exam.answers as number[]) ?? [];
    const g = gradeExam(answers);
    const result: ExamResult = {
      level: exam.level,
      correct: exam.correct,
      total: EXAM_TOTAL,
      score: exam.score,
      tiers: g.tiers,
      rank: await rankOf(exam.score, exam.finishedAt),
    };
    return { ok: true, state: "done" as const, total: EXAM_TOTAL, result };
  }

  return {
    ok: true,
    state: "progress" as const,
    total: EXAM_TOTAL,
    question: publicQuestion(exam.answered),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  return Response.json(await stateFor(session.user.id));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);

  // Boshlash: faqat bir marta (userId unique), takroran bosilsa mavjudi qaytadi
  if (body?.action === "start") {
    await prisma.levelExam.createMany({ data: [{ userId }], skipDuplicates: true });
    return Response.json(await stateFor(userId));
  }

  if (body?.action === "answer") {
    const index = Math.floor(Number(body?.index));
    const choice = Math.floor(Number(body?.choice));
    const exam = await prisma.levelExam.findUnique({ where: { userId } });
    if (!exam || exam.finishedAt) return Response.json(await stateFor(userId));
    if (!Number.isFinite(index) || !Number.isFinite(choice) || choice < 0 || choice > 3) {
      return Response.json({ ok: false }, { status: 400 });
    }
    // Faqat navbatdagi savolga javob qabul qilinadi (oldingisini o'zgartirib bo'lmaydi)
    if (index !== exam.answered) return Response.json(await stateFor(userId));

    const answers = [...((exam.answers as number[]) ?? []), choice];
    const last = answers.length >= EXAM_TOTAL;
    const g = last ? gradeExam(answers) : null;

    // Atomik: faqat answered hali o'zgarmagan bo'lsa yozamiz (ikki marta bosish/poyga holatlari)
    await prisma.levelExam.updateMany({
      where: { userId, answered: index, finishedAt: null },
      data: {
        answers,
        answered: answers.length,
        ...(g ? { finishedAt: new Date(), correct: g.correct, score: g.score, level: g.level } : {}),
      },
    });
    return Response.json(await stateFor(userId));
  }

  return Response.json({ ok: false }, { status: 400 });
}
