import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { useAuth } from "../../hooks/useAuth";
import { useCrud } from "../../hooks/useCrud";
import { tabButtonClasses } from "../../lib/formClasses";
import { podeGerenciarEquipesRotaSegura } from "../../lib/permissions";
import type { RsColaborador, RsEquipe } from "../../types/rotaSegura2026";
import { ColaboradoresTab } from "./equipes/ColaboradoresTab";
import { EquipesTab } from "./equipes/EquipesTab";

type Aba = "equipes" | "colaboradores";

export function RotaSegura2026EquipesPage() {
  const { usuario } = useAuth();
  const podeEditar = podeGerenciarEquipesRotaSegura(usuario?.papel);
  const [aba, setAba] = useState<Aba>("equipes");

  const {
    items: equipes,
    carregando: carregandoEquipes,
    erro: erroEquipes,
    criar: criarEquipe,
    atualizar: atualizarEquipe,
    remover: removerEquipe,
  } = useCrud<RsEquipe>("/rota-segura/equipes", "Não foi possível carregar as equipes.");

  const {
    items: colaboradores,
    carregando: carregandoColaboradores,
    erro: erroColaboradores,
    criar: criarColaborador,
    atualizar: atualizarColaborador,
    remover: removerColaborador,
  } = useCrud<RsColaborador>("/rota-segura/colaboradores", "Não foi possível carregar os colaboradores.");

  return (
    <div className="grid gap-[18px]">
      <Panel title="Equipes e colaboradores" description="Cadastro das equipes de campo e dos colaboradores vinculados a cada uma.">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabButtonClasses(aba === "equipes")} onClick={() => setAba("equipes")}>
            Equipes
          </button>
          <button type="button" className={tabButtonClasses(aba === "colaboradores")} onClick={() => setAba("colaboradores")}>
            Colaboradores
          </button>
        </div>
      </Panel>

      {aba === "equipes" && (
        <EquipesTab
          equipes={equipes}
          carregando={carregandoEquipes}
          erro={erroEquipes}
          criar={criarEquipe}
          atualizar={atualizarEquipe}
          remover={removerEquipe}
          podeEditar={podeEditar}
        />
      )}

      {aba === "colaboradores" && (
        <ColaboradoresTab
          colaboradores={colaboradores}
          equipes={equipes}
          carregando={carregandoColaboradores}
          erro={erroColaboradores}
          criar={criarColaborador}
          atualizar={atualizarColaborador}
          remover={removerColaborador}
          podeEditar={podeEditar}
        />
      )}
    </div>
  );
}
