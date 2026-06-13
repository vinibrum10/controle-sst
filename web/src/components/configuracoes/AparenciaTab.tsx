import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/IconSprite";
import { useTheme } from "../../hooks/useTheme";
import { useAppearance } from "../../hooks/useAppearance";
import { useToast } from "../../hooks/useToast";
import {
  applyAppearanceVars,
  DEFAULT_APPEARANCE,
  DENSITY_OPTIONS,
  FONT_SIZE_OPTIONS,
  PRIMARY_COLOR_PRESETS,
  isValidHexColor,
  type AppearanceSettings,
} from "../../lib/appearance";

const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";
const optionButtonClasses = (active: boolean) =>
  `min-h-[42px] rounded-[8px] border px-3 text-[0.85rem] font-extrabold transition-all ${
    active
      ? "border-teal bg-teal text-white shadow-card"
      : "border-line bg-neutral-button text-text hover:border-teal/40"
  }`;

export function AparenciaTab() {
  const { theme, toggleTheme } = useTheme();
  const { settings, setSettings, resetSettings } = useAppearance();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<AppearanceSettings>(settings);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) applyAppearanceVars(previewRef.current, draft);
  }, [draft]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const fontFactor = FONT_SIZE_OPTIONS.find((option) => option.value === draft.fontSize)?.factor ?? 1;

  function handleSave() {
    setSettings(draft);
    showToast("Aparência atualizada com sucesso.");
  }

  function handleDiscard() {
    setDraft(settings);
  }

  function handleReset() {
    resetSettings();
    setDraft(DEFAULT_APPEARANCE);
    showToast("Aparência restaurada para o padrão.");
  }

  return (
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Tema</h3>
        <p className="m-0 text-[0.85rem] text-muted">Escolha entre o tema claro ou escuro para toda a aplicação.</p>
        <div className="flex gap-2">
          <button
            type="button"
            className={optionButtonClasses(theme === "light")}
            onClick={() => theme === "dark" && toggleTheme()}
          >
            <span className="inline-flex items-center gap-2">
              <Icon id="icon-sun" /> Claro
            </span>
          </button>
          <button
            type="button"
            className={optionButtonClasses(theme === "dark")}
            onClick={() => theme === "light" && toggleTheme()}
          >
            <span className="inline-flex items-center gap-2">
              <Icon id="icon-moon" /> Escuro
            </span>
          </button>
        </div>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Cor primária</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Define a cor de destaque usada em botões, links e elementos ativos do sistema.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          {PRIMARY_COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Selecionar cor ${color}`}
              className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                draft.primaryColor.toLowerCase() === color.toLowerCase() ? "border-teal" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setDraft((current) => ({ ...current, primaryColor: color }))}
            />
          ))}
          <label className="flex min-h-[42px] items-center gap-2 rounded-[8px] border border-line bg-surface px-2.5 text-[0.85rem] font-extrabold text-text">
            Personalizada
            <input
              type="color"
              value={isValidHexColor(draft.primaryColor) ? draft.primaryColor : DEFAULT_APPEARANCE.primaryColor}
              className="h-7 w-10 cursor-pointer rounded border border-line bg-transparent p-0"
              onChange={(e) => setDraft((current) => ({ ...current, primaryColor: e.target.value }))}
            />
          </label>
        </div>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Tamanho da fonte</h3>
        <p className="m-0 text-[0.85rem] text-muted">Ajusta o tamanho geral dos textos em todo o sistema.</p>
        <div className="flex flex-wrap gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={optionButtonClasses(draft.fontSize === option.value)}
              onClick={() => setDraft((current) => ({ ...current, fontSize: option.value }))}
            >
              {option.label}
            </button>
          ))}
        </div>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Densidade da interface</h3>
        <p className="m-0 text-[0.85rem] text-muted">Controla o espaçamento entre elementos nas telas.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {DENSITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`grid gap-1 rounded-[8px] border px-3 py-2.5 text-left transition-all ${
                draft.density === option.value
                  ? "border-teal bg-teal text-white shadow-card"
                  : "border-line bg-neutral-button text-text hover:border-teal/40"
              }`}
              onClick={() => setDraft((current) => ({ ...current, density: option.value }))}
            >
              <span className="text-[0.85rem] font-extrabold">{option.label}</span>
              <span className={`text-[0.76rem] ${draft.density === option.value ? "text-white/85" : "text-muted"}`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Pré-visualização</h3>
        <p className="m-0 text-[0.85rem] text-muted">
          Veja como os elementos vão ficar antes de salvar as alterações.
        </p>
        <div
          ref={previewRef}
          className="grid gap-3 rounded-[8px] border border-line bg-surface p-4"
        >
          <p className="m-0" style={{ fontSize: `${16 * fontFactor}px`, fontWeight: 800, letterSpacing: "-0.01em" }}>
            Texto de exemplo
          </p>
          <p className="m-0 text-muted" style={{ fontSize: `${14 * fontFactor}px` }}>
            Este é um parágrafo de demonstração para o tamanho de fonte e cor escolhidos.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="primary" size="sm">
              Botão primário
            </Button>
            <Button variant="secondary" size="sm">
              Botão secundário
            </Button>
            <span className="inline-flex min-h-[28px] items-center rounded-full bg-teal-soft px-2.5 text-[0.78rem] font-extrabold text-teal-strong">
              Destaque
            </span>
          </div>
        </div>
      </article>

      <div className="flex flex-wrap justify-end gap-2.5">
        <Button variant="danger" onClick={handleReset}>
          Restaurar padrão
        </Button>
        <Button variant="secondary" onClick={handleDiscard} disabled={!dirty}>
          Descartar alterações
        </Button>
        <Button onClick={handleSave} disabled={!dirty}>
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
