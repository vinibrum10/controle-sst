import { useState, useEffect, useCallback } from "react";
import { Panel } from "../ui/Panel";
import {
  type AtendimentoOS,
  listarAtendimentos,
  iniciarAtendimento,
  finalizarAtendimento,
  excluirAtendimento,
  isPausadaFimDeSemana,
} from "../../lib/atendimentoOS";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { useFuncionarios } from "../../hooks/useFuncionarios";

const MAX_ATIVOS = 3;

interface AtendimentoOSCardProps {
  /** ID do funcionário filtrado; undefined = usuário logado */
  responsavelId?: string;
  /** Semana selecionada no formato AAAA-Www */
  semana: string;
}

export function AtendimentoOSCard({ responsavelId: responsavelIdProp, semana }: AtendimentoOSCardProps) {
  const { showToast } = useToast();
  const { usuario } = useAuth();
  const { funcionarios } = useFuncionarios();
  const [numeroOS, setNumeroOS] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>("");
  const [ativos, setAtivos] = useState<AtendimentoOS[]>([]);
  const [historico, setHistorico] = useState<AtendimentoOS[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [pausada, setPausada] = useState(isPausadaFimDeSemana());

  const meuUserId = usuario?.id;
  const meuFuncId = usuario?.funcionarioId ?? undefined;
  const papel = usuario?.papel;
  const canManageOthers = papel === "ADMIN" || papel === "GESTOR";

  // Só mostra botões de ação quando não há filtro externo ou o filtro é o próprio usuário
  const isProprioUsuario = !responsavelIdProp || responsavelIdProp === meuFuncId;

  // Técnico alvo para ações (próprio ou selecionado por ADMIN/GESTOR)
  const tecnicoAlvoId = tecnicoSelecionado || (isProprioUsuario ? meuFuncId : responsavelIdProp);

  const carregar = useCallback(async () => {
    try {
      // OS ativas: sem filtro de semana, filtra pelo responsável
      const queryAtivas = isProprioUsuario
        ? { criadoPorId: meuUserId, ativos: true as const }
        : { responsavelId: responsavelIdProp, ativos: true as const };

      // Histórico: filtra pela semana selecionada (OS finalizadas)
      const queryHist = isProprioUsuario
        ? { criadoPorId: meuUserId, semana }
        : { responsavelId: responsavelIdProp, semana };

      const [ativas, hist] = await Promise.all([
        listarAtendimentos(queryAtivas),
        listarAtendimentos(queryHist),
      ]);
      setAtivos(ativas);
      setHistorico(hist.filter((a) => !!a.finalizadoEm));
    } catch {
      // ignora erros no carregamento inicial
    }
  }, [semana, meuUserId, meuFuncId, responsavelIdProp, isProprioUsuario]);

  useEffect(() => { carregar(); }, [carregar]);

  // Atualiza estado pausada a cada minuto (cobre a virada das 17h na sexta)
  useEffect(() => {
    const id = setInterval(() => setPausada(isPausadaFimDeSemana()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function handleIniciar() {
    if (!numeroOS.trim()) { showToast("Informe o número da OS."); return; }
    if (!solicitante.trim()) { showToast("Informe o nome do solicitante."); return; }
    if (ativos.length >= MAX_ATIVOS) {
      showToast(`Máximo de ${MAX_ATIVOS} OS em atendimento simultâneo.`);
      return;
    }
    setCarregando(true);
    try {
      const responsavelFuncId = canManageOthers && tecnicoSelecionado ? tecnicoSelecionado : undefined;
      const novo = await iniciarAtendimento(numeroOS.trim(), solicitante.trim(), responsavelFuncId);
      setAtivos((prev) => [...prev, novo]);
      setNumeroOS("");
      setSolicitante("");
      showToast(`OS ${novo.numeroOS} iniciada.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao iniciar atendimento.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleFinalizar(id: string) {
    setCarregando(true);
    try {
      const finalizado = await finalizarAtendimento(id);
      setAtivos((prev) => prev.filter((a) => a.id !== id));
      setHistorico((prev) => [finalizado, ...prev]);
      showToast(`OS ${finalizado.numeroOS} finalizada.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao finalizar atendimento.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluir(id: string) {
    try {
      await excluirAtendimento(id);
      setHistorico((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  // Horas consumidas em OS na semana selecionada
  const horasConsumidas = historico.reduce((sum, a) => sum + (a.duracaoSegundos ?? 0) / 3600, 0);

  // Podeagir: o usuário logado pode criar/finalizar OS nesta visualização
  const podeAgir = isProprioUsuario || canManageOthers;
  const podeIniciar = podeAgir && ativos.length < MAX_ATIVOS && !pausada;

  return (
    <Panel
      title="Atendimento de OS Interliga"
      description="Registre o número da OS que você está atendendo."
    >
      <div className="grid gap-3">
        {/* Resumo: contagem e horas */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-[8px] bg-surface-strong px-3 py-2">
            <span className={`text-[1.1rem] font-extrabold ${ativos.length >= MAX_ATIVOS ? "text-red" : "text-text"}`}>
              {ativos.length}/{MAX_ATIVOS}
            </span>
            <span className="text-[0.8rem] text-muted">OS ativas</span>
          </div>
          {horasConsumidas > 0 && (
            <div className="flex items-center gap-1.5 rounded-[8px] bg-surface-strong px-3 py-2">
              <span className="text-[1.1rem] font-extrabold text-text">
                {horasConsumidas.toFixed(1)}h
              </span>
              <span className="text-[0.8rem] text-muted">em OS nesta semana</span>
            </div>
          )}
          {ativos.length < MAX_ATIVOS && (
            <div className="flex items-center gap-1.5 rounded-[8px] bg-[#edf8f1] px-3 py-2">
              <span className="text-[1.1rem] font-extrabold text-green">
                {MAX_ATIVOS - ativos.length}
              </span>
              <span className="text-[0.8rem] text-[#17643e]">vagas disponíveis</span>
            </div>
          )}
        </div>

        {/* Formulário de abertura (visível para podeIniciar) */}
        {podeIniciar && (
          <div className="grid gap-2">
            {/* Selector de técnico para ADMIN/GESTOR */}
            {canManageOthers && (
              <select
                value={tecnicoSelecionado}
                onChange={(e) => setTecnicoSelecionado(e.target.value)}
                className="min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal"
              >
                <option value="">Técnico: eu mesmo</option>
                {funcionarios.filter((f) => f.ativo).map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Número da OS"
              value={numeroOS}
              onChange={(e) => setNumeroOS(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIniciar()}
              className="min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Solicitante"
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleIniciar()}
                className="min-h-[40px] flex-1 rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal"
              />
              <button
                type="button"
                onClick={handleIniciar}
                disabled={carregando}
                className="min-h-[40px] rounded-[8px] bg-green px-5 text-[0.88rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Iniciar
              </button>
            </div>
          </div>
        )}

        {/* Aviso de pausa no fim de semana */}
        {pausada && (
          <p className="rounded-[8px] bg-amber-50 px-3 py-2 text-[0.82rem] font-semibold text-amber-700">
            OS pausadas — retomam na segunda-feira.
          </p>
        )}

        {/* OS em atendimento ativo */}
        {ativos.length > 0 && (
          <div className="grid gap-1.5">
            {ativos.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between gap-3 rounded-[8px] border px-3 py-2.5 ${
                  pausada
                    ? "border-amber-300 bg-amber-50"
                    : "border-teal bg-teal-soft"
                }`}
              >
                <div className="grid gap-0.5">
                  <span className={`text-[0.7rem] font-extrabold uppercase tracking-widest ${pausada ? "text-amber-600" : "text-teal"}`}>
                    {pausada ? "Pausada" : "Em atendimento"}
                  </span>
                  <span className="font-extrabold text-text">OS {a.numeroOS}</span>
                  {a.solicitante && (
                    <span className="text-[0.8rem] text-muted">Solicitante: {a.solicitante}</span>
                  )}
                  {a.responsavel && (
                    <span className="text-[0.78rem] text-muted">Técnico: {a.responsavel.nome}</span>
                  )}
                </div>
                {podeAgir && !pausada && (
                  <button
                    type="button"
                    onClick={() => handleFinalizar(a.id)}
                    disabled={carregando}
                    className="min-h-[36px] rounded-[8px] bg-red px-4 text-[0.85rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
              OS finalizadas na semana
            </p>
            <div className="grid gap-1.5">
              {historico.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[6px] bg-surface-strong px-3 py-2 text-[0.85rem]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-text">OS {a.numeroOS}</span>
                      {a.solicitante && (
                        <span className="text-[0.8rem] text-muted">· {a.solicitante}</span>
                      )}
                      {a.duracaoSegundos != null && a.duracaoSegundos > 0 && (
                        <span className="text-[0.78rem] font-semibold text-teal">
                          {(a.duracaoSegundos / 3600).toFixed(1)}h
                        </span>
                      )}
                    </div>
                    <span className="text-[0.78rem] text-muted">
                      {new Date(a.iniciadoEm).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      {" "}
                      {new Date(a.iniciadoEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" – "}
                      {a.finalizadoEm
                        ? new Date(a.finalizadoEm).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  {podeAgir && (
                    <button
                      type="button"
                      onClick={() => handleExcluir(a.id)}
                      className="ml-auto text-muted hover:text-red"
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

        {ativos.length === 0 && historico.length === 0 && !podeIniciar && (
          <p className="text-center text-[0.85rem] text-muted">Nenhuma OS nesta semana.</p>
        )}
      </div>
    </Panel>
  );
}
