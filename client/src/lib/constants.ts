// Content status constants for content management
export const CONTENT_STATUSES = {
  IDEA: 'idea',
  PLANNING: 'planning',
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export type ContentStatus = typeof CONTENT_STATUSES[keyof typeof CONTENT_STATUSES];

// Content priority levels
export const CONTENT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type ContentPriority = typeof CONTENT_PRIORITIES[keyof typeof CONTENT_PRIORITIES];

// Platform constants
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  BLOG: 'blog',
  EMAIL: 'email'
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

// Content type categories
export const CONTENT_CATEGORIES = {
  SOCIAL: 'social',
  BLOG: 'blog',
  VIDEO: 'video',
  EMAIL: 'email',
  MARKETING: 'marketing',
  EDUCATIONAL: 'educational',
  ENTERTAINMENT: 'entertainment'
} as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[keyof typeof CONTENT_CATEGORIES];