import * as webpush from "web-push";
import { prisma } from "./prisma";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:admin@rus-tili-sayti.vercel.app", PUBLIC_KEY, PRIVATE_KEY);
}

export type PushPayload = { title: string; body: string; url?: string };

export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  if (!PUBLIC_KEY || !PRIVATE_KEY) return { sent: 0, removed: 0 };

  const subs = await prisma.pushSubscription.findMany();
  let sent = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: unknown) {
        // Obuna eskirgan yoki bekor qilingan bo'lsa (410/404) bazadan o'chiramiz
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          removed++;
        }
      }
    })
  );

  return { sent, removed };
}
