import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { SessionExpiredModal } from "./contexts/SessionExpiredModal";
import { AppRoutes } from "./routes/AppRoutes";
import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme();

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppRoutes />
            <SessionExpiredModal />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
