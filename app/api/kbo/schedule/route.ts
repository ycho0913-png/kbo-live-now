import { NextResponse } from "next/server";
import dayjs from "dayjs";
import { getSchedule, getUpcomingSchedule } from "@/services/kbo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
    const days = Number(searchParams.get("days") ?? "1");
    const data = days > 1 ? await getUpcomingSchedule(days) : await getSchedule(date);
    return NextResponse.json({ ok: true, data, meta: { date, days: days > 1 ? days : 1 } });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "일정 조회 실패" },
      { status: 500 }
    );
  }
}
