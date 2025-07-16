import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonicalUrl?: string;
  structuredData?: object;
  noindex?: boolean;
}

export default function SEOHead({
  title = "Rheonda Ogletree - Digital Wellness & Productivity Expert | Belle Journal",
  description = "Rheonda Ogletree is a leading digital wellness and productivity expert. Discover Belle Journal - your comprehensive platform for personal growth, habit tracking, and life optimization.",
  keywords = ["Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda", "digital wellness", "productivity expert", "Belle Journal", "personal development", "habit tracking", "life coach", "wellness consultant"],
  author = "Rheonda Ogletree",
  ogTitle,
  ogDescription,
  ogImage = "/og-image.jpg",
  ogUrl = typeof window !== 'undefined' ? window.location.href : "",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite = "@RheondaOgletree",
  twitterCreator = "@RheondaOgletree",
  canonicalUrl,
  structuredData,
  noindex = false
}: SEOHeadProps) {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));
    updateMetaTag('author', author);
    updateMetaTag('robots', noindex ? 'noindex,nofollow' : 'index,follow');
    
    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', ogUrl, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:site_name', 'Belle Journal - Rheonda Ogletree', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:site', twitterSite);
    updateMetaTag('twitter:creator', twitterCreator);
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl || ogUrl;
    
    // Structured Data (JSON-LD)
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (structuredDataScript) {
      structuredDataScript.remove();
    }
    
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
    
    // Additional meta tags for better indexing
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('theme-color', '#9333ea');
    updateMetaTag('msapplication-TileColor', '#9333ea');
    
    // Language and locale
    const htmlElement = document.documentElement;
    htmlElement.lang = 'en';
    updateMetaTag('og:locale', 'en_US', true);
    
  }, [title, description, keywords, author, ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterCard, twitterSite, twitterCreator, canonicalUrl, structuredData, noindex]);
  
  return null; // This component doesn't render anything visible
}