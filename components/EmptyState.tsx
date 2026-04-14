export default function EmptyState({ message = "표시할 데이터가 없습니다." }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-sm font-semibold text-ink/60">
      {message}
    </div>
  );
}
