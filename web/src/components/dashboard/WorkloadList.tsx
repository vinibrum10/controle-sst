import type { CargaPorPessoa } from "../../types/dashboard";
import { EmptyState } from "../ui/Panel";

interface WorkloadListProps {
  cargaPorPessoa: CargaPorPessoa[];
}

export function WorkloadList({ cargaPorPessoa }: WorkloadListProps) {
  if (cargaPorPessoa.length === 0) {
    return <EmptyState message="Cadastre pessoas para acompanhar a carga." />;
  }

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {cargaPorPessoa.map(({ funcionario, carga, capacidade, percentual, livre }) => {
        const fillClass = percentual >= 100 ? "bg-red" : percentual >= 80 ? "bg-amber" : "bg-teal";
        const ativo = funcionario.ativo !== false;
        const support =
          carga === 0
            ? "Sem tarefa aberta na semana selecionada."
            : livre > 0
              ? `${livre}h livres para apoio.`
              : "Capacidade semanal comprometida.";

        return (
          <article key={funcionario.id} className="rounded-[8px] border border-line bg-surface-soft p-3 dark:bg-surface">
            <header className="flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <strong className="block truncate">{funcionario.nome}</strong>
                <span className="block truncate text-muted">
                  {funcionario.funcao}
                  {ativo ? "" : " - inativo"}
                </span>
              </div>
              <span
                className={`inline-flex min-h-[24px] shrink-0 items-center whitespace-nowrap rounded-full px-2 ${
                  ativo ? "bg-surface-strong" : "bg-[#eef0f2] text-[#68736f]"
                }`}
              >
                {carga}h de {capacidade}h
              </span>
            </header>
            <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#e7eeec] dark:bg-surface-strong" aria-label={`Carga de ${funcionario.nome}`}>
              <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${Math.min(percentual, 100)}%` }} />
            </div>
            <small className="mt-1 block text-muted">{support}</small>
          </article>
        );
      })}
    </div>
  );
}
