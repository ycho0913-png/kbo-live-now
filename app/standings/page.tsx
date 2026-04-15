import ErrorBox from "@/components/ErrorBox";
import SectionTitle from "@/components/SectionTitle";
import StandingsTable from "@/components/StandingsTable";
import { getStandings } from "@/services/kbo";

export default async function StandingsPage() {
  try {
    const standings = await getStandings();

    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle title="팀 순위" description="KBO 공식 팀 순위를 1위부터 10위까지 표시합니다." />
        <StandingsTable rows={standings.slice(0, 10)} />
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle title="팀 순위" />
        <ErrorBox message={error instanceof Error ? error.message : "순위 조회 실패"} />
      </main>
    );
  }
}
