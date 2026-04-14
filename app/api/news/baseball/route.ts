import { NextResponse } from "next/server";
import { getBaseballNews, getSamsungLionsNews } from "@/services/naverNews";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get("team");
    const data = team === "samsung" ? await getSamsungLionsNews() : await getBaseballNews();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "뉴스 조회 실패" },
      { status: 500 }
    );
  }
}
