import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import type { GameDetail } from "@/types/baseball";

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const detail: GameDetail = {
    id: decodeURIComponent(params.id),
    title: "경기 상세",
    status: "placeholder",
    innings: [],
    lineups: [],
    playByPlay: []
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionTitle
        title="경기 상세"
        description="실시간 문자중계, 이닝별 점수, 라인업 확장을 위한 자리입니다."
      />
      <div className="rounded-lg border border-line bg-white p-6">
        <p className="text-sm font-bold text-grass">Game ID</p>
        <h1 className="mt-2 break-words text-2xl font-black text-ink">{detail.id}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["이닝별 점수", "라인업", "문자중계"].map((label) => (
            <div key={label} className="rounded-lg border border-line p-4">
              <h2 className="font-black text-ink">{label}</h2>
              <p className="mt-2 text-sm text-ink/60">다음 버전에서 데이터 연결 예정입니다.</p>
            </div>
          ))}
        </div>
        <Link href="/" className="mt-6 inline-flex rounded-md bg-grass px-4 py-2 text-sm font-bold text-white">
          홈으로
        </Link>
      </div>
    </main>
  );
}
