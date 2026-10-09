// ─── MOSTLYVERS Design System ─────────────────────────────────────────────────
// Warm literary × modern royal aesthetic

export const Colors = {
  // Backgrounds
  background:    '#FBF7F2',   // scanned specification's warm ivory canvas
  cardBg:        '#FFFCF8',   // parchment-white cards
  inputBg:       '#FFFFFF',   // pure white for inputs
  tagBg:         '#F0E9E0',   // soft tan for genre tags

  // Brand
  primary:       '#4A210D',   // deep espresso brown — buttons, headings
  accent:        '#B88A52',   // muted antique gold — ornaments/highlights
  accentLight:   '#EDD99A',   // light gold for backgrounds

  // Text
  textPrimary:   '#2F190D',   // near-black warm brown
  textSecondary: '#6F625B',   // warm graphite for subtitles/captions
  textMuted:     '#9B8C82',   // lightest readable warm grey

  // UI
  border:        '#E8DDD2',   // soft beige for cards and inputs
  divider:       '#D8C5AF',   // antique-gold separator
  progressBg:    '#EFE3D6',   // progress track

  // State colors
  success:       '#4A7C59',   // forest green for PAID badge
  error:         '#8B2635',   // deep crimson for errors only
  prebook:       '#D96673',   // coral-wine badge from the specification
  prebookBtn:    '#C84755',   // PRE-BOOK button fill
  purchased:     '#4A7C59',   // same as success for purchased state
  purchasedBg:   '#EEF5EF',   // light green bg for purchased badge

  // Misc
  white:         '#FFFFFF',
  overlay:       'rgba(44, 21, 8, 0.45)',  // brown overlay for images
  tagText:       '#5C3D2E',   // genre pill text
};

export const Fonts = {
  display:       'CormorantGaramond_700Bold',
  displayMedium: 'CormorantGaramond_600SemiBold',
  body:          'Lato_400Regular',
  bodyBold:      'Lato_700Bold',
  bodyBlack:     'Lato_900Black',
  // Size scale
  displaySize:   36,
  headingSize:   32,
  subheadingSize: 20,
  bodySize:      15,
  smallSize:     13,
  tinySize:      11,

  // Weights (for reference)
  bold:          '700' as const,
  semibold:      '600' as const,
  medium:        '500' as const,
  regular:       '400' as const,
};

export const Radii = {
  card:    14,
  button:  10,
  input:   11,
  pill:    20,
  badge:   8,
  circle:  999,
};

export const Shadows = {
  card: {
    shadowColor: '#3D1A0A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.055,
    shadowRadius: 10,
    elevation: 2,
  },
  lifted: {
    shadowColor: '#3D1A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Ornamental divider string used across screens
export const HEART_DIVIDER = '─────  ♥  ─────';
export const ARROW_HEART = '→  ♥  ←';
export const SPARKLE = '✦';

export const Layout = {
  screenPadding: 14,
  tabBarSpace: 94,
  maxContentWidth: 720,
};
