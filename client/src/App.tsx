import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import PublicView from "@/pages/PublicView";
import AuthCheck from "@/pages/AuthCheck";
import NotFoundPage from "@/pages/not-found";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: authStatus, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        return { authenticated: false, isAdmin: false };
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authStatus?.authenticated || !authStatus?.isAdmin) {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Switch>
          <Route path="/" component={PublicView} />
          <Route path="/admin">
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          </Route>
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

export default App;