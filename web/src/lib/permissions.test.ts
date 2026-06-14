import { describe, expect, test } from "vitest";
import { CHAVES_PERMISSAO, MATRIZ_PADRAO, PAPEIS, PERMISSION_GROUPS } from "./permissions";

describe("CHAVES_PERMISSAO", () => {
  test("contem 13 chaves unicas", () => {
    expect(CHAVES_PERMISSAO).toHaveLength(13);
    expect(new Set(CHAVES_PERMISSAO).size).toBe(13);
  });
});

describe("PERMISSION_GROUPS", () => {
  test("cobre todas as chaves de permissao, sem duplicatas", () => {
    const chaves = PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.chave));
    expect(chaves).toHaveLength(CHAVES_PERMISSAO.length);
    expect(new Set(chaves)).toEqual(new Set(CHAVES_PERMISSAO));
  });
});

describe("MATRIZ_PADRAO", () => {
  test("possui uma entrada para cada papel e cada chave de permissao", () => {
    for (const papel of PAPEIS) {
      for (const chave of CHAVES_PERMISSAO) {
        expect(typeof MATRIZ_PADRAO[papel][chave]).toBe("boolean");
      }
    }
  });

  test("ADMIN possui todas as permissoes", () => {
    for (const chave of CHAVES_PERMISSAO) {
      expect(MATRIZ_PADRAO.ADMIN[chave]).toBe(true);
    }
  });

  test("GERENCIAR_EQUIPE permite ADMIN, GESTOR e VISUALIZADOR", () => {
    expect(MATRIZ_PADRAO.ADMIN.GERENCIAR_EQUIPE).toBe(true);
    expect(MATRIZ_PADRAO.GESTOR.GERENCIAR_EQUIPE).toBe(true);
    expect(MATRIZ_PADRAO.VISUALIZADOR.GERENCIAR_EQUIPE).toBe(true);
    expect(MATRIZ_PADRAO.TST.GERENCIAR_EQUIPE).toBe(false);
    expect(MATRIZ_PADRAO.COLABORADOR.GERENCIAR_EQUIPE).toBe(false);
  });

  test("GERENCIAR_USUARIOS e restrito ao ADMIN", () => {
    for (const papel of PAPEIS) {
      expect(MATRIZ_PADRAO[papel].GERENCIAR_USUARIOS).toBe(papel === "ADMIN");
    }
  });
});
