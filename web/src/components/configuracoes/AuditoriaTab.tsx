import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import { EmptyState } from "../ui/Panel";
import { formatDateTime } from "../../lib/format";
import { ACAO_LABELS, ENTIDADE_LABELS, formatarDetalhes, type LogAuditoriaItem } from "../../lib/auditoria";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

export function AuditoriaTab() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.papel === "ADMIN";

  const {
    data: logs,
    carregando,
    erro,
  } = useApiResource<LogAuditoriaItem[]>(isAdmin ? "/auditoria" : null, "Não foi possível carregar o log de auditoria.");

  if (!usuario) return null;

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Log de auditoria</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Registro das principais ações administrativas: cadastros gerais, configurações do sistema, permissões e
          dados/backup.
        </p>

        {!isAdmin ? (
          <EmptyState message="Apenas administradores podem visualizar o log de auditoria." />
        ) : erro ? (
          <p className="text-red">{erro}</p>
        ) : carregando ? (
          <p className="text-muted">Carregando log de auditoria...</p>
        ) : !logs || logs.length === 0 ? (
          <EmptyState message="Nenhuma ação registrada até agora." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[0.85rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Usuário</th>
                  <th className="py-2 pr-3">Ação</th>
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 text-muted">{formatDateTime(item.criadoEm)}</td>
                    <td className="py-2 pr-3 text-text">{item.usuarioNome || item.usuarioEmail || "-"}</td>
                    <td className="py-2 pr-3 text-text">{ACAO_LABELS[item.acao] ?? item.acao}</td>
                    <td className="py-2 pr-3 text-text">{ENTIDADE_LABELS[item.entidade] ?? item.entidade}</td>
                    <td className="py-2 pr-3 text-text">{formatarDetalhes(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
}
