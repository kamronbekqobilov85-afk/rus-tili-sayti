import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const dailyGoal = Number(body?.dailyGoal);
  if (!Number.isFinite(dailyGoal) || dailyGoal < 5 || dailyGoal > 500) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { dailyGoal: Math.round(dailyGoal) },
  });

  return Response.json({ ok: true });
}
