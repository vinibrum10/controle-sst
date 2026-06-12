import { programaStatusLabel } from "../../lib/enums";
import { BADGE_VARIANT_CLASSES, badgeBase, type BadgeVariant } from "../../lib/badge";

export type { BadgeVariant } from "../../lib/badge";

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PLANEJADO: "info",
  PLANEJADA: "info",
  PENDENTE: "info",
  ABERTO: "info",
  EM_ANDAMENTO: "warning",
  EM_TRATATIVA: "warning",
  REALIZADO: "success",
  REALIZADA: "success",
  CONCLUIDO: "success",
  ATIVA: "success",
  CANCELADO: "neutral",
  CANCELADA: "neutral",
  INATIVA: "neutral",
  VENCIDO: "danger",
  ATRASADO: "danger",
};

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
}

export function StatusBadge({ status, variant, label }: StatusBadgeProps) {
  const resolvedVariant = variant || STATUS_VARIANTS[status] || "neutral";
  return <span className={`${badgeBase} ${BADGE_VARIANT_CLASSES[resolvedVariant]}`}>{label || programaStatusLabel(status)}</span>;
}
