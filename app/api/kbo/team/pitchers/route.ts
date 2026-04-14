import { NextResponse } from "next/server";
import { getTeamPitcherStats } from "@/services/kbo";

export async function GET() {
  try {
    const data = await getTeamPitcherStats();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "팀 투수 기록 조회 실패" },
      { status: 500 }
    );
  }
}
