require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const prisma = require("./db");
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const funcionariosRoutes = require("./routes/funcionarios.routes");
const tarefasRoutes = require("./routes/tarefas.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const ajudaRoutes = require("./routes/ajuda.routes");
const dataRoutes = require("./routes/data.routes");
const {
  treinamentos, inspecoes, auditorias, achados, planosAcao, rotasSeguras, anexos
} = require("./routes/programas.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ----- API -----
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/tarefas", tarefasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ajuda", ajudaRoutes);
app.use("/api/dados", dataRoutes);
app.use("/api/treinamentos", treinamentos);
app.use("/api/inspecoes", inspecoes);
app.use("/api/auditorias", auditorias);
app.use("/api/achados", achados);
app.use("/api/planos-acao", planosAcao);
app.use("/api/rotas-seguras", rotasSeguras);
app.use("/api/anexos", anexos);

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
app.use(express.static(publicDir));

// SPA fallback (rotas com hash sao tratadas no front-end)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

// ----- Tratamento de erros -----
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (err?.code === "P2025") {
    return res.status(404).json({ error: "Registro nao encontrado." });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({ error: "Ja existe um registro com esses dados (conflito de unicidade)." });
  }
  res.status(500).json({ error: "Erro interno no servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Controle SST rodando na porta ${PORT}`);
});
