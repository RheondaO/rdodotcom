
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sparkles, Home } from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";

export default function Custom404() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="404 - Page Not Found | Belle Journal"
        description="The page you're looking for doesn't exist. Return to Belle Journal for your digital wellness and productivity needs."
        noIndex={true}
      />
      
      {/* Floating sparkles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Sparkles 
              className="h-4 w-4 text-purple-400 dark:text-purple-300 opacity-60" 
              style={{
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-200 dark:border-purple-700 shadow-2xl">
        <CardContent className="pt-8 pb-6 text-center">
          {/* Main sparkle icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Sparkles className="h-10 w-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            404 ✨ Oops!
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            This page seems to have vanished into the digital cosmos
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            But don't worry, we'll help you find your way back to productivity paradise!
          </p>

          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
                <Home className="h-4 w-4 mr-2" />
                Return to Belle Journal
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <Sparkles className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Lost but not forgotten ✨
          </div>
        </CardContent>
      </Card>

      {/* Additional floating sparkles for extra magic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={`extra-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-pulse"></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
