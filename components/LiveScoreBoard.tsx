import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import TeamBadge from "@/components/TeamBadge";
import type { ScoreboardGame } from "@/types/baseball";

export default function LiveScoreBoard({ games }: { games: ScoreboardGame[] }) {
  if (!games.length) return <EmptyState message="현재 표시할 실시간 경기 정보가 없습니다." />;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/game/${encodeURIComponent(game.id)}`}
          className="rounded-lg border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-[#ff6b00]"
        >
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#ff6b00]">
            <span>{game.status || game.inning || "경기 정보"}</span>
            <span>{game.stadium || game.time}</span>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-center sm:gap-3">
            <div className="min-w-0 justify-self-end">
              <TeamBadge team={game.awayTeam || "원정"} compact />
            </div>
            <span className="rounded-md bg-[#ff6b00] px-2 py-2 text-base font-black text-white sm:px-3 sm:text-lg">
              {game.awayScore ?? "-"} : {game.homeScore ?? "-"}
            </span>
            <div className="min-w-0 justify-self-start">
              <TeamBadge team={game.homeTeam || "홈"} compact />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
