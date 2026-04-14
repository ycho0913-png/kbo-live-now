import * as cheerio from "cheerio";
import type { NewsItem } from "@/types/baseball";
import { normalizeText } from "@/lib/parsers/kbo";

export function parseDaumNews(html: string, source = "다음 뉴스"): NewsItem[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const items: NewsItem[] = [];

  $("a").each((_, anchor) => {
    const href = $(anchor).attr("href") ?? "";
    const title = normalizeText($(anchor).attr("title")) || normalizeText($(anchor).text());

    if (!/^https?:\/\/v\.daum\.net\/v\/\d+/.test(href)) return;
    if (!title || title.length < 10 || title.length > 120) return;
    if (/^\d+$/.test(title) || /채널|홈|자세히 보기/.test(title)) return;
    if (seen.has(href)) return;

    seen.add(href);
    items.push({
      id: Buffer.from(href).toString("base64url"),
      title,
      url: href,
      source
    });
  });

  return items.slice(0, 20);
}
