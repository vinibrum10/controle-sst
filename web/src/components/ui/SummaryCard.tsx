interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="min-h-[112px] rounded-[8px] border border-[rgba(15,130,120,0.12)] bg-gradient-to-b from-white to-surface-soft p-[18px] shadow-[0_12px_30px_rgba(20,33,31,0.08)] dark:from-surface dark:to-surface">
      <span className="mb-3 block h-[3px] w-[38px] rounded-full bg-teal" aria-hidden="true" />
      <span className="block text-[0.82rem] font-bold text-muted">{label}</span>
      <strong className="my-2 block text-[2rem] leading-none">{value}</strong>
      {hint && <small className="text-muted">{hint}</small>}
    </article>
  );
}
