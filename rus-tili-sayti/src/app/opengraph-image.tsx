import { ImageResponse } from "next/og";

// Havola Telegram, Instagram va boshqa joylarda ulashilganda ko'rinadigan rasm
export const alt = "Rus tili — bepul va oson o'rganing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const chip = {
    display: "flex",
    alignItems: "center",
    padding: "14px 28px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "2px solid rgba(255,255,255,0.3)",
    fontSize: 30,
    fontWeight: 800,
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "linear-gradient(135deg, #059669 0%, #0d9488 45%, #1d4ed8 100%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: 70,
            width: 300,
            height: 300,
            borderRadius: 70,
            background: "rgba(255,255,255,0.16)",
            border: "3px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 190,
            fontWeight: 900,
            transform: "rotate(8deg)",
          }}
        >
          Я
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 76,
              height: 76,
              borderRadius: 22,
              background: "linear-gradient(135deg,#34d399,#0ea5e9)",
              border: "3px solid rgba(255,255,255,0.5)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            Ру
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 900 }}>Rus tili</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          <div style={{ display: "flex" }}>Rus tilini</div>
          <div style={{ display: "flex", color: "#fde68a" }}>o'ynab o'rganing</div>
        </div>

        <div style={{ display: "flex", marginTop: 22, fontSize: 34, fontWeight: 600, color: "#d1fae5" }}>
          Kuniga 10 daqiqa — o'zbek tilida, bepul
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <div style={chip}>Darslar</div>
          <div style={chip}>Reyting</div>
          <div style={chip}>Sovg'alar</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
