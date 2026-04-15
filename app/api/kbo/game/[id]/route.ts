import { NextResponse } from "next/server";
import { getGameDetail } from "@/services/kbo";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getGameDetail(params.id);

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "s-maxage=15, stale-while-revalidate=15"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "경기 상세 조회 실패" },
      { status: 500 }
    );
  }
}
