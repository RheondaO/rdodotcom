/**
 * Centralized constants for dropdown options to ensure consistency
 * between frontend UI, backend validation, and storage
 */

// Page options for @rotationonly platform
export const PAGE_OPTIONS = [
  '@rotationonly.mag',
  '@rotationonly.ext',
  '@rotationonly.stem',
  '@rotationonly.art',
  '@rotationonly.sci',
  '@rotationonly.tech'
] as const;

export type PageOption = typeof PAGE_OPTIONS[number];

// Moon phase options
export const MOON_PHASE_OPTIONS = [
  'None',
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Third Quarter',
  'Waning Crescent'
] as const;

export type MoonPhaseOption = typeof MOON_PHASE_OPTIONS[number];

// Mapping between display labels and backend values for moon phases
export const MOON_PHASE_DISPLAY_TO_BACKEND: Record<string, string | null> = {
  'None': null,
  'New Moon': 'new_moon',
  'Waxing Crescent': 'waxing_crescent',
  'First Quarter': 'first_quarter',
  'Waxing Gibbous': 'waxing_gibbous',
  'Full Moon': 'full_moon',
  'Waning Gibbous': 'waning_gibbous',
  'Third Quarter': 'last_quarter',
  'Waning Crescent': 'waning_crescent'
};

// Mini-game block titles (Square Type options)
export const MINI_GAME_TITLES = [
  'Morning Motivation Series',
  'Astro Insights',
  'Creative Experiments', 
  'Personal Stories',
  'Community Challenges',
  'Tutorial Tuesdays'
] as const;

export type MiniGameTitle = typeof MINI_GAME_TITLES[number];

// Backend validation for moon phases (matching backend enum)
export const MOON_PHASE_BACKEND_VALUES = [
  'new_moon',
  'first_quarter', 
  'full_moon',
  'last_quarter',
  'waxing_crescent',
  'waxing_gibbous',
  'waning_gibbous',
  'waning_crescent'
] as const;

export type MoonPhaseBackendValue = typeof MOON_PHASE_BACKEND_VALUES[number];

// Status options for scheduled content items
export const CONTENT_STATUS_OPTIONS = [
  'scheduled',
  'created',
  'published',
  'failed'
] as const;

export type ContentStatusOption = typeof CONTENT_STATUS_OPTIONS[number];