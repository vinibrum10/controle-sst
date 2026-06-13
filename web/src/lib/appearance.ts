export type FontSize = "sm" | "md" | "lg" | "xl";
export type Density = "compact" | "standard" | "comfortable";

export interface AppearanceSettings {
  primaryColor: string;
  fontSize: FontSize;
  density: Density;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  primaryColor: "#2c5d8a",
  fontSize: "md",
  density: "standard",
};

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string; scale: string; factor: number }[] = [
  { value: "sm", label: "Pequena", scale: "93.75%", factor: 0.9375 },
  { value: "md", label: "Padrão", scale: "100%", factor: 1 },
  { value: "lg", label: "Grande", scale: "106.25%", factor: 1.0625 },
  { value: "xl", label: "Extra grande", scale: "112.5%", factor: 1.125 },
];

export const DENSITY_OPTIONS: { value: Density; label: string; description: string; spacing: string }[] = [
  { value: "compact", label: "Compacta", description: "Espaçamentos reduzidos, mais conteúdo visível.", spacing: "0.2rem" },
  { value: "standard", label: "Padrão", description: "Equilíbrio entre espaço e densidade de informação.", spacing: "0.25rem" },
  { value: "comfortable", label: "Confortável", description: "Espaçamentos ampliados, leitura mais folgada.", spacing: "0.3rem" },
];

export const PRIMARY_COLOR_PRESETS: string[] = [
  "#2c5d8a",
  "#1f7a5c",
  "#7a3e9d",
  "#b4232f",
  "#a76309",
  "#24784c",
  "#4a4a4a",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function darkenHex(hex: string, amount = 0.18): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
}

export function softRgba(hex: string, alpha = 0.14): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function isValidHexColor(hex: string): boolean {
  return hexToRgb(hex) !== null;
}

const FONT_SIZE_MAP: Record<FontSize, string> = Object.fromEntries(
  FONT_SIZE_OPTIONS.map((option) => [option.value, option.scale]),
) as Record<FontSize, string>;

const DENSITY_MAP: Record<Density, string> = Object.fromEntries(
  DENSITY_OPTIONS.map((option) => [option.value, option.spacing]),
) as Record<Density, string>;

/** Aplica as variáveis de aparência em um elemento (raiz da aplicação ou painel de pré-visualização). */
export function applyAppearanceVars(target: HTMLElement, settings: AppearanceSettings): void {
  if (settings.primaryColor !== DEFAULT_APPEARANCE.primaryColor && isValidHexColor(settings.primaryColor)) {
    target.style.setProperty("--color-teal", settings.primaryColor);
    target.style.setProperty("--color-teal-strong", darkenHex(settings.primaryColor));
    target.style.setProperty("--color-teal-soft", softRgba(settings.primaryColor));
  } else {
    target.style.removeProperty("--color-teal");
    target.style.removeProperty("--color-teal-strong");
    target.style.removeProperty("--color-teal-soft");
  }

  target.style.setProperty("font-size", FONT_SIZE_MAP[settings.fontSize]);
  target.style.setProperty("--spacing", DENSITY_MAP[settings.density]);
}

export function clearAppearanceVars(target: HTMLElement): void {
  target.style.removeProperty("--color-teal");
  target.style.removeProperty("--color-teal-strong");
  target.style.removeProperty("--color-teal-soft");
  target.style.removeProperty("font-size");
  target.style.removeProperty("--spacing");
}
