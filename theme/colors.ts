// ============================================================
// Artha AI — Design Tokens
// Source: Stitch project "Artha AI Platform" (projects/10447423988989424604)
// Last synced: 2026-05-26
// ============================================================

export const colors = {
  // ── Core Background Layers ──────────────────────────────────
  bg:    '#0A0A0F',   // Level 0 — App background (deep space)
  s1:    '#12121A',   // Level 1 — Card backgrounds (Surface 1)
  s2:    '#1C1C28',   // Level 2 — Elevated elements (Surface 2)

  // ── Stitch Material Surface Hierarchy ──────────────────────
  surfaceContainerLowest:  '#0D0D15',
  surfaceContainerLow:     '#1B1B23',
  surfaceContainer:        '#1F1F27',
  surfaceContainerHigh:    '#292932',
  surfaceContainerHighest: '#34343D',
  surfaceBright:           '#393841',
  surfaceVariant:          '#34343D',

  // ── Brand Accent Colors ────────────────────────────────────
  accent:  '#6C63FF',  // Electric Indigo — primary CTA
  success: '#34D399',  // Emerald green — safe-to-spend, positive
  warning: '#F87171',  // Soft red — danger, overspend
  doom:    '#A78BFA',  // Purple — doom spending, AI insights
  amber:   '#FCD34D',  // Amber — danger window warnings

  // ── Typography Colors ──────────────────────────────────────
  text:    '#F8FAFC',  // Primary text (near white)
  muted:   '#64748B',  // Ghost / secondary text (slate gray)
  onPrimary: '#F8FAFC',

  // ── Semantic Colors ────────────────────────────────────────
  error:   '#FFB4AB',  // Material error
  tertiary: '#45DFA4', // Material tertiary (emerald)

  // ── Borders ────────────────────────────────────────────────
  border:  '#1E1E2E',  // Default card border
  borderVariant: '#464555',

  // ── Special UI Colors ──────────────────────────────────────
  dangerBg:     '#291A11',   // Danger window card bg
  dangerBorder: '#78350F',   // Danger window card border
  dangerGlow:   '#D97706',   // Left-border glow amber
  doomBg:       '#1C1C28',   // Doom card background

  // ── Category Colors ────────────────────────────────────────
  categoryBills:   '#F59E0B',  // Amber — bills reserved
  categorySpent:   '#EF4444',  // Red — spent
  categoryBuffer:  '#3B82F6',  // Blue — safety buffer
  categorySafe:    '#10B981',  // Green — safe to spend
} as const;

export const spacing = {
  containerMargin:   20,   // Screen horizontal padding
  gutter:            16,   // Internal component spacing
  sectionGap:        32,   // Between major sections
  componentPaddingX: 16,   // Card horizontal padding
  componentPaddingY: 12,   // Card vertical padding
  navHeight:         60,   // Bottom navigation bar
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm:   4,    // Inputs, small chips
  md:   8,    // Default
  lg:   12,   // Medium cards
  xl:   16,   // Main cards
  xxl:  24,   // Buttons (pill-like)
  full: 9999, // Avatars, pills
} as const;

export const typography = {
  displayLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  displayLgMobile: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  currencyLg: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 24,
    lineHeight: 32,
  },
  currencySm: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  currencyHero: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 48,
    lineHeight: 56,
  },
} as const;

// Convenience re-exports for backward compatibility
export { colors as default };
