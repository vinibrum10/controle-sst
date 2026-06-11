import { formatDate } from "../../lib/format";
import type { HistoricoAjudaItem } from "../../types/ajuda";

export function HistoryItem({ pedido }: { pedido: HistoricoAjudaItem }) {
  return (
    <article className="min-w-0 rounded-[8px] border border-line bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)] p-3 shadow-[0_8px_18px_rgba(20,33,31,0.05)] dark:bg-none dark:bg-surface">
      <header className="flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          <strong className="block truncate">{pedido.tarefa?.titulo || "Tarefa"}</strong>
          <span className="block truncate text-muted">
            {formatDate(pedido.criadoEm)} - {pedido.solicitante?.nome || "Solicitante"}
          </span>
        </div>
        <span className="inline-flex min-h-[24px] shrink-0 items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
          Apoio: {pedido.atendente?.nome || "não definido"}
        </span>
      </header>
    </article>
  );
}
