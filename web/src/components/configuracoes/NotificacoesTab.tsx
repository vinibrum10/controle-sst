import { useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { useApiResource } from "../../hooks/useApiResource";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage } from "../../lib/formClasses";
import { atualizarPreferenciasNotificacao, type PreferenciaNotificacaoItem, type StatusEmail } from "../../lib/notificacoes";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

export function NotificacoesTab() {
  const { showToast } = useToast();
  const { data: preferencias, carregando, erro } = useApiResource<PreferenciaNotificacaoItem[]>(
    "/notificacoes/preferencias",
    "Não foi possível carregar as preferências de notificação.",
  );
  const { data: statusEmail } = useApiResource<StatusEmail>("/notificacoes/email-status");

  const [original, setOriginal] = useState<PreferenciaNotificacaoItem[] | null>(null);
  const [draft, setDraft] = useState<PreferenciaNotificacaoItem[] | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (preferencias && original === null) {
    setOriginal(preferencias.map((item) => ({ ...item })));
    setDraft(preferencias.map((item) => ({ ...item })));
  }

  const itens = draft ?? [];
  const alterado = Boolean(
    original && draft && draft.some((item, index) => {
      const base = original[index];
      return item.inApp !== base.inApp || item.email !== base.email;
    }),
  );

  function alternar(tipo: PreferenciaNotificacaoItem["tipo"], campo: "inApp" | "email") {
    setDraft((current) =>
      (current ?? itens).map((item) => (item.tipo === tipo ? { ...item, [campo]: !item[campo] } : item)),
    );
  }

  function descartarAlteracoes() {
    setDraft(original ? original.map((item) => ({ ...item })) : null);
  }

  async function salvarAlteracoes() {
    if (!draft) return;

    setSalvando(true);
    try {
      const atualizado = await atualizarPreferenciasNotificacao(
        draft.map((item) => ({ tipo: item.tipo, inApp: item.inApp, email: item.email })),
      );
      setOriginal(atualizado.map((item) => ({ ...item })));
      setDraft(atualizado.map((item) => ({ ...item })));
      showToast("Preferências de notificação atualizadas.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar as preferências de notificação."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Preferências de notificação</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Escolha quais avisos você deseja receber dentro do sistema (sino de notificações) e por e-mail.
        </p>

        {statusEmail?.habilitado === false && (
          <p className="m-0 flex items-start gap-2 rounded-[8px] border border-line bg-surface p-2.5 text-[0.78rem] text-muted">
            <Icon id="icon-alert" className="mt-0.5 shrink-0 text-amber" />
            O envio de e-mails ainda não está configurado neste sistema. As preferências de e-mail abaixo ficam
            salvas, mas nenhum e-mail será enviado até que um administrador configure o servidor de e-mail.
          </p>
        )}

        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando preferências...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[0.85rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Tipo de notificação</th>
                  <th className="px-2 py-2 text-center">No sistema</th>
                  <th className="px-2 py-2 text-center">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.tipo} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 text-text">{item.titulo}</td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.inApp}
                        disabled={salvando}
                        onChange={() => alternar(item.tipo, "inApp")}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {item.emailDisponivel ? (
                        <input
                          type="checkbox"
                          checked={item.email}
                          disabled={salvando}
                          onChange={() => alternar(item.tipo, "email")}
                        />
                      ) : (
                        <span className="text-muted" title="Não há envio de e-mail para este tipo de notificação.">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {alterado && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={salvarAlteracoes} disabled={salvando}>
              <Icon id="icon-check" />
              Salvar alterações
            </Button>
            <Button type="button" variant="secondary" onClick={descartarAlteracoes} disabled={salvando}>
              <Icon id="icon-close" />
              Descartar
            </Button>
          </div>
        )}
      </article>
    </div>
  );
}
