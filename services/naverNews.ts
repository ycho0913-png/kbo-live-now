import { getOrSetCache } from "@/lib/cache";
import { fetchHtml } from "@/lib/fetcher";
import { parseDaumNews } from "@/lib/parsers/daum";
import { parseNaverBaseballNews } from "@/lib/parsers/naver";

function naverMobileNewsSearchUrl(query: string) {
  const params = new URLSearchParams({
    where: "m_news",
    query,
    sort: "1"
  });

  return `https://m.search.naver.com/search.naver?${params.toString()}`;
}

async function getNewsByQuery(cacheKey: string, query: string) {
  return getOrSetCache(cacheKey, 120, async () => {
    const html = await fetchHtml(naverMobileNewsSearchUrl(query), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      }
    });
    return parseNaverBaseballNews(html);
  });
}

async function getDaumNewsByQuery(cacheKey: string, query: string) {
  return getOrSetCache(cacheKey, 120, async () => {
    const params = new URLSearchParams({
      w: "news",
      q: query
    });
    const html = await fetchHtml(`https://m.search.daum.net/search?${params.toString()}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      }
    });
    return parseDaumNews(html, "다음 뉴스");
  });
}

function mergeNews(...groups: Awaited<ReturnType<typeof getNewsByQuery>>[]) {
  const seen = new Set<string>();

  return groups
    .flat()
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

export async function getBaseballNews() {
  return getNewsByQuery("news:baseball:v2", "프로야구 KBO");
}

export async function getSamsungLionsNews() {
  const [daum, naver] = await Promise.all([
    getDaumNewsByQuery("news:daum:samsung-lions:v2", "삼성 라이온즈"),
    getNewsByQuery("news:samsung-lions:v3", "삼성 라이온즈 야구")
  ]);

  return mergeNews(daum, naver).filter((item) => /삼성|라이온즈|라팍/.test(item.title));
}
