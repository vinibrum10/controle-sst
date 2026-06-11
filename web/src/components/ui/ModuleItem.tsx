interface ModuleItemProps {
  badge: string;
  title: string;
  description: string;
}

export function ModuleItem({ badge, title, description }: ModuleItemProps) {
  return (
    <article className="grid gap-2 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
      <span className="inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
        {badge}
      </span>
      <strong className="text-[1rem]">{title}</strong>
      <small className="text-muted">{description}</small>
    </article>
  );
}
