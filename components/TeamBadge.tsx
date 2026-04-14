import { getTeamBrand } from "@/lib/teamBranding";

interface TeamBadgeProps {
  team: string;
  compact?: boolean;
}

export default function TeamBadge({ team, compact = false }: TeamBadgeProps) {
  const brand = getTeamBrand(team);

  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-black sm:gap-2 sm:text-sm"
      style={{
        backgroundColor: brand.primary,
        color: brand.text
      }}
      title={`${brand.name} · ${brand.mascot}`}
    >
      <span aria-hidden="true">{brand.symbol}</span>
      <span className="truncate">{compact ? brand.shortName : team || brand.shortName}</span>
    </span>
  );
}
