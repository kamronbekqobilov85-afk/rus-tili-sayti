import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const done = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: session.user.id, date: todayStr() } },
    select: { id: true },
  });

  return Response.json({ ok: true, done: !!done });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const userId = session.user.id;
  const date = todayStr();

  try {
    await prisma.dailyChallenge.create({ data: { userId, date } });
  } catch {
    // unique constraint — bugun allaqachon bajarilgan
    return Response.json({ ok: true, alreadyDone: true });
  }

  return Response.json({ ok: true, alreadyDone: false });
}
