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
          className="flex min-w-0 items-center justify-between gap-2.5 rounded-[8px] border border-line bg-gradient-to-b from-white to-[#fbfcfd] p-3 shadow-[0_8px_18px_rgba(20,33,31,0.05)] dark:from-surface dark:to-surface"
        >
          <span className="inline-flex min-h-[24px] items-center rounded-full bg-surface-strong px-2">{index + 1}</span>
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
