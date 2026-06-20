const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const prisma = require("./db");
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const funcionariosRoutes = require("./routes/funcionarios.routes");
const tarefasRoutes = require("./routes/tarefas.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const relatoriosRoutes = require("./routes/relatorios.routes");
const ajudaRoutes = require("./routes/ajuda.routes");
const dataRoutes = require("./routes/data.routes");
const permissoesRoutes = require("./routes/permissoes.routes");
const notificacoesRoutes = require("./routes/notificacoes.routes");
const auditoriaRoutes = require("./routes/auditoria.routes");
const atendimentoOSRoutes = require("./routes/atendimentoOS.routes");
const viagensRoutes = require("./routes/viagens.routes");
const { converterOSAtrasadas } = require("./utils/osConverter");
const { sistema: configuracaoSistemaRoutes, cadastros: cadastrosRoutes } = require("./routes/configuracoes.routes");
const {
  treinamentos, inspecoes, auditorias, achados, planosAcao, rotasSeguras, anexos
} = require("./routes/programas.routes");
const {
  edicoes: rsEdicoes,
  propostas: rsPropostas,
  criterios: rsCriterios,
  regras: rsRegras,
  premiacoes: rsPremiacoes,
  equipes: rsEquipes,
  colaboradores: rsColaboradores,
  avaliacoes: rsAvaliacoes,
  comite: rsComite,
  penalidades: rsPenalidades,
  ranking: rsRanking,
  dashboard: rsDashboard,
  relatorios: rsRelatorios
} = require("./routes/rotaSegura2026.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ----- API -----
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/tarefas", tarefasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/ajuda", ajudaRoutes);
app.use("/api/dados", dataRoutes);
app.use("/api/permissoes", permissoesRoutes);
app.use("/api/notificacoes", notificacoesRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/atendimentos-os", atendimentoOSRoutes);
app.use("/api/viagens", viagensRoutes);
app.use("/api/configuracoes/sistema", configuracaoSistemaRoutes);
app.use("/api/cadastros", cadastrosRoutes);
app.use("/api/treinamentos", treinamentos);
app.use("/api/inspecoes", inspecoes);
app.use("/api/auditorias", auditorias);
app.use("/api/achados", achados);
app.use("/api/planos-acao", planosAcao);
app.use("/api/rotas-seguras", rotasSeguras);
app.use("/api/anexos", anexos);
app.use("/api/rota-segura/edicoes", rsEdicoes);
app.use("/api/rota-segura/propostas", rsPropostas);
app.use("/api/rota-segura/criterios", rsCriterios);
app.use("/api/rota-segura/regras", rsRegras);
app.use("/api/rota-segura/premiacoes", rsPremiacoes);
app.use("/api/rota-segura/equipes", rsEquipes);
app.use("/api/rota-segura/colaboradores", rsColaboradores);
app.use("/api/rota-segura/avaliacoes", rsAvaliacoes);
app.use("/api/rota-segura/comite", rsComite);
app.use("/api/rota-segura/penalidades", rsPenalidades);
app.use("/api/rota-segura/ranking", rsRanking);
app.use("/api/rota-segura/dashboard", rsDashboard);
app.use("/api/rota-segura/relatorios", rsRelatorios);

// Converte OS atrasadas de semanas anteriores em tarefas (executa no startup).
converterOSAtrasadas().catch((err) =>
  console.error("[osConverter] Falha no startup:", err.message)
);

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok" });
  } catch (err) {
    console.error("Health check - falha na conexao com o banco:", err);
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

// ----- Frontend estatico -----
const publicDir = path.join(__dirname, "..", "web", "dist");

if (!fs.existsSync(path.join(publicDir, "index.html"))) {
  console.error(`[ERRO] web/dist/index.html nao encontrado em: ${publicDir}`);
  console.error("[ERRO] Execute: npm run build");
}

app.use(express.static(publicDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const indexPath = path.join(publicDir, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[ERRO] Falha ao servir ${indexPath}:`, err.message);
      res.status(503).json({
        error: "Frontend nao encontrado. Execute: npm run build",
        path: indexPath,
      });
    }
  });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (err?.code === "P2025") {
    return res.status(404).json({ error: "Registro nao encontrado." });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({ error: "Ja existe um registro com esses dados (conflito de unicidade)." });
  }
  if (err?.code === "P2003") {
    return res.status(409).json({ error: "Este registro esta em uso por outros dados e nao pode ser removido/alterado." });
  }
  res.status(500).json({ error: "Erro interno no servidor." });
});

module.exports = app;
