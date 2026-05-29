import { Platform, StyleSheet } from 'react-native';

// ============================================================
// Artha AI — Design System  (Clean 2-accent palette)
// Primary: Mint Green #34D399  (safe, positive, brand)
// Danger:  Soft Red   #F87171  (risk, warnings)
// ============================================================

// ── COLORS ───────────────────────────────────────────────────
export const colors = {
  // Core background layers
  bg: '#0A0A0F',    // Level 0 — app background
  s1: '#111118',    // Level 1 — card backgrounds
  s2: '#18181F',    // Level 2 — elevated elements
  s3: '#1F1F28',    // Level 3 — input fields, inner elements

  // PRIMARY ACCENT — Mint Green (financial safety, brand)
  accent:  '#34D399',  // Primary CTA, safe-to-spend
  accentDim: '#1A3D2E', // Accent background tint

  // DANGER ACCENT — Soft Red (risk, warnings, overspend)
  danger:  '#F87171',  // Danger, risk, alerts
  dangerDim: '#2D1515', // Danger background tint

  // AMBER — Only for Danger Window (calendar warnings)
  amber:   '#FBBF24',
  amberDim: '#2D2000',

  // DOOM — Only for Doom Spending screen
  doom:    '#A78BFA',
  doomDim: '#1A1430',

  // Text
  text:  '#F1F5F9',   // Primary text (warm white)
  muted: '#64748B',   // Secondary text (slate gray)
  hint:  '#334155',   // Placeholder / very muted

  // Borders
  border: '#1E1E2E',    // Default card border
  borderMid: '#2E2E3E', // Slightly visible border

  // Semantic aliases (backward compat)
  success: '#34D399',   // = accent
  warning: '#F87171',   // = danger
  error:   '#F87171',   // = danger
  green:   '#34D399',
  red:     '#F87171',
  purple:  '#A78BFA',
  blue:    '#60A5FA',
  tertiary: '#34D399',

  // Category colors for breakdown rows
  categoryBills:  '#FBBF24',  // amber
  categorySpent:  '#F87171',  // danger/red
  categoryBuffer: '#60A5FA',  // blue
  categorySafe:   '#34D399',  // green

  // Special component backgrounds
  dangerBg:     '#1C1008',
  dangerBorder: '#78350F',
  dangerGlow:   '#D97706',
  doomBg:       '#13101F',
} as const;

// ── SPACING ──────────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 40,
  containerMargin: 20,
  gutter:          16,
  sectionGap:      28,
  navHeight:       60,
} as const;

// ── RADIUS ───────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ── TYPOGRAPHY ───────────────────────────────────────────────
export const type = {
  displayLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
    color: colors.text,
  },
  displayMobile: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.text,
  },
  headline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
  // Currency — JetBrains Mono for ₹ alignment
  currencyHero: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 38,
    lineHeight: 46,
    color: colors.text,
  },
  currencyLg: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },
  currencySm: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  // Compat aliases
  h1: { fontFamily: 'Inter_700Bold', fontSize: 26, color: colors.text, lineHeight: 32 },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.text, lineHeight: 26 },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text, lineHeight: 22 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.muted, lineHeight: 20 },
  bodyMd: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.text, lineHeight: 20 },
  num: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, color: colors.text },
} as const;

// ── SHADOWS ──────────────────────────────────────────────────
export const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  android: { elevation: 5 },
  default: {},
});

export const accentShadow = Platform.select({
  ios: {
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
  default: {},
});

// ── REUSABLE CARD STYLES ─────────────────────────────────────
export const card = StyleSheet.create({
  base: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  inner: {
    backgroundColor: colors.s2,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  danger: {
    backgroundColor: colors.dangerDim,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.danger}30`,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    marginBottom: spacing.md,
  },
  doom: {
    backgroundColor: colors.doomDim,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.doom}30`,
    marginBottom: spacing.md,
  },
  success: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
    marginBottom: spacing.md,
  },
});