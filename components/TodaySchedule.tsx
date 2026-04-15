import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import TeamBadge from "@/components/TeamBadge";
import { getTeamBrand } from "@/lib/teamBranding";
import type { ScheduleGame } from "@/types/baseball";

export default function TodaySchedule({ games }: { games: ScheduleGame[] }) {
  if (!games.length) return <EmptyState message="오늘 등록된 KBO 일정이 없습니다." />;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {games.map((game) => {
        const homeBrand = getTeamBrand(game.homeTeam);

        return (
          <Link
            href={`/game/${encodeURIComponent(game.id)}`}
            key={game.id}
            className="rounded-lg border border-line bg-white p-4 shadow-soft hover:border-[#ff6b00]"
            style={{ borderLeft: `6px solid ${homeBrand.primary}` }}
          >
            <div className="flex items-center justify-between gap-3 text-sm font-bold text-ink/60">
              <span>{game.time || "시간 미정"}</span>
              <span>{game.stadium || "구장 미정"}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-lg font-black text-ink">
              <TeamBadge team={game.awayTeam || "원정팀"} />
              <span className="text-[#ff6b00]">vs</span>
              <TeamBadge team={game.homeTeam || "홈팀"} />
            </div>
            <div className="mt-3 grid gap-1 text-sm text-ink/60">
              <p>{game.status || "예정"} · 클릭하면 실시간 게임센터로 이동합니다.</p>
              <p className="font-bold text-ink/70">
                선발: {game.awayStartingPitcher || "발표 전"} vs {game.homeStartingPitcher || "발표 전"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
