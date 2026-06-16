import { useState, useEffect, useCallback } from "react";
import { Panel } from "../ui/Panel";
import {
  type AtendimentoOS,
  listarAtendimentos,
  iniciarAtendimento,
  finalizarAtendimento,
  excluirAtendimento,
} from "../../lib/atendimentoOS";
import { useToast } from "../../hooks/useToast";
import { toDateInputValue } from "../../lib/format";

const MAX_ATIVOS = 3;

export function AtendimentoOSCard() {
  const { showToast } = useToast();
  const [numeroOS, setNumeroOS] = useState("");
  const [ativos, setAtivos] = useState<AtendimentoOS[]>([]);
  const [historico, setHistorico] = useState<AtendimentoOS[]>([]);
  const [carregando, setCarregando] = useState(false);

  const hoje = toDateInputValue(new Date());

  const carregar = useCallback(async () => {
    try {
      const lista = await listarAtendimentos({ data: hoje });
      setAtivos(lista.filter((a) => !a.finalizadoEm));
      setHistorico(lista.filter((a) => !!a.finalizadoEm));
    } catch {
      // ignora erros no carregamento inicial
    }
  }, [hoje]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleIniciar() {
    if (!numeroOS.trim()) { showToast("Informe o número da OS."); return; }
    if (ativos.length >= MAX_ATIVOS) {
      showToast(`Máximo de ${MAX_ATIVOS} OS em atendimento simultâneo.`);
      return;
    }
    setCarregando(true);
    try {
      const novo = await iniciarAtendimento(numeroOS.trim());
      setAtivos((prev) => [...prev, novo]);
      setNumeroOS("");
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

  return (
    <Panel
      title="Atendimento de OS Interliga"
      description="Registre o número da OS que você está atendendo."
    >
      <div className="grid gap-3">
        {/* Input + Iniciar (visível enquanto houver vagas) */}
        {ativos.length < MAX_ATIVOS && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Número da OS"
              value={numeroOS}
              onChange={(e) => setNumeroOS(e.target.value)}
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
        )}

        {/* OS em atendimento ativo */}
        {ativos.length > 0 && (
          <div className="grid gap-1.5">
            {ativos.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-teal bg-teal-soft px-3 py-2.5"
              >
                <div className="grid gap-0.5">
                  <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-teal">
                    Em atendimento
                  </span>
                  <span className="font-extrabold text-text">OS {a.numeroOS}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFinalizar(a.id)}
                  disabled={carregando}
                  className="min-h-[36px] rounded-[8px] bg-red px-4 text-[0.85rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Finalizar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Histórico do dia */}
        {historico.length > 0 && (
          <div>
            <p className="mb-2 text-[0.73rem] font-extrabold uppercase tracking-widest text-muted">
              Histórico de hoje
            </p>
            <div className="grid gap-1.5">
              {historico.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[6px] bg-surface-strong px-3 py-2 text-[0.85rem]"
                >
                  <span className="font-bold text-text">OS {a.numeroOS}</span>
                  <span className="text-muted">
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
                  <button
                    type="button"
                    onClick={() => handleExcluir(a.id)}
                    className="ml-auto text-muted hover:text-red"
                    aria-label="Excluir"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
