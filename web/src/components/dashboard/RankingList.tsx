import type { RankingEntry } from "../../types/dashboard";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/Panel";

interface RankingListProps {
  ranking: RankingEntry[];
  suffix: string;
}

export function RankingList({ ranking, suffix }: RankingListProps) {
  if (ranking.length === 0) {
    return <EmptyState message="Sem dados suficientes." />;
  }

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {ranking.map(({ funcionario, valor }, index) => (
        <article
          key={funcionario.id}
          className="flex min-w-0 items-center justify-between gap-2.5 rounded-[8px] border border-line bg-surface-soft p-3 dark:bg-surface"
        >
          <span
            className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[0.8rem] font-extrabold ${
              index === 0 ? "bg-amber/15 text-amber" : "bg-surface-strong text-muted"
            }`}
          >
            {index + 1}
          </span>
          <Avatar nome={funcionario.nome} foto={funcionario.foto} size="small" />
          <div className="min-w-0 flex-1">
            <strong className="block truncate">{funcionario.nome}</strong>
            <span className="block truncate text-muted">{funcionario.funcao}</span>
          </div>
          <strong className="shrink-0 whitespace-nowrap">
            {valor} {suffix}
          </strong>
        </article>
      ))}
    </div>
  );
}
