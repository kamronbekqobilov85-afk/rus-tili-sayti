import { auth } from "../../../auth";
import { awardXp, todayXpOf, DAILY_XP_CAP, XP_PER_TEST, XP_PER_WORD } from "../../../lib/gamification";

// Tezlik chegarasi: bir foydalanuvchi soniyasiga bir necha marta so'rov yubora olmaydi
// (serverless'da har nusxada alohida, lekin oddiy skript/looplarni to'xtatadi)
const lastCall = new Map<string, number>();
const MIN_GAP_MS = 600;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const type = body?.type === "test" ? "test" : body?.type === "word" ? "word" : null;
  if (!type) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  const prev = lastCall.get(userId) ?? 0;
  if (now - prev < MIN_GAP_MS) {
    return Response.json({ ok: true, skipped: "rate" });
  }
  lastCall.set(userId, now);
  if (lastCall.size > 5000) lastCall.clear();

  // Kunlik chegaradan oshgan bo'lsa, ball qo'shilmaydi
  if ((await todayXpOf(userId)) >= DAILY_XP_CAP) {
    return Response.json({ ok: true, skipped: "cap" });
  }

  const amount = type === "test" ? XP_PER_TEST : XP_PER_WORD;
  const result = await awardXp(userId, amount);

  return Response.json({ ok: true, ...result });
}
