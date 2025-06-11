import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import PublicView from "@/pages/PublicView";
import AuthCheck from "@/pages/AuthCheck";
import NotFoundPage from "@/pages/not-found";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: authStatus } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        return { authenticated: false, isAdmin: false };
      }
      return response.json();
    }
  });

  if (!authStatus?.isAdmin) {
    return <PublicView />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Switch>
          <Route path="/" component={PublicView} />
          <Route path="/dashboard">
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          </Route>
          <Route path="/auth-check" component={AuthCheck} />
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}