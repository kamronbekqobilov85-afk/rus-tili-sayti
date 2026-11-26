import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { words } from "../../data/words";
import { XP_PER_RUN_GATE } from "../../data/achievements";
import { awardXp, todayXpOf, xpAllowedNow, XP_PER_TEST } from "../../../lib/gamification";

// Tezlik chegarasi: bir foydalanuvchi soniyasiga bir necha marta so'rov yubora olmaydi
// (serverless'da har nusxada alohida, lekin oddiy skript/looplarni to'xtatadi)
const lastCall = new Map<string, number>();
const MIN_GAP_MS = 600;
const SECTION_XP = 10;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const type =
    body?.type === "test"
      ? "test"
      : body?.type === "word"
        ? "word"
        : body?.type === "section"
          ? "section"
          : body?.type === "pair"
            ? "pair"
            : body?.type === "watch"
              ? "watch"
              : body?.type === "run"
                ? "run"
                : null;
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

  // Kunlik (va vaqt bo'yicha) chegaradan oshgan bo'lsa, ball qo'shilmaydi
  if ((await todayXpOf(userId)) >= xpAllowedNow()) {
    return Response.json({ ok: true, skipped: "cap" });
  }

  let amount: number;
  if (type === "section") {
    // So'zlar bo'limini o'qib chiqqani uchun +10: har bir mavzudan bir marta (serverda belgilanadi)
    const key = typeof body?.key === "string" ? body.key : "";
    if (!words.some((w) => w.category === key)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    const created = await prisma.userAchievement.createMany({
      data: [{ userId, key: `sozlar-${key}` }],
      skipDuplicates: true,
    });
    if (created.count === 0) {
      return Response.json({ ok: true, skipped: "already" });
    }
    amount = SECTION_XP;
  } else if (type === "pair") {
    // So'z testida ikkita to'g'ri javob = 1 ball (har biri 0,5)
    amount = 1;
  } else if (type === "run") {
    // "Yugur va o'rgan": to'g'ri ochilgan eshiklar soni (bir o'yin uchun yuqori chegara bor)
    const gates = Math.floor(Number(body?.gates));
    if (!Number.isFinite(gates) || gates < 1) {
      return Response.json({ ok: false }, { status: 400 });
    }
    amount = Math.min(gates, 40) * XP_PER_RUN_GATE;
  } else if (type === "watch") {
    // Video ko'rish: har 5 daqiqaga 20 ball (mashq emas, shuning uchun kamaytirilmagan)
    amount = 20;
  } else if (type === "word") {
    // Javob uchun 2,5 ball: butun son saqlanadi, shuning uchun navbat bilan 2 va 3 beriladi
    const dayStart = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
    const countToday = await prisma.xpEvent.count({
      where: { userId, source: "word", createdAt: { gte: dayStart } },
    });
    amount = countToday % 2 === 0 ? 2 : 3;
  } else {
    amount = XP_PER_TEST;
  }
  const result = await awardXp(userId, amount, { source: type });

  return Response.json({ ok: true, gained: amount, ...result });
}
