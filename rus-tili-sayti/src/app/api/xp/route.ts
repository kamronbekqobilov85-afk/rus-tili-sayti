import { auth } from "../../../auth";
import { awardXp, XP_PER_TEST, XP_PER_WORD } from "../../../lib/gamification";
import { XP_PER_RUN_GATE } from "../../data/achievements";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type =
    body?.type === "test" ? "test" : body?.type === "word" ? "word" : body?.type === "run" ? "run" : null;
  if (!type) {
    return Response.json({ ok: false }, { status: 400 });
  }

  let amount = type === "test" ? XP_PER_TEST : XP_PER_WORD;
  if (type === "run") {
    // "Yugur va o'rgan": to'g'ri ochilgan eshiklar soni (bir o'yin uchun yuqori chegara bor)
    const gates = Math.floor(Number(body?.gates));
    if (!Number.isFinite(gates) || gates < 1) {
      return Response.json({ ok: false }, { status: 400 });
    }
    amount = Math.min(gates, 40) * XP_PER_RUN_GATE;
  }
  const result = await awardXp(session.user.id, amount);

  return Response.json({ ok: true, gained: amount, ...result });
}
