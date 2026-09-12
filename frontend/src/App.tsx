import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSiteSettings } from "@/hooks/usePortfolioData";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/Admin";

const queryClient = new QueryClient();

const AppShell = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const theme = settings.theme || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.documentElement.lang = settings.language || "en";
    localStorage.setItem("portfolio-theme", theme);
  }, [settings.theme, settings.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index/>}/>
        <Route path="/admin" element={<AdminPage/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster/>
      <AppShell/>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
