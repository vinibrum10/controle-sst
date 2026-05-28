export function CardIndicador({ label, value, hint }) {
  return `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint || ""}</small>
    </article>
  `;
}
