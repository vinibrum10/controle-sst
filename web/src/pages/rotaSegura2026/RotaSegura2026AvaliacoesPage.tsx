import { useEffect, useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useAuth } from "../../hooks/useAuth";
import { useCrud } from "../../hooks/useCrud";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { tabButtonClasses } from "../../lib/formClasses";
import { podeDecidirComiteRotaSegura, podeLancarAvaliacaoRotaSegura } from "../../lib/permissions";
import type { RsEquipe } from "../../types/rotaSegura2026";
import { AvaliacoesTab } from "./avaliacoes/AvaliacoesTab";
import { ComiteTab } from "./avaliacoes/ComiteTab";

type Aba = "avaliacoes" | "comite";

export function RotaSegura2026AvaliacoesPage() {
  const { usuario } = useAuth();
  const podeLancar = podeLancarAvaliacaoRotaSegura(usuario?.papel);
  const podeDecidir = podeDecidirComiteRotaSegura(usuario?.papel);

  const { edicoes, edicaoAtiva } = useEdicoesRotaSegura();
  const [edicaoId, setEdicaoId] = useState("");
  const [aba, setAba] = useState<Aba>("avaliacoes");

  useEffect(() => {
    if (!edicaoId && edicaoAtiva) setEdicaoId(edicaoAtiva.id);
  }, [edicaoId, edicaoAtiva]);

  const { items: equipes } = useCrud<RsEquipe>("/rota-segura/equipes", "Não foi possível carregar as equipes.");

  return (
    <div className="grid gap-[18px]">
      <Panel
        title="Avaliação de APR"
        description="Lançamento das avaliações de APR (amostral e via Forms) e decisões do comitê sobre riscos/medidas adicionais."
        headerExtra={edicoes.length > 0 ? <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoId} /> : undefined}
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
