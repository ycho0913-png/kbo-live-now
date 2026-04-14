import EmptyState from "@/components/EmptyState";
import type { NewsItem } from "@/types/baseball";

export default function NewsList({ items }: { items: NewsItem[] }) {
  if (!items.length) return <EmptyState message="오늘 확인된 야구 뉴스가 없습니다." />;

  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-white shadow-soft">
      {items.map((item) => (
        <li key={item.id} className="p-4">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block font-bold text-ink hover:text-[#ff6b00]"
          >
            {item.title}
          </a>
          <p className="mt-2 text-sm text-ink/60">{item.source}</p>
        </li>
      ))}
    </ul>
  );
}
