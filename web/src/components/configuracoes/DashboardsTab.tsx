import { useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { useApiResource } from "../../hooks/useApiResource";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage } from "../../lib/formClasses";
import { atualizarPreferenciasDashboard, type PreferenciaDashboardItem } from "../../lib/dashboard";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

const moveButtonClasses =
  "grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-line bg-surface-soft text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40";

interface SecaoProps {
  titulo: string;
  descricao: string;
  itens: PreferenciaDashboardItem[];
  desabilitado: boolean;
  onAlternar: (id: string) => void;
  onMover: (id: string, direcao: -1 | 1) => void;
}

function SecaoWidgets({ titulo, descricao, itens, desabilitado, onAlternar, onMover }: SecaoProps) {
  const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem);

  return (
    <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
      <h3 className={sectionTitleClasses}>{titulo}</h3>
      <p className="m-0 text-[0.85rem] text-muted">{descricao}</p>

      <div className="grid gap-2">
        {ordenados.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2.5 rounded-[8px] border border-line bg-surface p-2.5">
            <label className="flex min-w-0 flex-1 items-center gap-2.5 text-[0.85rem] font-extrabold text-text">
              <input
                type="checkbox"
                checked={item.visivel}
                disabled={desabilitado}
                onChange={() => onAlternar(item.id)}
              />
              <span className="truncate">{item.titulo}</span>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                className={moveButtonClasses}
                disabled={desabilitado || index === 0}
                onClick={() => onMover(item.id, -1)}
                aria-label={`Mover "${item.titulo}" para cima`}
              >
                <Icon id="icon-chevron" className="rotate-180" />
              </button>
              <button
                type="button"
                className={moveButtonClasses}
                disabled={desabilitado || index === ordenados.length - 1}
                onClick={() => onMover(item.id, 1)}
                aria-label={`Mover "${item.titulo}" para baixo`}
              >
                <Icon id="icon-chevron" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function DashboardsTab() {
  const { showToast } = useToast();
  const { data: preferencias, carregando, erro } = useApiResource<PreferenciaDashboardItem[]>(
    "/dashboard/preferencias",
    "Não foi possível carregar as preferências de dashboard.",
  );

  const [original, setOriginal] = useState<PreferenciaDashboardItem[] | null>(null);
  const [draft, setDraft] = useState<PreferenciaDashboardItem[] | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (preferencias && original === null) {
    setOriginal(preferencias.map((item) => ({ ...item })));
    setDraft(preferencias.map((item) => ({ ...item })));
  }

  const itens = draft ?? [];
  const metricas = itens.filter((item) => item.tipo === "metric");
  const links = itens.filter((item) => item.tipo === "link");

  const alterado = Boolean(
    original &&
      draft &&
      draft.some((item) => {
        const base = original.find((o) => o.id === item.id);
        return !base || item.visivel !== base.visivel || item.ordem !== base.ordem;
      }),
  );

  function alternar(id: string) {
    setDraft((current) => (current ?? itens).map((item) => (item.id === id ? { ...item, visivel: !item.visivel } : item)));
  }

  function mover(id: string, direcao: -1 | 1) {
    setDraft((current) => {
      const lista = current ?? itens;
      const item = lista.find((i) => i.id === id);
      if (!item) return lista;

      const grupo = lista.filter((i) => i.tipo === item.tipo).sort((a, b) => a.ordem - b.ordem);
      const index = grupo.findIndex((i) => i.id === id);
      const novoIndex = index + direcao;
      if (novoIndex < 0 || novoIndex >= grupo.length) return lista;

      const outro = grupo[novoIndex];
      return lista.map((i) => {
        if (i.id === item.id) return { ...i, ordem: outro.ordem };
        if (i.id === outro.id) return { ...i, ordem: item.ordem };
        return i;
      });
    });
  }

  function descartarAlteracoes() {
    setDraft(original ? original.map((item) => ({ ...item })) : null);
  }

  async function salvarAlteracoes() {
    if (!draft) return;

    setSalvando(true);
    try {
      const atualizado = await atualizarPreferenciasDashboard(draft.map((item) => ({ id: item.id, visivel: item.visivel, ordem: item.ordem })));
      setOriginal(atualizado.map((item) => ({ ...item })));
      setDraft(atualizado.map((item) => ({ ...item })));
      showToast("Preferências de dashboard atualizadas.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar as preferências de dashboard."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="m-0 text-[0.85rem] text-muted">
        Escolha quais cartões e acessos rápidos aparecem na sua página Início e em que ordem. Essas preferências são pessoais e não afetam outros
        usuários.
      </p>

      {erro && <p className="text-red">{erro}</p>}
      {carregando ? (
        <p className="text-muted">Carregando preferências...</p>
      ) : (
        <>
          <SecaoWidgets
            titulo="Resumo da semana"
            descricao="Indicadores exibidos na seção de resumo da página Início."
            itens={metricas}
            desabilitado={salvando}
            onAlternar={alternar}
            onMover={mover}
          />
          <SecaoWidgets
            titulo="Acesso rápido"
            descricao="Atalhos exibidos na seção de acesso rápido da página Início."
            itens={links}
            desabilitado={salvando}
            onAlternar={alternar}
            onMover={mover}
          />
        </>
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
    </div>
  );
}
