import { NextResponse } from "next/server";
import { getPlayerHitterStats } from "@/services/kbo";

export async function GET() {
  try {
    const data = await getPlayerHitterStats();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "타자 기록 조회 실패" },
      { status: 500 }
    );
  }
}
