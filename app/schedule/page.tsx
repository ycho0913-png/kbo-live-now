import ErrorBox from "@/components/ErrorBox";
import LiveScoreBoard from "@/components/LiveScoreBoard";
import SectionTitle from "@/components/SectionTitle";
import TodaySchedule from "@/components/TodaySchedule";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import { getSchedule, getScoreboard, getUpcomingSchedule } from "@/services/kbo";

async function safe<T>(loader: () => Promise<T>) {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    return { data: [] as T, error: error instanceof Error ? error.message : "데이터 조회 실패" };
  }
}

export default async function SchedulePage() {
  const [scoreboard, today, upcoming] = await Promise.all([
    safe(getScoreboard),
    safe(getSchedule),
    safe(() => getUpcomingSchedule(14))
  ]);

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10">
      <section>
        <SectionTitle title="실시간 경기 현황" description="진행 중인 경기는 30초 서버 캐시와 상세 화면 15초 갱신으로 반영합니다." />
        {scoreboard.error ? <ErrorBox message={scoreboard.error} /> : <LiveScoreBoard games={scoreboard.data} />}
      </section>

      <section>
        <SectionTitle title="오늘 경기 일정" description="경기를 누르면 선발투수, 이닝별 점수, 라인업, 문자중계 상세로 이동합니다." />
        {today.error ? <ErrorBox message={today.error} /> : <TodaySchedule games={today.data} />}
      </section>

      <section>
        <SectionTitle title="추후 경기 일정" description="앞으로 14일간 예정된 경기 시간과 구장을 표시합니다." />
        {upcoming.error ? <ErrorBox message={upcoming.error} /> : <UpcomingSchedule games={upcoming.data} />}
      </section>
    </main>
  );
}
