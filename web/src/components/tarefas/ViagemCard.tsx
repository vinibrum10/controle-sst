import { useState, useEffect, useCallback } from "react";
import { Panel } from "../ui/Panel";
import {
  type Viagem,
  listarViagens,
  iniciarViagem,
  finalizarViagem,
  excluirViagem,
} from "../../lib/viagens";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { useFuncionarios } from "../../hooks/useFuncionarios";

interface ViagemCardProps {
  /** ID do funcionário filtrado; undefined = usuário logado */
  responsavelId?: string;
  /** Semana selecionada no formato AAAA-Www */
  semana: string;
  /** Carga de tarefas da pessoa na semana (horasEstimadas) */
  cargaTarefas?: number;
  /** Capacidade semanal da pessoa em horas */
  capacidade?: number;
}

export function ViagemCard({ responsavelId: responsavelIdProp, semana, cargaTarefas, capacidade }: ViagemCardProps) {
  const { showToast } = useToast();
  const { usuario } = useAuth();
  const { funcionarios } = useFuncionarios();

  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>("");
  const [ativas, setAtivas] = useState<Viagem[]>([]);
  const [historico, setHistorico] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(false);

  const meuUserId = usuario?.id;
  const meuFuncId = usuario?.funcionarioId ?? undefined;
  const papel = usuario?.papel;
  const canManageOthers = papel === "ADMIN" || papel === "GESTOR";
  const isProprioUsuario = !responsavelIdProp || responsavelIdProp === meuFuncId;
  const podeAgir = isProprioUsuario || canManageOthers;

  const carregar = useCallback(async () => {
    try {
      const queryAtivas = isProprioUsuario
        ? { criadoPorId: meuUserId, ativos: true as const }
        : { tecnicoId: responsavelIdProp, ativos: true as const };

      const queryHist = isProprioUsuario
        ? { criadoPorId: meuUserId, semana }
        : { tecnicoId: responsavelIdProp, semana };

      const [ativasData, histData] = await Promise.all([
        listarViagens(queryAtivas),
        listarViagens(queryHist),
      ]);
      setAtivas(ativasData);
      setHistorico(histData.filter((v) => !!v.finalizadoEm));
    } catch {
      // ignora erros no carregamento inicial
    }
  }, [semana, meuUserId, meuFuncId, responsavelIdProp, isProprioUsuario]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleIniciar() {
    if (!origem.trim()) { showToast("Informe a origem."); return; }
    if (!destino.trim()) { showToast("Informe o destino."); return; }
    if (!motivo.trim()) { showToast("Informe o motivo da viagem."); return; }
    setCarregando(true);
    try {
      const tecnicoFuncId = canManageOthers && tecnicoSelecionado ? tecnicoSelecionado : undefined;
      const nova = await iniciarViagem({ origem: origem.trim(), destino: destino.trim(), motivo: motivo.trim(), tecnicoFuncId });
      setAtivas((prev) => [...prev, nova]);
      setOrigem("");
      setDestino("");
      setMotivo("");
      showToast(`Viagem ${nova.origem} → ${nova.destino} iniciada.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao iniciar viagem.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleFinalizar(id: string) {
    setCarregando(true);
    try {
      const finalizada = await finalizarViagem(id);
      setAtivas((prev) => prev.filter((v) => v.id !== id));
      setHistorico((prev) => [finalizada, ...prev]);
      showToast(`Viagem ${finalizada.origem} → ${finalizada.destino} finalizada.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao finalizar viagem.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluir(id: string) {
    try {
      await excluirViagem(id);
      setHistorico((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  const horasConsumidas = historico.reduce((sum, v) => sum + (v.duracaoSegundos ?? 0) / 3600, 0);
  const horasLivres = (capacidade != null && cargaTarefas != null)
    ? Math.max(capacidade - cargaTarefas - horasConsumidas, 0)
    : null;

  const inputClass = "min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal";

  return (
    <Panel
      title="Viagem"
      description="Registre deslocamentos relacionados às atividades."
    >
      <div className="grid gap-3">
        {/* Resumo */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-[8px] bg-surface-strong px-3 py-2">
            <span className="text-[1.1rem] font-extrabold text-text">{ativas.length}</span>
            <span className="text-[0.8rem] text-muted">em deslocamento</span>
          </div>
          {horasConsumidas > 0 && (
            <div className="flex items-center gap-1.5 rounded-[8px] bg-surface-strong px-3 py-2">
              <span className="text-[1.1rem] font-extrabold text-text">{horasConsumidas.toFixed(1)}h</span>
              <span className="text-[0.8rem] text-muted">em viagens nesta semana</span>
            </div>
          )}
          {horasLivres !== null && (
            <div className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 ${horasLivres <= 0 ? "bg-[#ffe3e3]" : "bg-[#edf8f1]"}`}>
              <span className={`text-[1.1rem] font-extrabold ${horasLivres <= 0 ? "text-red" : "text-green"}`}>
                {horasLivres.toFixed(0)}h
              </span>
              <span className={`text-[0.8rem] ${horasLivres <= 0 ? "text-red" : "text-[#17643e]"}`}>
                disponíveis na semana
              </span>
            </div>
          )}
        </div>

        {/* Formulário */}
        {podeAgir && (
          <div className="grid gap-2">
            {canManageOthers && (
              <select
                value={tecnicoSelecionado}
                onChange={(e) => setTecnicoSelecionado(e.target.value)}
                className={inputClass}
              >
                <option value="">Técnico: eu mesmo</option>
                {funcionarios.filter((f) => f.ativo).map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            )}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Origem"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Motivo da viagem"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleIniciar()}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={handleIniciar}
                disabled={carregando}
                className="min-h-[40px] rounded-[8px] bg-teal px-5 text-[0.88rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Iniciar
              </button>
            </div>
          </div>
        )}

        {/* Viagens em deslocamento */}
        {ativas.length > 0 && (
          <div className="grid gap-1.5">
            {ativas.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-teal bg-teal-soft px-3 py-2.5"
              >
                <div className="grid min-w-0 gap-0.5">
                  <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-teal">
                    Em deslocamento
                  </span>
                  <span className="truncate font-extrabold text-text">
                    {v.origem} → {v.destino}
                  </span>
                  <span className="text-[0.8rem] text-muted">{v.motivo}</span>
                  {v.tecnico && (
                    <span className="text-[0.78rem] text-muted">Técnico: {v.tecnico.nome}</span>
                  )}
                </div>
                {podeAgir && (
                  <button
                    type="button"
                    onClick={() => handleFinalizar(v.id)}
                    disabled={carregando}
                    className="shrink-0 min-h-[36px] rounded-[8px] bg-red px-4 text-[0.85rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Histórico da semana */}
        {historico.length > 0 && (
          <div>
            <p className="mb-2 text-[0.73rem] font-extrabold uppercase tracking-widest text-muted">
              Viagens finalizadas na semana
            </p>
            <div className="grid gap-1.5">
              {historico.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-[6px] bg-surface-strong px-3 py-2 text-[0.85rem]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold text-text">{v.origem} → {v.destino}</span>
                      {v.duracaoSegundos != null && v.duracaoSegundos > 0 && (
                        <span className="text-[0.78rem] font-semibold text-teal">
                          {(v.duracaoSegundos / 3600).toFixed(1)}h
                        </span>
                      )}
                    </div>
                    <div className="text-[0.78rem] text-muted">{v.motivo}</div>
                    <div className="text-[0.78rem] text-muted">
                      {new Date(v.iniciadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      {" "}
                      {new Date(v.iniciadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {v.finalizadoEm
                        ? new Date(v.finalizadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </div>
                  </div>
                  {podeAgir && (
                    <button
                      type="button"
                      onClick={() => handleExcluir(v.id)}
                      className="ml-auto shrink-0 text-muted hover:text-red"
                      aria-label="Excluir"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {ativas.length === 0 && historico.length === 0 && !podeAgir && (
          <p className="text-center text-[0.85rem] text-muted">Nenhuma viagem nesta semana.</p>
        )}
      </div>
    </Panel>
  );
}
