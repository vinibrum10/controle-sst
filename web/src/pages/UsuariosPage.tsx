import { Panel, EmptyState } from "../components/ui/Panel";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useUsuarios } from "../hooks/useUsuarios";
import { PAPEIS, PAPEL_LABELS } from "../lib/permissions";
import { ApiError } from "../lib/api";
import type { Papel } from "../types";

const fieldClasses =
  "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

export function UsuariosPage() {
  const { usuario } = useAuth();
  const { usuarios, carregando, alterarPapel, alterarAtivo } = useUsuarios();
  const { showToast } = useToast();

  async function handlePapelChange(id: string, papel: Papel) {
    try {
      await alterarPapel(id, papel);
      showToast("Papel atualizado.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao atualizar o papel do usuário.");
    }
  }

  async function handleAtivoToggle(id: string, ativo: boolean) {
    const acao = ativo ? "reativar" : "inativar";
    if (!window.confirm(`Tem certeza que deseja ${acao} este usuário?`)) return;

    try {
      await alterarAtivo(id, ativo);
      showToast(ativo ? "Usuário reativado." : "Usuário inativado.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao atualizar o status do usuário.");
    }
  }

  return (
    <Panel
      className="mx-auto max-w-[1000px]"
      title="Usuários"
      description="Gerencie o papel e o acesso de cada usuário do sistema."
    >
      {carregando ? (
        <p className="text-muted">Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <EmptyState message="Nenhum usuário encontrado." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.9rem]">
            <thead>
              <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">E-mail</th>
                <th className="py-2 pr-3">Papel</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((item) => {
                const isSelf = item.id === usuario?.id;
                return (
                  <tr key={item.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 font-extrabold">
                      {item.nome}
                      {isSelf && <span className="ml-1.5 text-[0.76rem] font-normal text-muted">(você)</span>}
                    </td>
                    <td className="py-2 pr-3 text-muted">{item.email}</td>
                    <td className="py-2 pr-3">
                      <select
                        className={fieldClasses}
                        value={item.papel}
                        disabled={isSelf}
                        onChange={(e) => handlePapelChange(item.id, e.target.value as Papel)}
                      >
                        {PAPEIS.map((papel) => (
                          <option key={papel} value={papel}>
                            {PAPEL_LABELS[papel]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        disabled={isSelf}
                        className={`inline-flex min-h-[34px] items-center justify-center gap-[9px] rounded-[8px] border px-3 font-extrabold transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                          item.ativo
                            ? "border-line bg-neutral-button text-text hover:-translate-y-px active:translate-y-0"
                            : "border-green/25 bg-[#e2f4e6] text-green hover:-translate-y-px active:translate-y-0"
                        }`}
                        onClick={() => handleAtivoToggle(item.id, !item.ativo)}
                      >
                        {item.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
