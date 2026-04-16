import ErrorBox from "@/components/ErrorBox";
import LiveScoreBoard from "@/components/LiveScoreBoard";
import NewsList from "@/components/NewsList";
import SectionTitle from "@/components/SectionTitle";
import StatTable from "@/components/StatTable";
import SamsungPulse from "@/components/SamsungPulse";
import TeamBadge from "@/components/TeamBadge";
import TodaySchedule from "@/components/TodaySchedule";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import {
  getSchedule,
  getScoreboard,
  getTeamHitterStats,
  getTeamPitcherStats,
  getUpcomingSchedule
} from "@/services/kbo";
import { getSamsungLionsNews } from "@/services/naverNews";
import type { KeyPlayerRow, ScheduleGame, ScoreboardGame } from "@/types/baseball";

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

function opponentName(game?: ScheduleGame | ScoreboardGame) {
  if (!game) return "상대팀 확인중";
  return game.awayTeam.includes("삼성") ? game.homeTeam : game.awayTeam;
}

function samsungStarter(game?: ScheduleGame | ScoreboardGame) {
  if (!game) return "발표 전";
  return game.awayTeam.includes("삼성")
    ? game.awayStartingPitcher || "발표 전"
    : game.homeStartingPitcher || "발표 전";
}

function opponentStarter(game?: ScheduleGame | ScoreboardGame) {
  if (!game) return "발표 전";
  return game.awayTeam.includes("삼성")
    ? game.homeStartingPitcher || "발표 전"
    : game.awayStartingPitcher || "발표 전";
}

function samsungKeyPlayers(games: ScoreboardGame[]) {
  const players: KeyPlayerRow[] = [];
  const seen = new Set<string>();

  for (const game of games) {
    for (const player of game.matchupAnalysis?.keyPlayers ?? []) {
      if (!player.team.includes("삼성") || seen.has(player.name)) continue;
      seen.add(player.name);
      players.push(player);
      if (players.length >= 6) return players;
    }
  }

  return players;
}

export default async function LionsPage() {
  const [today, scoreboard, upcoming, teamHitters, teamPitchers, news] = await Promise.all([
    safe(getSchedule),
    safe(getScoreboard),
    safe(() => getUpcomingSchedule(21)),
    safe(getTeamHitterStats),
    safe(getTeamPitcherStats),
    safe(getSamsungLionsNews)
  ]);

  const todayGames = today.error ? [] : today.data.filter(isSamsungGame);
  const liveGames = scoreboard.error ? [] : scoreboard.data.filter(isSamsungGame);
  const upcomingGames = upcoming.error ? [] : upcoming.data.filter(isSamsungGame);
  const samsungHitters = teamHitters.error ? [] : teamHitters.data.filter(isSamsungTeam);
  const samsungPitchers = teamPitchers.error ? [] : teamPitchers.data.filter(isSamsungTeam);
  const focusGame = liveGames[0] ?? todayGames[0] ?? upcomingGames[0];
  const keyPlayers = samsungKeyPlayers(liveGames);

  return (
    <main className="pb-24">
      <section className="border-b border-line bg-[#0b4ea2] px-3 py-6 text-white sm:px-4 sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-white/75">Samsung Lions Room</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">삼성 라이온즈 방</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold text-white/85 sm:text-base">
              오늘 경기, 선발 매치업, 삼성 키플레이어, 라이온즈 뉴스만 한눈에 모았습니다.
            </p>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur">
            <p className="text-xs font-black text-white/70">오늘의 삼성 포커스</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TeamBadge team="삼성" />
              <span className="text-sm font-black text-white/70">vs</span>
              <TeamBadge team={opponentName(focusGame)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-white/15 p-3">
                <p className="text-white/60">경기</p>
                <p className="mt-1 font-black">{focusGame?.time || "시간 미정"} · {focusGame?.stadium || "구장 미정"}</p>
              </div>
              <div className="rounded-md bg-white/15 p-3">
                <p className="text-white/60">상태</p>
                <p className="mt-1 font-black">{focusGame?.status || "일정 확인중"}</p>
              </div>
              <div className="rounded-md bg-white/15 p-3">
                <p className="text-white/60">삼성 선발</p>
                <p className="mt-1 font-black">{samsungStarter(focusGame)}</p>
              </div>
              <div className="rounded-md bg-white/15 p-3">
                <p className="text-white/60">상대 선발</p>
                <p className="mt-1 font-black">{opponentStarter(focusGame)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-3 py-8 sm:px-4 sm:py-10">
        <SamsungPulse
          focusGame={focusGame}
          hitting={samsungHitters[0]}
          pitching={samsungPitchers[0]}
          news={news.error ? [] : news.data}
        />

        <section>
          <SectionTitle
            title="삼성 실시간 스코어보드"
            description="상대 전력, 선발 투수, 키플레이어를 삼성 경기 중심으로 보여줍니다."
            href="/schedule"
          />
          {scoreboard.error ? <ErrorBox message={scoreboard.error} /> : <LiveScoreBoard games={liveGames} />}
        </section>

        {keyPlayers.length ? (
          <section>
            <SectionTitle title="오늘의 삼성 키플레이어" description="KBO 프리뷰 기준 주요 삼성 선수입니다." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keyPlayers.map((player) => (
                <article key={`${player.category}-${player.name}`} className="rounded-lg border border-line bg-white p-4 shadow-soft">
                  <p className="text-xs font-black text-[#0b4ea2]">{player.category || "키플레이어"}</p>
                  <h3 className="mt-2 text-xl font-black text-ink">{player.name}</h3>
                  <p className="mt-2 text-sm font-bold text-ink/60">
                    {player.rank} · {player.rate || player.record || "기록 확인중"}
                  </p>
                  {player.record ? <p className="mt-1 text-sm text-ink/55">{player.record}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <SectionTitle title="오늘 삼성 경기" description="클릭하면 경기 상세와 문자중계 화면으로 이동합니다." href="/schedule" />
            {today.error ? <ErrorBox message={today.error} /> : <TodaySchedule games={todayGames} />}
          </div>

          <div className="min-w-0">
            <SectionTitle title="다가오는 삼성 일정" description="앞으로 21일 안의 삼성 경기입니다." href="/schedule" />
            {upcoming.error ? <ErrorBox message={upcoming.error} /> : <UpcomingSchedule games={upcomingGames.slice(0, 6)} />}
          </div>
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
          <SectionTitle title="삼성 라이온즈 뉴스" description="다음/네이버에서 삼성 관련 기사 10개를 우선 표시합니다." />
          {news.error ? <ErrorBox message={news.error} /> : <NewsList items={news.data.slice(0, 10)} />}
        </section>
      </div>
    </main>
  );
}
