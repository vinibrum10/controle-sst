import { initials } from "../../lib/format";

const sizeClasses = {
  small: "w-[34px] h-[34px] text-[0.76rem]",
  large: "w-[52px] h-[52px] text-[0.95rem]",
};

interface AvatarProps {
  nome: string;
  foto?: string | null;
  size?: keyof typeof sizeClasses;
}

export function Avatar({ nome, foto, size = "small" }: AvatarProps) {
  const baseClasses = `inline-grid shrink-0 place-items-center rounded-full bg-teal-soft font-black text-teal-strong ${sizeClasses[size]}`;

  if (foto?.startsWith("data:image/")) {
    return <img className={`${baseClasses} object-cover`} src={foto} alt={`Foto de ${nome}`} />;
  }

  return (
    <span className={baseClasses} aria-hidden="true">
      {initials(nome)}
    </span>
  );
}
