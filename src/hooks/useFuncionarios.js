import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  alternarStatusFuncionario,
  excluirFuncionario
} from "../services/api/funcionarios.js";
import { getState, setState } from "../state/store.js";

export async function carregarFuncionarios() {
  const funcionarios = await listarFuncionarios();
  setState({ funcionarios });
  return funcionarios;
}

export async function adicionarFuncionario(dados) {
  const funcionario = await criarFuncionario(dados);
  setState({ funcionarios: [...getState().funcionarios, funcionario].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) });
  return funcionario;
}

export async function editarFuncionario(id, dados) {
  const funcionario = await atualizarFuncionario(id, dados);
  setState({
    funcionarios: getState().funcionarios.map((item) => (item.id === id ? funcionario : item))
  });
  return funcionario;
}

export async function alternarAtivoFuncionario(id, ativo) {
  const funcionario = await alternarStatusFuncionario(id, ativo);
  setState({
    funcionarios: getState().funcionarios.map((item) => (item.id === id ? funcionario : item))
  });
  return funcionario;
}

export async function removerFuncionario(id) {
  await excluirFuncionario(id);
  setState({ funcionarios: getState().funcionarios.filter((item) => item.id !== id) });
}
