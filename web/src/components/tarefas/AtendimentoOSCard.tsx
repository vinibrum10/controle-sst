import { useState, useEffect, useCallback } from "react";
import { Panel } from "../ui/Panel";
import {
  type AtendimentoOS,
  listarAtendimentos,
  iniciarAtendimento,
  finalizarAtendimento,
  excluirAtendimento,
  formatarDuracao,
} from "../../lib/atendimentoOS";
import { useToast } from "../../hooks/useToast";
import { toDateInputValue } from "../../lib/format";

export function AtendimentoOSCard() {
  const { showToast } = useToast();
  const [numeroOS, setNumeroOS] = useState("");
  const [ativo, setAtivo] = useState<AtendimentoOS | null>(null);
  const [historico, setHistorico] = useState<AtendimentoOS[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const hoje = toDateInputValue(new Date());

  const carregar = useCallback(async () => {
    try {
      const lista = await listarAtendimentos({ data: hoje });
      setAtivo(lista.find((a) => !a.finalizadoEm) ?? null);
      setHistorico(lista.filter((a) => !!a.finalizadoEm));
    } catch {
      // ignora erros silenciosamente no carregamento inicial
    }
  }, [hoje]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!ativo) { setElapsed(0); return; }
    const update = () =>
      setElapsed(Math.round((Date.now() - new Date(ativo.iniciadoEm).getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [ativo]);

  async function handleIniciar() {
    if (!numeroOS.trim()) { showToast("Informe o número da OS."); return; }
    if (ativo) { showToast("Finalize o atendimento atual antes de iniciar outro."); return; }
    setCarregando(true);
    try {
      const novo = await iniciarAtendimento(numeroOS.trim());
      setAtivo(novo);
      setNumeroOS("");
      showToast(`Atendimento da OS ${novo.numeroOS} iniciado.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao iniciar atendimento.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleFinalizar() {
    if (!ativo) return;
    setCarregando(true);
    try {
      const finalizado = await finalizarAtendimento(ativo.id);
      setAtivo(null);
      setHistorico((prev) => [finalizado, ...prev]);
      showToast(
        `OS ${finalizado.numeroOS} finalizada em ${formatarDuracao(finalizado.duracaoSegundos ?? 0)}.`
      );
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
    <Panel title="Atendimento de OS Interliga" description="Registre e cronomettre o tempo de atendimento de cada OS.">
      <div className="grid gap-3">
        {/* Campo + botão iniciar */}
        {!ativo && (
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

        {/* Em andamento */}
        {ativo && (
          <div className="flex items-center justify-between gap-3 rounded-[8px] border border-teal bg-teal-soft p-3">
            <div className="grid gap-0.5">
              <span className="text-[0.73rem] font-extrabold uppercase tracking-widest text-teal">
                Em atendimento
              </span>
              <span className="text-[1rem] font-extrabold text-text">OS {ativo.numeroOS}</span>
              <span className="font-mono text-[1.6rem] font-extrabold tabular-nums text-text">
                {formatarDuracao(elapsed)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleFinalizar}
              disabled={carregando}
              className="min-h-[40px] rounded-[8px] bg-red px-5 text-[0.88rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Finalizar
            </button>
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
                  <span className="font-mono tabular-nums text-muted">
                    {formatarDuracao(a.duracaoSegundos ?? 0)}
                  </span>
                  <span className="ml-auto text-[0.78rem] text-muted">
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
                    className="text-muted hover:text-red"
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
