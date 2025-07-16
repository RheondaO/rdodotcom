import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Home, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">✨</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Belle Journal
              </h1>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Sparkles Animation */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-4 text-purple-400 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="absolute -top-2 -right-6 text-pink-400 animate-bounce">
              <Star className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 left-8 text-orange-400 animate-pulse delay-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-2 -right-4 text-purple-400 animate-bounce delay-500">
              <Star className="h-8 w-8" />
            </div>
            
            {/* Main 404 Display */}
            <Card className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-xl border border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-12">
                <div className="mb-6">
                  <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    404
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Oops! Page Not Found
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    The page you're looking for seems to have wandered off into the digital cosmos. 
                    Don't worry, it happens to the best of us!
                  </p>
                </div>

                {/* Sparkle Decorations */}
                <div className="flex justify-center items-center gap-4 mb-8">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-400"></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-600"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Meet the Admin
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inspirational Quote */}
          <div className="mt-12">
            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-purple-200/30 dark:border-purple-800/30">
              <blockquote className="text-lg font-light text-gray-700 dark:text-gray-200 italic">
                "Not all who wander are lost... but this page definitely is."
              </blockquote>
              <footer className="mt-2">
                <cite className="text-sm text-purple-600 dark:text-purple-400">
                  — With love from Belle Journal ✨
                </cite>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lost but not forgotten. 
            <span className="text-purple-600 font-medium"> Building in public, one page at a time.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © 2025 Really Obvious Media Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
