import EmptyState from "@/components/EmptyState";
import TeamBadge from "@/components/TeamBadge";
import type { MatchupAnalysis } from "@/types/baseball";

export default function MatchupAnalysisPanel({ analysis }: { analysis?: MatchupAnalysis }) {
  if (!analysis) return <EmptyState message="전력 비교 데이터를 불러오는 중입니다." />;

  const hasData =
    analysis.teamPower.length || analysis.startingPitchers.length || analysis.keyPlayers.length;

  if (!hasData) {
    return <EmptyState message="전력 비교 데이터가 아직 제공되지 않았습니다." />;
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-[#ff6b00]">Matchup Report</p>
            <h2 className="mt-1 text-xl font-black text-ink">상대 전력 비교</h2>
          </div>
          <span className="text-xs font-bold text-ink/45">KBO 공식</span>
        </div>

        {analysis.teamPower.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {analysis.teamPower.map((team) => (
              <div key={team.team} className="rounded-lg border border-line bg-paper p-4">
                <TeamBadge team={team.team} />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="시즌" value={team.record} />
                  <Stat label="최근 5경기" value={team.recent} />
                  <Stat label="팀 ERA" value={team.era} />
                  <Stat label="팀 타율" value={team.battingAverage} />
                  <Stat label="평균 득점" value={team.averageRuns} />
                  <Stat label="평균 실점" value={team.averageAllowed} />
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">
            팀 전력 비교는 경기 프리뷰 제공 시 표시됩니다.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <h2 className="text-xl font-black text-ink">선발 투수 성적</h2>
        {analysis.startingPitchers.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {analysis.startingPitchers.map((pitcher) => (
              <div key={`${pitcher.team}-${pitcher.name}`} className="rounded-lg border border-line p-4">
                <p className="text-sm font-bold text-ink/50">{pitcher.team}</p>
                <h3 className="mt-1 text-2xl font-black text-ink">{pitcher.name}</h3>
                <p className="mt-1 text-sm font-bold text-[#ff6b00]">
                  {[pitcher.style, pitcher.seasonRecord].filter(Boolean).join(" · ") || "시즌 기록"}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Stat label="ERA" value={pitcher.era} />
                  <Stat label="WAR" value={pitcher.war} />
                  <Stat label="경기" value={pitcher.games} />
                  <Stat label="선발이닝" value={pitcher.averageStarterInnings} />
                  <Stat label="QS" value={pitcher.qualityStarts} />
                  <Stat label="WHIP" value={pitcher.whip} />
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">
            선발 투수 성적은 선발 발표 후 표시됩니다.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <h2 className="text-xl font-black text-ink">키플레이어 성적</h2>
        {analysis.keyPlayers.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {analysis.keyPlayers.slice(0, 12).map((player, index) => (
              <div
                key={`${player.category}-${player.team}-${player.name}-${index}`}
                className="rounded-lg border border-line bg-paper p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-[#ff6b00]">{player.category || "키플레이어"}</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{player.name}</h3>
                  </div>
                  <TeamBadge team={player.team} compact />
                </div>
                <p className="mt-3 text-sm font-bold text-ink/60">
                  {player.rank} · {player.rate || player.record || "기록 확인중"}
                </p>
                {player.record ? <p className="mt-1 text-sm text-ink/55">{player.record}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">
            키플레이어는 경기 프리뷰 제공 시 표시됩니다.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-ink/45">{label}</dt>
      <dd className="mt-1 font-black text-ink">{value || "-"}</dd>
    </div>
  );
}
