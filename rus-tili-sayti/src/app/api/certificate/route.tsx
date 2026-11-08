import { ImageResponse } from "next/og";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { CERTIFICATE_TIERS } from "../../data/certificates";

export const runtime = "nodejs";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tashkent",
  }).format(d);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tierNum = Number(searchParams.get("tier"));
  const tier = CERTIFICATE_TIERS.find((t) => t.tier === tierNum);
  if (!tier) {
    return new Response("Noto'g'ri daraja", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, name: true },
  });
  if (!user || user.xp < tier.tier) {
    return new Response("Bu sertifikat hali ochilmagan", { status: 403 });
  }

  const { colors } = tier;
  const name = user.name || "Foydalanuvchi";
  const today = formatDate(new Date());

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 55%, ${colors.to} 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "40px",
            left: "40px",
            right: "40px",
            bottom: "40px",
            border: `3px solid ${colors.accent}`,
            borderRadius: "24px",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "56px",
            left: "56px",
            right: "56px",
            bottom: "56px",
            border: `1px solid ${colors.accent}`,
            borderRadius: "16px",
            opacity: 0.6,
          }}
        />

        <div style={{ display: "flex", fontSize: "80px" }}>🏆</div>

        <div
          style={{
            display: "flex",
            marginTop: "18px",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: colors.accent,
          }}
        >
          Rus tili
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: "56px",
            fontWeight: 800,
            color: colors.text,
            textAlign: "center",
          }}
        >
          {tier.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "6px",
            fontSize: "26px",
            fontWeight: 500,
            color: colors.text,
            opacity: 0.85,
          }}
        >
          {tier.subtitle}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "50px",
            fontSize: "22px",
            fontWeight: 600,
            color: colors.accent,
          }}
        >
          Ushbu sertifikat
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "14px",
            fontSize: "52px",
            fontWeight: 800,
            color: colors.text,
            borderBottom: `3px solid ${colors.text}`,
            paddingBottom: "10px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "26px",
            fontSize: "24px",
            fontWeight: 500,
            color: colors.accent,
            textAlign: "center",
          }}
        >
          rus tilini o'rganishda {tier.tier.toLocaleString("ru-RU")} ball to'plagani uchun beriladi
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "60px",
            fontSize: "20px",
            fontWeight: 600,
            color: colors.text,
            opacity: 0.8,
          }}
        >
          {today} • rus-tili-sayti.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 800 }
  );
}
