import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useAuth } from "../../hooks/useAuth";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { useQueryCrud } from "../../hooks/useQueryCrud";
import { tabButtonClasses } from "../../lib/formClasses";
import { podeConfigurarRotaSegura } from "../../lib/permissions";
import type { RsCriterio } from "../../types/rotaSegura2026";
import { CriteriosTab } from "./configuracao/CriteriosTab";
import { EdicoesTab } from "./configuracao/EdicoesTab";
import { PremiacaoTab } from "./configuracao/PremiacaoTab";
import { PropostaTab } from "./configuracao/PropostaTab";
import { RegrasTab } from "./configuracao/RegrasTab";

type Aba = "edicoes" | "proposta" | "criterios" | "regras" | "premiacao";

const ABAS: { id: Aba; label: string }[] = [
  { id: "edicoes", label: "Edições do programa" },
  { id: "proposta", label: "Proposta / regulamento" },
  { id: "criterios", label: "Critérios de pontuação" },
  { id: "regras", label: "Regras condicionais" },
  { id: "premiacao", label: "Premiação" },
];

export function RotaSegura2026ConfiguracaoPage() {
  const { usuario } = useAuth();
  const podeEditar = podeConfigurarRotaSegura(usuario?.papel);

  const { edicoes, carregando, erro, edicaoAtiva, criar, atualizar, remover } = useEdicoesRotaSegura();
  const [edicaoIdSelecionada, setEdicaoIdSelecionada] = useState("");
  const [aba, setAba] = useState<Aba>("edicoes");

  const edicaoId = edicaoIdSelecionada || edicaoAtiva?.id || "";

  const edicaoSelecionada = edicoes.find((edicao) => edicao.id === edicaoId) || null;
  const edicaoNome = edicaoSelecionada ? `${edicaoSelecionada.nome} (${edicaoSelecionada.ano})` : "";

  const { items: criterios } = useQueryCrud<RsCriterio>(
    "/rota-segura/criterios",
    edicaoId ? `?edicaoId=${edicaoId}` : "",
    "Não foi possível carregar os critérios.",
  );

  return (
    <div className="grid gap-6">
      <Panel
        title="Configuração do Rota Segura"
        description="Cada edição anual tem sua própria proposta, critérios de pontuação, regras condicionais e premiação."
        headerExtra={edicoes.length > 0 ? <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoIdSelecionada} /> : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {ABAS.map(({ id, label }) => (
            <button key={id} type="button" className={tabButtonClasses(aba === id)} onClick={() => setAba(id)}>
              {label}
            </button>
          ))}
        </div>
      </Panel>

      {aba === "edicoes" && (
        <EdicoesTab edicoes={edicoes} carregando={carregando} erro={erro} criar={criar} atualizar={atualizar} remover={remover} />
      )}
      {aba === "proposta" && <PropostaTab edicaoId={edicaoId} edicaoNome={edicaoNome} podeEditar={podeEditar} />}
      {aba === "criterios" && <CriteriosTab edicaoId={edicaoId} edicaoNome={edicaoNome} podeEditar={podeEditar} />}
      {aba === "regras" && <RegrasTab edicaoId={edicaoId} edicaoNome={edicaoNome} criterios={criterios} podeEditar={podeEditar} />}
      {aba === "premiacao" && <PremiacaoTab edicaoId={edicaoId} edicaoNome={edicaoNome} podeEditar={podeEditar} />}
    </div>
  );
}
