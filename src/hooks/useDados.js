import { exportarDados, importarDados, restaurarDemo } from "../services/api/dados.js";
import { todayValue } from "../utils/format.js";

export async function exportarParaArquivo() {
  const dados = await exportarDados();
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `controle-sst-${todayValue()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importarDeArquivo(file) {
  const texto = await file.text();
  const payload = JSON.parse(texto);
  return importarDados(payload);
}

export async function restaurarDemonstracao() {
  return restaurarDemo();
}
