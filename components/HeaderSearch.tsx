"use client";

import { FormEvent, useRef, useState } from "react";
import TeamBadge from "@/components/TeamBadge";
import type { ApiResponse, SearchResponse } from "@/types/baseball";

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openPanel() {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        cache: "no-store"
      });
      const json = (await response.json()) as ApiResponse<SearchResponse>;

      if (!json.ok) {
        setError(json.message);
        return;
      }

      setResult(json.data);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "검색 실패");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPanel}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-lg font-black text-ink shadow-soft hover:border-[#ff6b00] hover:text-[#ff6b00]"
        aria-label="팀 또는 선수 검색"
      >
        <span aria-hidden="true">⌕</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-x-3 top-20 z-40 rounded-lg border border-line bg-white p-4 shadow-soft sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[430px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[#ff6b00]">KBO 검색</p>
              <h2 className="mt-1 text-lg font-black text-ink">팀 또는 선수 찾기</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md bg-paper px-3 py-2 text-sm font-black text-ink/60 hover:bg-ink hover:text-white"
            >
              닫기
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 삼성, 구자욱, 양창섭"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[#ff6b00]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#ff6b00] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "검색중" : "검색"}
            </button>
          </form>

          <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
            {error ? (
              <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
            ) : null}

            {!result && !error ? (
              <p className="rounded-md bg-paper p-3 text-sm font-bold text-ink/60">
                팀명이나 선수 이름을 입력하면 순위, 팀 기록, 개인 성적을 바로 보여드립니다.
              </p>
            ) : null}

            {result ? <SearchResults result={result} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchResults({ result }: { result: SearchResponse }) {
  const isEmpty = !result.teams.length && !result.players.length;

  if (isEmpty) {
    return (
      <p className="rounded-md bg-paper p-3 text-sm font-bold text-ink/60">
        검색 결과가 없습니다. 팀명은 삼성, KIA, LG처럼 입력해보세요.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {result.teams.length ? (
        <section>
          <h3 className="text-sm font-black text-ink">팀 결과</h3>
          <div className="mt-2 grid gap-2">
            {result.teams.map((team) => (
              <article key={team.team} className="rounded-lg border border-line bg-paper p-3">
                <div className="flex items-center justify-between gap-2">
                  <TeamBadge team={team.team} />
                  <span className="text-xs font-black text-ink/50">
                    {team.standing?.rank ? `${team.standing.rank}위` : "순위 확인중"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink/65">{team.summary}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-ink/60">
                  <Metric label="타율" value={team.hitting?.avg} />
                  <Metric label="홈런" value={team.hitting?.homeRuns} />
                  <Metric label="ERA" value={team.pitching?.era} />
                </div>
                {team.games[0] ? (
                  <a
                    href={`/game/${encodeURIComponent(team.games[0].id)}`}
                    className="mt-3 block rounded-md bg-white px-3 py-2 text-xs font-black text-[#ff6b00]"
                  >
                    오늘 경기 보기 · {team.games[0].awayTeam} vs {team.games[0].homeTeam}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {result.players.length ? (
        <section>
          <h3 className="text-sm font-black text-ink">선수 결과</h3>
          <div className="mt-2 grid gap-2">
            {result.players.map((player) => (
              <article key={`${player.team}-${player.name}-${player.role}`} className="rounded-lg border border-line bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-black text-ink">{player.name}</p>
                    <p className="mt-1 text-xs font-bold text-ink/50">{player.role} · 개인 성적</p>
                  </div>
                  <TeamBadge team={player.team} compact />
                </div>
                <p className="mt-2 text-sm font-bold text-ink/65">{player.summary}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-ink/60">
                  {player.hitter ? (
                    <>
                      <Metric label="타율" value={player.hitter.avg} />
                      <Metric label="홈런" value={player.hitter.homeRuns} />
                      <Metric label="OPS" value={player.hitter.ops} />
                    </>
                  ) : (
                    <>
                      <Metric label="ERA" value={player.pitcher?.era} />
                      <Metric label="승" value={player.pitcher?.wins} />
                      <Metric label="삼진" value={player.pitcher?.strikeouts} />
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-md bg-white p-2">
      <p className="text-[10px] text-ink/45">{label}</p>
      <p className="mt-1 font-black text-ink">{value ?? "-"}</p>
    </div>
  );
}
