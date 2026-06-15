import { Icon } from "./IconSprite";

interface LogoProps {
  size?: "sm" | "lg";
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}

const MARK_SIZES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-9 w-9",
  lg: "h-12 w-12",
};

const ICON_SIZES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-[18px] w-[18px]",
  lg: "h-6 w-6",
};

const TITLE_SIZES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-[0.95rem]",
  lg: "text-[1.4rem]",
};

// Marca do sistema (icone + "SGEPI"), usada na barra lateral, no login e no rodape.
export function Logo({ size = "sm", variant = "dark", showTagline = true, className = "" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-text";
  const taglineColor = variant === "light" ? "text-[#5e7488]" : "text-muted";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`grid ${MARK_SIZES[size]} shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#6fa0c8] to-teal text-white shadow-card`}
        aria-hidden="true"
      >
        <Icon id="icon-shield" className={ICON_SIZES[size]} />
      </div>
      <div className="min-w-0">
        <strong className={`block ${TITLE_SIZES[size]} font-extrabold leading-tight tracking-tight ${textColor}`}>SGEPI</strong>
        {showTagline && (
          <span className={`mt-0.5 block truncate text-[0.62rem] font-bold uppercase tracking-[0.14em] ${taglineColor}`}>
            Equipes, Programas e Indicadores
          </span>
        )}
      </div>
    </div>
  );
}
