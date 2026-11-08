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
  const certNo = `RT-${tier.tier}-${session.user.id.slice(-6).toUpperCase()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1400px",
          height: "990px",
          display: "flex",
          flexDirection: "column",
          background: "#fffdf7",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "28px",
        }}
      >
        {/* Tashqi ramka */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
            border: `10px solid ${colors.border}`,
            borderRadius: "6px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              height: "100%",
              border: `2px solid ${colors.border}`,
              borderRadius: "4px",
              padding: "50px 90px",
              position: "relative",
            }}
          >
            {/* Burchak bezaklari */}
            <div style={{ display: "flex", position: "absolute", top: "18px", left: "18px", fontSize: "30px", color: colors.border }}>❦</div>
            <div style={{ display: "flex", position: "absolute", top: "18px", right: "18px", fontSize: "30px", color: colors.border }}>❦</div>
            <div style={{ display: "flex", position: "absolute", bottom: "18px", left: "18px", fontSize: "30px", color: colors.border }}>❦</div>
            <div style={{ display: "flex", position: "absolute", bottom: "18px", right: "18px", fontSize: "30px", color: colors.border }}>❦</div>

            {/* Sarlavha */}
            <div
              style={{
                display: "flex",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "8px",
                textTransform: "uppercase",
                color: "#78716c",
              }}
            >
              Rus tili — bepul o'rganish platformasi
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "34px",
                fontSize: "64px",
                fontWeight: 800,
                letterSpacing: "4px",
                color: colors.title,
              }}
            >
              SERTIFIKAT
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "8px",
                fontSize: "22px",
                fontWeight: 500,
                color: "#78716c",
              }}
            >
              {tier.subtitle}
            </div>

            {/* Ajratuvchi */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "36px", gap: "14px" }}>
              <div style={{ display: "flex", width: "70px", height: "2px", background: colors.border }} />
              <div style={{ display: "flex", fontSize: "26px" }}>{tier.medal}</div>
              <div style={{ display: "flex", width: "70px", height: "2px", background: colors.border }} />
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "36px",
                fontSize: "20px",
                color: "#57534e",
              }}
            >
              Ushbu sertifikat quyidagi shaxsga topshiriladi:
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "18px",
                fontSize: "56px",
                fontWeight: 800,
                color: "#1c1917",
                borderBottom: `3px solid ${colors.border}`,
                padding: "0 24px 12px",
              }}
            >
              {name}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "32px",
                fontSize: "22px",
                color: "#44403c",
                textAlign: "center",
                maxWidth: "980px",
                lineHeight: 1.6,
              }}
            >
              {tier.reason}
            </div>

            {/* Pastki qism: sana, muhr, imzo */}
            <div
              style={{
                display: "flex",
                width: "100%",
                marginTop: "auto",
                paddingTop: "40px",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", fontSize: "18px", fontWeight: 700, color: "#1c1917", borderTop: "2px solid #d6d3d1", paddingTop: "8px" }}>
                  {today}
                </div>
                <div style={{ display: "flex", fontSize: "14px", color: "#a8a29e", marginTop: "2px" }}>Berilgan sana</div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  borderRadius: "999px",
                  background: colors.badge,
                  color: colors.badgeText,
                  fontSize: "40px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                }}
              >
                {tier.medal}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", fontSize: "18px", fontWeight: 700, color: "#1c1917", borderTop: "2px solid #d6d3d1", paddingTop: "8px" }}>
                  Rus tili platformasi
                </div>
                <div style={{ display: "flex", fontSize: "14px", color: "#a8a29e", marginTop: "2px" }}>rus-tili-sayti.vercel.app</div>
              </div>
            </div>

            <div style={{ display: "flex", marginTop: "18px", fontSize: "13px", color: "#d6d3d1" }}>
              Sertifikat raqami: {certNo}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1400, height: 990 }
  );
}
