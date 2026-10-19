import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { registerSW } from 'virtual:pwa-register';

import App from "./App";
import { theme } from "./theme";
import "./index.css";

// зачем: регистрируем SW (autoUpdate активирует новый SW автоматически)
registerSW({ immediate: true });

// зачем: autoUpdate активирует новый SW, но страница живёт на старом коде — перезагружаемся сами
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (!refreshing) {
    refreshing = true;
    window.location.reload();
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);