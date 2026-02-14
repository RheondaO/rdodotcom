/**
 * Centralized constants for dropdown options to ensure consistency
 * between frontend UI, backend validation, and storage
 */

// Page options for @rotationonly platform
export const PAGE_OPTIONS = [
  '@rotationonly.mag',
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
  'Void of Course',
  'Sun Sign'
] as const;

export type MoonPhaseOption = typeof MOON_PHASE_OPTIONS[number];

// Mapping between display labels and backend values for moon phases
export const MOON_PHASE_DISPLAY_TO_BACKEND: Record<string, string | null> = {
  'None': 'None',
  'New Moon': 'New Moon',
  'Waxing Crescent': 'Waxing Crescent',
  'First Quarter': 'First Quarter',
  'Waxing Gibbous': 'Waxing Gibbous',
  'Full Moon': 'Full Moon',
  'Waning Gibbous': 'Waning Gibbous',
  'Third Quarter': 'Last Quarter',
  'Waning Crescent': 'Waning Crescent',
  'Sun Sign': 'Sun Sign'
};

// Mini-game block titles (Square Type options)
export const MINI_GAME_TITLES = [
  'Administration',
  'Definitions & Intros',
  'Moon Cycle',
  '**An Elevated Edit',
  'Angel Numbers',
  'AttractionLabs',
  '@XXXDotEdu',
  'Backchannel: Unfiltered; Unposted',
  '**Booth Report',
  'Console Clairvoyance',
  'CoreFitt',
  'Cupids Carousel',
  'Edge Theory',
  'Energetic Portals I',
  'Energetic Portals II',
  'Energetic Portals III',
  'Energy Audit',
  'FearFactory',
  'FreekyFridazeLive',
  '**GayDay 3D',
  '**Glow Mode',
  'Inner Chemistry',
  'Intent Quest',
  'Knowledge Academy',
  'Love at First Sight',
  'Love Check Up',
  'Lucky && Blessed',
  'OkieMaps',
  'Order && Ontology',
  '**One Thought',
  '**One Word',
  'Pick-A-Card',
  'Po$iAffirmation$tation',
  'Magic Rocks!',
  'Mindful Maze',
  'Mindful Maze Express',
  'Mysterium Tremendum',
  'Nite Skool I',
  'Nite Skool II',
  'Queer Check In',
  'Quiet Momentum',
  'Risky Biz',
  'Safe XXX Saturdaze',
  'Say Something Nice',
  'Seasons',
  'She Stays On My Mind',
  'Should I Text Them?',
  'Social Experiment',
  'Stats && Strats',
  'Stretch Lab',
  'Sun Sign Info Card',
  'Tarot of The Month',
  '**The 100 Club',
  'The Ethics of Survival',
  'The Guide',
  'The Hypocrisy',
  'The Texting Game',
  'The Way He Makes Me Feel',
  'The Void Window',
  'ThiccFitt',
  'ThirstyThurdaze',
  'V Feminine Reminder',
  'Weekly Music Wrap Up',
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
  'Waxing Gibbous',
  'waning_gibbous',
  'waning_crescent',
  'Sun Signs'
] as const;

export type MoonPhaseBackendValue = typeof MOON_PHASE_BACKEND_VALUES[number];

// Status options for scheduled content items
export const CONTENT_STATUS_OPTIONS = [
  'Not Started',
  'Wrote',
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