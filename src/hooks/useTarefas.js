import {
  listarTarefas,
  criarTarefa,
  atualizarTarefa,
  atualizarStatusTarefa,
  excluirTarefa
} from "../services/api/tarefas.js";
import { getState, setState } from "../state/store.js";

export async function carregarTarefas(filtros = {}) {
  const tarefas = await listarTarefas(filtros);
  setState({ tarefas });
  return tarefas;
}

export async function adicionarTarefa(dados) {
  const tarefa = await criarTarefa(dados);
  setState({ tarefas: [tarefa, ...getState().tarefas] });
  return tarefa;
}

export async function editarTarefa(id, dados) {
  const tarefa = await atualizarTarefa(id, dados);
  setState({ tarefas: getState().tarefas.map((item) => (item.id === id ? tarefa : item)) });
  return tarefa;
}

export async function alterarStatusTarefa(id, status) {
  const tarefa = await atualizarStatusTarefa(id, status);
  setState({ tarefas: getState().tarefas.map((item) => (item.id === id ? tarefa : item)) });
  return tarefa;
}

export async function removerTarefa(id) {
  await excluirTarefa(id);
  setState({ tarefas: getState().tarefas.filter((item) => item.id !== id) });
}
