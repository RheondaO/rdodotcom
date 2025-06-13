
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Shield, User, AlertCircle } from "lucide-react";

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

export default function AuthCheck() {
  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Authentication Status
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Check your login status and permissions
            </p>
          </div>

          <Card className="border-purple-100 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
              <CardDescription>
                Current login and permission status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Authentication Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Logged In</span>
                </div>
                <Badge variant={authStatus?.authenticated ? "default" : "destructive"}>
                  {authStatus?.authenticated ? "Yes" : "No"}
                </Badge>
              </div>

              {/* Admin Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Admin Access</span>
                </div>
                <Badge variant={authStatus?.isAdmin ? "default" : "secondary"}>
                  {authStatus?.isAdmin ? "Yes" : "No"}
                </Badge>
              </div>

              {/* User Info */}
              {authStatus?.user && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span>{authStatus.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Username:</span>
                      <span>@{authStatus.user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                      <span className="font-mono text-xs">{authStatus.user.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              <div className="space-y-3">
                {!authStatus?.authenticated && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You are not logged in. Only public content is accessible.</span>
                  </div>
                )}

                {authStatus?.authenticated && !authStatus?.isAdmin && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You are logged in but don't have admin access to the dashboard.</span>
                  </div>
                )}

                {authStatus?.isAdmin && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">You have full admin access to the dashboard!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  View Public Site
                </Button>
                {authStatus?.isAdmin && (
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex-1"
                  >
                    Access Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
