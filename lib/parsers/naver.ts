import * as cheerio from "cheerio";
import type { NewsItem } from "@/types/baseball";
import { normalizeText } from "@/lib/parsers/kbo";

export function parseNaverBaseballNews(html: string): NewsItem[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const items: NewsItem[] = [];

  $("a").each((_, anchor) => {
    const title =
      normalizeText($(anchor).attr("title")) ||
      normalizeText($(anchor).text());
    const href = $(anchor).attr("href") ?? "";

    if (!title || title.length < 8) return;
    if (title.length > 120) return;
    if (/본문|Naver|언론사 선정|구독하세요|채널 프로모션|도움말|이전페이지/.test(title)) return;
    if (!/sports\.naver\.com|news\.naver\.com|n\.news\.naver\.com|articleView|\/article\//.test(href)) return;

    const url = href.startsWith("http")
      ? href
      : href.startsWith("/kbaseball")
        ? `https://m.sports.naver.com${href}`
        : `https://sports.news.naver.com${href}`;
    if (/channelPromotion|static\/channel/.test(url)) return;
    if (seen.has(url)) return;

    seen.add(url);
    items.push({
      id: Buffer.from(url).toString("base64url"),
      title,
      url,
      source: "네이버 스포츠"
    });
  });

  return items.slice(0, 20);
}
