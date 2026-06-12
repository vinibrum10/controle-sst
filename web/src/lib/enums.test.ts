import { describe, expect, test } from "vitest";
import { priorityLabel, programaStatusLabel, routinePeriodLabel, statusLabel, typeLabel } from "./enums";

describe("statusLabel", () => {
  test("traduz os status conhecidos", () => {
    expect(statusLabel("PENDENTE")).toBe("Pendente");
    expect(statusLabel("EM_ANDAMENTO")).toBe("Em andamento");
    expect(statusLabel("CONCLUIDA")).toBe("Concluída");
  });
});

describe("typeLabel e priorityLabel", () => {
  test("traduzem tipo e prioridade da tarefa", () => {
    expect(typeLabel("ROTINEIRA")).toBe("Rotineira");
    expect(priorityLabel("CRITICA")).toBe("Crítica");
  });
});

describe("routinePeriodLabel", () => {
  test("usa Semanal como padrao quando nao informado", () => {
    expect(routinePeriodLabel()).toBe("Semanal");
    expect(routinePeriodLabel(null)).toBe("Semanal");
  });

  test("traduz os periodos informados", () => {
    expect(routinePeriodLabel("TRIMESTRAL")).toBe("Trimestral");
    expect(routinePeriodLabel("ANUAL")).toBe("Anual");
  });
});

describe("programaStatusLabel", () => {
  test("traduz status dos programas de SST", () => {
    expect(programaStatusLabel("PLANEJADO")).toBe("Planejado");
    expect(programaStatusLabel("REALIZADA")).toBe("Realizada");
    expect(programaStatusLabel("EM_TRATATIVA")).toBe("Em tratativa");
    expect(programaStatusLabel("ATRASADO")).toBe("Atrasado");
  });

  test("retorna o proprio valor para status desconhecidos", () => {
    expect(programaStatusLabel("DESCONHECIDO")).toBe("DESCONHECIDO");
  });
});
