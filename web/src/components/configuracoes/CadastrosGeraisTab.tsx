import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { EmptyState } from "../ui/Panel";
import { useApiResource } from "../../hooks/useApiResource";
import { usePermissao } from "../../hooks/usePermissao";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage, fieldClasses, labelClasses, tabButtonClasses } from "../../lib/formClasses";
import { resizePhoto } from "../../lib/image";
import {
  CATEGORIAS_CADASTRO,
  atualizarCadastroGeral,
  atualizarConfiguracaoSistema,
  criarCadastroGeral,
  excluirCadastroGeral,
  type CadastroGeralItem,
  type CategoriaCadastro,
  type ConfiguracaoSistemaItem,
} from "../../lib/cadastros";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

interface ConfigDraft {
  nomeSistema: string;
  nomeEmpresa: string;
  logoUrl: string;
}

export function CadastrosGeraisTab() {
  const podeGerenciar = usePermissao("GERENCIAR_CADASTROS");
  const { showToast } = useToast();

  const {
    data: configuracao,
    carregando: carregandoConfig,
    erro: erroConfig,
    recarregar: recarregarConfig,
  } = useApiResource<ConfiguracaoSistemaItem>("/configuracoes/sistema", "Não foi possível carregar os dados do programa.");

  const {
    data: itens,
    carregando: carregandoItens,
    erro: erroItens,
    recarregar: recarregarItens,
  } = useApiResource<CadastroGeralItem[]>("/cadastros", "Não foi possível carregar as listas do sistema.");

  const [draftConfig, setDraftConfig] = useState<ConfigDraft | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  if (configuracao && draftConfig === null) {
    setDraftConfig({
      nomeSistema: configuracao.nomeSistema,
      nomeEmpresa: configuracao.nomeEmpresa ?? "",
      logoUrl: configuracao.logoUrl ?? "",
    });
  }

  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaCadastro>("UNIDADE");
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [criando, setCriando] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [salvandoItem, setSalvandoItem] = useState(false);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizePhoto(file, 160);
      setDraftConfig((current) => (current ? { ...current, logoUrl: resized } : current));
    } catch {
      showToast("Não consegui carregar essa imagem. Tente outro arquivo.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSalvarConfig(event: FormEvent) {
    event.preventDefault();
    if (!draftConfig) return;

    setSalvandoConfig(true);
    try {
      await atualizarConfiguracaoSistema({
        nomeSistema: draftConfig.nomeSistema.trim(),
        nomeEmpresa: draftConfig.nomeEmpresa.trim() || null,
        logoUrl: draftConfig.logoUrl || null,
      });
      await recarregarConfig();
      showToast("Dados do programa atualizados.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar os dados do programa."));
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function handleCriarItem(event: FormEvent) {
    event.preventDefault();
    if (!novoNome.trim()) return;

    setCriando(true);
    try {
      await criarCadastroGeral({ categoria: categoriaAtiva, nome: novoNome.trim(), descricao: novaDescricao.trim() || null });
      setNovoNome("");
      setNovaDescricao("");
      recarregarItens();
      showToast("Item adicionado.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao adicionar item."));
    } finally {
      setCriando(false);
    }
  }

  async function handleToggleAtivo(item: CadastroGeralItem) {
    try {
      await atualizarCadastroGeral(item.id, { ativo: !item.ativo });
      recarregarItens();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar item."));
    }
  }

  function iniciarEdicao(item: CadastroGeralItem) {
    setEditandoId(item.id);
    setEditNome(item.nome);
    setEditDescricao(item.descricao ?? "");
  }

  async function handleSalvarEdicao(event: FormEvent) {
    event.preventDefault();
    if (!editandoId || !editNome.trim()) return;

    setSalvandoItem(true);
    try {
      await atualizarCadastroGeral(editandoId, { nome: editNome.trim(), descricao: editDescricao.trim() || null });
      setEditandoId(null);
      recarregarItens();
      showToast("Item atualizado.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar item."));
    } finally {
      setSalvandoItem(false);
    }
  }

  async function handleExcluirItem(item: CadastroGeralItem) {
    if (!window.confirm(`Excluir "${item.nome}"?`)) return;

    try {
      await excluirCadastroGeral(item.id);
      recarregarItens();
      showToast("Item excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir item."));
    }
  }

  const dirtyConfig = Boolean(
    configuracao &&
      draftConfig &&
      (draftConfig.nomeSistema !== configuracao.nomeSistema ||
        draftConfig.nomeEmpresa !== (configuracao.nomeEmpresa ?? "") ||
        draftConfig.logoUrl !== (configuracao.logoUrl ?? "")),
  );

  const itensCategoria = (itens ?? []).filter((item) => item.categoria === categoriaAtiva);
  const categoriaInfo = CATEGORIAS_CADASTRO.find((categoria) => categoria.id === categoriaAtiva);

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Dados do programa</h3>
        <p className="m-0 text-[0.85rem] text-muted">Nome do sistema, nome da empresa e logo exibidos no programa.</p>

        {erroConfig && <p className="text-red">{erroConfig}</p>}
        {carregandoConfig || !draftConfig ? (
          <p className="text-muted">Carregando dados do programa...</p>
        ) : (
          <form className="grid gap-3" onSubmit={handleSalvarConfig}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-line bg-surface">
                {draftConfig.logoUrl ? (
                  <img src={draftConfig.logoUrl} alt="Logo da empresa" className="h-full w-full object-contain" />
                ) : (
                  <Icon id="icon-database" className="h-6 w-6 text-muted" />
                )}
              </div>
              <label className={`${labelClasses} flex-1`}>
                Logo da empresa
                <input
                  type="file"
                  accept="image/*"
                  disabled={!podeGerenciar}
                  className={`${fieldClasses} py-1.5`}
                  onChange={handleLogoChange}
                />
              </label>
              {draftConfig.logoUrl && podeGerenciar && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDraftConfig((current) => (current ? { ...current, logoUrl: "" } : current))}
                >
                  Remover logo
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClasses}>
                Nome do sistema
                <input
                  type="text"
                  required
                  disabled={!podeGerenciar}
                  className={fieldClasses}
                  value={draftConfig.nomeSistema}
                  onChange={(e) => setDraftConfig((current) => (current ? { ...current, nomeSistema: e.target.value } : current))}
                />
              </label>
              <label className={labelClasses}>
                Nome da empresa
                <input
                  type="text"
                  disabled={!podeGerenciar}
                  className={fieldClasses}
                  value={draftConfig.nomeEmpresa}
                  onChange={(e) => setDraftConfig((current) => (current ? { ...current, nomeEmpresa: e.target.value } : current))}
                />
              </label>
            </div>

            {!podeGerenciar && <p className="m-0 text-[0.78rem] text-muted">Apenas administradores e gestores podem alterar os dados do programa.</p>}

            {podeGerenciar && (
              <Button type="submit" className="w-fit" disabled={!dirtyConfig || salvandoConfig}>
                Salvar dados do programa
              </Button>
            )}
          </form>
        )}
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Listas do sistema</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Cadastros usados como referência pelos demais módulos: unidades, áreas/setores, cargos/funções, equipes e tipos.
        </p>

        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_CADASTRO.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={tabButtonClasses(categoriaAtiva === categoria.id)}
              onClick={() => setCategoriaAtiva(categoria.id)}
            >
              {categoria.label}
            </button>
          ))}
        </div>

        {categoriaInfo && <p className="m-0 text-[0.78rem] text-muted">{categoriaInfo.descricao}</p>}

        {erroItens && <p className="text-red">{erroItens}</p>}
        {carregandoItens ? (
          <p className="text-muted">Carregando listas...</p>
        ) : itensCategoria.length === 0 ? (
          <EmptyState message="Nenhum item cadastrado nesta lista." />
        ) : (
          <div className="grid gap-2">
            {itensCategoria.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-2.5 rounded-[8px] border border-line bg-surface p-2.5">
                {editandoId === item.id ? (
                  <form className="flex min-w-0 flex-1 flex-wrap items-center gap-2" onSubmit={handleSalvarEdicao}>
                    <input
                      type="text"
                      required
                      className={`${fieldClasses} min-w-[140px] flex-1`}
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      className={`${fieldClasses} min-w-[140px] flex-1`}
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                    />
                    <Button type="submit" disabled={salvandoItem || !editNome.trim()}>
                      <Icon id="icon-check" />
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditandoId(null)} disabled={salvandoItem}>
                      <Icon id="icon-close" />
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[0.85rem] font-extrabold text-text">{item.nome}</p>
                      {item.descricao && <p className="m-0 truncate text-[0.78rem] text-muted">{item.descricao}</p>}
                    </div>
                    <span
                      className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-[0.74rem] font-extrabold ${
                        item.ativo ? "bg-teal-soft text-teal-strong" : "bg-neutral-button text-muted"
                      }`}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </span>
                    {podeGerenciar && (
                      <div className="flex flex-wrap gap-1.5">
                        <Button type="button" variant="secondary" onClick={() => handleToggleAtivo(item)}>
                          {item.ativo ? "Inativar" : "Ativar"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => iniciarEdicao(item)}>
                          Editar
                        </Button>
                        <Button type="button" variant="danger" onClick={() => handleExcluirItem(item)}>
                          <Icon id="icon-trash" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {podeGerenciar && (
          <form className="flex flex-wrap items-end gap-2" onSubmit={handleCriarItem}>
            <label className={`${labelClasses} min-w-[140px] flex-1`}>
              Novo item
              <input
                type="text"
                required
                placeholder="Nome"
                className={fieldClasses}
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />
            </label>
            <label className={`${labelClasses} min-w-[140px] flex-1`}>
              Descrição (opcional)
              <input type="text" className={fieldClasses} value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} />
            </label>
            <Button type="submit" disabled={criando || !novoNome.trim()}>
              <Icon id="icon-plus" />
              Adicionar
            </Button>
          </form>
        )}
      </article>
    </div>
  );
}
