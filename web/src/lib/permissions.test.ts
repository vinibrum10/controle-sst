import { describe, expect, test } from "vitest";
import {
  podeExcluirFuncionario,
  podeExportarDados,
  podeGerenciarEquipe,
  podeGerenciarProgramasSST,
  podeGerenciarUsuarios,
  podeImportarDados,
  podeRestaurarDemo,
} from "./permissions";
import type { Papel } from "../types";

const TODOS_PAPEIS: Papel[] = ["ADMIN", "GESTOR", "TST", "VISUALIZADOR", "COLABORADOR"];

function papeisPermitidos(fn: (papel?: Papel | null) => boolean): Papel[] {
  return TODOS_PAPEIS.filter((papel) => fn(papel));
}

describe("podeGerenciarEquipe", () => {
  test("permite ADMIN, GESTOR e VISUALIZADOR", () => {
    expect(papeisPermitidos(podeGerenciarEquipe)).toEqual(["ADMIN", "GESTOR", "VISUALIZADOR"]);
  });

  test("nega TST e COLABORADOR", () => {
    expect(podeGerenciarEquipe("TST")).toBe(false);
    expect(podeGerenciarEquipe("COLABORADOR")).toBe(false);
  });

  test("nega quando o papel nao e informado", () => {
    expect(podeGerenciarEquipe(null)).toBe(false);
    expect(podeGerenciarEquipe(undefined)).toBe(false);
  });
});

describe("podeExcluirFuncionario", () => {
  test("permite apenas ADMIN e GESTOR", () => {
    expect(papeisPermitidos(podeExcluirFuncionario)).toEqual(["ADMIN", "GESTOR"]);
  });

  test("nega VISUALIZADOR mesmo podendo gerenciar a equipe", () => {
    expect(podeGerenciarEquipe("VISUALIZADOR")).toBe(true);
    expect(podeExcluirFuncionario("VISUALIZADOR")).toBe(false);
  });
});

describe("podeGerenciarProgramasSST", () => {
  test("permite ADMIN, GESTOR e TST", () => {
    expect(papeisPermitidos(podeGerenciarProgramasSST)).toEqual(["ADMIN", "GESTOR", "TST"]);
  });

  test("nega VISUALIZADOR e COLABORADOR", () => {
    expect(podeGerenciarProgramasSST("VISUALIZADOR")).toBe(false);
    expect(podeGerenciarProgramasSST("COLABORADOR")).toBe(false);
  });
});

describe("podeGerenciarUsuarios", () => {
  test("permite apenas ADMIN", () => {
    expect(papeisPermitidos(podeGerenciarUsuarios)).toEqual(["ADMIN"]);
  });
});

describe("acoes administrativas de dados", () => {
  test("exportar e permitido a ADMIN e GESTOR", () => {
    expect(papeisPermitidos(podeExportarDados)).toEqual(["ADMIN", "GESTOR"]);
  });

  test("importar e restaurar demo sao restritos a ADMIN", () => {
    expect(papeisPermitidos(podeImportarDados)).toEqual(["ADMIN"]);
    expect(papeisPermitidos(podeRestaurarDemo)).toEqual(["ADMIN"]);
  });
});
