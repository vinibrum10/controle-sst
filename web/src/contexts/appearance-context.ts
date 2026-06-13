import { createContext } from "react";
import type { AppearanceSettings } from "../lib/appearance";

export interface AppearanceContextValue {
  settings: AppearanceSettings;
  setSettings: (settings: AppearanceSettings) => void;
  resetSettings: () => void;
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);
