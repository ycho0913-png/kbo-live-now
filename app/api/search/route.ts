import { NextRequest, NextResponse } from "next/server";
import { searchKbo } from "@/services/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 1) {
    return NextResponse.json({ ok: true, data: { query, teams: [], players: [] } });
  }

  try {
    const data = await searchKbo(query);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "검색 데이터 조회 실패" },
      { status: 500 }
    );
  }
}
