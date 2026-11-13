import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { awardXp } from "../../../lib/gamification";

// Sirli sandiq: har bir foydalanuvchi kuniga (Toshkent vaqti bo'yicha) bir marta ochadi

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Sovg'alar va ularning chiqish ehtimoli (weight yig'indisi 100)
const REWARDS: { xp: number; weight: number }[] = [
  { xp: 10, weight: 30 },
  { xp: 20, weight: 25 },
  { xp: 30, weight: 18 },
  { xp: 50, weight: 13 },
  { xp: 100, weight: 8 },
  { xp: 200, weight: 4 },
  { xp: 500, weight: 2 },
];

function tashkentDate(): string {
  return new Date(Date.now() + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

// Keyingi Toshkent yarim tunigacha qolgan vaqt (ms)
function msUntilNextChest(): number {
  const now = Date.now() + TASHKENT_OFFSET_MS;
  const dayMs = 24 * 60 * 60 * 1000;
  return dayMs - (now % dayMs);
}

function pickReward(): number {
  const total = REWARDS.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of REWARDS) {
    roll -= r.weight;
    if (roll < 0) return r.xp;
  }
  return REWARDS[0].xp;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const opened = await prisma.dailyChest.findUnique({
    where: { userId_date: { userId: session.user.id, date: tashkentDate() } },
    select: { reward: true },
  });

  return Response.json({
    ok: true,
    opened: !!opened,
    reward: opened?.reward ?? null,
    nextInMs: msUntilNextChest(),
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const userId = session.user.id;
  const date = tashkentDate();
  const reward = pickReward();

  try {
    await prisma.dailyChest.create({ data: { userId, date, reward } });
  } catch {
    // unique constraint — bugun allaqachon ochilgan
    const existing = await prisma.dailyChest.findUnique({
      where: { userId_date: { userId, date } },
      select: { reward: true },
    });
    return Response.json({
      ok: true,
      alreadyOpened: true,
      reward: existing?.reward ?? null,
      nextInMs: msUntilNextChest(),
    });
  }

  const result = await awardXp(userId, reward);

  return Response.json({
    ok: true,
    alreadyOpened: false,
    reward,
    xp: result.xp,
    nextInMs: msUntilNextChest(),
  });
}
