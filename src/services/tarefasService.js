const STORAGE_KEY = "controle-sst-v1";

export function loadLocalState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function saveLocalState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function tarefasDaSemana(tasks, week) {
  return tasks.filter((task) => task.week === week);
}
