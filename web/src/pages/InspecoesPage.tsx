import { useMemo, useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { StatusBadge, type BadgeVariant } from "../components/ui/StatusBadge";
import { SummaryCard } from "../components/ui/SummaryCard";
import { useCrud } from "../hooks/useCrud";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { podeGerenciarProgramasSST } from "../lib/permissions";
import { ApiError } from "../lib/api";
import { achadoTipoLabel, gravidadeLabel, programaStatusLabel } from "../lib/enums";
import { formatDate, shiftDate, startOfToday } from "../lib/format";
import type {
  Achado,
  Auditoria,
  GravidadeAchado,
  Inspecao,
  PlanoAcao,
  StatusAchado,
  StatusAuditoria,
  StatusInspecao,
  StatusPlanoAcao,
  TipoAchado,
} from "../types/programas";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";
const selectInlineClasses =
  "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2 text-[0.85rem] text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const deleteButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-red/25 bg-red-soft px-2.5 text-[0.8rem] font-extrabold text-red transition-transform duration-150 hover:-translate-y-px active:translate-y-0";
const twoColLayout = "grid gap-6 lg:items-start lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]";

const STATUS_INSPECAO_OPTIONS: StatusInspecao[] = ["PLANEJADA", "REALIZADA", "CANCELADA"];
const STATUS_AUDITORIA_OPTIONS: StatusAuditoria[] = ["PLANEJADA", "REALIZADA", "CANCELADA"];
const STATUS_ACHADO_OPTIONS: StatusAchado[] = ["ABERTO", "EM_TRATATIVA", "CONCLUIDO"];
const STATUS_PLANO_OPTIONS: StatusPlanoAcao[] = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "ATRASADO"];
const TIPO_ACHADO_OPTIONS: TipoAchado[] = ["NAO_CONFORMIDADE", "OBSERVACAO", "OPORTUNIDADE_MELHORIA"];
const GRAVIDADE_OPTIONS: GravidadeAchado[] = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

