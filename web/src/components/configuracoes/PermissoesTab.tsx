import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { useAuth } from "../../hooks/useAuth";
import { PAPEIS, PAPEL_LABELS, PAPEL_DESCRICOES, PERMISSION_GROUPS } from "../../lib/permissions";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

export function PermissoesTab() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  const minhasPermissoes = PERMISSION_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.filter((item) => item.roles.includes(usuario.papel)),
  })).filter((group) => group.items.length > 0);

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
                    <li key={item.label} className="flex items-start gap-2 text-[0.85rem] text-text">
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
        <p className="m-0 text-[0.85rem] text-muted">Veja quais perfis têm acesso a cada funcionalidade do sistema.</p>
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
                    <tr key={item.label} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3 text-text">{item.label}</td>
                      {PAPEIS.map((papel) => (
                        <td key={papel} className="px-2 py-2 text-center">
                          {item.roles.includes(papel) && <Icon id="icon-check" className="inline text-teal" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
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
