interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="min-h-[112px] rounded-xl border border-line bg-surface p-6 shadow-card">
      <span className="mb-3 block h-[3px] w-[38px] rounded-full bg-teal" aria-hidden="true" />
      <span className="block text-eyebrow text-muted">{label}</span>
      <strong className="my-2 block text-display tabular-nums">{value}</strong>
      {hint && <small className="text-muted">{hint}</small>}
    </article>
  );
}
