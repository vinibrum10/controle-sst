import { useMemo, useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { AvailabilityItem } from "../components/ajuda/AvailabilityItem";
import { HistoryItem } from "../components/ajuda/HistoryItem";
import { useTarefas } from "../hooks/useTarefas";
import { useAjuda } from "../hooks/useAjuda";
import { useToast } from "../hooks/useToast";
import { currentWeekValue, formatDate } from "../lib/format";
import { isDone } from "../lib/tarefaHelpers";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";

export function AjudaPage() {
  const [semana, setSemana] = useState(currentWeekValue);
  const { tarefas, pedirAjuda } = useTarefas(semana);
  const { disponibilidade, historico, carregando, recarregar } = useAjuda(semana);
  const { showToast } = useToast();

  const [tarefaId, setTarefaId] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ativas = useMemo(() => tarefas.filter((tarefa) => !isDone(tarefa)), [tarefas]);
  const selectedId = ativas.some((tarefa) => tarefa.id === tarefaId) ? tarefaId : ativas[0]?.id || "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;

    setSubmitting(true);
    try {
      const resposta = await pedirAjuda(selectedId);
      setResultado(resposta.mensagem);
      if (resposta.notificacaoEmail?.enviado) {
        showToast("Ajuda atribuída automaticamente. E-mail de notificação enviado ao apoio.");
      } else if (resposta.notificacaoEmail?.motivo) {
        showToast(`Ajuda atribuída automaticamente. ${resposta.notificacaoEmail.motivo}`);
      } else {
        showToast("Ajuda atribuída automaticamente.");
      }
      await recarregar();
    } catch (err) {
      setResultado(err instanceof Error ? err.message : "Nenhuma pessoa com capacidade livre foi encontrada para essa semana.");
      showToast("Sem apoio disponível na semana selecionada.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex justify-end">
        <label className="grid w-full gap-1.5 text-[0.82rem] font-bold text-muted sm:w-auto">
          Semana
          <input
            type="week"
            value={semana}
            onChange={(event) => setSemana(event.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none focus:border-teal sm:w-[160px]"
          />
        </label>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Panel
          title="Pedir ajuda"
          description="O programa procura primeiro quem está sem tarefa aberta na semana e depois quem tem maior capacidade livre."
        >
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className={labelClasses}>
              Tarefa que precisa de apoio
              <select
                required
                className={fieldClasses}
                value={selectedId}
                onChange={(e) => setTarefaId(e.target.value)}
              >
                {ativas.length === 0 ? (
                  <option value="">Nenhuma tarefa ativa nesta semana</option>
                ) : (
                  ativas.map((tarefa) => (
                    <option key={tarefa.id} value={tarefa.id}>
                      {tarefa.titulo} - {tarefa.responsavel?.nome || "sem responsável"} - {formatDate(tarefa.prazo)}
                    </option>
                  ))
                )}
              </select>
            </label>
            <Button type="submit" variant="accent" full disabled={submitting || ativas.length === 0}>
              <Icon id="icon-help" />
              Pedir ajuda automática
            </Button>
          </form>

          {resultado && (
            <div className="mt-3.5 rounded-[8px] border border-[rgba(46,111,183,0.24)] bg-[#edf5ff] p-3 text-[#1d456f]">
              {resultado}
            </div>
          )}
        </Panel>

        <Panel title="Disponíveis para apoio" description="Ordenado por carga livre na semana selecionada.">
          {carregando ? (
            <p className="text-muted">Carregando disponibilidade...</p>
          ) : disponibilidade.length === 0 ? (
            <EmptyState message="Cadastre pessoas para distribuir ajuda." />
          ) : (
            <div className="grid gap-2.5">
              {disponibilidade.map((item) => (
                <AvailabilityItem key={item.funcionario.id} {...item} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Histórico de ajuda" description="Pedidos realizados, pessoa solicitante e apoio atribuído.">
        {carregando ? (
          <p className="text-muted">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <EmptyState message="Nenhum pedido de ajuda registrado." />
        ) : (
          <div className="grid gap-2.5">
            {historico.map((pedido) => (
              <HistoryItem key={pedido.id} pedido={pedido} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
