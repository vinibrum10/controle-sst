import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppearanceContext } from "./appearance-context";
import { applyAppearanceVars, clearAppearanceVars, DEFAULT_APPEARANCE, type AppearanceSettings } from "../lib/appearance";

const STORAGE_KEY = "sst-appearance";

function readInitialSettings(): AppearanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APPEARANCE, ...parsed };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppearanceSettings>(readInitialSettings);

  useEffect(() => {
    const root = document.documentElement;
    if (JSON.stringify(settings) === JSON.stringify(DEFAULT_APPEARANCE)) {
      clearAppearanceVars(root);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    applyAppearanceVars(root, settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setSettings = useCallback((next: AppearanceSettings) => {
    setSettingsState(next);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_APPEARANCE);
  }, []);

  return (
    <AppearanceContext.Provider value={{ settings, setSettings, resetSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}
