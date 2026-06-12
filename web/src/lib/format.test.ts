import { describe, expect, test } from "vitest";
import { initials, shiftDate, toDateInputValue, weekFromDate } from "./format";

describe("toDateInputValue", () => {
  test("formata a data no padrao AAAA-MM-DD", () => {
    expect(toDateInputValue(new Date(2026, 5, 12))).toBe("2026-06-12");
    expect(toDateInputValue(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("shiftDate", () => {
  test("desloca a data atual em N dias", () => {
    const hoje = toDateInputValue(new Date());
    expect(shiftDate(0)).toBe(hoje);

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    expect(shiftDate(-1)).toBe(toDateInputValue(ontem));
  });
});

describe("weekFromDate", () => {
  test("calcula a semana ISO a partir de uma data", () => {
    expect(weekFromDate("2026-06-12")).toBe("2026-W24");
    expect(weekFromDate("2026-01-01")).toBe("2026-W01");
  });
});

describe("initials", () => {
  test("retorna as iniciais do nome", () => {
    expect(initials("Ana Paula Souza")).toBe("AP");
    expect(initials("Bruno")).toBe("B");
  });

  test("retorna ? quando o nome esta vazio", () => {
    expect(initials("")).toBe("?");
  });
});
