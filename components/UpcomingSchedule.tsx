import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import TeamBadge from "@/components/TeamBadge";
import type { ScheduleGame } from "@/types/baseball";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00+09:00`));
}

export default function UpcomingSchedule({ games }: { games: ScheduleGame[] }) {
  if (!games.length) return <EmptyState message="예정된 경기 일정이 없습니다." />;

  const grouped = games.reduce<Record<string, ScheduleGame[]>>((acc, game) => {
    acc[game.date] = acc[game.date] ?? [];
    acc[game.date].push(game);
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dateGames]) => (
          <div key={date} className="rounded-lg border border-line bg-white shadow-soft">
            <div className="border-b border-line bg-paper px-4 py-3">
              <h3 className="font-black text-ink">{formatDate(date)}</h3>
            </div>
            <div className="divide-y divide-line">
              {[...dateGames]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${encodeURIComponent(game.id)}`}
                    className="grid gap-2 px-4 py-3 hover:bg-paper sm:grid-cols-[80px_1fr_120px]"
                  >
                    <span className="font-black text-[#ff6b00]">{game.time || "시간 미정"}</span>
                    <span className="flex min-w-0 flex-wrap items-center gap-2 font-bold text-ink">
                      <TeamBadge team={game.awayTeam || "원정팀"} compact />
                      <span className="text-[#ff6b00]">vs</span>
                      <TeamBadge team={game.homeTeam || "홈팀"} compact />
                    </span>
                    <span className="text-sm font-semibold text-ink/60 sm:text-right">
                      {game.stadium || game.status || "경기 정보"}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
