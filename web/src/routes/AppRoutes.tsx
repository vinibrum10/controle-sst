import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CriarTarefaPage } from "../pages/CriarTarefaPage";
import { ExecucaoPage } from "../pages/ExecucaoPage";
import { FuncionariosPage } from "../pages/FuncionariosPage";
import { AjudaPage } from "../pages/AjudaPage";
import { RotaSeguraPage } from "../pages/RotaSeguraPage";
import { TreinamentosPage } from "../pages/TreinamentosPage";
import { InspecoesPage } from "../pages/InspecoesPage";
import { DadosPage } from "../pages/DadosPage";
import { ConfiguracoesPage } from "../pages/ConfiguracoesPage";
import { ProtectedRoute } from "./ProtectedRoute";
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tarefas/criar" element={<CriarTarefaPage />} />
        <Route path="/tarefas/executar" element={<ExecucaoPage />} />
        <Route path="/funcionarios" element={<FuncionariosPage />} />
        <Route path="/ajuda" element={<AjudaPage />} />
        <Route path="/programas/rota-segura" element={<RotaSeguraPage />} />
        <Route path="/treinamentos" element={<TreinamentosPage />} />
        <Route path="/inspecoes" element={<InspecoesPage />} />
        <Route path="/dados" element={<DadosPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
      </Route>
    </Routes>
  );
}
