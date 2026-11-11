import { ImageResponse } from "next/og";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

// Instagram Story o'lchami (9:16) — foydalanuvchi o'z reytingini ulashishi uchun
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, xp: true },
  });
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const higherCount = await prisma.user.count({ where: { xp: { gt: user.xp } } });
  const rank = higherCount + 1;
  const name = user.name || "Foydalanuvchi";
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "radial-gradient(circle at 30% 0%, #10b981 0%, #0c4a6e 45%, #0b1220 85%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 110 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg,#34d399,#0ea5e9)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            Я
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>Rus tili</div>
        </div>

        <div style={{ display: "flex", fontSize: 150, marginTop: 130 }}>{medal}</div>

        <div
          style={{
            display: "flex",
            marginTop: 50,
            fontSize: 46,
            fontWeight: 700,
            color: "#bae6fd",
          }}
        >
          Umumiy reytingda
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 150,
            fontWeight: 900,
          }}
        >
          #{rank}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 46,
            fontWeight: 700,
            color: "#6ee7b7",
          }}
        >
          {user.xp.toLocaleString("ru-RU")} ball
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 70,
            fontSize: 42,
            fontWeight: 800,
            textAlign: "center",
            maxWidth: 860,
          }}
        >
          {name}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "auto",
            marginBottom: 140,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "white",
              color: "#065f46",
              fontWeight: 900,
              fontSize: 36,
              padding: "26px 64px",
              borderRadius: 999,
            }}
          >
            Sen ham sinab ko'r →
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 32, fontWeight: 800, color: "#6ee7b7" }}>
            rus-tili-sayti.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
