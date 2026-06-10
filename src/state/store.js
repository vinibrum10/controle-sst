// Estado central da aplicacao. Paginas e componentes leem o estado atual
// com getState() e assinam mudancas com subscribe() para se atualizar.

import { currentWeekValue } from "../utils/format.js";

let state = {
  usuario: null,
  funcionarios: [],
  tarefas: [],
  dashboard: null,
  disponibilidade: [],
  historicoAjuda: [],
  filtros: {
    semana: currentWeekValue(),
    responsavel: "todos",
    tipo: "todos",
    status: "ativas"
  },
  carregando: false
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
