import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useAuth } from "../../hooks/useAuth";
import { useCrud } from "../../hooks/useCrud";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { usePermissao } from "../../hooks/usePermissao";
import { tabButtonClasses } from "../../lib/formClasses";
import type { RsEquipe } from "../../types/rotaSegura2026";
import { AvaliacoesTab } from "./avaliacoes/AvaliacoesTab";
import { ComiteTab } from "./avaliacoes/ComiteTab";

type Aba = "avaliacoes" | "comite";

export function RotaSegura2026AvaliacoesPage() {
  const { usuario } = useAuth();
  const podeLancar = usePermissao("LANCAR_AVALIACAO_ROTA_SEGURA");
  const podeDecidir = usePermissao("DECIDIR_COMITE_ROTA_SEGURA");

  const { edicoes, edicaoAtiva } = useEdicoesRotaSegura();
  const [edicaoIdSelecionada, setEdicaoIdSelecionada] = useState("");
  const [aba, setAba] = useState<Aba>("avaliacoes");

  const edicaoId = edicaoIdSelecionada || edicaoAtiva?.id || "";

  const { items: equipes } = useCrud<RsEquipe>("/rota-segura/equipes", "Não foi possível carregar as equipes.");

  return (
    <div className="grid gap-6">
      <Panel
        title="Avaliação de APR"
        description="Lançamento das avaliações de APR (amostral e via Forms) e decisões do comitê sobre riscos/medidas adicionais."
        headerExtra={edicoes.length > 0 ? <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoIdSelecionada} /> : undefined}
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabButtonClasses(aba === "avaliacoes")} onClick={() => setAba("avaliacoes")}>
            Avaliações
          </button>
          <button type="button" className={tabButtonClasses(aba === "comite")} onClick={() => setAba("comite")}>
            Comitê
          </button>
        </div>
      </Panel>

      {aba === "avaliacoes" && <AvaliacoesTab edicaoId={edicaoId} equipes={equipes} podeLancar={podeLancar} papel={usuario?.papel} />}
      {aba === "comite" && <ComiteTab edicaoId={edicaoId} podeDecidir={podeDecidir} />}
    </div>
  );
}
