import Link from "next/link";
import HeaderSearch from "@/components/HeaderSearch";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/schedule", label: "경기 일정" },
  { href: "/lions", label: "삼성 방" },
  { href: "/players", label: "선수 기록" },
  { href: "/teams", label: "팀 기록" },
  { href: "/standings", label: "팀 순위" },
  { href: "/news", label: "뉴스" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-black tracking-normal text-ink sm:text-xl">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#ff6b00] text-sm text-white">
            K
          </span>
          <span className="truncate">KBO LIVE NOW</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden max-w-full gap-2 overflow-x-auto text-sm font-semibold text-ink/60 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-[#ff6b00] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}
