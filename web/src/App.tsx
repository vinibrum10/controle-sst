import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppearanceProvider } from "./contexts/AppearanceContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRoutes } from "./routes/AppRoutes";
import { IconSprite } from "./components/ui/IconSprite";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppearanceProvider>
          <AuthProvider>
            <PermissionsProvider>
              <ToastProvider>
                <IconSprite />
                <AppRoutes />
              </ToastProvider>
            </PermissionsProvider>
          </AuthProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