function gravidadeVariant(gravidade: GravidadeAchado): BadgeVariant {
  if (gravidade === "CRITICA" || gravidade === "ALTA") return "danger";
  if (gravidade === "MEDIA") return "warning";
  return "neutral";
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && Array.isArray(err.detalhes) && err.detalhes.length > 0) {
    const primeiro = err.detalhes[0] as { mensagem?: string };
    return primeiro.mensagem || err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

function defaultInspecaoForm() {
  return {
    titulo: "",
    area: "",
    tipo: "",
    dataPrevista: shiftDate(7),
    dataRealizada: "",
    responsavelId: "",
    status: "PLANEJADA" as StatusInspecao,
    observacoes: "",
  };
}

function defaultAuditoriaForm() {
  return {
    titulo: "",
    escopo: "",
    norma: "",
    dataPrevista: shiftDate(14),
    dataRealizada: "",
    responsavelId: "",
    status: "PLANEJADA" as StatusAuditoria,
    observacoes: "",
  };
}

function defaultAchadoForm() {
  return {
    descricao: "",
    tipo: "NAO_CONFORMIDADE" as TipoAchado,
    gravidade: "MEDIA" as GravidadeAchado,
    status: "ABERTO" as StatusAchado,
    origem: "",
    responsavelId: "",
  };
}

function defaultPlanoForm() {
  return {
    achadoId: "",
    descricao: "",
    responsavelId: "",
    prazo: shiftDate(14),
    status: "PENDENTE" as StatusPlanoAcao,
  };
}

export function InspecoesPage() {
  const {
    items: inspecoes,
    carregando: carregandoInspecoes,
    erro: erroInspecoes,
    criar: criarInspecao,
    atualizar: atualizarInspecao,
    remover: removerInspecao,
  } = useCrud<Inspecao>("/inspecoes");
  const {
    items: auditorias,
    carregando: carregandoAuditorias,
    erro: erroAuditorias,
    criar: criarAuditoria,
    atualizar: atualizarAuditoria,
    remover: removerAuditoria,
  } = useCrud<Auditoria>("/auditorias");
  const {
    items: achados,
    carregando: carregandoAchados,
    erro: erroAchados,
    criar: criarAchado,
    atualizar: atualizarAchado,
    remover: removerAchado,
  } = useCrud<Achado>("/achados");
  const {
    items: planosAcao,
    carregando: carregandoPlanos,
    erro: erroPlanos,
    criar: criarPlano,
    atualizar: atualizarPlano,
    remover: removerPlano,
  } = useCrud<PlanoAcao>("/planos-acao");

  const { funcionarios } = useFuncionarios();
  const { showToast } = useToast();
  const { usuario } = useAuth();
  const canManage = podeGerenciarProgramasSST(usuario?.papel);
  const ativos = funcionarios.filter((f) => f.ativo);

  const [inspecaoForm, setInspecaoForm] = useState(defaultInspecaoForm);
  const [auditoriaForm, setAuditoriaForm] = useState(defaultAuditoriaForm);
  const [achadoForm, setAchadoForm] = useState(defaultAchadoForm);
  const [planoForm, setPlanoForm] = useState(defaultPlanoForm);

  const [submittingInspecao, setSubmittingInspecao] = useState(false);
  const [submittingAuditoria, setSubmittingAuditoria] = useState(false);
  const [submittingAchado, setSubmittingAchado] = useState(false);
  const [submittingPlano, setSubmittingPlano] = useState(false);

  const resumo = useMemo(() => {
    const hoje = startOfToday();
    const inspecoesPlanejadas = inspecoes.filter((i) => i.status === "PLANEJADA").length;
    const auditoriasPlanejadas = auditorias.filter((a) => a.status === "PLANEJADA").length;
    const achadosAbertos = achados.filter((a) => a.status !== "CONCLUIDO").length;
    const planosAtrasados = planosAcao.filter((p) => p.status !== "CONCLUIDO" && new Date(p.prazo) < hoje).length;
    return { inspecoesPlanejadas, auditoriasPlanejadas, achadosAbertos, planosAtrasados };
  }, [inspecoes, auditorias, achados, planosAcao]);

  function origemDoAchado(achado: Achado): string {
    if (achado.inspecaoId) {
      const inspecao = inspecoes.find((i) => i.id === achado.inspecaoId);
      return inspecao ? `Inspeção · ${inspecao.titulo}` : "Inspeção";
    }
    if (achado.auditoriaId) {
      const auditoria = auditorias.find((a) => a.id === achado.auditoriaId);
      return auditoria ? `Auditoria · ${auditoria.titulo}` : "Auditoria";
    }
    if (achado.rotaSeguraId) return "Rota segura";
    return "Registro geral";
  }

  async function handleSubmitInspecao(event: FormEvent) {
    event.preventDefault();
    const titulo = inspecaoForm.titulo.trim();
    if (!titulo || !inspecaoForm.dataPrevista) {
      showToast("Informe o título e a data prevista da inspeção.");
      return;
    }

    setSubmittingInspecao(true);
    try {
      await criarInspecao({
        titulo,
        area: inspecaoForm.area.trim() || null,
        tipo: inspecaoForm.tipo.trim() || null,
        dataPrevista: inspecaoForm.dataPrevista,
        dataRealizada: inspecaoForm.dataRealizada || null,
        status: inspecaoForm.status,
        observacoes: inspecaoForm.observacoes.trim() || null,
        responsavelId: inspecaoForm.responsavelId || null,
      });
      setInspecaoForm(defaultInspecaoForm());
      showToast("Inspeção cadastrada.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao cadastrar inspeção."));
    } finally {
      setSubmittingInspecao(false);
    }
  }

  async function handleSubmitAuditoria(event: FormEvent) {
    event.preventDefault();
    const titulo = auditoriaForm.titulo.trim();
    if (!titulo || !auditoriaForm.dataPrevista) {
      showToast("Informe o título e a data prevista da auditoria.");
      return;
    }

    setSubmittingAuditoria(true);
    try {
      await criarAuditoria({
        titulo,
        escopo: auditoriaForm.escopo.trim() || null,
        norma: auditoriaForm.norma.trim() || null,
        dataPrevista: auditoriaForm.dataPrevista,
        dataRealizada: auditoriaForm.dataRealizada || null,
        status: auditoriaForm.status,
        observacoes: auditoriaForm.observacoes.trim() || null,
        responsavelId: auditoriaForm.responsavelId || null,
      });
      setAuditoriaForm(defaultAuditoriaForm());
      showToast("Auditoria cadastrada.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao cadastrar auditoria."));
    } finally {
      setSubmittingAuditoria(false);
    }
  }

  async function handleSubmitAchado(event: FormEvent) {
    event.preventDefault();
    const descricao = achadoForm.descricao.trim();
    if (!descricao) {
      showToast("Descreva o achado ou desvio identificado.");
      return;
    }

    const inspecaoId = achadoForm.origem.startsWith("inspecao:") ? achadoForm.origem.slice("inspecao:".length) : null;
    const auditoriaId = achadoForm.origem.startsWith("auditoria:") ? achadoForm.origem.slice("auditoria:".length) : null;

    setSubmittingAchado(true);
    try {
      await criarAchado({
        descricao,
        tipo: achadoForm.tipo,
        gravidade: achadoForm.gravidade,
        status: achadoForm.status,
        inspecaoId,
        auditoriaId,
        responsavelId: achadoForm.responsavelId || null,
      });
      setAchadoForm(defaultAchadoForm());
      showToast("Achado registrado.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao registrar achado."));
    } finally {
      setSubmittingAchado(false);
    }
  }

  async function handleSubmitPlano(event: FormEvent) {
    event.preventDefault();
    const descricao = planoForm.descricao.trim();
    if (!planoForm.achadoId || !descricao || !planoForm.prazo) {
      showToast("Selecione o achado, descreva o plano e informe o prazo.");
      return;
    }

    setSubmittingPlano(true);
    try {
      await criarPlano({
        achadoId: planoForm.achadoId,
        descricao,
        responsavelId: planoForm.responsavelId || null,
        prazo: planoForm.prazo,
        status: planoForm.status,
      });
      setPlanoForm((current) => ({ ...defaultPlanoForm(), achadoId: current.achadoId }));
      showToast("Plano de ação criado.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao criar plano de ação."));
    } finally {
      setSubmittingPlano(false);
    }
  }

  async function handleStatusInspecao(inspecao: Inspecao, status: StatusInspecao) {
    try {
      await atualizarInspecao(inspecao.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status da inspeção."));
    }
  }

  async function handleStatusAuditoria(auditoria: Auditoria, status: StatusAuditoria) {
    try {
      await atualizarAuditoria(auditoria.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status da auditoria."));
    }
  }

  async function handleStatusAchado(achado: Achado, status: StatusAchado) {
    try {
      await atualizarAchado(achado.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status do achado."));
    }
  }

  async function handleStatusPlano(plano: PlanoAcao, status: StatusPlanoAcao) {
    try {
      await atualizarPlano(plano.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status do plano de ação."));
    }
  }

  async function handleExcluirInspecao(inspecao: Inspecao) {
    if (!window.confirm(`Excluir a inspeção "${inspecao.titulo}"? Os achados vinculados permanecem registrados.`)) return;
    try {
      await removerInspecao(inspecao.id);
      showToast("Inspeção excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir inspeção."));
    }
  }

  async function handleExcluirAuditoria(auditoria: Auditoria) {
    if (!window.confirm(`Excluir a auditoria "${auditoria.titulo}"? Os achados vinculados permanecem registrados.`)) return;
    try {
      await removerAuditoria(auditoria.id);
      showToast("Auditoria excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir auditoria."));
    }
  }

  async function handleExcluirAchado(achado: Achado) {
    if (!window.confirm("Excluir este achado? Os planos de ação vinculados também serão removidos.")) return;
    try {
      await removerAchado(achado.id);
      showToast("Achado excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir achado."));
    }
  }

  async function handleExcluirPlano(plano: PlanoAcao) {
    if (!window.confirm("Excluir este plano de ação?")) return;
    try {
      await removerPlano(plano.id);
      showToast("Plano de ação excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir plano de ação."));
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <SummaryCard label="Inspeções planejadas" value={resumo.inspecoesPlanejadas} hint="aguardando execução" />
        <SummaryCard label="Auditorias planejadas" value={resumo.auditoriasPlanejadas} hint="aguardando execução" />
        <SummaryCard label="Achados abertos" value={resumo.achadosAbertos} hint="não conformidades e desvios" />
        <SummaryCard label="Planos de ação atrasados" value={resumo.planosAtrasados} hint="prazo vencido" />
      </div>

      <div className={canManage ? twoColLayout : "grid gap-6"}>
        <Panel title="Inspeções programadas" description="Checklists de campo, áreas avaliadas e responsáveis pela execução.">
          {erroInspecoes && <p className="text-red">{erroInspecoes}</p>}
          {carregandoInspecoes ? (
            <p className="text-muted">Carregando inspeções...</p>
          ) : inspecoes.length === 0 ? (
            <EmptyState message="Nenhuma inspeção cadastrada." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Inspeção</th>
                    <th className="py-2 pr-3">Prevista</th>
                    <th className="py-2 pr-3">Realizada</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Achados</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {inspecoes.map((inspecao) => (
                    <tr key={inspecao.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block">{inspecao.titulo}</strong>
                        <small className="text-muted">
                          {[inspecao.area, inspecao.tipo].filter(Boolean).join(" · ") || "Sem área definida"}
                        </small>
                      </td>
                      <td className="py-2 pr-3 text-muted">{formatDate(inspecao.dataPrevista)}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(inspecao.dataRealizada)}</td>
                      <td className="py-2 pr-3 text-muted">{inspecao.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3">{inspecao.achados?.length || 0}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={inspecao.status}
                            onChange={(e) => handleStatusInspecao(inspecao, e.target.value as StatusInspecao)}
                          >
                            {STATUS_INSPECAO_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={inspecao.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirInspecao(inspecao)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {canManage && (
          <Panel title="Nova inspeção" description="Programe inspeções de campo por área, setor ou linha de produção.">
            <form className="grid gap-3" onSubmit={handleSubmitInspecao}>
              <label className={labelClasses}>
                Título
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: Inspeção de EPIs - Almoxarifado"
                  required
                  className={fieldClasses}
                  value={inspecaoForm.titulo}
                  onChange={(e) => setInspecaoForm((current) => ({ ...current, titulo: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Área
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Ex.: Almoxarifado"
                    className={fieldClasses}
                    value={inspecaoForm.area}
                    onChange={(e) => setInspecaoForm((current) => ({ ...current, area: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Tipo
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Ex.: EPI, ergonomia, elétrica"
                    className={fieldClasses}
                    value={inspecaoForm.tipo}
                    onChange={(e) => setInspecaoForm((current) => ({ ...current, tipo: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Data prevista
                  <input
                    type="date"
                    required
                    className={fieldClasses}
                    value={inspecaoForm.dataPrevista}
                    onChange={(e) => setInspecaoForm((current) => ({ ...current, dataPrevista: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Data realizada
                  <input
                    type="date"
                    className={fieldClasses}
                    value={inspecaoForm.dataRealizada}
                    onChange={(e) => setInspecaoForm((current) => ({ ...current, dataRealizada: e.target.value }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Responsável
                <select
                  className={fieldClasses}
                  value={inspecaoForm.responsavelId}
                  onChange={(e) => setInspecaoForm((current) => ({ ...current, responsavelId: e.target.value }))}
                >
                  <option value="">Sem responsável definido</option>
                  {ativos.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Status
                <select
                  className={fieldClasses}
                  value={inspecaoForm.status}
                  onChange={(e) => setInspecaoForm((current) => ({ ...current, status: e.target.value as StatusInspecao }))}
                >
                  {STATUS_INSPECAO_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {programaStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Observações
                <textarea
                  rows={3}
                  maxLength={420}
                  placeholder="Itens do checklist, pontos de atenção ou orientações."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={inspecaoForm.observacoes}
                  onChange={(e) => setInspecaoForm((current) => ({ ...current, observacoes: e.target.value }))}
                />
              </label>

              <Button type="submit" full disabled={submittingInspecao}>
                <Icon id="icon-plus" />
                Programar inspeção
              </Button>
            </form>
          </Panel>
        )}
      </div>

      <div className={canManage ? twoColLayout : "grid gap-6"}>
        <Panel title="Auditorias" description="Auditorias internas e externas de conformidade com normas e procedimentos.">
          {erroAuditorias && <p className="text-red">{erroAuditorias}</p>}
          {carregandoAuditorias ? (
            <p className="text-muted">Carregando auditorias...</p>
          ) : auditorias.length === 0 ? (
            <EmptyState message="Nenhuma auditoria cadastrada." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Auditoria</th>
                    <th className="py-2 pr-3">Prevista</th>
                    <th className="py-2 pr-3">Realizada</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Achados</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {auditorias.map((auditoria) => (
                    <tr key={auditoria.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block">{auditoria.titulo}</strong>
                        <small className="text-muted">
                          {[auditoria.escopo, auditoria.norma].filter(Boolean).join(" · ") || "Sem escopo definido"}
                        </small>
                      </td>
                      <td className="py-2 pr-3 text-muted">{formatDate(auditoria.dataPrevista)}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(auditoria.dataRealizada)}</td>
                      <td className="py-2 pr-3 text-muted">{auditoria.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3">{auditoria.achados?.length || 0}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={auditoria.status}
                            onChange={(e) => handleStatusAuditoria(auditoria, e.target.value as StatusAuditoria)}
                          >
                            {STATUS_AUDITORIA_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={auditoria.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirAuditoria(auditoria)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {canManage && (
          <Panel title="Nova auditoria" description="Planeje auditorias de conformidade com normas regulamentadoras ou ISO 45001.">
            <form className="grid gap-3" onSubmit={handleSubmitAuditoria}>
              <label className={labelClasses}>
                Título
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: Auditoria interna - ISO 45001"
                  required
                  className={fieldClasses}
                  value={auditoriaForm.titulo}
                  onChange={(e) => setAuditoriaForm((current) => ({ ...current, titulo: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Escopo
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Ex.: Unidade industrial"
                    className={fieldClasses}
                    value={auditoriaForm.escopo}
                    onChange={(e) => setAuditoriaForm((current) => ({ ...current, escopo: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Norma de referência
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Ex.: ISO 45001, NR-12"
                    className={fieldClasses}
                    value={auditoriaForm.norma}
                    onChange={(e) => setAuditoriaForm((current) => ({ ...current, norma: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Data prevista
                  <input
                    type="date"
                    required
                    className={fieldClasses}
                    value={auditoriaForm.dataPrevista}
                    onChange={(e) => setAuditoriaForm((current) => ({ ...current, dataPrevista: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Data realizada
                  <input
                    type="date"
                    className={fieldClasses}
                    value={auditoriaForm.dataRealizada}
                    onChange={(e) => setAuditoriaForm((current) => ({ ...current, dataRealizada: e.target.value }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Responsável
                <select
                  className={fieldClasses}
                  value={auditoriaForm.responsavelId}
                  onChange={(e) => setAuditoriaForm((current) => ({ ...current, responsavelId: e.target.value }))}
                >
                  <option value="">Sem responsável definido</option>
                  {ativos.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Status
                <select
                  className={fieldClasses}
                  value={auditoriaForm.status}
                  onChange={(e) => setAuditoriaForm((current) => ({ ...current, status: e.target.value as StatusAuditoria }))}
                >
                  {STATUS_AUDITORIA_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {programaStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Observações
                <textarea
                  rows={3}
                  maxLength={420}
                  placeholder="Critérios de auditoria, documentos a verificar ou setores envolvidos."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={auditoriaForm.observacoes}
                  onChange={(e) => setAuditoriaForm((current) => ({ ...current, observacoes: e.target.value }))}
                />
              </label>

              <Button type="submit" full disabled={submittingAuditoria}>
                <Icon id="icon-plus" />
                Programar auditoria
              </Button>
            </form>
          </Panel>
        )}
      </div>

      <div className={canManage ? twoColLayout : "grid gap-6"}>
        <Panel title="Achados e desvios" description="Não conformidades, observações e oportunidades de melhoria identificadas.">
          {erroAchados && <p className="text-red">{erroAchados}</p>}
          {carregandoAchados ? (
            <p className="text-muted">Carregando achados...</p>
          ) : achados.length === 0 ? (
            <EmptyState message="Nenhum achado registrado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Achado</th>
                    <th className="py-2 pr-3">Origem</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Gravidade</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Identificado em</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {achados.map((achado) => (
                    <tr key={achado.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block max-w-[280px]">{achado.descricao}</strong>
                        {achado.planosAcao && achado.planosAcao.length > 0 && (
                          <small className="text-muted">
                            {achado.planosAcao.length} plano{achado.planosAcao.length > 1 ? "s" : ""} de ação
                          </small>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-muted">{origemDoAchado(achado)}</td>
                      <td className="py-2 pr-3 text-muted">{achadoTipoLabel(achado.tipo)}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={achado.gravidade} label={gravidadeLabel(achado.gravidade)} variant={gravidadeVariant(achado.gravidade)} />
                      </td>
                      <td className="py-2 pr-3 text-muted">{achado.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(achado.identificadoEm)}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={achado.status}
                            onChange={(e) => handleStatusAchado(achado, e.target.value as StatusAchado)}
                          >
                            {STATUS_ACHADO_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={achado.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirAchado(achado)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {canManage && (
          <Panel title="Registrar achado" description="Vincule o achado a uma inspeção ou auditoria, quando aplicável.">
            <form className="grid gap-3" onSubmit={handleSubmitAchado}>
              <label className={labelClasses}>
                Descrição
                <textarea
                  rows={3}
                  maxLength={420}
                  placeholder="Ex.: Extintor com carga vencida no setor de pintura."
                  required
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={achadoForm.descricao}
                  onChange={(e) => setAchadoForm((current) => ({ ...current, descricao: e.target.value }))}
                />
              </label>

              <label className={labelClasses}>
                Origem
                <select
                  className={fieldClasses}
                  value={achadoForm.origem}
                  onChange={(e) => setAchadoForm((current) => ({ ...current, origem: e.target.value }))}
                >
                  <option value="">Registro geral (sem vínculo)</option>
                  {inspecoes.length > 0 && (
                    <optgroup label="Inspeções">
                      {inspecoes.map((inspecao) => (
                        <option key={`inspecao:${inspecao.id}`} value={`inspecao:${inspecao.id}`}>
                          {inspecao.titulo}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {auditorias.length > 0 && (
                    <optgroup label="Auditorias">
                      {auditorias.map((auditoria) => (
                        <option key={`auditoria:${auditoria.id}`} value={`auditoria:${auditoria.id}`}>
                          {auditoria.titulo}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Tipo
                  <select
                    className={fieldClasses}
                    value={achadoForm.tipo}
                    onChange={(e) => setAchadoForm((current) => ({ ...current, tipo: e.target.value as TipoAchado }))}
                  >
                    {TIPO_ACHADO_OPTIONS.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {achadoTipoLabel(tipo)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClasses}>
                  Gravidade
                  <select
                    className={fieldClasses}
                    value={achadoForm.gravidade}
                    onChange={(e) => setAchadoForm((current) => ({ ...current, gravidade: e.target.value as GravidadeAchado }))}
                  >
                    {GRAVIDADE_OPTIONS.map((gravidade) => (
                      <option key={gravidade} value={gravidade}>
                        {gravidadeLabel(gravidade)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={labelClasses}>
                Responsável pela correção
                <select
                  className={fieldClasses}
                  value={achadoForm.responsavelId}
                  onChange={(e) => setAchadoForm((current) => ({ ...current, responsavelId: e.target.value }))}
                >
                  <option value="">Sem responsável definido</option>
                  {ativos.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Status
                <select
                  className={fieldClasses}
                  value={achadoForm.status}
                  onChange={(e) => setAchadoForm((current) => ({ ...current, status: e.target.value as StatusAchado }))}
                >
                  {STATUS_ACHADO_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {programaStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <Button type="submit" full disabled={submittingAchado}>
                <Icon id="icon-plus" />
                Registrar achado
              </Button>
            </form>
          </Panel>
        )}
      </div>

      <div className={canManage ? twoColLayout : "grid gap-6"}>
        <Panel title="Planos de ação" description="Tratativas, responsáveis e prazos para correção dos achados identificados.">
          {erroPlanos && <p className="text-red">{erroPlanos}</p>}
          {carregandoPlanos ? (
            <p className="text-muted">Carregando planos de ação...</p>
          ) : planosAcao.length === 0 ? (
            <EmptyState message="Nenhum plano de ação cadastrado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Plano de ação</th>
                    <th className="py-2 pr-3">Achado relacionado</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Prazo</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {planosAcao.map((plano) => (
                    <tr key={plano.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block max-w-[280px]">{plano.descricao}</strong>
                      </td>
                      <td className="py-2 pr-3 text-muted">
                        <span className="block max-w-[220px] truncate">{plano.achado?.descricao || "-"}</span>
                      </td>
                      <td className="py-2 pr-3 text-muted">{plano.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(plano.prazo)}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={plano.status}
                            onChange={(e) => handleStatusPlano(plano, e.target.value as StatusPlanoAcao)}
                          >
                            {STATUS_PLANO_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={plano.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirPlano(plano)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {canManage && (
          <Panel title="Novo plano de ação" description="Defina a tratativa, o responsável e o prazo para correção do achado.">
            {achados.length === 0 ? (
              <p className="text-muted text-[0.85rem]">Registre um achado antes de criar um plano de ação.</p>
            ) : (
              <form className="grid gap-3" onSubmit={handleSubmitPlano}>
                <label className={labelClasses}>
                  Achado relacionado
                  <select
                    required
                    className={fieldClasses}
                    value={planoForm.achadoId}
                    onChange={(e) => setPlanoForm((current) => ({ ...current, achadoId: e.target.value }))}
                  >
                    <option value="">Selecione um achado</option>
                    {achados.map((achado) => (
                      <option key={achado.id} value={achado.id}>
                        {achado.descricao.length > 60 ? `${achado.descricao.slice(0, 60)}...` : achado.descricao}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClasses}>
                  Descrição do plano
                  <textarea
                    rows={3}
                    maxLength={420}
                    placeholder="Ex.: Substituir o extintor e agendar nova inspeção em 7 dias."
                    required
                    className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                    value={planoForm.descricao}
                    onChange={(e) => setPlanoForm((current) => ({ ...current, descricao: e.target.value }))}
                  />
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className={labelClasses}>
                    Responsável
                    <select
                      className={fieldClasses}
                      value={planoForm.responsavelId}
                      onChange={(e) => setPlanoForm((current) => ({ ...current, responsavelId: e.target.value }))}
                    >
                      <option value="">Sem responsável definido</option>
                      {ativos.map((funcionario) => (
                        <option key={funcionario.id} value={funcionario.id}>
                          {funcionario.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClasses}>
                    Prazo
                    <input
                      type="date"
                      required
                      className={fieldClasses}
                      value={planoForm.prazo}
                      onChange={(e) => setPlanoForm((current) => ({ ...current, prazo: e.target.value }))}
                    />
                  </label>
                </div>

                <label className={labelClasses}>
                  Status
                  <select
                    className={fieldClasses}
                    value={planoForm.status}
                    onChange={(e) => setPlanoForm((current) => ({ ...current, status: e.target.value as StatusPlanoAcao }))}
                  >
                    {STATUS_PLANO_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {programaStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <Button type="submit" full disabled={submittingPlano}>
                  <Icon id="icon-plus" />
                  Criar plano de ação
                </Button>
              </form>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
