import { useRef, type ChangeEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { EmptyState } from "../ui/Panel";
import { useToast } from "../../hooks/useToast";
import { usePermissao } from "../../hooks/usePermissao";
import { exportarDados, importarDados, restaurarDemo } from "../../lib/dados";
import { ApiError } from "../../lib/api";
import { toDateInputValue } from "../../lib/format";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

export function DadosBackupTab() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const podeExportar = usePermissao("EXPORTAR_DADOS");
  const podeImportar = usePermissao("IMPORTAR_DADOS");
  const podeRestaurar = usePermissao("RESTAURAR_DEMO");

  async function handleExport() {
    try {
      const dados = await exportarDados();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sgepi-${toDateInputValue(new Date())}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Dados exportados.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao exportar dados.");
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const texto = await file.text();
      const payload = JSON.parse(texto);
      const resultado = await importarDados(payload);
      const erros = resultado.erros.length ? ` ${resultado.erros.length} registro(s) com erro.` : "";
      showToast(
        `Importação concluída: ${resultado.funcionariosImportados} funcionário(s), ${resultado.tarefasImportadas} tarefa(s).${erros}`,
      );
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message);
      else showToast("Arquivo inválido. Exporte um JSON pelo próprio programa.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleReset() {
    if (!window.confirm("Restaurar os dados de demonstração? Os funcionários e tarefas atuais serão substituídos.")) return;

    try {
      await restaurarDemo();
      showToast("Dados de demonstração restaurados.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao restaurar dados de demonstração.");
    }
  }

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Backup e restauração</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Exporte uma cópia de segurança dos funcionários e tarefas, importe dados de um backup ou restaure a demonstração.
        </p>

        {podeExportar || podeImportar || podeRestaurar ? (
          <div className="flex flex-wrap gap-2.5">
            {podeExportar && (
              <Button variant="download" className="min-w-[190px] max-sm:w-full" onClick={handleExport}>
                <Icon id="icon-download" />
                Exportar dados
              </Button>
            )}
            {podeImportar && (
              <Button variant="secondary" className="min-w-[190px] max-sm:w-full" onClick={handleImportClick}>
                <Icon id="icon-upload" />
                Importar dados
              </Button>
            )}
            {podeRestaurar && (
              <Button variant="danger" className="min-w-[190px] max-sm:w-full" onClick={handleReset}>
                <Icon id="icon-trash" />
                Restaurar demonstração
              </Button>
            )}
            <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportChange} />
          </div>
        ) : (
          <EmptyState message="Apenas administradores e gestores podem exportar, importar ou restaurar dados." />
        )}
      </article>
    </div>
  );
}
