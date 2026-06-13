export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger" | "download";
export type ButtonSize = "sm" | "lg";

const baseClasses = "inline-flex items-center justify-center gap-[9px] rounded-[8px] font-extrabold transition-all duration-150 ease-out hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60 disabled:pointer-events-none disabled:hover:translate-y-0";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-teal text-white shadow-card hover:bg-teal-strong hover:shadow-card-lg",
  secondary: "border border-line bg-neutral-button text-text hover:border-teal/40 hover:bg-surface",
  ghost: "border border-white/15 bg-transparent text-[#91a39e] text-sm hover:text-[#f4f7f6] hover:border-white/30 focus-visible:ring-offset-transparent",
  accent: "bg-blue text-white shadow-card hover:bg-blue-strong hover:shadow-card-lg",
  danger: "border border-red/25 bg-red-soft text-red hover:bg-red/15",
  download: "border border-[#ccd6da] bg-[#f8fafb] text-navy shadow-card hover:border-teal/30 dark:border-line dark:bg-surface dark:text-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[42px] px-3.5",
  lg: "min-h-[48px] px-3.5 text-base",
};

interface ButtonClassesArgs {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
}

export function buttonClasses({ variant = "primary", size = "sm", full, className = "" }: ButtonClassesArgs = {}): string {
  return [baseClasses, variantClasses[variant], sizeClasses[size], full ? "w-full" : "", className].filter(Boolean).join(" ");
}
