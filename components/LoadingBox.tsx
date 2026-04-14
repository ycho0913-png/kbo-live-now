export default function LoadingBox({ label = "데이터를 불러오는 중입니다." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-6 text-sm font-semibold text-ink/60">
      {label}
    </div>
  );
}
