import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

// Tezlik chegarasi: bir foydalanuvchi o'yin natijasini 5 soniyadan tez-tez yubora olmaydi
const lastCall = new Map<string, number>();
const MIN_GAP_MS = 5000;

function int(v: unknown, max: number): number | null {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}

// O'yin tugaganda natijani saqlaydi (faqat eng yaxshisi reytingga o'tadi).
// Ball serverda qayta hisoblanadi: masofa + 50 × eshik. Qiymatlar ishonarli
// chegaradan oshsa, natija rad etiladi.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const distance = int(body?.distance, 100000);
  const gates = int(body?.gates, 1000);
  const level = int(body?.level, 1000);
  const seconds = int(body?.seconds, 36000);
  if (distance === null || gates === null || level === null || seconds === null || seconds < 1) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Ishonarlilik: tezlik 19 birlik/s dan oshmaydi, eshik kamida ~5 soniyada bir marta chiqadi
  const plausible =
    distance <= seconds * 19 + 20 &&
    gates <= Math.floor(seconds / 4) + 1 &&
    level >= gates &&
    level <= gates + 3;
  if (!plausible) {
    return Response.json({ ok: false }, { status: 422 });
  }

  const now = Date.now();
  if (now - (lastCall.get(userId) ?? 0) < MIN_GAP_MS) {
    return Response.json({ ok: true, skipped: "rate" });
  }
  lastCall.set(userId, now);
  if (lastCall.size > 5000) lastCall.clear();

  const score = distance + gates * 50;

  const existing = await prisma.runScore.findUnique({ where: { userId } });
  const isRecord = !existing || score > existing.bestScore;

  await prisma.runScore.upsert({
    where: { userId },
    create: { userId, bestScore: score, bestDistance: distance, bestGates: gates, bestLevel: level, plays: 1 },
    update: {
      plays: { increment: 1 },
      bestLevel: Math.max(existing?.bestLevel ?? 0, level),
      ...(isRecord ? { bestScore: score, bestDistance: distance, bestGates: gates } : {}),
    },
  });

  const best = isRecord ? score : existing!.bestScore;
  const rank = (await prisma.runScore.count({ where: { bestScore: { gt: best } } })) + 1;

  return Response.json({ ok: true, isRecord, best, rank });
}
