import { NextResponse } from "next/server";
import { getScoreboard } from "@/services/kbo";

export async function GET() {
  try {
    const data = await getScoreboard();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "스코어보드 조회 실패" },
      { status: 500 }
    );
  }
}
