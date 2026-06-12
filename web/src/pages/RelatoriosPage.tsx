import { useState } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { useRelatorio } from "../hooks/useRelatorio";
import { programaStatusLabel } from "../lib/enums";
import { shiftDate, toDateInputValue } from "../lib/format";
import type { ContagemPorStatus } from "../types/relatorio";

const fieldClasses =
  "min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

const PROGRAMA_LABELS: Record<string, string> = {
  treinamentos: "Treinamentos",
  inspecoes: "Inspeções",
  auditorias: "Auditorias",
  achados: "Achados / Desvios",
  planosAcao: "Planos de Ação",
  rotasSeguras: "Rotas Seguras",
};

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function RelatoriosPage() {
  const [inicio, setInicio] = useState(() => shiftDate(-29));
  const [fim, setFim] = useState(() => toDateInputValue(new Date()));
  const { relatorio, carregando, erro } = useRelatorio(inicio, fim);

  function handleExportCsv() {
    if (!relatorio) return;

    const linhas = [
      ["Relatório", `${inicio} a ${fim}`],
      [],
      ["Tarefas no período"],
      ["Total", "Concluídas", "Pendentes", "Em andamento", "Atrasadas", "Horas estimadas", "Entregas no prazo (%)"],
      [
        relatorio.tarefas.total,
        relatorio.tarefas.concluidas,
        relatorio.tarefas.pendentes,
        relatorio.tarefas.emAndamento,
        relatorio.tarefas.atrasadas,
        relatorio.tarefas.horasEstimadas,
        relatorio.tarefas.entregasNoPrazoPercent,
      ],
      [],
      ["Por funcionário"],
      ["Nome", "Função", "Tarefas no período", "Concluídas", "Atrasos", "Pedidos de ajuda"],
      ...relatorio.porFuncionario.map((item) => [
        item.funcionario.nome,
        item.funcionario.funcao,
        item.total,
        item.concluidas,
        item.atrasos,
        item.ajudaPedida,
      ]),
    ];

    const csv = linhas.map((linha) => linha.map(csvCell).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-controle-sst-${inicio}-a-${fim}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-[18px]">
      <Panel
        title="Relatórios"
        description="Resumo de tarefas, equipe e programas de SST para o período selecionado."
        headerExtra={
          <div className="flex flex-wrap items-end justify-end gap-2">
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              De
              <input
                type="date"
                className={`${fieldClasses} w-[160px]`}
                value={inicio}
                max={fim}
                onChange={(e) => setInicio(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              Até
              <input
                type="date"
                className={`${fieldClasses} w-[160px]`}
                value={fim}
                min={inicio}
                onChange={(e) => setFim(e.target.value)}
              />
            </label>
            <Button variant="download" onClick={handleExportCsv} disabled={!relatorio}>
              <Icon id="icon-download" />
              Exportar CSV
            </Button>
          </div>
        }
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando || !relatorio ? (
          <p className="text-muted">Carregando relatório...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <ResumoCard label="Tarefas no período" value={relatorio.tarefas.total} hint={`${relatorio.tarefas.horasEstimadas}h estimadas`} />
            <ResumoCard label="Concluídas" value={relatorio.tarefas.concluidas} hint={`${relatorio.tarefas.entregasNoPrazoPercent}% no prazo`} />
            <ResumoCard label="Em andamento" value={relatorio.tarefas.emAndamento} hint={`${relatorio.tarefas.pendentes} pendentes`} />
            <ResumoCard label="Atrasadas" value={relatorio.tarefas.atrasadas} hint="ainda não concluídas" />
          </div>
        )}
      </Panel>

      {relatorio && (
        <Panel title="Desempenho por funcionário" description="Tarefas do período em que a pessoa é responsável.">
          {relatorio.porFuncionario.length === 0 ? (
            <EmptyState message="Nenhum funcionário cadastrado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Função</th>
                    <th className="py-2 pr-3">Tarefas</th>
                    <th className="py-2 pr-3">Concluídas</th>
                    <th className="py-2 pr-3">Atrasos</th>
                    <th className="py-2 pr-3">Ajuda pedida</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.porFuncionario.map((item) => (
                    <tr key={item.funcionario.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3 font-extrabold">
                        {item.funcionario.nome}
                        {!item.funcionario.ativo && <span className="ml-1.5 text-[0.76rem] font-normal text-muted">(inativo)</span>}
                      </td>
                      <td className="py-2 pr-3 text-muted">{item.funcionario.funcao}</td>
                      <td className="py-2 pr-3">{item.total}</td>
                      <td className="py-2 pr-3">{item.concluidas}</td>
                      <td className="py-2 pr-3">{item.atrasos}</td>
                      <td className="py-2 pr-3">{item.ajudaPedida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {relatorio && (
        <Panel title="Programas de SST" description="Situação atual dos registros por programa.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(relatorio.programasSST).map(([chave, contagem]) => (
              <ProgramaCard key={chave} titulo={PROGRAMA_LABELS[chave] || chave} contagem={contagem} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function ResumoCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <article className="min-h-[112px] rounded-[8px] border border-[rgba(15,130,120,0.12)] bg-gradient-to-b from-white to-surface-soft p-[18px] shadow-[0_12px_30px_rgba(20,33,31,0.08)] dark:from-surface dark:to-surface">
      <span className="mb-3 block h-[3px] w-[38px] rounded-full bg-teal" aria-hidden="true" />
      <span className="block text-[0.82rem] font-bold text-muted">{label}</span>
      <strong className="my-2 block text-[2rem] leading-none">{value}</strong>
      <small className="text-muted">{hint}</small>
    </article>
  );
}

function ProgramaCard({ titulo, contagem }: { titulo: string; contagem: ContagemPorStatus }) {
  const { total, ...porStatus } = contagem;

  return (
    <article className="rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
      <div className="mb-2 flex items-center justify-between gap-2">
        <strong className="text-[0.95rem]">{titulo}</strong>
        <span className="inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
          {total} no total
        </span>
      </div>
      {total === 0 ? (
        <p className="m-0 text-[0.85rem] text-muted">Nenhum registro.</p>
      ) : (
        <ul className="m-0 grid gap-1 p-0 text-[0.85rem]">
          {Object.entries(porStatus).map(([status, valor]) => (
            <li key={status} className="flex items-center justify-between gap-2 text-muted">
              <span>{programaStatusLabel(status)}</span>
              <strong className="text-text">{valor}</strong>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
