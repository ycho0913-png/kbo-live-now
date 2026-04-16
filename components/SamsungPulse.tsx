import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";
import type { NewsItem, ScheduleGame, TeamHittingRow, TeamPitchingRow } from "@/types/baseball";

interface SamsungPulseProps {
  focusGame?: ScheduleGame;
  hitting?: TeamHittingRow;
  pitching?: TeamPitchingRow;
  news: NewsItem[];
}

export default function SamsungPulse({ focusGame, hitting, pitching, news }: SamsungPulseProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
      <Link
        href={focusGame ? `/game/${encodeURIComponent(focusGame.id)}` : "/schedule"}
        className="rounded-lg border border-[#0b4ea2]/20 bg-white p-4 shadow-soft hover:border-[#0b4ea2] sm:p-5"
      >
        <p className="text-xs font-black uppercase tracking-normal text-[#0b4ea2]">Next Lions Game</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TeamBadge team={focusGame?.awayTeam || "삼성"} />
          <span className="font-black text-[#ff6b00]">vs</span>
          <TeamBadge team={focusGame?.homeTeam || "상대팀"} />
        </div>
        <div className="mt-4 grid gap-2 text-sm font-semibold text-ink/65 sm:grid-cols-3">
          <span className="rounded-md bg-[#f8fafc] p-3">{focusGame?.date || "날짜 확인중"}</span>
          <span className="rounded-md bg-[#f8fafc] p-3">{focusGame?.time || "시간 확인중"}</span>
          <span className="rounded-md bg-[#f8fafc] p-3">{focusGame?.stadium || "구장 확인중"}</span>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/teams" className="rounded-lg border border-line bg-white p-4 shadow-soft hover:border-[#0b4ea2]">
          <p className="text-xs font-black text-ink/45">팀 타율</p>
          <strong className="mt-2 block text-2xl font-black text-[#0b4ea2]">{hitting?.avg ?? "-"}</strong>
          <p className="mt-1 text-xs font-semibold text-ink/55">순위 {hitting?.rank ?? "-"}</p>
        </Link>
        <Link href="/teams?tab=pitchers" className="rounded-lg border border-line bg-white p-4 shadow-soft hover:border-[#0b4ea2]">
          <p className="text-xs font-black text-ink/45">팀 ERA</p>
          <strong className="mt-2 block text-2xl font-black text-[#0b4ea2]">{pitching?.era ?? "-"}</strong>
          <p className="mt-1 text-xs font-semibold text-ink/55">순위 {pitching?.rank ?? "-"}</p>
        </Link>
        <Link href="/news" className="rounded-lg border border-line bg-white p-4 shadow-soft hover:border-[#0b4ea2]">
          <p className="text-xs font-black text-ink/45">삼성 뉴스</p>
          <strong className="mt-2 block text-2xl font-black text-[#0b4ea2]">{Math.min(news.length, 10)}</strong>
          <p className="mt-1 text-xs font-semibold text-ink/55">원문 링크</p>
        </Link>
      </div>
    </section>
  );
}
