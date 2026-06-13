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
    <section className={`min-w-0 rounded-xl border border-line bg-surface p-6 shadow-card ${className}`}>
      {(title || headerExtra) && (
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3.5">
          {title && (
            <div>
              <h2 className="text-[1.05rem] font-extrabold tracking-tight">{title}</h2>
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
    <div className="rounded-xl border border-dashed border-line bg-[#fbfdfc] p-6 text-center text-[0.9rem] text-muted dark:bg-surface-soft">
      {message}
    </div>
  );
}
