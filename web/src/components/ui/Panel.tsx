import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, description, headerExtra, children, className = "" }: PanelProps) {
  return (
    <section className={`min-w-0 rounded-[8px] border border-line bg-surface p-5 shadow-[0_12px_30px_rgba(20,33,31,0.08)] ${className}`}>
      {(title || headerExtra) && (
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3.5">
          {title && (
            <div>
              <h2 className="text-[1.05rem] font-extrabold">{title}</h2>
              {description && <p className="mb-0 text-[0.88rem] text-muted">{description}</p>}
            </div>
          )}
          {headerExtra}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-line bg-[#fbfdfc] p-[22px] text-muted dark:bg-surface-soft">
      {message}
    </div>
  );
}
