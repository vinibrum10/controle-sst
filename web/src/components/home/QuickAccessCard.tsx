import { Link } from "react-router-dom";
import { Icon } from "../ui/IconSprite";

export interface QuickAccessLink {
  to: string;
  label: string;
  description: string;
  icon: string;
}

export function QuickAccessCard({ to, label, description, icon }: QuickAccessLink) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3.5 rounded-xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-px hover:border-teal/40 hover:shadow-card-lg"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-soft text-teal-strong dark:text-teal" aria-hidden="true">
        <Icon id={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block text-[0.98rem] font-extrabold tracking-tight">{label}</strong>
        <p className="mb-0 mt-1 text-[0.85rem] text-muted">{description}</p>
      </div>
      <Icon id="icon-arrow-right" className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal" />
    </Link>
  );
}
