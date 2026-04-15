import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import TeamBadge from "@/components/TeamBadge";
import type { KeyPlayerRow, ScoreboardGame } from "@/types/baseball";

export default function LiveScoreBoard({ games }: { games: ScoreboardGame[] }) {
  if (!games.length) {
    return <EmptyState message="현재 표시할 실시간 경기 정보가 없습니다." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {games.map((game) => {
        const isSamsungGame = game.awayTeam.includes("삼성") || game.homeTeam.includes("삼성");

        return (
          <Link
            key={game.id}
            href={`/game/${encodeURIComponent(game.id)}`}
            className={`rounded-lg border bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:border-[#ff6b00] sm:p-4 ${
              isSamsungGame ? "border-[#0b4ea2]/35 ring-2 ring-[#0b4ea2]/10" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-[11px] font-black text-[#ff6b00] sm:text-xs">
              <span className="truncate">{game.inning || game.status || "경기 정보"}</span>
              <span className="shrink-0 rounded-md bg-paper px-2 py-1 text-ink/60">
                {game.stadium || game.time}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-center">
              <div className="min-w-0 justify-self-end">
                <TeamBadge team={game.awayTeam || "원정"} compact />
              </div>
              <span className="rounded-md bg-[#ff6b00] px-2 py-2 text-base font-black leading-none text-white sm:px-3 sm:text-lg">
                {game.awayScore ?? "-"} : {game.homeScore ?? "-"}
              </span>
              <div className="min-w-0 justify-self-start">
                <TeamBadge team={game.homeTeam || "홈"} compact />
              </div>
            </div>

            <div className="mt-3 grid gap-1 rounded-md bg-paper px-3 py-2 text-[11px] font-bold text-ink/60 sm:text-xs">
              <span className="truncate">
                선발 {game.awayStartingPitcher || "발표 전"} vs {game.homeStartingPitcher || "발표 전"}
              </span>
              <span>
                {game.bases?.length ? `주자 ${game.bases.join(", ")}` : "주자 정보 대기"} ·
                B {game.balls ?? "-"} S {game.strikes ?? "-"} O {game.outs ?? "-"}
              </span>
            </div>

            <ScoreboardMatchupSummary game={game} />
          </Link>
        );
      })}
    </div>
  );
}

function ScoreboardMatchupSummary({ game }: { game: ScoreboardGame }) {
  const analysis = game.matchupAnalysis;
  if (!analysis) return null;

  const hasData =
    analysis.teamPower.length || analysis.startingPitchers.length || analysis.keyPlayers.length;
  if (!hasData) return null;

  const topPlayers = pickTopKeyPlayers(analysis.keyPlayers);

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-line bg-[#f8fafc] p-2.5 sm:space-y-3 sm:p-3">
      {analysis.teamPower.length ? (
        <div>
          <p className="text-[11px] font-black text-[#ff6b00]">상대 전력</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {analysis.teamPower.slice(0, 2).map((team) => (
              <div key={team.team} className="rounded-md bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <TeamBadge team={team.team} compact />
                  <span className="text-[11px] font-black text-ink sm:text-xs">{team.record || "-"}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-bold text-ink/55 sm:text-[11px]">
                  <span>ERA {team.era || "-"}</span>
                  <span>타율 {team.battingAverage || "-"}</span>
                  <span>최근 {team.recent || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {analysis.startingPitchers.length ? (
        <div>
          <p className="text-[11px] font-black text-[#ff6b00]">선발 투수</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {analysis.startingPitchers.slice(0, 2).map((pitcher) => (
              <div key={`${pitcher.team}-${pitcher.name}`} className="rounded-md bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-black text-ink sm:text-sm">{pitcher.name}</span>
                  <span className="text-[10px] font-bold text-ink/50 sm:text-[11px]">{pitcher.team}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-bold text-ink/55 sm:text-[11px]">
                  <span>{pitcher.era || "-"} ERA</span>
                  <span>{pitcher.whip || "-"} WHIP</span>
                  <span>{pitcher.qualityStarts || "-"} QS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {topPlayers.length ? (
        <div>
          <p className="text-[11px] font-black text-[#ff6b00]">키플레이어</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {topPlayers.map((player, index) => (
              <div key={`${player.team}-${player.name}-${index}`} className="rounded-md bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-black text-ink sm:text-sm">{player.name}</span>
                  <TeamBadge team={player.team} compact />
                </div>
                <p className="mt-1 truncate text-[10px] font-bold text-ink/55 sm:text-[11px]">
                  {player.category || "주요 선수"} · {player.rate || player.record || player.rank || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function pickTopKeyPlayers(players: KeyPlayerRow[]) {
  const seen = new Set<string>();
  const picked: KeyPlayerRow[] = [];

  for (const player of players) {
    const key = `${player.team}-${player.name}`;
    if (!player.name || seen.has(key)) continue;
    seen.add(key);
    picked.push(player);
    if (picked.length >= 2) break;
  }

  return picked;
}
