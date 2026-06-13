import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { useAuth } from "../../hooks/useAuth";
import { usePermissoes } from "../../hooks/usePermissao";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage } from "../../lib/formClasses";
import { atualizarPermissoes } from "../../lib/permissoes";
import {
  CHAVES_PERMISSAO,
  PAPEIS,
  PAPEL_LABELS,
  PAPEL_DESCRICOES,
  PERMISSION_GROUPS,
  type ChavePermissao,
  type MatrizPermissoes,
} from "../../lib/permissions";
import type { Papel } from "../../types";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

function cloneMatriz(matriz: MatrizPermissoes): MatrizPermissoes {
  const copia = {} as MatrizPermissoes;
  for (const papel of PAPEIS) {
    copia[papel] = { ...matriz[papel] };
  }
  return copia;
}

export function PermissoesTab() {
  const { usuario } = useAuth();
  const { matriz, atualizarMatriz } = usePermissoes();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<MatrizPermissoes | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!usuario) return null;

  const isAdmin = usuario.papel === "ADMIN";
  const matrizExibida = draft ?? matriz;
  const alterado = draft !== null;

  const minhasPermissoes = PERMISSION_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.filter((item) => matriz[usuario.papel][item.chave]),
  })).filter((group) => group.items.length > 0);

  function alternarPermissao(papel: Papel, chave: ChavePermissao) {
    if (papel === "ADMIN" && chave === "GERENCIAR_USUARIOS") return;
    setDraft((current) => {
      const base = cloneMatriz(current ?? matriz);
      base[papel] = { ...base[papel], [chave]: !base[papel][chave] };
      return base;
    });
  }

  function descartarAlteracoes() {
    setDraft(null);
  }

  async function salvarAlteracoes() {
    if (!draft) return;

    const itens = PAPEIS.flatMap((papel) =>
      CHAVES_PERMISSAO.filter((chave) => draft[papel][chave] !== matriz[papel][chave]).map((chave) => ({
        papel,
        chave,
        permitido: draft[papel][chave],
      })),
    );

    if (itens.length === 0) {
      setDraft(null);
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await atualizarPermissoes(itens);
      atualizarMatriz(atualizado);
      setDraft(null);
      showToast("Permissões atualizadas.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar as permissões."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Seu perfil de acesso</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex min-h-[32px] items-center rounded-full bg-teal-soft px-3 text-[0.85rem] font-extrabold text-teal-strong">
            {PAPEL_LABELS[usuario.papel]}
          </span>
        </div>
        <p className="m-0 text-[0.85rem] text-muted">{PAPEL_DESCRICOES[usuario.papel]}</p>

        {minhasPermissoes.length > 0 && (
          <div className="grid gap-2.5">
            {minhasPermissoes.map((group) => (
              <div key={group.title} className="grid gap-1.5">
                <span className="text-[0.78rem] font-extrabold uppercase text-muted">{group.title}</span>
                <ul className="m-0 grid gap-1 pl-0">
                  {group.items.map((item) => (
                    <li key={item.chave} className="flex items-start gap-2 text-[0.85rem] text-text">
                      <Icon id="icon-check" className="mt-0.5 text-teal" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Perfis do sistema</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Cada usuário possui um destes perfis, que define o que ele pode visualizar e gerenciar no sistema.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PAPEIS.map((papel) => (
            <div key={papel} className="grid gap-1 rounded-[8px] border border-line bg-surface p-3">
              <span className="text-[0.85rem] font-extrabold text-text">{PAPEL_LABELS[papel]}</span>
              <span className="text-[0.78rem] text-muted">{PAPEL_DESCRICOES[papel]}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Matriz de permissões</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          {isAdmin
            ? "Marque ou desmarque as caixas para definir quais perfis têm acesso a cada funcionalidade do sistema."
            : "Veja quais perfis têm acesso a cada funcionalidade do sistema."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.85rem]">
            <thead>
              <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                <th className="py-2 pr-3">Funcionalidade</th>
                {PAPEIS.map((papel) => (
                  <th key={papel} className="px-2 py-2 text-center">
                    {PAPEL_LABELS[papel]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <Fragment key={group.title}>
                  <tr>
                    <td colSpan={PAPEIS.length + 1} className="pt-3 pb-1 text-[0.76rem] font-extrabold uppercase text-muted">
                      {group.title}
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.chave} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3 text-text">{item.label}</td>
                      {PAPEIS.map((papel) => {
                        const permitido = matrizExibida[papel][item.chave];
                        const bloqueado = papel === "ADMIN" && item.chave === "GERENCIAR_USUARIOS";
                        return (
                          <td key={papel} className="px-2 py-2 text-center">
                            {isAdmin ? (
                              <input
                                type="checkbox"
                                checked={permitido}
                                disabled={bloqueado || salvando}
                                onChange={() => alternarPermissao(papel, item.chave)}
                                title={
                                  bloqueado
                                    ? "O perfil Administrador deve manter acesso a 'Gerenciar usuários'."
                                    : undefined
                                }
                              />
                            ) : (
                              permitido && <Icon id="icon-check" className="inline text-teal" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <>
            <p className="m-0 text-[0.78rem] text-muted">
              O acesso do perfil Administrador a "Gerenciar usuários" não pode ser removido, para evitar perda de acesso ao sistema.
            </p>
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
          </>
        )}
      </article>

      {usuario.papel === "ADMIN" && (
        <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
          <h3 className={sectionTitleClasses}>Gerenciar usuários</h3>
          <p className="m-0 text-[0.85rem] text-muted">
            Altere o perfil de acesso e o status de cada usuário cadastrado no sistema.
          </p>
          <Link to="/usuarios" className="w-fit">
            <Button variant="secondary">
              <Icon id="icon-team" />
              Ir para Usuários
            </Button>
          </Link>
        </article>
      )}
    </div>
  );
}
