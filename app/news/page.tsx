import ErrorBox from "@/components/ErrorBox";
import NewsList from "@/components/NewsList";
import SectionTitle from "@/components/SectionTitle";
import { getBaseballNews } from "@/services/naverNews";

export default async function NewsPage() {
  try {
    const news = await getBaseballNews();

    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle title="야구 뉴스" description="네이버 스포츠 야구 기사 링크를 보조 소스로 표시합니다." />
        <NewsList items={news.slice(0, 10)} />
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle title="야구 뉴스" />
        <ErrorBox message={error instanceof Error ? error.message : "뉴스 조회 실패"} />
      </main>
    );
  }
}
