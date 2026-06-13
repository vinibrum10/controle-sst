import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/IconSprite";
import { useToast } from "../../../hooks/useToast";
import { useApiResource } from "../../../hooks/useApiResource";
import { apiFetch } from "../../../lib/api";
import { extractErrorMessage, fieldClasses, labelClasses } from "../../../lib/formClasses";
import type { RsProposta } from "../../../types/rotaSegura2026";

interface PropostaTabProps {
  edicaoId: string;
  edicaoNome: string;
  podeEditar: boolean;
}

type PropostaFormState = Record<
  | "titulo"
  | "slogan"
  | "mensagemAbertura"
  | "objetivoGeral"
  | "justificativa"
  | "publicoAlvo"
  | "areasParticipantes"
  | "regrasGerais"
  | "criteriosAvaliacao"
  | "estruturaComite"
  | "regraPremiacao"
  | "premios"
  | "cronograma"
  | "observacoes",
  string
>;

function defaultForm(): PropostaFormState {
  return {
    titulo: "",
    slogan: "",
    mensagemAbertura: "",
    objetivoGeral: "",
    justificativa: "",
    publicoAlvo: "",
    areasParticipantes: "",
    regrasGerais: "",
    criteriosAvaliacao: "",
    estruturaComite: "",
    regraPremiacao: "",
    premios: "",
    cronograma: "",
    observacoes: "",
  };
}

function toForm(proposta: RsProposta): PropostaFormState {
  return {
    titulo: proposta.titulo || "",
    slogan: proposta.slogan || "",
    mensagemAbertura: proposta.mensagemAbertura || "",
    objetivoGeral: proposta.objetivoGeral || "",
    justificativa: proposta.justificativa || "",
    publicoAlvo: proposta.publicoAlvo || "",
    areasParticipantes: proposta.areasParticipantes || "",
    regrasGerais: proposta.regrasGerais || "",
    criteriosAvaliacao: proposta.criteriosAvaliacao || "",
    estruturaComite: proposta.estruturaComite || "",
    regraPremiacao: proposta.regraPremiacao || "",
    premios: proposta.premios || "",
    cronograma: proposta.cronograma || "",
    observacoes: proposta.observacoes || "",
  };
}

const FIELDS: { key: keyof PropostaFormState; label: string; rows?: number; placeholder?: string }[] = [
  { key: "titulo", label: "Título da edição" },
  { key: "slogan", label: "Slogan" },
  { key: "mensagemAbertura", label: "Mensagem de abertura", rows: 3 },
  { key: "objetivoGeral", label: "Objetivo geral", rows: 3 },
  { key: "justificativa", label: "Justificativa", rows: 3 },
  { key: "publicoAlvo", label: "Público-alvo", rows: 2 },
  { key: "areasParticipantes", label: "Áreas participantes", rows: 2 },
  { key: "regrasGerais", label: "Regras gerais", rows: 4 },
  { key: "criteriosAvaliacao", label: "Critérios de avaliação (resumo)", rows: 4 },
  { key: "estruturaComite", label: "Estrutura do comitê", rows: 3 },
  { key: "regraPremiacao", label: "Regra de premiação", rows: 2 },
  { key: "premios", label: "Prêmios", rows: 2 },
  { key: "cronograma", label: "Cronograma", rows: 2 },
  { key: "observacoes", label: "Observações", rows: 2 },
];

export function PropostaTab({ edicaoId, edicaoNome, podeEditar }: PropostaTabProps) {
  const { showToast } = useToast();
  const { data, carregando, erro, recarregar } = useApiResource<RsProposta>(
    edicaoId ? `/rota-segura/propostas/${edicaoId}` : null,
    "Não foi possível carregar a proposta.",
  );

  const [form, setForm] = useState<PropostaFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [dataSincronizada, setDataSincronizada] = useState<RsProposta | null>(null);

  if (data !== dataSincronizada) {
    setDataSincronizada(data);
    setForm(data ? toForm(data) : defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    setSubmitting(true);
    try {
      const payload: Record<string, string | null> = {};
      for (const { key } of FIELDS) {
        payload[key] = form[key].trim() || null;
      }
      await apiFetch(`/rota-segura/propostas/${edicaoId}`, { method: "PUT", body: payload });
      showToast("Proposta salva.");
      await recarregar();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a proposta."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para configurar a proposta." />;
  }

  return (
    <Panel
      title={`Proposta / regulamento - ${edicaoNome}`}
      description="Conteúdo consultável pelas equipes como referência oficial da edição (objetivo, regras gerais, critérios, comitê, premiação e cronograma)."
    >
      {carregando ? (
        <p className="text-muted">Carregando proposta...</p>
      ) : (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          {erro && data === null && (
            <p className="rounded-[8px] border border-dashed border-line bg-[#fbfdfc] p-2.5 text-[0.85rem] text-muted dark:bg-surface-soft">
              Esta edição ainda não tem proposta cadastrada. Preencha os campos abaixo e salve para criá-la.
            </p>
          )}
          {FIELDS.map(({ key, label, rows }) => (
            <label key={key} className={labelClasses}>
              {label}
              {rows ? (
                <textarea
                  rows={rows}
                  maxLength={4000}
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form[key]}
                  readOnly={!podeEditar}
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                />
              ) : (
                <input
                  type="text"
                  maxLength={200}
                  className={fieldClasses}
                  value={form[key]}
                  readOnly={!podeEditar}
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                />
              )}
            </label>
          ))}

          {podeEditar && (
            <Button type="submit" disabled={submitting}>
              <Icon id="icon-check" />
              Salvar proposta
            </Button>
          )}
        </form>
      )}
    </Panel>
  );
}
