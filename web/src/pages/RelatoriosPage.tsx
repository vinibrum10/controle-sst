import { useState } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { SummaryCard } from "../components/ui/SummaryCard";
import { useRelatorio } from "../hooks/useRelatorio";
import { shiftDate, toDateInputValue } from "../lib/format";

const fieldClasses =
  "min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

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
    link.download = `relatorio-sgepi-${inicio}-a-${fim}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <Panel
        title="Relatórios"
        description="Resumo de tarefas, equipe e programas de SST para o período selecionado."
        headerExtra={
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end sm:justify-end">
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              De
              <input
                type="date"
                className={`${fieldClasses} w-full sm:w-[160px]`}
                value={inicio}
                max={fim}
                onChange={(e) => setInicio(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              Até
              <input
                type="date"
                className={`${fieldClasses} w-full sm:w-[160px]`}
                value={fim}
                min={inicio}
                onChange={(e) => setFim(e.target.value)}
              />
            </label>
            <Button variant="download" onClick={handleExportCsv} disabled={!relatorio} full className="sm:w-auto">
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
            <SummaryCard label="Tarefas no período" value={relatorio.tarefas.total} hint={`${relatorio.tarefas.horasEstimadas}h estimadas`} />
            <SummaryCard label="Concluídas" value={relatorio.tarefas.concluidas} hint={`${relatorio.tarefas.entregasNoPrazoPercent}% no prazo`} />
            <SummaryCard label="Em andamento" value={relatorio.tarefas.emAndamento} hint={`${relatorio.tarefas.pendentes} pendentes`} />
            <SummaryCard label="Atrasadas" value={relatorio.tarefas.atrasadas} hint="ainda não concluídas" />
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

    </div>
  );
}
