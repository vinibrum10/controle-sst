export function TabelaTarefas({ tasks }) {
  if (!tasks.length) {
    return '<div class="empty-state">Nenhuma tarefa encontrada.</div>';
  }

  return `
    <div class="task-list">
      ${tasks.map((task) => `
        <article class="task-card">
          <div>
            <h3>${task.title}</h3>
            <div class="task-meta">
              <span class="badge">${task.ownerName || "Sem responsavel"}</span>
              <span class="badge due">Prazo: ${task.dueDate}</span>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}
