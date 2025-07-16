import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Award, BookOpen, Target, TrendingUp, Users, Calendar } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "../components/SEOHead";
import { generatePersonStructuredData, RHEONDA_PERSON_DATA } from "../utils/structuredData";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="About Rheonda Ogletree - Digital Wellness & Productivity Expert"
        description="Learn about Rheonda Ogletree (Rheonda D Ogletree), a leading digital wellness and productivity expert. Discover her expertise in personal development, habit tracking, and life optimization."
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
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-white text-6xl">R</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Rheonda Ogletree
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Digital Wellness & Productivity Expert
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Also known as Rheonda D Ogletree
          </p>
        </div>

        {/* About Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                About Rheonda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Rheonda Ogletree</strong> is a pioneering digital wellness and productivity expert, entrepreneur, and prompt engineer who has dedicated her career to helping individuals optimize their personal and professional lives through innovative technology solutions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                As the creator of Belle Journal built on Replit with AI-powered insights, Rheonda has combined her expertise in personal development, habit formation, and digital wellness to create a comprehensive web app that empowers users to track their habits, build meaningful goals, and achieve sustainable growth.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Beyond Belle Journal, Rheonda is the entrepreneur behind <strong>Really Obvious Media Lab (RODML)</strong> and the <strong>rotationonly digital magazine</strong>, showcasing her expertise in blogging, content creation, and digital publishing. Her approach to "vibe coding" and business development has made her a recognized girl boss in the tech and wellness space.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                With extensive experience in AI, artificial intelligence, and prompt engineering, Rheonda specializes in helping people create sustainable systems for personal growth and life optimization through innovative habit trackers and productivity tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Mission & Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Mission:</strong> To empower individuals with the tools, insights, and guidance needed to create meaningful, sustainable changes in their daily lives through digital wellness solutions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Vision:</strong> A world where everyone has access to personalized, intelligent systems that support their journey toward optimal health, productivity, and personal fulfillment.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Approach:</strong> Combining data-driven insights with human-centered design to create intuitive, effective tools for personal transformation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expertise Areas */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Areas of Expertise
            </CardTitle>
            <CardDescription>
              Rheonda's specialized knowledge spans multiple domains of personal development and digital wellness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Digital Wellness & AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Helping people develop healthy relationships with technology through AI-powered insights and prompt engineering
                </p>
              </div>
              
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Entrepreneurship & Business</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Girl boss approach to building successful businesses including Really Obvious Media Lab and rotationonly magazine
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vibe Coding & Web Apps</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Creating innovative web applications on Replit with a focus on user experience and productivity optimization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services & Offerings */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Personal productivity consultations and habit trackers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Digital wellness coaching with AI-powered insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Entrepreneurship and business development through Really Obvious Media Lab</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Vibe coding and web app development on Replit</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Digital magazine publishing and content creation (rotationonly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">Prompt engineering and artificial intelligence consulting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                    2024
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300">Top Productivity Expert Recognition</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200">
                    2023
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300">Really Obvious Media Lab (RODML) Launch</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    2023
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300">Belle Journal Web App Launch (Built on Replit)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                    2022
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300">rotationonly Digital Magazine Launch</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    2022
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300">Certified AI & Prompt Engineering Specialist</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Connect with Rheonda</CardTitle>
            <CardDescription>
              Get in touch to learn more about digital wellness and productivity optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Professional Profiles</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>LinkedIn:</strong> linkedin.com/in/rheonda-ogletree
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Twitter:</strong> @RheondaOgletree
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Instagram:</strong> @rheonda.ogletree
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Apple Music:</strong> @rotationonly
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Really Obvi Media:</strong> Really Obvious Media Lab (RODML)
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Platforms & Projects</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Experience Belle Journal - the comprehensive digital wellness web app created by Rheonda Ogletree for personal growth and productivity optimization. Built with vibe coding on Replit, featuring AI-powered habit trackers and journal capabilities.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                  <strong>Also explore:</strong> Really Obvious Media Lab (RODML) for entrepreneurship resources and rotationonly digital magazine for cutting-edge content.
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Explore Belle Journal
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}