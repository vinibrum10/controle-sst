import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { DashboardOverviewPage } from "../pages/dashboard/DashboardOverviewPage";
import { DashboardTarefasPage } from "../pages/dashboard/DashboardTarefasPage";
import { DashboardRotaSeguraPage } from "../pages/dashboard/DashboardRotaSeguraPage";
import { DashboardTreinamentosPage } from "../pages/dashboard/DashboardTreinamentosPage";
import { DashboardInspecoesPage } from "../pages/dashboard/DashboardInspecoesPage";
import { CriarTarefaPage } from "../pages/CriarTarefaPage";
import { ExecucaoPage } from "../pages/ExecucaoPage";
import { FuncionariosPage } from "../pages/FuncionariosPage";
import { AjudaPage } from "../pages/AjudaPage";
import { RotaSeguraPage } from "../pages/RotaSeguraPage";
import { RotaSegura2026DashboardPage } from "../pages/rotaSegura2026/RotaSegura2026DashboardPage";
import { RotaSegura2026ConfiguracaoPage } from "../pages/rotaSegura2026/RotaSegura2026ConfiguracaoPage";
import { RotaSegura2026EquipesPage } from "../pages/rotaSegura2026/RotaSegura2026EquipesPage";
import { RotaSegura2026AvaliacoesPage } from "../pages/rotaSegura2026/RotaSegura2026AvaliacoesPage";
import { RotaSegura2026PenalidadesPage } from "../pages/rotaSegura2026/RotaSegura2026PenalidadesPage";
import { RotaSegura2026RankingPage } from "../pages/rotaSegura2026/RotaSegura2026RankingPage";
import { TreinamentosPage } from "../pages/TreinamentosPage";
import { InspecoesPage } from "../pages/InspecoesPage";
import { DadosPage } from "../pages/DadosPage";
import { RelatoriosPage } from "../pages/RelatoriosPage";
import { ConfiguracoesPage } from "../pages/ConfiguracoesPage";
import { UsuariosPage } from "../pages/UsuariosPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RequireRole } from "./RequireRole";
import { DEFAULT_PATH } from "../components/sidebar/navigation";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="tarefas" element={<DashboardTarefasPage />} />
          <Route path="rota-segura" element={<DashboardRotaSeguraPage />} />
          <Route path="treinamentos" element={<DashboardTreinamentosPage />} />
          <Route path="inspecoes" element={<DashboardInspecoesPage />} />
        </Route>
        <Route path="/tarefas/criar" element={<CriarTarefaPage />} />
        <Route path="/tarefas/executar" element={<ExecucaoPage />} />
        <Route path="/funcionarios" element={<FuncionariosPage />} />
        <Route path="/ajuda" element={<AjudaPage />} />
        <Route path="/programas/rota-segura" element={<RotaSeguraPage />} />
        <Route path="/programas/rota-segura-2026" element={<RotaSegura2026DashboardPage />} />
        <Route
          path="/programas/rota-segura-2026/configuracao"
          element={
            <RequireRole roles={["ADMIN"]}>
              <RotaSegura2026ConfiguracaoPage />
            </RequireRole>
          }
        />
        <Route path="/programas/rota-segura-2026/equipes" element={<RotaSegura2026EquipesPage />} />
        <Route path="/programas/rota-segura-2026/avaliacoes" element={<RotaSegura2026AvaliacoesPage />} />
        <Route path="/programas/rota-segura-2026/penalidades" element={<RotaSegura2026PenalidadesPage />} />
        <Route path="/programas/rota-segura-2026/ranking" element={<RotaSegura2026RankingPage />} />
        <Route path="/treinamentos" element={<TreinamentosPage />} />
        <Route path="/inspecoes" element={<InspecoesPage />} />
        <Route path="/dados" element={<DadosPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route
          path="/usuarios"
          element={
            <RequireRole roles={["ADMIN"]}>
              <UsuariosPage />
            </RequireRole>
          }
        />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
      </Route>
    </Routes>
  );
}
