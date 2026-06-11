interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-[8px] border border-line bg-surface p-6 shadow-[0_12px_30px_rgba(20,33,31,0.08)]">
      <h2 className="mb-2 text-lg font-extrabold">{title}</h2>
      <p className="mb-3 text-muted">{description}</p>
      <p className="text-sm font-extrabold text-teal">Esta tela será migrada para React na próxima etapa.</p>
    </section>
  );
}
