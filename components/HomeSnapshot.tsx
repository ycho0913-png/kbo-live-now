import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";
import type { NewsItem, ScheduleGame, StandingRow } from "@/types/baseball";

interface HomeSnapshotProps {
  todayGames: ScheduleGame[];
  upcomingGames: ScheduleGame[];
  standings: StandingRow[];
  news: NewsItem[];
}

function gameLabel(game?: ScheduleGame) {
  if (!game) return "오늘 등록된 경기를 확인 중입니다.";
  return `${game.awayTeam || "원정"} vs ${game.homeTeam || "홈"}`;
}

export default function HomeSnapshot({ todayGames, upcomingGames, standings, news }: HomeSnapshotProps) {
  const samsungGame =
    todayGames.find((game) => game.awayTeam.includes("삼성") || game.homeTeam.includes("삼성")) ??
    upcomingGames.find((game) => game.awayTeam.includes("삼성") || game.homeTeam.includes("삼성"));
  const topTeams = standings.slice(0, 3);

  return (
    <section className="px-3 py-5 sm:px-4">
      <div className="mx-auto grid max-w-6xl gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Link
          href={samsungGame ? `/game/${encodeURIComponent(samsungGame.id)}` : "/lions"}
          className="rounded-lg border border-[#0b4ea2]/20 bg-[linear-gradient(135deg,#ffffff_0%,#e8f3ff_54%,#d7e8ff_100%)] p-4 shadow-soft hover:border-[#0b4ea2] sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-normal text-[#0b4ea2]">Samsung Focus</p>
              <h2 className="mt-2 text-xl font-black leading-tight text-ink sm:text-3xl">삼성 라이온즈 바로보기</h2>
            </div>
            <span className="shrink-0 rounded-md bg-[#0b4ea2] px-3 py-2 text-lg font-black text-white">사자</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-bold text-ink/55">{samsungGame?.date || "오늘 기준"} · {samsungGame?.time || "시간 확인중"}</p>
              <p className="mt-1 break-words text-lg font-black text-ink">{gameLabel(samsungGame)}</p>
              <p className="mt-2 text-sm font-semibold text-ink/60">
                {samsungGame?.stadium || "구장 확인중"} · {samsungGame?.status || "일정 확인중"}
              </p>
            </div>
            <span className="inline-flex h-10 items-center justify-center rounded-md bg-[#d7e8ff] px-4 text-sm font-black text-[#0b4ea2]">
              삼성 방
            </span>
          </div>
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <Link href="/standings" className="rounded-lg border border-[#ff6b00]/20 bg-[linear-gradient(135deg,#ffffff_0%,#fff4e8_100%)] p-4 shadow-soft hover:border-[#ff6b00]">
            <p className="text-xs font-black uppercase tracking-normal text-[#ff6b00]">Top 3</p>
            <div className="mt-3 grid gap-2">
              {topTeams.length ? (
                topTeams.map((row) => (
                  <div key={`${row.rank}-${row.team}`} className="flex items-center justify-between gap-2 rounded-md bg-white/75 px-2 py-2 text-sm font-black text-ink">
                    <TeamBadge team={row.team} compact />
                    <span>{row.winningRate ?? "-"}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-ink/55">순위 집계 중</p>
              )}
            </div>
          </Link>

          <Link href="/news" className="rounded-lg border border-[#116149]/20 bg-[linear-gradient(135deg,#ffffff_0%,#e8f6ef_100%)] p-4 shadow-soft hover:border-[#116149]">
            <p className="text-xs font-black uppercase tracking-normal text-[#116149]">News</p>
            <strong className="mt-2 block text-3xl font-black text-[#116149]">{Math.min(news.length, 10)}</strong>
            <p className="mt-2 text-sm font-semibold text-ink/60">오늘 야구 뉴스 기본 10개</p>
            <span className="mt-4 inline-flex rounded-md bg-[#116149] px-3 py-2 text-xs font-black text-white">
              원문 링크 보기
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
