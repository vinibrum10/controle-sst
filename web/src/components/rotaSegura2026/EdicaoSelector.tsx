import { selectInlineClasses } from "../../lib/formClasses";
import type { RsEdicaoPrograma } from "../../types/rotaSegura2026";

interface EdicaoSelectorProps {
  edicoes: RsEdicaoPrograma[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}

export function EdicaoSelector({ edicoes, value, onChange, label = "Edição" }: EdicaoSelectorProps) {
  return (
    <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
      {label}
      <select className={`${selectInlineClasses} w-full sm:min-w-[220px]`} value={value} onChange={(e) => onChange(e.target.value)}>
        {edicoes.length === 0 && <option value="">Nenhuma edição cadastrada</option>}
        {edicoes.map((edicao) => (
          <option key={edicao.id} value={edicao.id}>
            {edicao.nome} ({edicao.ano}){edicao.ativo ? " · ativa" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
