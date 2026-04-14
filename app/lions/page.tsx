import ErrorBox from "@/components/ErrorBox";
import NewsList from "@/components/NewsList";
import SectionTitle from "@/components/SectionTitle";
import StatTable from "@/components/StatTable";
import TeamBadge from "@/components/TeamBadge";
import TodaySchedule from "@/components/TodaySchedule";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import { getSchedule, getTeamHitterStats, getTeamPitcherStats, getUpcomingSchedule } from "@/services/kbo";
import { getSamsungLionsNews } from "@/services/naverNews";

async function safe<T>(loader: () => Promise<T>) {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    return { data: [] as T, error: error instanceof Error ? error.message : "데이터 조회 실패" };
  }
}

function isSamsungGame(game: { awayTeam: string; homeTeam: string }) {
  return game.awayTeam.includes("삼성") || game.homeTeam.includes("삼성");
}

function isSamsungTeam(row: { team: string }) {
  return row.team.includes("삼성");
}

export default async function LionsPage() {
  const [today, upcoming, teamHitters, teamPitchers, news] = await Promise.all([
    safe(getSchedule),
    safe(() => getUpcomingSchedule(21)),
    safe(getTeamHitterStats),
    safe(getTeamPitcherStats),
    safe(getSamsungLionsNews)
  ]);

  const todayGames = today.error ? [] : today.data.filter(isSamsungGame);
  const upcomingGames = upcoming.error ? [] : upcoming.data.filter(isSamsungGame);
  const samsungHitters = teamHitters.error ? [] : teamHitters.data.filter(isSamsungTeam);
  const samsungPitchers = teamPitchers.error ? [] : teamPitchers.data.filter(isSamsungTeam);

  return (
    <main>
      <section className="border-b border-line bg-[#0b4ea2] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-normal text-white/70">Samsung Lions Room</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">삼성 라이온즈 방</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold text-white/85">
            오늘 경기, 다가오는 일정, 팀 기록, 라이온즈 뉴스를 한곳에 모았습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10">
        <section>
          <SectionTitle title="오늘 삼성 경기" description="오늘 삼성 라이온즈 경기만 따로 보여줍니다." href="/schedule" />
          {today.error ? <ErrorBox message={today.error} /> : <TodaySchedule games={todayGames} />}
        </section>

        <section>
          <SectionTitle title="다가오는 삼성 경기" description="앞으로 21일 일정 중 삼성 경기만 모았습니다." href="/schedule" />
          {upcoming.error ? <ErrorBox message={upcoming.error} /> : <UpcomingSchedule games={upcomingGames} />}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle title="삼성 팀 타격" href="/teams" />
            {teamHitters.error ? (
              <ErrorBox message={teamHitters.error} />
            ) : (
              <StatTable
                rows={samsungHitters}
                rowKey={(row, index) => `${row.team}-${index}`}
                emptyMessage="삼성 팀 타격 기록을 찾지 못했습니다."
                columns={[
                  { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                  { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} /> },
                  { key: "avg", header: "타율", align: "right", render: (row) => row.avg },
                  { key: "hr", header: "홈런", align: "right", render: (row) => row.homeRuns },
                  { key: "ops", header: "OPS", align: "right", render: (row) => row.ops }
                ]}
              />
            )}
          </div>

          <div className="min-w-0">
            <SectionTitle title="삼성 팀 투수" href="/teams?tab=pitchers" />
            {teamPitchers.error ? (
              <ErrorBox message={teamPitchers.error} />
            ) : (
              <StatTable
                rows={samsungPitchers}
                rowKey={(row, index) => `${row.team}-${index}`}
                emptyMessage="삼성 팀 투수 기록을 찾지 못했습니다."
                columns={[
                  { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                  { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} /> },
                  { key: "era", header: "ERA", align: "right", render: (row) => row.era },
                  { key: "wins", header: "승", align: "right", render: (row) => row.wins },
                  { key: "strikeouts", header: "삼진", align: "right", render: (row) => row.strikeouts }
                ]}
              />
            )}
          </div>
        </section>

        <section>
          <SectionTitle title="삼성 라이온즈 뉴스" description="기본 10개를 우선 표시합니다." />
          {news.error ? <ErrorBox message={news.error} /> : <NewsList items={news.data.slice(0, 10)} />}
        </section>
      </div>
    </main>
  );
}
