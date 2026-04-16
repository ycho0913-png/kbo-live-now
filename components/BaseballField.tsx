import type { GameSituation } from "@/types/baseball";

const bases = [
  { base: 2 as const, label: "2루", className: "left-1/2 top-[18%] -translate-x-1/2" },
  { base: 3 as const, label: "3루", className: "left-[22%] top-[48%] -translate-x-1/2 -translate-y-1/2" },
  { base: 1 as const, label: "1루", className: "right-[22%] top-[48%] translate-x-1/2 -translate-y-1/2" }
];

export default function BaseballField({ situation }: { situation?: GameSituation }) {
  const runners = situation?.runners ?? [];

  function runnerOn(base: 1 | 2 | 3) {
    return runners.find((runner) => runner.base === base);
  }

  return (
    <div className="rounded-lg border border-emerald-800/20 bg-emerald-950 p-3 text-white shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-emerald-200">Live Ground</p>
          <h3 className="mt-1 text-lg font-black">현재 그라운드</h3>
        </div>
        <div className="rounded-md bg-white/10 px-3 py-2 text-right text-xs font-bold text-white/75">
          <p>{situation?.inning || situation?.status || "경기 상황 대기"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px] sm:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[330px] overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,#57b36f_0%,#1f8a4c_58%,#0d5f38_100%)]">
          <div className="absolute inset-[16%] rotate-45 rounded-md border-4 border-white/80 bg-amber-200/70 shadow-inner" />
          <div className="absolute left-1/2 top-[72%] h-8 w-8 -translate-x-1/2 rotate-45 rounded-sm border-2 border-white bg-white" />
          <div className="absolute left-1/2 top-[77%] -translate-x-1/2 rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-black">
            홈
          </div>

          {bases.map((base) => {
            const runner = runnerOn(base.base);
            return (
              <div key={base.base} className={`absolute ${base.className}`}>
                <div
                  className={`relative h-11 w-11 rotate-45 rounded-sm border-2 shadow-lg ${
                    runner ? "border-[#ff6b00] bg-[#ff6b00]" : "border-white bg-white/85"
                  }`}
                >
                  {runner ? (
                    <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
                  ) : null}
                </div>
                <div className="mt-2 w-20 -translate-x-4 text-center text-[11px] font-black">
                  <p>{base.label}</p>
                  <p className="truncate text-emerald-100/85">{runner?.name || "비어있음"}</p>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-3 left-1/2 w-[58%] -translate-x-1/2 rounded-full bg-amber-100/70 px-3 py-2 text-center text-xs font-black text-emerald-950">
            {runners.length ? `${runners.length}명 출루` : "주자 없음"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
          <CountPill label="B" value={situation?.balls} activeColor="bg-lime-400" />
          <CountPill label="S" value={situation?.strikes} activeColor="bg-yellow-300" />
          <CountPill label="O" value={situation?.outs} activeColor="bg-red-400" />
        </div>
      </div>
    </div>
  );
}

function CountPill({
  label,
  value,
  activeColor
}: {
  label: string;
  value: number | null | undefined;
  activeColor: string;
}) {
  const count = value ?? 0;
  const max = label === "B" ? 3 : 2;

  return (
    <div className="rounded-md bg-white/10 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black">{label}</span>
        <span className="text-xs font-bold text-white/65">{value ?? "-"}</span>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: max }).map((_, index) => (
          <span
            key={index}
            className={`h-2 flex-1 rounded-full ${index < count ? activeColor : "bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
