import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppSelector } from "./app/hooks";
import { Router } from "./Router";
import { useEffect } from "react";

function ThemeApplier({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((s) => s.theme.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className={
        theme === "dark"
          ? "dark min-h-dvh bg-custom-bg text-custom-text"
          : "min-h-dvh bg-custom-bg text-custom-text"
      }
    >
      {children}
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeApplier>
          <Router />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--surface-elevated)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                boxShadow:
                  "0 10px 30px rgba(2, 6, 23, 0.12), 0 2px 10px rgba(2, 6, 23, 0.08)",
              },
              success: {
                iconTheme: {
                  primary: "var(--success)",
                  secondary: "var(--surface-elevated)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--danger)",
                  secondary: "var(--surface-elevated)",
                },
              },
            }}
          />
        </ThemeApplier>
      </BrowserRouter>
    </Provider>
  );
}
