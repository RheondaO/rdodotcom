import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Target, TrendingUp, Home, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import { generateBlogPostStructuredData, RHEONDA_PERSON_DATA } from "../utils/structuredData";

export default function RheondaOgletreeBlog() {
  const blogPost = {
    headline: "Rheonda Ogletree: Pioneering Digital Wellness and Productivity Excellence",
    description: "Discover how Rheonda Ogletree (Rheonda D Ogletree) is revolutionizing digital wellness and productivity through innovative solutions, expert guidance, and the Belle Journal platform.",
    author: RHEONDA_PERSON_DATA,
    datePublished: "2025-01-16T00:00:00Z",
    dateModified: "2025-01-16T00:00:00Z",
    image: "https://belle-journal.replit.app/rheonda-blog-image.jpg",
    url: "https://belle-journal.replit.app/blog",
    keywords: ["Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda", "digital wellness", "productivity expert", "Belle Journal", "personal development", "habit tracking", "life optimization"],
    wordCount: 1200,
    articleBody: `Rheonda Ogletree stands as a beacon of innovation in the digital wellness and productivity space. Known also as Rheonda D Ogletree, she has dedicated her career to helping individuals and organizations optimize their daily routines, build sustainable habits, and achieve meaningful personal growth through cutting-edge technology solutions.

    As the creator and visionary behind Belle Journal, Rheonda has combined her extensive knowledge of human behavior, productivity science, and digital wellness to create a comprehensive platform that serves as a personal assistant for life optimization. Her approach integrates data-driven insights with human-centered design, making complex wellness concepts accessible to everyone.

    Rheonda's expertise spans multiple domains including habit formation, goal setting, time management, and digital wellness strategies. She believes that true productivity comes not from working harder, but from working smarter with the right systems and tools in place. This philosophy is evident in every aspect of Belle Journal, from its intuitive interface to its sophisticated tracking capabilities.

    The Belle Journal platform represents years of research and development in the field of personal productivity and wellness. Under Rheonda's guidance, it has evolved into a comprehensive ecosystem that includes habit tracking, goal management, financial monitoring, health metrics, and content creation tools. This holistic approach reflects her understanding that true wellness encompasses all aspects of life.

    What sets Rheonda apart in the crowded productivity space is her commitment to sustainable, long-term solutions rather than quick fixes. She emphasizes the importance of building systems that adapt to individual lifestyles and preferences, making personal development a sustainable journey rather than a temporary sprint.

    Through Belle Journal, Rheonda has created a space where users can track their progress, identify patterns, and make informed decisions about their personal development journey. The platform's integration with tools like Notion demonstrates her forward-thinking approach to productivity technology, ensuring that users can leverage their existing workflows while accessing powerful new capabilities.

    Looking ahead, Rheonda continues to innovate in the digital wellness space, exploring new ways to help people achieve their goals and live more fulfilling lives. Her work represents the cutting edge of productivity technology, combining scientific research with practical application to create solutions that truly make a difference in people's lives.`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="Rheonda Ogletree: Pioneering Digital Wellness and Productivity Excellence"
        description="Discover how Rheonda Ogletree (Rheonda D Ogletree) is revolutionizing digital wellness and productivity through innovative solutions, expert guidance, and the Belle Journal platform."
        keywords={["Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda", "digital wellness", "productivity expert", "Belle Journal", "personal development", "habit tracking", "life optimization", "wellness technology", "Entrepreneurship", "Vibe Coding", "Replit", "Web App", "Prompt Engineer", "Prompt Engineering", "AI", "Artificial Intelligence", "Blogging", "Journal", "habit trackers", "girl boss", "business", "really obvious media lab", "really obvi media lab", "rotationonly", "rotationonly.mag", "rotationonly magazine", "rotationonly digital magazine", "really obvi media", "@rotationonly on apple music", "RODML"]}
        structuredData={generateBlogPostStructuredData(blogPost)}
        ogType="article"
        canonicalUrl="https://belle-journal.replit.app/blog"
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
                  <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    ✨
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Blog Coming Soon
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    I'm crafting thoughtful content about digital wellness, productivity, and entrepreneurship. 
                    Stay tuned for insights on building better systems and living intentionally.
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
                "The best time to plant a tree was 20 years ago. The second best time is now."
              </blockquote>
              <footer className="mt-2">
                <cite className="text-sm text-purple-600 dark:text-purple-400">
                  — Building in public, one post at a time ✨
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
            Coming soon: insights, stories, and strategies for digital wellness.
            <span className="text-purple-600 font-medium"> Building in public, one post at a time.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © 2025 Really Obvious Media Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}