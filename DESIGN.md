# Artha AI — Design System
> Extracted from Stitch project: **Artha AI Platform** (projects/10447423988989424604)

---

## Brand Identity
**Artha AI — अर्थ** is India's trauma-informed AI financial companion for freelancers.
- Personality: Grounded, empathetic, sophisticated
- Visual style: Modern-Minimalist + Glassmorphic accents
- Emotional goal: "Calculated calm" — transforms financial anxiety into structured clarity

---

## Color Palette

### Core Artha Colors (Primary reference)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0F` | App background (deep space) |
| `s1` | `#12121A` | Card backgrounds (Surface 1) |
| `s2` | `#1C1C28` | Elevated elements (Surface 2) |
| `accent` | `#6C63FF` | Primary CTA, active states |
| `success` | `#34D399` | Safe-to-spend, positive values |
| `warning` | `#F87171` | Danger states, negative values |
| `doom` | `#A78BFA` | Doom spending, AI insights |
| `text` | `#F8FAFC` | Primary text |
| `muted` | `#64748B` | Secondary/ghost text |
| `border` | `#1E1E2E` | Card borders |
| `amber` | `#FCD34D` | Danger window warnings |

### Stitch Material Color Tokens
| Token | Hex |
|-------|-----|
| `background` | `#13131B` |
| `surface` | `#12121A` |
| `surface-dim` | `#13131B` |
| `surface-container-lowest` | `#0D0D15` |
| `surface-container-low` | `#1B1B23` |
| `surface-container` | `#1F1F27` |
| `surface-container-high` | `#292932` |
| `surface-container-highest` | `#34343D` |
| `surface-bright` | `#393841` |
| `surface-variant` | `#34343D` |
| `primary` | `#6C63FF` |
| `on-primary` | `#F8FAFC` |
| `primary-container` | `#1C1C28` |
| `secondary` | `#CEBDFF` |
| `tertiary` | `#45DFA4` |
| `error` | `#FFB4AB` |
| `outline` | `#1E1E2E` |
| `outline-variant` | `#464555` |
| `on-surface` | `#F8FAFC` |
| `on-surface-variant` | `#64748B` |

---

## Typography

| Scale | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| `display-lg` | Inter | 32px | 700 | 40px | -0.02em |
| `display-lg-mobile` | Inter | 24px | 700 | 32px | -0.01em |
| `headline-md` | Inter | 20px | 600 | 28px | — |
| `body-lg` | Inter | 16px | 400 | 24px | — |
| `body-sm` | Inter | 14px | 400 | 20px | — |
| `label-caps` | Inter | 12px | 700 | 16px | 0.05em |
| `currency-lg` | JetBrains Mono | 24px | 500 | 32px | — |
| `currency-sm` | JetBrains Mono | 14px | 500 | 20px | — |

**Rule:** Use `JetBrains Mono` for ALL ₹ Rupee amounts — ensures perfect tabular alignment.

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `container-margin` | 20px | Screen horizontal padding |
| `gutter` | 16px | Internal component spacing |
| `section-gap` | 32px | Between major sections |
| `component-padding-x` | 16px | Card horizontal padding |
| `component-padding-y` | 12px | Card vertical padding |
| `nav-height` | 60px | Bottom navigation bar |

---

## Shape & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Inputs, small chips |
| `DEFAULT` | 8px | Default roundness |
| `md` | 12px | Medium cards |
| `lg` | 16px | Main cards |
| `xl` | 24px | Buttons |
| `full` | 9999px | Pills, avatars |

---

## Elevation & Depth (Tonal Stacking)

1. **Level 0** → `#0A0A0F` (App background)
2. **Level 1** → `#12121A` + 1px border `#1E1E2E` (Cards)
3. **Level 2** → `#1C1C28` + accent glow at 10% opacity (Modals / active states)
4. **Glass** → 70% opacity + `backdrop-blur: 20px` (Nav bar, overlays)

---

## Component Specs

### Cards
- Background: `#12121A`
- Border: `1px solid #1E1E2E`
- Radius: 16px
- On tap: border animates to `#6C63FF`

### Primary Button
- Background: `#6C63FF`
- Text: `#F8FAFC`
- Radius: 24px (pill-like)
- Glow: `box-shadow: 0 0 15px rgba(108,99,255,0.3)`

### Bottom Navigation
- Height: 60px
- Background: `rgba(10,10,15,0.80)` + `backdrop-blur: 10px`
- Top border: `1px solid #1E1E2E`
- Active icon: `#6C63FF`
- Inactive icon: `#64748B`

### Danger Window Banner
- Background: `rgba(41,26,17,1)` 
- Left border glow: `#D97706` (amber)
- Text: `#FCD34D`

### Doom Alert Card
- Background: `#1C1C28` (primary-container)
- Border: `#6C63FF`
- Text: `#6C63FF` (primary)

### AI Insights (Artha Special)
- Border: 1px gradient (Indigo → Purple)
- Indicator: Soft-pulsing purple dot

---

## Screen Inventory

| # | Screen | File | Stitch ID |
|---|--------|------|-----------|
| 1 | Home Dashboard | `app/home.tsx` | `821c10a2...` |
| 2 | Forecast / Danger Window | `app/forecast.tsx` | `fde5a986...` |
| 3 | Gig Dashboard | `app/gig.tsx` | `1d1d713e...` |
| 4 | Family Safety Net | `app/family.tsx` | `6bfd3afe...` |
| 5 | AI Coach Chat | `app/coach.tsx` | `4ed1875b...` |
| 6 | Breathe | `app/breathe.tsx` | `653b0dcc...` |
| 7 | Scheme Radar | `app/schemes.tsx` | `573e6b73...` |
| 8 | Settings | `app/settings.tsx` | `d559f1b3...` |
| 9 | Doom Intervention | `app/doom.tsx` | `9af9f229...` |

---

## React Native Fonts Setup

```typescript
// package.json fonts required:
"@expo-google-fonts/inter": "*",
"@expo-google-fonts/jetbrains-mono": "*",
```

```typescript
// App.tsx font load:
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
```
