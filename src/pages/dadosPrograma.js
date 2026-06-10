import { $, showToast } from "../utils/dom.js";
import { exportarParaArquivo, importarDeArquivo, restaurarDemonstracao } from "../hooks/useDados.js";

let bound = false;

export async function renderDadosPage() {
  if (bound) return;

  $("#exportData").addEventListener("click", handleExport);
  $("#importDataButton").addEventListener("click", () => $("#importData").click());
  $("#importData").addEventListener("change", handleImport);
  $("#resetData").addEventListener("click", handleReset);

  bound = true;
}

async function handleExport() {
  try {
    await exportarParaArquivo();
    showToast("Dados exportados.");
  } catch (err) {
    showToast(err.message || "Erro ao exportar dados.");
  }
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const resultado = await importarDeArquivo(file);
    const erros = resultado.erros?.length ? ` ${resultado.erros.length} registro(s) com erro.` : "";
    showToast(`Importação concluída: ${resultado.funcionariosImportados} funcionário(s), ${resultado.tarefasImportadas} tarefa(s).${erros}`);
  } catch {
    showToast("Arquivo inválido. Exporte um JSON pelo próprio programa.");
  } finally {
    event.target.value = "";
  }
}

async function handleReset() {
  if (!confirm("Restaurar os dados de demonstração? Os funcionários e tarefas atuais serão substituídos.")) return;

  try {
    await restaurarDemonstracao();
    showToast("Dados de demonstração restaurados.");
  } catch (err) {
    showToast(err.message || "Erro ao restaurar dados de demonstração.");
  }
}
