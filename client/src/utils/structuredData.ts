// Structured Data (JSON-LD) generators for better SEO and rich snippets

export interface PersonStructuredData {
  name: string;
  alternateName?: string[];
  jobTitle?: string;
  description?: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  worksFor?: {
    name: string;
    url?: string;
  };
  knowsAbout?: string[];
  alumniOf?: string[];
  awards?: string[];
}

export interface WebsiteStructuredData {
  name: string;
  description: string;
  url: string;
  author: PersonStructuredData;
  publisher: PersonStructuredData;
  keywords?: string[];
  inLanguage?: string;
  copyrightYear?: number;
  copyrightHolder?: string;
}

export interface BlogPostStructuredData {
  headline: string;
  description: string;
  author: PersonStructuredData;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  wordCount?: number;
  articleBody?: string;
  publisher?: {
    name: string;
    logo?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export function generatePersonStructuredData(person: PersonStructuredData) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    alternateName: person.alternateName,
    jobTitle: person.jobTitle,
    description: person.description,
    url: person.url,
    image: person.image,
    sameAs: person.sameAs,
    worksFor: person.worksFor ? {
      "@type": "Organization",
      name: person.worksFor.name,
      url: person.worksFor.url
    } : undefined,
    knowsAbout: person.knowsAbout,
    alumniOf: person.alumniOf?.map(school => ({
      "@type": "Organization",
      name: school
    })),
    award: person.awards
  };
}

export function generateWebsiteStructuredData(website: WebsiteStructuredData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: website.name,
    description: website.description,
    url: website.url,
    author: generatePersonStructuredData(website.author),
    publisher: generatePersonStructuredData(website.publisher),
    keywords: website.keywords,
    inLanguage: website.inLanguage || "en-US",
    copyrightYear: website.copyrightYear,
    copyrightHolder: website.copyrightHolder,
    potentialAction: {
      "@type": "SearchAction",
      target: `${website.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateBlogPostStructuredData(blogPost: BlogPostStructuredData) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blogPost.headline,
    description: blogPost.description,
    author: generatePersonStructuredData(blogPost.author),
    datePublished: blogPost.datePublished,
    dateModified: blogPost.dateModified || blogPost.datePublished,
    image: blogPost.image,
    url: blogPost.url,
    keywords: blogPost.keywords,
    wordCount: blogPost.wordCount,
    articleBody: blogPost.articleBody,
    publisher: blogPost.publisher ? {
      "@type": "Organization",
      name: blogPost.publisher.name,
      logo: blogPost.publisher.logo ? {
        "@type": "ImageObject",
        url: blogPost.publisher.logo.url,
        width: blogPost.publisher.logo.width,
        height: blogPost.publisher.logo.height
      } : undefined
    } : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogPost.url
    }
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Belle Journal",
    description: "Digital wellness and productivity platform by Rheonda Ogletree",
    url: typeof window !== 'undefined' ? window.location.origin : "",
    founder: {
      "@type": "Person",
      name: "Rheonda Ogletree",
      alternateName: ["Rheonda D Ogletree", "Rheonda"],
      jobTitle: "Digital Wellness & Productivity Expert",
      description: "Leading expert in digital wellness and productivity optimization"
    },
    sameAs: [
      "https://twitter.com/RheondaOgletree",
      "https://linkedin.com/in/rheonda-ogletree",
      "https://instagram.com/rheonda.ogletree"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English"
    }
  };
}

// Default structured data for Rheonda Ogletree
export const RHEONDA_PERSON_DATA: PersonStructuredData = {
  name: "Rheonda Ogletree",
  alternateName: ["Rheonda D Ogletree", "Rheonda"],
  jobTitle: "Digital Wellness & Productivity Expert, Entrepreneur, Prompt Engineer",
  description: "Leading expert in digital wellness, productivity optimization, and personal development. Creator of Belle Journal - a comprehensive platform for life optimization and habit tracking. Entrepreneur behind Really Obvious Media Lab and rotationonly digital magazine.",
  url: typeof window !== 'undefined' ? window.location.origin : "",
  image: "/profile-image.jpg",
  sameAs: [
    "https://twitter.com/RheondaOgletree",
    "https://linkedin.com/in/rheonda-ogletree",
    "https://instagram.com/rheonda.ogletree",
    "https://facebook.com/rheonda.ogletree",
    "https://music.apple.com/artist/rotationonly"
  ],
  worksFor: {
    name: "Really Obvious Media Lab",
    url: typeof window !== 'undefined' ? window.location.origin : ""
  },
  knowsAbout: [
    "Digital Wellness",
    "Productivity Optimization",
    "Personal Development",
    "Habit Tracking",
    "Life Coaching",
    "Wellness Consulting",
    "Task Management",
    "Goal Setting",
    "Time Management",
    "Mindfulness",
    "Work-Life Balance",
    "Entrepreneurship",
    "Vibe Coding",
    "Replit Development",
    "Web App Development",
    "Prompt Engineering",
    "AI",
    "Artificial Intelligence",
    "Blogging",
    "Journal Writing",
    "Habit Trackers",
    "Girl Boss",
    "Business Development",
    "Digital Magazine Publishing",
    "Content Creation",
    "Media Production"
  ],
  awards: [
    "Digital Wellness Pioneer Award",
    "Top Productivity Expert 2024"
  ]
};

export const BELLE_JOURNAL_WEBSITE_DATA: WebsiteStructuredData = {
  name: "Belle Journal - Rheonda Ogletree",
  description: "Your comprehensive digital wellness and productivity platform. Track habits, manage goals, and optimize your life with expert guidance from Rheonda Ogletree. Built with Replit and featuring AI-powered insights.",
  url: typeof window !== 'undefined' ? window.location.origin : "",
  author: RHEONDA_PERSON_DATA,
  publisher: RHEONDA_PERSON_DATA,
  keywords: [
    "Rheonda Ogletree",
    "Rheonda D Ogletree", 
    "Rheonda",
    "digital wellness",
    "productivity",
    "habit tracking",
    "personal development",
    "life optimization",
    "wellness platform",
    "Belle Journal",
    "Entrepreneurship",
    "Vibe Coding",
    "Replit",
    "Web App",
    "Prompt Engineer",
    "Prompt Engineering",
    "AI",
    "Artificial Intelligence",
    "Blogging",
    "Journal",
    "habit trackers",
    "girl boss",
    "business",
    "really obvious media lab",
    "really obvi media lab",
    "rotationonly",
    "rotationonly.mag",
    "rotationonly magazine",
    "rotationonly digital magazine",
    "really obvi media",
    "@rotationonly on apple music",
    "RODML"
  ],
  inLanguage: "en-US",
  copyrightYear: new Date().getFullYear(),
  copyrightHolder: "Rheonda Ogletree"
};