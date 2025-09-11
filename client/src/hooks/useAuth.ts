import { useQuery } from "@tanstack/react-query";

interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    username: string;
    profileImage: string;
  };
  isAdmin: boolean;
}

export function useAuth() {
  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: true
  });

  return {
    user: authStatus?.user,
    isLoading,
    isAuthenticated: authStatus?.authenticated || false,
    isAdmin: authStatus?.isAdmin || false,
  };
}