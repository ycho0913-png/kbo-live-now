export default function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-sm font-semibold text-red-200">
      {message}
    </div>
  );
}
