import { listarDisponibilidade, listarHistoricoAjuda, solicitarAjuda } from "../services/api/ajuda.js";
import { getState, setState } from "../state/store.js";

export async function carregarDisponibilidade(semana) {
  const disponibilidade = await listarDisponibilidade(semana);
  setState({ disponibilidade });
  return disponibilidade;
}

export async function carregarHistoricoAjuda() {
  const historicoAjuda = await listarHistoricoAjuda();
  setState({ historicoAjuda });
  return historicoAjuda;
}

export async function pedirAjuda(tarefaId) {
  const resultado = await solicitarAjuda(tarefaId);
  setState({
    tarefas: getState().tarefas.map((item) => (item.id === resultado.tarefa.id ? resultado.tarefa : item))
  });
  return resultado;
}
