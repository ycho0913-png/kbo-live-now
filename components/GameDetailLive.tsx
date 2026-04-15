"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorBox from "@/components/ErrorBox";
import LoadingBox from "@/components/LoadingBox";
import TeamBadge from "@/components/TeamBadge";
import type { ApiResponse, GameDetail } from "@/types/baseball";

type Props = {
  initialDetail: GameDetail;
};

export default function GameDetailLive({ initialDetail }: Props) {
  const [detail, setDetail] = useState(initialDetail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiPath = useMemo(
    () => `/api/kbo/game/${encodeURIComponent(initialDetail.id)}`,
    [initialDetail.id]
  );

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        setIsLoading(true);
        const response = await fetch(apiPath, { cache: "no-store" });
        const json = (await response.json()) as ApiResponse<GameDetail>;

        if (!active) return;
        if (!json.ok) {
          setError(json.message);
          return;
        }

        setDetail(json.data);
        setError(null);
      } catch (refreshError) {
        if (!active) return;
        setError(refreshError instanceof Error ? refreshError.message : "실시간 갱신 실패");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    const timer = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [apiPath]);

  const game = detail.scoreboard;

  return (
    <div className="grid gap-5">
      {error ? <ErrorBox message={error} /> : null}

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-[#ff6b00]">Live Game</p>
            <h1 className="mt-2 text-2xl font-black text-ink sm:text-4xl">{detail.title}</h1>
            <p className="mt-2 text-sm font-bold text-ink/55">
              {game?.stadium || "구장 확인중"} · {game?.time || "시간 확인중"} · {game?.inning || game?.status || "상태 확인중"}
            </p>
          </div>
          <div className="rounded-md bg-paper px-3 py-2 text-xs font-bold text-ink/60">
            {isLoading ? "갱신 중" : `최근 갱신 ${detail.refreshedAt ? new Date(detail.refreshedAt).toLocaleTimeString("ko-KR") : "-"}`}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <TeamBadge team={game?.awayTeam || "원정"} />
          <div className="rounded-lg bg-ink px-4 py-3 text-2xl font-black text-white sm:text-4xl">
            {game?.awayScore ?? 0} : {game?.homeScore ?? 0}
          </div>
          <TeamBadge team={game?.homeTeam || "홈"} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-paper p-4">
            <p className="text-xs font-bold text-ink/50">원정 선발</p>
            <p className="mt-1 text-lg font-black text-ink">{game?.awayStartingPitcher || "발표 전"}</p>
          </div>
          <div className="rounded-lg border border-line bg-paper p-4">
            <p className="text-xs font-bold text-ink/50">홈 선발</p>
            <p className="mt-1 text-lg font-black text-ink">{game?.homeStartingPitcher || "발표 전"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
        <h2 className="text-xl font-black text-ink">이닝별 점수</h2>
        {detail.innings.length ? (
          <div className="mt-4 max-w-full overflow-x-auto">
            <table className="min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="px-3 py-2 text-left">팀</th>
                  {detail.innings.map((row) => (
                    <th key={row.inning} className="px-3 py-2 text-center">{row.inning}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 font-bold">{game?.awayTeam || "원정"}</td>
                  {detail.innings.map((row) => (
                    <td key={row.inning} className="px-3 py-2 text-center">{row.away ?? "-"}</td>
                  ))}
                </tr>
                <tr className="border-t border-line bg-paper">
                  <td className="px-3 py-2 font-bold">{game?.homeTeam || "홈"}</td>
                  {detail.innings.map((row) => (
                    <td key={row.inning} className="px-3 py-2 text-center">{row.home ?? "-"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">이닝별 점수는 경기 시작 후 표시됩니다.</p>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
          <h2 className="text-xl font-black text-ink">라인업 / 그라운드</h2>
          {detail.lineups.length ? (
            <div className="mt-4 grid gap-4">
              {detail.lineups.map((lineup) => (
                <div key={lineup.team} className="rounded-lg border border-line p-4">
                  <h3 className="font-black text-ink">{lineup.team}</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-ink/70">
                    {lineup.players.map((player, index) => (
                      <li key={`${player.name}-${index}`} className="flex justify-between gap-3">
                        <span>{player.order ? `${player.order}번 ` : ""}{player.name}</span>
                        <span className="font-bold text-ink/45">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">라인업은 발표 후 자동으로 표시됩니다.</p>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-6">
          <h2 className="text-xl font-black text-ink">문자중계</h2>
          {detail.playByPlay.length ? (
            <ul className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {detail.playByPlay.slice(0, 80).map((play, index) => (
                <li key={`${play.inning}-${index}`} className="rounded-lg border border-line bg-paper p-3">
                  <p className="text-xs font-black text-[#ff6b00]">{play.inning} {play.batter ? `· ${play.batter}` : ""}</p>
                  <p className="mt-1 text-sm font-bold leading-relaxed text-ink">{play.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg bg-paper p-4 text-sm font-bold text-ink/60">문자중계는 경기 시작 후 자동으로 갱신됩니다.</p>
          )}
        </div>
      </section>

      {isLoading ? <LoadingBox label="실시간 데이터를 다시 불러오는 중입니다." /> : null}
    </div>
  );
}
