import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Award, BookOpen, Target, TrendingUp, Users, Calendar, Home, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import { generatePersonStructuredData, RHEONDA_PERSON_DATA } from "../utils/structuredData";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="About Rheonda Dorothy Ogletree - Admin & Prompt Engineer"
        description="Learn about Rheonda Dorothy Ogletree (RDO), admin and prompt engineer behind Belle Journal. Discover her expertise in AI, prompt engineering, and digital wellness innovation."
        keywords={["Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda", "about", "biography", "digital wellness expert", "productivity consultant", "personal development coach", "Belle Journal creator", "Entrepreneurship", "Vibe Coding", "Replit", "Web App", "Prompt Engineer", "Prompt Engineering", "AI", "Artificial Intelligence", "Blogging", "Journal", "habit trackers", "girl boss", "business", "really obvious media lab", "really obvi media lab", "rotationonly", "rotationonly.mag", "rotationonly magazine", "rotationonly digital magazine", "really obvi media", "@rotationonly on apple music", "RODML"]}
        structuredData={generatePersonStructuredData(RHEONDA_PERSON_DATA)}
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">✨</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Belle Journal
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
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
            
            {/* Main Coming Soon Display */}
            <Card className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-xl border border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-12">
                <div className="mb-6">
                  {/* Profile Circle with RDO */}
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                    <span className="text-white text-2xl font-serif">RDO</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Rheonda Dorothy Ogletree
                  </h1>
                  <p className="text-lg text-purple-600 dark:text-purple-400 mb-6">
                    Admin & Prompt Engineer
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Profile coming soon. I'm building something beautiful here - 
                    a space to share my journey in AI, prompt engineering, and digital wellness.
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
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Home className="mr-2 h-4 w-4" />
                      Explore Belle Journal
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Read the Blog
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
                "The future belongs to those who believe in the beauty of their dreams."
              </blockquote>
              <footer className="mt-2">
                <cite className="text-sm text-purple-600 dark:text-purple-400">
                  — Building in public, crafting with purpose ✨
                </cite>
              </footer>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with transparency and accountability in mind. 
            <span className="text-purple-600 font-medium"> Building in public, one day at a time.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © 2025 Really Obvious Media Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}