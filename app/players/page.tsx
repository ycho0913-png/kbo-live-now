import Link from "next/link";
import ErrorBox from "@/components/ErrorBox";
import SectionTitle from "@/components/SectionTitle";
import StatTable from "@/components/StatTable";
import TeamBadge from "@/components/TeamBadge";
import { getPlayerHitterStats, getPlayerPitcherStats } from "@/services/kbo";

async function safe<T>(loader: () => Promise<T>) {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    return { data: [] as T, error: error instanceof Error ? error.message : "데이터 조회 실패" };
  }
}

export default async function PlayersPage({
  searchParams
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab === "pitchers" ? "pitchers" : "hitters";
  const hitterStats = tab === "hitters" ? await safe(getPlayerHitterStats) : null;
  const pitcherStats = tab === "pitchers" ? await safe(getPlayerPitcherStats) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionTitle title="선수 기록" description="KBO 공식 기록실 데이터를 서버에서 조회합니다." />
      <div className="mb-5 flex gap-2">
        <Link className={`rounded-md px-4 py-2 text-sm font-bold ${tab === "hitters" ? "bg-grass text-white" : "bg-white text-ink"}`} href="/players?tab=hitters">
          타자 기록
        </Link>
        <Link className={`rounded-md px-4 py-2 text-sm font-bold ${tab === "pitchers" ? "bg-grass text-white" : "bg-white text-ink"}`} href="/players?tab=pitchers">
          투수 기록
        </Link>
      </div>
      {tab === "hitters" && hitterStats?.error ? (
        <ErrorBox message={hitterStats.error} />
      ) : tab === "hitters" && hitterStats ? (
        <StatTable
          rows={hitterStats.data}
          rowKey={(row, index) => `${row.player}-${index}`}
          columns={[
            { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
            { key: "player", header: "선수", render: (row) => row.player },
            { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
            { key: "avg", header: "타율", align: "right", render: (row) => row.avg },
            { key: "games", header: "경기", align: "right", render: (row) => row.games },
            { key: "hits", header: "안타", align: "right", render: (row) => row.hits },
            { key: "hr", header: "홈런", align: "right", render: (row) => row.homeRuns },
            { key: "rbi", header: "타점", align: "right", render: (row) => row.rbi },
            { key: "ops", header: "OPS", align: "right", render: (row) => row.ops }
          ]}
        />
      ) : pitcherStats?.error ? (
        <ErrorBox message={pitcherStats.error} />
      ) : pitcherStats ? (
        <StatTable
          rows={pitcherStats.data}
          rowKey={(row, index) => `${row.player}-${index}`}
          columns={[
            { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
            { key: "player", header: "선수", render: (row) => row.player },
            { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} compact /> },
            { key: "era", header: "ERA", align: "right", render: (row) => row.era },
            { key: "games", header: "경기", align: "right", render: (row) => row.games },
            { key: "wins", header: "승", align: "right", render: (row) => row.wins },
            { key: "losses", header: "패", align: "right", render: (row) => row.losses },
            { key: "saves", header: "세이브", align: "right", render: (row) => row.saves },
            { key: "strikeouts", header: "삼진", align: "right", render: (row) => row.strikeouts }
          ]}
        />
      ) : null}
    </main>
  );
}
