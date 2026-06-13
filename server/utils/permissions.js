const prisma = require("../db");

// Papeis de usuario validos (espelha o enum PapelUsuario do Prisma).
const PAPEIS = ["ADMIN", "GESTOR", "TST", "VISUALIZADOR", "COLABORADOR"];

// Chaves de permissao validas (espelha o enum ChavePermissao do Prisma).
const CHAVES_PERMISSAO = [
  "GERENCIAR_EQUIPE",
  "EXCLUIR_FUNCIONARIO",
  "GERENCIAR_PROGRAMAS_SST",
  "GERENCIAR_USUARIOS",
  "EXPORTAR_DADOS",
  "IMPORTAR_DADOS",
  "RESTAURAR_DEMO",
  "CONFIGURAR_ROTA_SEGURA",
  "GERENCIAR_EQUIPES_ROTA_SEGURA",
  "LANCAR_AVALIACAO_ROTA_SEGURA",
  "DECIDIR_COMITE_ROTA_SEGURA",
  "EXCLUIR_AVALIACAO_ROTA_SEGURA"
];

let matrizPromise = null;

// Monta a matriz { [papel]: { [chave]: boolean } } a partir do banco.
async function carregarMatriz() {
  const registros = await prisma.permissaoPerfil.findMany();

  const matriz = {};
  for (const papel of PAPEIS) {
    matriz[papel] = {};
    for (const chave of CHAVES_PERMISSAO) {
      matriz[papel][chave] = false;
    }
  }

  for (const registro of registros) {
    if (matriz[registro.papel]) {
      matriz[registro.papel][registro.chave] = registro.permitido;
    }
  }

  return matriz;
}

// Retorna a matriz de permissoes, carregando do banco na primeira chamada
// e reutilizando o resultado em memoria nas chamadas seguintes.
function getMatriz() {
  if (!matrizPromise) {
    matrizPromise = carregarMatriz().catch((err) => {
      matrizPromise = null;
      throw err;
    });
  }
  return matrizPromise;
}

// Forca o recarregamento da matriz na proxima chamada a getMatriz().
function invalidarMatriz() {
  matrizPromise = null;
}

// Restringe a rota aos papeis com a permissao "chave" habilitada na matriz.
function requirePermissao(chave) {
  return async (req, res, next) => {
    try {
      const matriz = await getMatriz();
      const permitido = req.user && matriz[req.user.papel]?.[chave];
      if (!permitido) {
        return res.status(403).json({ error: "Sem permissao para esta acao." });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { PAPEIS, CHAVES_PERMISSAO, carregarMatriz, getMatriz, invalidarMatriz, requirePermissao };
