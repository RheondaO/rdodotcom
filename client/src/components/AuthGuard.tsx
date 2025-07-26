import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, User, Lock, ExternalLink } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  action?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, action = "perform this action", fallback }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Lock className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#17111d] border">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Admin Access</span>
            </div>
            <Badge variant="outline" className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
              Required
            </Badge>
          </div>
          
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            To {action}, you need to be logged in as an admin user.
          </p>
          
          <Button 
            onClick={() => window.open('/admin', '_blank')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Admin Login
          </Button>
          
          <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
            After logging in, return here and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export function AuthStatus() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
        Checking...
      </Badge>
    );
  }

  if (isAuthenticated && isAdmin) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Admin
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
      Not Authenticated
    </Badge>
  );
}