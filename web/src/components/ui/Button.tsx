import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "../../lib/buttonClasses";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

export function Button({ variant, size, full, className, ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, size, full, className })} {...props} />;
}
