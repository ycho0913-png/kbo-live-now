import { NextResponse } from "next/server";
import { getStandings } from "@/services/kbo";

export async function GET() {
  try {
    const data = await getStandings();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "순위 조회 실패" },
      { status: 500 }
    );
  }
}
