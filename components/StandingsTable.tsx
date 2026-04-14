import StatTable from "@/components/StatTable";
import TeamBadge from "@/components/TeamBadge";
import type { StandingRow } from "@/types/baseball";

export default function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <StatTable
      rows={rows}
      rowKey={(row, index) => `${row.team}-${index}`}
      emptyMessage="순위 데이터가 없습니다."
      columns={[
        { key: "rank", header: "순위", align: "center", render: (row) => row.rank },
        { key: "team", header: "팀", render: (row) => <TeamBadge team={row.team} /> },
        { key: "games", header: "경기", align: "right", render: (row) => row.games },
        { key: "wins", header: "승", align: "right", render: (row) => row.wins },
        { key: "losses", header: "패", align: "right", render: (row) => row.losses },
        { key: "draws", header: "무", align: "right", render: (row) => row.draws },
        { key: "winningRate", header: "승률", align: "right", render: (row) => row.winningRate },
        { key: "gamesBehind", header: "게임차", align: "right", render: (row) => row.gamesBehind },
        { key: "streak", header: "연속", align: "right", render: (row) => row.streak }
      ]}
    />
  );
}
