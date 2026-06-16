import { formatWeekLabel, addWeeks } from "../../lib/format";

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function WeekSelector({ value, onChange, required, className }: Props) {
  return (
    <div
      className={`flex min-h-[40px] items-center rounded-[8px] border border-line bg-surface-soft text-text transition-colors focus-within:border-teal ${
        className ?? ""
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(addWeeks(value, -1))}
        className="flex min-h-[40px] items-center px-3 text-xl font-light text-muted hover:text-text"
        aria-label="Semana anterior"
      >
        ‹
      </button>

      <div className="relative flex flex-1 items-center justify-center py-2">
        <span className="pointer-events-none select-none text-center text-[0.85rem] font-semibold leading-tight">
          {formatWeekLabel(value)}
        </span>
        <input
          type="week"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange(addWeeks(value, 1))}
        className="flex min-h-[40px] items-center px-3 text-xl font-light text-muted hover:text-text"
        aria-label="Próxima semana"
      >
        ›
      </button>
    </div>
  );
}
