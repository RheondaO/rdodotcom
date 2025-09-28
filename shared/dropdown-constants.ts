/**
 * Centralized constants for dropdown options to ensure consistency
 * between frontend UI, backend validation, and storage
 */

// Page options for @rotationonly platform
export const PAGE_OPTIONS = [
  '@rotationonly.mag',
  '@rotationonly.biz',
  '@rotationonly.stem',
  '@rotationonly.ext',
  '@rotationonly.music',
  '@rotationonly.xxx',
  '@rotationonly.ceo'
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
  'Waning Crescent',
  'Sun Sign'
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
  'Waning Crescent': 'waning_crescent',
  'Sun Sign': 'sun_sign'
};

// Mini-game block titles (Square Type options)
export const MINI_GAME_TITLES = [
  'Administration',
  'An Elevated Edit',
  'Angel Numbers', 
  '@XXXDotEdu',
  'Backchannel: Unfiltered; Unposted',
  'Booth Report',
  'Definitions & Introductions',
  'FearFactory',
  'FreekyFridazeLive',
  'Moon Cycle Message',
  'GayDay 3D',
  'Glow Mode',
  'Intent Quest',
  'Lucky && Blessed',
  'Numerology',
  'OkieMaps',
  'One Thought',
  'One Word',
  'PickACard',
  'Portal Message',
  'Portal Word Bank',
  'Quarterly Message',
  'Rock It!',
  'Safe XXX Saturdaze',
  'Say Something Nice',
  'She Stays On My Mind',
  'Sun Signs',
  'The 100 Club',
  'The Guide',
  'The Way He Makes Me Feel',
  'ThiccFitt',
  'ThirstyThurdaze',
  'Word of the Week',
  'Writing Quest',
  'Wrong Turn Friend',
  '4x2 Laws of Maat'
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
  'waning_crescent',
  'sun_signs'
] as const;

export type MoonPhaseBackendValue = typeof MOON_PHASE_BACKEND_VALUES[number];

// Status options for scheduled content items
export const CONTENT_STATUS_OPTIONS = [
  'Not Started',
  'Scheduled',
  'Design',
  'Review',
  'Published',
  'Cancelled'
] as const;

export type ContentStatusOption = typeof CONTENT_STATUS_OPTIONS[number];

// Zodiac sign options
export const ZODIAC_SIGN_OPTIONS = [
  'None',
  'Aries',
  'Taurus', 
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const;

export type ZodiacSignOption = typeof ZODIAC_SIGN_OPTIONS[number];