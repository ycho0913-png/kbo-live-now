import Link from "next/link";

interface SectionTitleProps {
  title: string;
  description?: string;
  href?: string;
}

export default function SectionTitle({ title, description, href }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink/60">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm font-bold text-[#ff6b00] hover:underline">
          더보기
        </Link>
      ) : null}
    </div>
  );
}
