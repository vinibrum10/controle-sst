// Matriz de permissoes padrao, espelhando o seed inserido pela migration
// "add_permissao_perfil" e o comportamento previamente hardcoded no sistema.
// Usado nos testes para validar que o banco esta semeado corretamente.

const DEFAULT_PERMISSOES = [
  { papel: "ADMIN", chave: "GERENCIAR_EQUIPE", permitido: true },
  { papel: "GESTOR", chave: "GERENCIAR_EQUIPE", permitido: true },
  { papel: "TST", chave: "GERENCIAR_EQUIPE", permitido: false },
  { papel: "VISUALIZADOR", chave: "GERENCIAR_EQUIPE", permitido: true },
  { papel: "COLABORADOR", chave: "GERENCIAR_EQUIPE", permitido: false },

  { papel: "ADMIN", chave: "EXCLUIR_FUNCIONARIO", permitido: true },
  { papel: "GESTOR", chave: "EXCLUIR_FUNCIONARIO", permitido: true },
  { papel: "TST", chave: "EXCLUIR_FUNCIONARIO", permitido: false },
  { papel: "VISUALIZADOR", chave: "EXCLUIR_FUNCIONARIO", permitido: false },
  { papel: "COLABORADOR", chave: "EXCLUIR_FUNCIONARIO", permitido: false },

  { papel: "ADMIN", chave: "GERENCIAR_PROGRAMAS_SST", permitido: true },
  { papel: "GESTOR", chave: "GERENCIAR_PROGRAMAS_SST", permitido: true },
  { papel: "TST", chave: "GERENCIAR_PROGRAMAS_SST", permitido: true },
  { papel: "VISUALIZADOR", chave: "GERENCIAR_PROGRAMAS_SST", permitido: false },
  { papel: "COLABORADOR", chave: "GERENCIAR_PROGRAMAS_SST", permitido: false },

  { papel: "ADMIN", chave: "GERENCIAR_USUARIOS", permitido: true },
  { papel: "GESTOR", chave: "GERENCIAR_USUARIOS", permitido: false },
  { papel: "TST", chave: "GERENCIAR_USUARIOS", permitido: false },
  { papel: "VISUALIZADOR", chave: "GERENCIAR_USUARIOS", permitido: false },
  { papel: "COLABORADOR", chave: "GERENCIAR_USUARIOS", permitido: false },

  { papel: "ADMIN", chave: "EXPORTAR_DADOS", permitido: true },
  { papel: "GESTOR", chave: "EXPORTAR_DADOS", permitido: true },
  { papel: "TST", chave: "EXPORTAR_DADOS", permitido: false },
  { papel: "VISUALIZADOR", chave: "EXPORTAR_DADOS", permitido: false },
  { papel: "COLABORADOR", chave: "EXPORTAR_DADOS", permitido: false },

  { papel: "ADMIN", chave: "IMPORTAR_DADOS", permitido: true },
  { papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: false },
  { papel: "TST", chave: "IMPORTAR_DADOS", permitido: false },
  { papel: "VISUALIZADOR", chave: "IMPORTAR_DADOS", permitido: false },
  { papel: "COLABORADOR", chave: "IMPORTAR_DADOS", permitido: false },

  { papel: "ADMIN", chave: "RESTAURAR_DEMO", permitido: true },
  { papel: "GESTOR", chave: "RESTAURAR_DEMO", permitido: false },
  { papel: "TST", chave: "RESTAURAR_DEMO", permitido: false },
  { papel: "VISUALIZADOR", chave: "RESTAURAR_DEMO", permitido: false },
  { papel: "COLABORADOR", chave: "RESTAURAR_DEMO", permitido: false },

  { papel: "ADMIN", chave: "CONFIGURAR_ROTA_SEGURA", permitido: true },
  { papel: "GESTOR", chave: "CONFIGURAR_ROTA_SEGURA", permitido: false },
  { papel: "TST", chave: "CONFIGURAR_ROTA_SEGURA", permitido: false },
  { papel: "VISUALIZADOR", chave: "CONFIGURAR_ROTA_SEGURA", permitido: false },
  { papel: "COLABORADOR", chave: "CONFIGURAR_ROTA_SEGURA", permitido: false },

  { papel: "ADMIN", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA", permitido: true },
  { papel: "GESTOR", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA", permitido: true },
  { papel: "TST", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA", permitido: true },
  { papel: "VISUALIZADOR", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA", permitido: false },
  { papel: "COLABORADOR", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA", permitido: false },

  { papel: "ADMIN", chave: "LANCAR_AVALIACAO_ROTA_SEGURA", permitido: true },
  { papel: "GESTOR", chave: "LANCAR_AVALIACAO_ROTA_SEGURA", permitido: false },
  { papel: "TST", chave: "LANCAR_AVALIACAO_ROTA_SEGURA", permitido: true },
  { papel: "VISUALIZADOR", chave: "LANCAR_AVALIACAO_ROTA_SEGURA", permitido: false },
  { papel: "COLABORADOR", chave: "LANCAR_AVALIACAO_ROTA_SEGURA", permitido: false },

  { papel: "ADMIN", chave: "DECIDIR_COMITE_ROTA_SEGURA", permitido: true },
  { papel: "GESTOR", chave: "DECIDIR_COMITE_ROTA_SEGURA", permitido: true },
  { papel: "TST", chave: "DECIDIR_COMITE_ROTA_SEGURA", permitido: false },
  { papel: "VISUALIZADOR", chave: "DECIDIR_COMITE_ROTA_SEGURA", permitido: false },
  { papel: "COLABORADOR", chave: "DECIDIR_COMITE_ROTA_SEGURA", permitido: false },

  { papel: "ADMIN", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA", permitido: true },
  { papel: "GESTOR", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA", permitido: false },
  { papel: "TST", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA", permitido: false },
  { papel: "VISUALIZADOR", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA", permitido: false },
  { papel: "COLABORADOR", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA", permitido: false },
];

module.exports = { DEFAULT_PERMISSOES };
