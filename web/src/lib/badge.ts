export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export const badgeBase = "inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full px-2 text-[0.76rem] font-extrabold";

export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-[#e2f4e6] text-green",
  warning: "bg-[#fff4d8] text-[#7b4a00]",
  danger: "bg-[#ffe3e3] text-red",
  info: "bg-[#eef6ff] text-blue",
  neutral: "bg-surface-strong text-muted",
};
