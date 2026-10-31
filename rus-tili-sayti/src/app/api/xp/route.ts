import { auth } from "../../../auth";
import { awardXp, XP_PER_TEST, XP_PER_WORD } from "../../../lib/gamification";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type === "test" ? "test" : body?.type === "word" ? "word" : null;
  if (!type) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const amount = type === "test" ? XP_PER_TEST : XP_PER_WORD;
  const result = await awardXp(session.user.id, amount);

  return Response.json({ ok: true, ...result });
}
