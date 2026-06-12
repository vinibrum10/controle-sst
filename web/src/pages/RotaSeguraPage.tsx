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
import { achadoTipoLabel, frequenciaRotaLabel, gravidadeLabel, programaStatusLabel } from "../lib/enums";
import { formatDate, startOfToday, toDateInputValue } from "../lib/format";
import type {
  Achado,
  FrequenciaRota,
  GravidadeAchado,
  RotaSegura,
  StatusAchado,
  StatusRota,
  TipoAchado,
} from "../types/programas";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";
const selectInlineClasses =
  "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2 text-[0.85rem] text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const deleteButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-red/25 bg-red-soft px-2.5 text-[0.8rem] font-extrabold text-red transition-transform duration-150 hover:-translate-y-px active:translate-y-0";
const verifyButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-green/25 bg-[#edf8f1] px-2.5 text-[0.8rem] font-extrabold text-green transition-transform duration-150 hover:-translate-y-px active:translate-y-0";
const twoColLayout = "grid gap-[18px] lg:items-start lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]";

const STATUS_ROTA_OPTIONS: StatusRota[] = ["ATIVA", "INATIVA"];
const FREQUENCIA_OPTIONS: FrequenciaRota[] = ["DIARIA", "SEMANAL", "QUINZENAL", "MENSAL"];
const STATUS_ACHADO_OPTIONS: StatusAchado[] = ["ABERTO", "EM_TRATATIVA", "CONCLUIDO"];
const TIPO_ACHADO_OPTIONS: TipoAchado[] = ["NAO_CONFORMIDADE", "OBSERVACAO", "OPORTUNIDADE_MELHORIA"];
const GRAVIDADE_OPTIONS: GravidadeAchado[] = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

const FREQUENCIA_DIAS: Record<FrequenciaRota, number> = {
  DIARIA: 1,
  SEMANAL: 7,
  QUINZENAL: 15,
  MENSAL: 30,
};

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

function verificacaoAtrasada(rota: RotaSegura): boolean {
  if (rota.status !== "ATIVA") return false;
  if (!rota.ultimaVerificacao) return true;
  const proxima = new Date(rota.ultimaVerificacao);
  proxima.setDate(proxima.getDate() + FREQUENCIA_DIAS[rota.frequencia]);
  return proxima < startOfToday();
}

function proximaVerificacao(rota: RotaSegura): string {
  if (!rota.ultimaVerificacao) return "A definir";
  const proxima = new Date(rota.ultimaVerificacao);
  proxima.setDate(proxima.getDate() + FREQUENCIA_DIAS[rota.frequencia]);
  return formatDate(toDateInputValue(proxima));
}

function defaultRotaForm() {
  return {
    nome: "",
    descricao: "",
    area: "",
    frequencia: "SEMANAL" as FrequenciaRota,
    ultimaVerificacao: "",
    status: "ATIVA" as StatusRota,
    responsavelId: "",
  };
}

function defaultDesvioForm() {
  return {
    descricao: "",
    tipo: "NAO_CONFORMIDADE" as TipoAchado,
    gravidade: "MEDIA" as GravidadeAchado,
    status: "ABERTO" as StatusAchado,
    rotaSeguraId: "",
    responsavelId: "",
  };
}

export function RotaSeguraPage() {
  const {
    items: rotas,
    carregando: carregandoRotas,
    erro: erroRotas,
    criar: criarRota,
    atualizar: atualizarRota,
    remover: removerRota,
  } = useCrud<RotaSegura>("/rotas-seguras");
  const {
    items: achados,
    carregando: carregandoAchados,
    erro: erroAchados,
    criar: criarAchado,
    atualizar: atualizarAchado,
    remover: removerAchado,
  } = useCrud<Achado>("/achados");

  const { funcionarios } = useFuncionarios();
  const { showToast } = useToast();
  const { usuario } = useAuth();
  const canManage = podeGerenciarProgramasSST(usuario?.papel);
  const ativos = funcionarios.filter((f) => f.ativo);

  const [rotaForm, setRotaForm] = useState(defaultRotaForm);
  const [desvioForm, setDesvioForm] = useState(defaultDesvioForm);
  const [submittingRota, setSubmittingRota] = useState(false);
  const [submittingDesvio, setSubmittingDesvio] = useState(false);

  const desviosDeRotas = useMemo(() => achados.filter((a) => a.rotaSeguraId), [achados]);

  const resumo = useMemo(() => {
    const total = rotas.length;
    const ativas = rotas.filter((r) => r.status === "ATIVA").length;
    const atrasadas = rotas.filter(verificacaoAtrasada).length;
    const desviosPendentes = desviosDeRotas.filter((a) => a.status !== "CONCLUIDO").length;
    return { total, ativas, atrasadas, desviosPendentes };
  }, [rotas, desviosDeRotas]);

  function nomeDaRota(rotaSeguraId: string | null): string {
    if (!rotaSeguraId) return "-";
    return rotas.find((r) => r.id === rotaSeguraId)?.nome || "-";
  }

  async function handleSubmitRota(event: FormEvent) {
    event.preventDefault();
    const nome = rotaForm.nome.trim();
    if (!nome) {
      showToast("Informe o nome da rota.");
      return;
    }

    setSubmittingRota(true);
    try {
      await criarRota({
        nome,
        descricao: rotaForm.descricao.trim() || null,
        area: rotaForm.area.trim() || null,
        frequencia: rotaForm.frequencia,
        ultimaVerificacao: rotaForm.ultimaVerificacao || null,
        status: rotaForm.status,
        responsavelId: rotaForm.responsavelId || null,
      });
      setRotaForm(defaultRotaForm());
      showToast("Rota segura cadastrada.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao cadastrar rota segura."));
    } finally {
      setSubmittingRota(false);
    }
  }

  async function handleSubmitDesvio(event: FormEvent) {
    event.preventDefault();
    const descricao = desvioForm.descricao.trim();
    if (!descricao || !desvioForm.rotaSeguraId) {
      showToast("Selecione a rota e descreva o desvio identificado.");
      return;
    }

    setSubmittingDesvio(true);
    try {
      await criarAchado({
        descricao,
        tipo: desvioForm.tipo,
        gravidade: desvioForm.gravidade,
        status: desvioForm.status,
        rotaSeguraId: desvioForm.rotaSeguraId,
        responsavelId: desvioForm.responsavelId || null,
      });
      setDesvioForm((current) => ({ ...defaultDesvioForm(), rotaSeguraId: current.rotaSeguraId }));
      showToast("Desvio registrado.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao registrar desvio."));
    } finally {
      setSubmittingDesvio(false);
    }
  }

  async function handleStatusRota(rota: RotaSegura, status: StatusRota) {
    try {
      await atualizarRota(rota.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status da rota."));
    }
  }

  async function handleStatusDesvio(achado: Achado, status: StatusAchado) {
    try {
      await atualizarAchado(achado.id, { status });
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao atualizar status do desvio."));
    }
  }

  async function handleVerificarHoje(rota: RotaSegura) {
    try {
      await atualizarRota(rota.id, { ultimaVerificacao: toDateInputValue(new Date()) });
      showToast(`Verificação de "${rota.nome}" registrada hoje.`);
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao registrar verificação."));
    }
  }

  async function handleExcluirRota(rota: RotaSegura) {
    if (!window.confirm(`Excluir a rota "${rota.nome}"? Os desvios vinculados permanecem registrados.`)) return;
    try {
      await removerRota(rota.id);
      showToast("Rota segura excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir rota segura."));
    }
  }

  async function handleExcluirDesvio(achado: Achado) {
    if (!window.confirm("Excluir este desvio? Os planos de ação vinculados também serão removidos.")) return;
    try {
      await removerAchado(achado.id);
      showToast("Desvio excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir desvio."));
    }
  }

  return (
    <div className="grid gap-[18px]">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <SummaryCard label="Rotas cadastradas" value={resumo.total} hint="todas as rotas do programa" />
        <SummaryCard label="Rotas ativas" value={resumo.ativas} hint="em acompanhamento" />
        <SummaryCard label="Verificações em atraso" value={resumo.atrasadas} hint="conforme a frequência definida" />
        <SummaryCard label="Desvios pendentes" value={resumo.desviosPendentes} hint="identificados nas rotas" />
      </div>

      <div className={canManage ? twoColLayout : "grid gap-[18px]"}>
        <Panel title="Rotas seguras" description="Trajetos monitorados, frequência de verificação e responsáveis pela inspeção de campo.">
          {erroRotas && <p className="text-red">{erroRotas}</p>}
          {carregandoRotas ? (
            <p className="text-muted">Carregando rotas...</p>
          ) : rotas.length === 0 ? (
            <EmptyState message="Nenhuma rota segura cadastrada." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Rota</th>
                    <th className="py-2 pr-3">Frequência</th>
                    <th className="py-2 pr-3">Última verificação</th>
                    <th className="py-2 pr-3">Próxima verificação</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Desvios</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {rotas.map((rota) => (
                    <tr key={rota.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block">{rota.nome}</strong>
                        <small className="text-muted">{rota.area || "Área não definida"}</small>
                      </td>
                      <td className="py-2 pr-3 text-muted">{frequenciaRotaLabel(rota.frequencia)}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(rota.ultimaVerificacao)}</td>
                      <td className="py-2 pr-3">
                        {verificacaoAtrasada(rota) ? (
                          <StatusBadge status="ATRASADO" label={`Atrasada · ${proximaVerificacao(rota)}`} />
                        ) : (
                          <span className="text-muted">{proximaVerificacao(rota)}</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-muted">{rota.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3">{rota.achados?.length || 0}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={rota.status}
                            onChange={(e) => handleStatusRota(rota, e.target.value as StatusRota)}
                          >
                            {STATUS_ROTA_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={rota.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className={verifyButtonClasses} onClick={() => handleVerificarHoje(rota)}>
                              <Icon id="icon-check" />
                              Verificar hoje
                            </button>
                            <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirRota(rota)}>
                              <Icon id="icon-trash" />
                              Excluir
                            </button>
                          </div>
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
          <Panel title="Nova rota segura" description="Cadastre trajetos a serem inspecionados periodicamente.">
            <form className="grid gap-3" onSubmit={handleSubmitRota}>
              <label className={labelClasses}>
                Nome da rota
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: Rota de empilhadeiras - Galpão 2"
                  required
                  className={fieldClasses}
                  value={rotaForm.nome}
                  onChange={(e) => setRotaForm((current) => ({ ...current, nome: e.target.value }))}
                />
              </label>

              <label className={labelClasses}>
                Área
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Ex.: Galpão 2"
                  className={fieldClasses}
                  value={rotaForm.area}
                  onChange={(e) => setRotaForm((current) => ({ ...current, area: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Frequência de verificação
                  <select
                    className={fieldClasses}
                    value={rotaForm.frequencia}
                    onChange={(e) => setRotaForm((current) => ({ ...current, frequencia: e.target.value as FrequenciaRota }))}
                  >
                    {FREQUENCIA_OPTIONS.map((frequencia) => (
                      <option key={frequencia} value={frequencia}>
                        {frequenciaRotaLabel(frequencia)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClasses}>
                  Última verificação
                  <input
                    type="date"
                    className={fieldClasses}
                    value={rotaForm.ultimaVerificacao}
                    onChange={(e) => setRotaForm((current) => ({ ...current, ultimaVerificacao: e.target.value }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Responsável
                <select
                  className={fieldClasses}
                  value={rotaForm.responsavelId}
                  onChange={(e) => setRotaForm((current) => ({ ...current, responsavelId: e.target.value }))}
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
                  value={rotaForm.status}
                  onChange={(e) => setRotaForm((current) => ({ ...current, status: e.target.value as StatusRota }))}
                >
                  {STATUS_ROTA_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {programaStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Descrição
                <textarea
                  rows={3}
                  maxLength={420}
                  placeholder="Pontos de verificação, sinalização e equipamentos esperados ao longo da rota."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={rotaForm.descricao}
                  onChange={(e) => setRotaForm((current) => ({ ...current, descricao: e.target.value }))}
                />
              </label>

              <Button type="submit" full disabled={submittingRota}>
                <Icon id="icon-plus" />
                Cadastrar rota
              </Button>
            </form>
          </Panel>
        )}
      </div>

      <div className={canManage ? twoColLayout : "grid gap-[18px]"}>
        <Panel title="Desvios identificados nas rotas" description="Ocorrências encontradas durante as verificações de campo.">
          {erroAchados && <p className="text-red">{erroAchados}</p>}
          {carregandoAchados ? (
            <p className="text-muted">Carregando desvios...</p>
          ) : desviosDeRotas.length === 0 ? (
            <EmptyState message="Nenhum desvio registrado nas rotas." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Desvio</th>
                    <th className="py-2 pr-3">Rota</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Gravidade</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Identificado em</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {desviosDeRotas.map((achado) => (
                    <tr key={achado.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block max-w-[260px]">{achado.descricao}</strong>
                        {achado.planosAcao && achado.planosAcao.length > 0 && (
                          <small className="text-muted">
                            {achado.planosAcao.length} plano{achado.planosAcao.length > 1 ? "s" : ""} de ação
                          </small>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-muted">{nomeDaRota(achado.rotaSeguraId)}</td>
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
                            onChange={(e) => handleStatusDesvio(achado, e.target.value as StatusAchado)}
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
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluirDesvio(achado)}>
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
          <Panel title="Registrar desvio" description="Aponte uma ocorrência encontrada durante a verificação de uma rota.">
            {rotas.length === 0 ? (
              <p className="text-muted text-[0.85rem]">Cadastre uma rota segura antes de registrar desvios.</p>
            ) : (
              <form className="grid gap-3" onSubmit={handleSubmitDesvio}>
                <label className={labelClasses}>
                  Rota
                  <select
                    required
                    className={fieldClasses}
                    value={desvioForm.rotaSeguraId}
                    onChange={(e) => setDesvioForm((current) => ({ ...current, rotaSeguraId: e.target.value }))}
                  >
                    <option value="">Selecione a rota</option>
                    {rotas.map((rota) => (
                      <option key={rota.id} value={rota.id}>
                        {rota.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClasses}>
                  Descrição do desvio
                  <textarea
                    rows={3}
                    maxLength={420}
                    placeholder="Ex.: Sinalização de piso apagada próxima à doca 4."
                    required
                    className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                    value={desvioForm.descricao}
                    onChange={(e) => setDesvioForm((current) => ({ ...current, descricao: e.target.value }))}
                  />
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className={labelClasses}>
                    Tipo
                    <select
                      className={fieldClasses}
                      value={desvioForm.tipo}
                      onChange={(e) => setDesvioForm((current) => ({ ...current, tipo: e.target.value as TipoAchado }))}
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
                      value={desvioForm.gravidade}
                      onChange={(e) => setDesvioForm((current) => ({ ...current, gravidade: e.target.value as GravidadeAchado }))}
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
                    value={desvioForm.responsavelId}
                    onChange={(e) => setDesvioForm((current) => ({ ...current, responsavelId: e.target.value }))}
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
                    value={desvioForm.status}
                    onChange={(e) => setDesvioForm((current) => ({ ...current, status: e.target.value as StatusAchado }))}
                  >
                    {STATUS_ACHADO_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {programaStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <Button type="submit" full disabled={submittingDesvio}>
                  <Icon id="icon-plus" />
                  Registrar desvio
                </Button>
              </form>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
