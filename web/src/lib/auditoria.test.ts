import { describe, expect, test } from "vitest";
import { ACAO_LABELS, ENTIDADE_LABELS, formatarDetalhes, type LogAuditoriaItem } from "./auditoria";

function montarLog(overrides: Partial<LogAuditoriaItem> = {}): LogAuditoriaItem {
  return {
    id: "1",
    usuarioId: "user-1",
    usuarioNome: "Admin Teste",
    usuarioEmail: "admin@teste.com",
    acao: "CRIAR",
    entidade: "CadastroGeral",
    entidadeId: "cad-1",
    detalhes: null,
    criadoEm: new Date().toISOString(),
    ...overrides,
  };
}

describe("ACAO_LABELS e ENTIDADE_LABELS", () => {
  test("possuem rotulos para as acoes e entidades conhecidas", () => {
    expect(ACAO_LABELS.CRIAR).toBe("Criação");
    expect(ACAO_LABELS.ATUALIZAR).toBe("Atualização");
    expect(ACAO_LABELS.EXCLUIR).toBe("Exclusão");
    expect(ACAO_LABELS.EXPORTAR).toBe("Exportação");
    expect(ACAO_LABELS.IMPORTAR).toBe("Importação");
    expect(ACAO_LABELS.RESTAURAR_DEMO).toBe("Restauração de demonstração");

    expect(ENTIDADE_LABELS.CadastroGeral).toBe("Cadastro geral");
    expect(ENTIDADE_LABELS.ConfiguracaoSistema).toBe("Configuração do sistema");
    expect(ENTIDADE_LABELS.PermissaoPerfil).toBe("Permissões");
    expect(ENTIDADE_LABELS.Dados).toBe("Dados");
  });
});

describe("formatarDetalhes", () => {
  test("retorna '-' quando nao ha detalhes", () => {
    expect(formatarDetalhes(montarLog({ detalhes: null }))).toBe("-");
  });

  test("resume alteracoes de permissoes com os rotulos de papel e permissao", () => {
    const log = montarLog({
      entidade: "PermissaoPerfil",
      acao: "ATUALIZAR",
      detalhes: {
        alteracoes: [
          { papel: "GESTOR", chave: "IMPORTAR_DADOS", permitidoAntes: false, permitidoDepois: true },
        ],
      },
    });

    expect(formatarDetalhes(log)).toContain("→ Permitido");
  });

  test("resume exportacao de dados com contagens", () => {
    const log = montarLog({
      entidade: "Dados",
      acao: "EXPORTAR",
      detalhes: { funcionarios: 5, tarefas: 12 },
    });

    expect(formatarDetalhes(log)).toBe("5 funcionário(s), 12 tarefa(s)");
  });

  test("resume importacao de dados com erros", () => {
    const log = montarLog({
      entidade: "Dados",
      acao: "IMPORTAR",
      detalhes: { funcionariosImportados: 2, tarefasImportadas: 3, erros: 1 },
    });

    expect(formatarDetalhes(log)).toBe("2 funcionário(s), 3 tarefa(s), 1 erro(s)");
  });

  test("formata detalhes genericos como pares chave/valor", () => {
    const log = montarLog({
      entidade: "ConfiguracaoSistema",
      acao: "ATUALIZAR",
      detalhes: { nomeEmpresa: "Empresa Teste" },
    });

    expect(formatarDetalhes(log)).toBe("nomeEmpresa: Empresa Teste");
  });
});
