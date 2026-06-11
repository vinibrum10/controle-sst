import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

const baseClasses = "inline-flex items-center justify-center gap-2 rounded-[8px] font-extrabold transition-transform duration-150 ease-out hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none";

const variantClasses: Record<Variant, string> = {
  primary: "min-h-[48px] bg-gradient-to-b from-[#149184] to-teal text-white text-base shadow-[0_8px_16px_rgba(20,33,31,0.06)]",
  secondary: "min-h-[42px] border border-line bg-neutral-button text-text",
  ghost: "min-h-[42px] border border-white/15 bg-transparent text-[#91a39e] text-sm hover:text-[#f4f7f6] hover:border-white/30",
};

export function Button({ variant = "primary", full, className = "", ...props }: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], full ? "w-full" : "", className].filter(Boolean).join(" ");
  return <button className={classes} {...props} />;
}
