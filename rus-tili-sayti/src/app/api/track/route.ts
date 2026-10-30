import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// Har bir sahifa ochilganda chaqiriladi: tashrifni va qurilma turini yozib boradi
export async function POST(req: NextRequest) {
  try {
    const { path } = (await req.json()) as { path?: string };
    const ua = new UAParser(req.headers.get("user-agent") || "");
    const device = ua.getDevice().type || "desktop"; // "mobile" | "tablet" | undefined -> desktop

    const session = await auth();

    await prisma.visit.create({
      data: {
        userId: session?.user?.id,
        path: path?.slice(0, 200) || "/",
        device,
        browser: ua.getBrowser().name,
        os: ua.getOS().name,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Statistika yig'ish muvaffaqiyatsiz bo'lsa ham, foydalanuvchi buni sezmasligi kerak
    return NextResponse.json({ ok: false });
  }
}
