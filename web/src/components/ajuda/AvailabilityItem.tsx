import { Avatar } from "../ui/Avatar";
import type { Disponibilidade } from "../../types/ajuda";

const badgeClasses = "inline-flex min-h-[24px] shrink-0 items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted";

export function AvailabilityItem({ funcionario, carga, livre }: Disponibilidade) {
  const percent = Math.min((carga / funcionario.capacidade) * 100, 100);
  const fillClass = carga > funcionario.capacidade ? "bg-red" : carga >= funcionario.capacidade * 0.8 ? "bg-amber" : "bg-teal";
  const label = carga === 0 ? "Vazio" : livre > 0 ? `${livre}h livres` : "Sem folga";

  return (
    <article className="min-w-0 rounded-[8px] border border-line bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)] p-3 shadow-[0_8px_18px_rgba(20,33,31,0.05)] dark:bg-none dark:bg-surface">
      <header className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar nome={funcionario.nome} foto={funcionario.foto} size="small" />
          <div className="min-w-0">
            <strong className="block truncate">{funcionario.nome}</strong>
            <span className="block truncate text-muted">{funcionario.funcao}</span>
          </div>
        </div>
        <span className={badgeClasses}>{label}</span>
      </header>
      <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#e7eeec] dark:bg-surface-strong">
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
}
