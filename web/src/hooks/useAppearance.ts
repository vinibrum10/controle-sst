import { useContext } from "react";
import { AppearanceContext } from "../contexts/appearance-context";

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance deve ser usado dentro de AppearanceProvider");
  return ctx;
}
