import SectionTitle from "@/components/SectionTitle";
import LiveScoreBoard from "@/components/LiveScoreBoard";
import TodaySchedule from "@/components/TodaySchedule";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import StandingsTable from "@/components/StandingsTable";
import NewsList from "@/components/NewsList";
import ErrorBox from "@/components/ErrorBox";
import StatTable from "@/components/StatTable";
import TeamBadge from "@/components/TeamBadge";
import { getBaseballNews } from "@/services/naverNews";
import {
  getPlayerHitterStats,
  getPlayerPitcherStats,
  getSchedule,
  getScoreboard,
  getStandings,
  getTeamHitterStats,
  getTeamPitcherStats,
  getUpcomingSchedule
} from "@/services/kbo";

async function settle<T>(promise: Promise<T>) {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: [] as T, error: error instanceof Error ? error.message : "데이터 조회 실패" };
  }
}

export default async function HomePage() {
  const [
    schedule,
    scoreboard,
    upcoming,
    standings,
    hitterStats,
    pitcherStats,
    teamHitters,
    teamPitchers,
    news
  ] = await Promise.all([
    settle(getSchedule()),
    settle(getScoreboard()),
    settle(getUpcomingSchedule(7)),
    settle(getStandings()),
    settle(getPlayerHitterStats()),
    settle(getPlayerPitcherStats()),
    settle(getTeamHitterStats()),
    settle(getTeamPitcherStats()),
    settle(getBaseballNews())
  ]);

  const dashboardStats = [
    { label: "오늘 경기", value: schedule.error ? "-" : schedule.data.length, tone: "bg-white text-ink" },
    { label: "실시간 경기", value: scoreboard.error ? "-" : scoreboard.data.length, tone: "bg-red-50 text-red-700" },
    { label: "추후 일정", value: upcoming.error ? "-" : upcoming.data.length, tone: "bg-yellow-50 text-yellow-800" },
    { label: "뉴스", value: news.error ? "-" : news.data.length, tone: "bg-sky-50 text-sky-800" }
  ];

  const quickLinks = [
    { href: "/schedule", label: "경기 일정" },
    { href: "/lions", label: "삼성 방" },
    { href: "/players", label: "선수 기록" },
    { href: "/teams", label: "팀 기록" },
    { href: "/standings", label: "팀 순위" },
    { href: "/news", label: "야구 뉴스" }
  ];
  const leaderTeam = !standings.error && standings.data[0] ? standings.data[0].team : "순위 집계 중";
  const firstNews = !news.error && news.data[0] ? news.data[0] : null;
  const battingLeader = !hitterStats.error && hitterStats.data[0] ? hitterStats.data[0] : null;
  const pitchingLeader = !pitcherStats.error && pitcherStats.data[0] ? pitcherStats.data[0] : null;

  return (
    <main className="pb-24">
      <section className="overflow-hidden px-3 py-5 text-ink sm:px-4 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_390px] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#ff6b00]">Live Archive</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-black italic leading-tight text-ink sm:mt-3 sm:text-6xl">
              경기부터 기록까지 오늘 볼 야구를 한 화면에.
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-ink/65 sm:mt-4 sm:text-base">
              실시간 경기, 오늘 일정, 추후 일정, 순위, 선수 기록, 팀 기록, 야구 뉴스를 모두 모았습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:flex sm:flex-wrap">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-line bg-white px-2 py-2 text-center text-xs font-bold text-ink shadow-soft hover:bg-[#ff6b00] hover:text-white sm:px-3 sm:text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {dashboardStats.map((item) => (
              <div key={item.label} className={`rounded-lg border border-line p-3 shadow-soft sm:p-4 ${item.tone}`}>
                <p className="text-[11px] font-bold opacity-70 sm:text-sm">{item.label}</p>
                <strong className="mt-1 block text-xl font-black sm:mt-2 sm:text-3xl">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-3 sm:px-4">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <a
            href={firstNews?.url ?? "/news"}
            target={firstNews ? "_blank" : undefined}
            rel={firstNews ? "noreferrer" : undefined}
            className="block bg-[linear-gradient(90deg,rgba(255,255,255,0.94),rgba(255,255,255,0.64)),url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-4 sm:p-10"
          >
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-normal">
                <span className="rounded-md bg-[#ff6b00] px-3 py-1 text-white">Top Story</span>
                <span className="text-ink/50">KBO News Feed</span>
              </div>
              <h2 className="line-clamp-3 max-w-[310px] break-words text-base font-black leading-snug text-ink [overflow-wrap:anywhere] sm:max-w-full sm:text-4xl">
                {firstNews?.title ?? "오늘의 KBO 소식을 불러오는 중입니다."}
              </h2>
              <p className="mt-4 text-sm font-bold text-ink/60">
                {firstNews ? "뉴스 원문 보기" : "뉴스 피드가 비어 있으면 잠시 후 다시 시도합니다."}
              </p>
            </div>
          </a>
        </div>
      </section>

      <section className="overflow-hidden px-3 py-6 sm:px-4 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-[#ff6b00]/25 bg-white p-6 shadow-soft">
            <p className="text-xs font-black uppercase tracking-normal text-[#ff6b00]">Diamond Poetry</p>
            <p className="mt-4 text-lg font-black italic leading-relaxed text-ink sm:mt-5 sm:text-2xl">
              봄바람에 실려 온 응원의 함성, 오늘의 순위표에도 새 불빛이 켜집니다.
            </p>
          </div>
          <div className="rounded-lg border border-teal-500/25 bg-white p-6 shadow-soft">
            <p className="text-xs font-black uppercase tracking-normal text-teal-700">League Leaders</p>
            <div className="mt-5 grid gap-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-ink/40">Batting Leader</p>
                  <p className="mt-1 font-black text-ink">{battingLeader?.player ?? "집계 중"}</p>
                </div>
                <strong className="text-3xl font-black text-teal-700">{battingLeader?.avg ?? "-"}</strong>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-ink/40">Pitching Leader</p>
                  <p className="mt-1 font-black text-ink">{pitchingLeader?.player ?? "집계 중"}</p>
                </div>
                <strong className="text-3xl font-black text-teal-700">{pitchingLeader?.era ?? "-"}</strong>
              </div>
            </div>
            <p className="mt-5 text-sm font-bold text-ink/55">
              현재 1위: <span className="text-[#ff6b00]">{leaderTeam}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden px-3 py-6 sm:px-4 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <SectionTitle title="실시간 스코어보드" description="30초 단위 서버 캐시를 사용합니다." href="/schedule" />
            {scoreboard.error ? <ErrorBox message={scoreboard.error} /> : <LiveScoreBoard games={scoreboard.data} />}
          </div>
          <div className="min-w-0">
            <SectionTitle title="오늘 경기 일정" description="KBO 공식 일정을 기준으로 표시합니다." href="/schedule" />
            {schedule.error ? <ErrorBox message={schedule.error} /> : <TodaySchedule games={schedule.data} />}
          </div>
        </section>

        <section className="hidden sm:block">
          <SectionTitle title="추후 경기 일정" description="앞으로 7일간 예정된 경기 시간입니다." href="/schedule" />
          {upcoming.error ? <ErrorBox message={upcoming.error} /> : <UpcomingSchedule games={upcoming.data} />}
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="min-w-0">
            <SectionTitle title="팀 순위" href="/standings" />
            {standings.error ? <ErrorBox message={standings.error} /> : <StandingsTable rows={standings.data.slice(0, 5)} />}
          </div>

          <div className="grid gap-8">
            <div className="min-w-0">
              <SectionTitle title="타자 기록" description="홈에서 전체 기록을 바로 확인합니다." href="/players" />
              {hitterStats.error ? (
                <ErrorBox message={hitterStats.error} />
              ) : (
                <StatTable
                  rows={hitterStats.data.slice(0, 5)}
                  rowKey={(row, index) => `${row.player}-${index}`}
                  columns={[
                    { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                    { key: "player", header: "선수", render: (row) => row.player },
                    { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
                    { key: "avg", header: "타율", align: "right", render: (row) => row.avg },
                    { key: "hr", header: "홈런", align: "right", render: (row) => row.homeRuns },
                    { key: "rbi", header: "타점", align: "right", render: (row) => row.rbi },
                    { key: "ops", header: "OPS", align: "right", render: (row) => row.ops }
                  ]}
                />
              )}
            </div>

            <div className="min-w-0">
              <SectionTitle title="투수 기록" description="홈에서 전체 기록을 바로 확인합니다." href="/players" />
              {pitcherStats.error ? (
                <ErrorBox message={pitcherStats.error} />
              ) : (
                <StatTable
                  rows={pitcherStats.data.slice(0, 5)}
                  rowKey={(row, index) => `${row.player}-${index}`}
                  columns={[
                    { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                    { key: "player", header: "선수", render: (row) => row.player },
                    { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
                    { key: "era", header: "ERA", align: "right", render: (row) => row.era },
                    { key: "wins", header: "승", align: "right", render: (row) => row.wins },
                    { key: "saves", header: "세이브", align: "right", render: (row) => row.saves },
                    { key: "strikeouts", header: "삼진", align: "right", render: (row) => row.strikeouts }
                  ]}
                />
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle title="팀 타격 기록" href="/teams" />
            {teamHitters.error ? (
              <ErrorBox message={teamHitters.error} />
            ) : (
              <StatTable
                rows={teamHitters.data.slice(0, 5)}
                rowKey={(row, index) => `${row.team}-${index}`}
                columns={[
                  { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                  { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
                  { key: "avg", header: "타율", align: "right", render: (row) => row.avg },
                  { key: "hr", header: "홈런", align: "right", render: (row) => row.homeRuns },
                  { key: "ops", header: "OPS", align: "right", render: (row) => row.ops }
                ]}
              />
            )}
          </div>

          <div className="min-w-0">
            <SectionTitle title="팀 투수 기록" href="/teams?tab=pitchers" />
            {teamPitchers.error ? (
              <ErrorBox message={teamPitchers.error} />
            ) : (
              <StatTable
                rows={teamPitchers.data.slice(0, 5)}
                rowKey={(row, index) => `${row.team}-${index}`}
                columns={[
                  { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
                  { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
                  { key: "era", header: "ERA", align: "right", render: (row) => row.era },
                  { key: "wins", header: "승", align: "right", render: (row) => row.wins },
                  { key: "strikeouts", header: "삼진", align: "right", render: (row) => row.strikeouts }
                ]}
              />
            )}
          </div>
        </section>

        <section>
          <SectionTitle title="야구 뉴스" href="/news" />
          {news.error ? <ErrorBox message={news.error} /> : <NewsList items={news.data.slice(0, 10)} />}
        </section>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-30 grid w-[min(94vw,520px)] -translate-x-1/2 grid-cols-5 rounded-lg border border-line bg-white/95 px-1 py-2 text-center text-[10px] font-black text-ink/55 shadow-soft backdrop-blur sm:bottom-4 sm:px-3 sm:py-3 sm:text-xs">
        {quickLinks.slice(0, 5).map((link) => (
          <a key={link.href} href={link.href} className="rounded-md px-1 py-2 hover:bg-[#ff6b00] hover:text-white sm:px-3">
            {link.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
