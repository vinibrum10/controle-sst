export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "lg";

const baseClasses = "inline-flex items-center justify-center gap-[9px] rounded-[8px] font-extrabold transition-transform duration-150 ease-out hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-b from-[#149184] to-teal text-white shadow-[0_8px_16px_rgba(20,33,31,0.06)]",
  secondary: "border border-line bg-neutral-button text-text",
  ghost: "border border-white/15 bg-transparent text-[#91a39e] text-sm hover:text-[#f4f7f6] hover:border-white/30",
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
