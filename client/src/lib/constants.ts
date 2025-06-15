// Constants for Belle Journal App
// Remove all app development suite related constants as they are no longer needed

export const SIDEBAR_SECTIONS = [
  'productivity',
  'health',
  'finance',
  'grocery',
  'habits',
  'goals',
  'content',
  'social-media',
  'reports'
] as const;

export type SidebarSection = typeof SIDEBAR_SECTIONS[number];