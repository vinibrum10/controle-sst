import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export function HomePlaceholder() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text p-6">
      <div className="max-w-md text-center grid gap-4">
        <h1 className="text-2xl font-extrabold">Controle SST</h1>
        <p className="text-muted">
          Login realizado com sucesso, {usuario?.nome}. As demais telas (layout, dashboard, etc.) ainda serão
          migradas para React nas próximas etapas.
        </p>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </div>
    </div>
  );
}
