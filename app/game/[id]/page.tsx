import Link from "next/link";
import GameDetailLive from "@/components/GameDetailLive";
import { getGameDetail } from "@/services/kbo";

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const detail = await getGameDetail(params.id);

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-3 py-5 sm:px-4 sm:py-8">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between">
        <Link href="/schedule" className="rounded-md border border-line bg-white px-3 py-2 text-center text-sm font-bold text-ink shadow-soft sm:px-4">
          경기 일정으로
        </Link>
        {detail.scoreboard?.gameCenterUrl ? (
          <a
            href={detail.scoreboard.gameCenterUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-[#ff6b00] px-3 py-2 text-center text-sm font-bold text-white sm:px-4"
          >
            KBO 원문
          </a>
        ) : null}
      </div>

      <GameDetailLive initialDetail={detail} />
    </main>
  );
}
