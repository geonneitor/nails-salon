---
name: Zen Luxury Aesthetics
colors:
  surface: '#131312'
  surface-dim: '#131312'
  surface-bright: '#393937'
  surface-container-lowest: '#0e0e0d'
  surface-container-low: '#1b1c1a'
  surface-container: '#20201e'
  surface-container-high: '#2a2a28'
  surface-container-highest: '#353533'
  on-surface: '#e5e2df'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2df'
  inverse-on-surface: '#31302e'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c6c7c2'
  on-secondary: '#2f312e'
  secondary-container: '#484a46'
  on-secondary-container: '#b8b9b4'
  tertiary: '#d0cecd'
  on-tertiary: '#313030'
  tertiary-container: '#b5b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e3e3de'
  secondary-fixed-dim: '#c6c7c2'
  on-secondary-fixed: '#1a1c19'
  on-secondary-fixed-variant: '#454744'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131312'
  on-background: '#e5e2df'
  surface-variant: '#353533'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-desktop: 120px
  section-mobile: 64px
  gutter: 24px
  container-max: 1200px
---

## Brand & Style

The design system is anchored in "Dark Luxury"—a visual strategy that prioritizes atmosphere, calmness, and exclusivity. Designed for a high-end nail salon, the UI must feel like a digital extension of a physical spa environment: quiet, intentional, and premium.

The style merges **Minimalism** with **Glassmorphism**. It utilizes heavy whitespace (or "dark space"), high-contrast typography, and subtle translucency to create depth. The goal is to evoke an emotional response of immediate relaxation and trust, positioning the service as a self-care ritual rather than a simple appointment.

## Colors

The palette is strictly curated to maintain a high-fashion, editorial feel. 

- **Deep Charcoal (#121212):** The primary canvas. It reduces eye strain and provides a sophisticated backdrop that makes imagery and gold accents pop.
- **Champagne Gold (#D4AF37):** Used exclusively for calls to action, active states, and premium highlights. It should be used sparingly to maintain its value.
- **Stone/Cream (#F5F5F0):** The primary ink color for typography on dark backgrounds and the fill color for high-importance surface cards.
- **Soft Neutral (#2A2A28):** Used for secondary containers and borders to create subtle separation without breaking the dark atmosphere.

## Typography

This design system employs a classic Serif/Sans-Serif pairing. **Playfair Display** provides the editorial authority required for a luxury brand, featuring high stroke contrast that feels like a fashion magazine. **DM Sans** provides a clean, geometric counterpoint for functional text, ensuring legibility at smaller sizes.

Use `label-sm` for navigation items and small headers above titles. The increased letter spacing and uppercase styling add a level of "designer" polish to the interface.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to ensure the content feels like a curated gallery. 

- **Desktop:** 12-column grid with a 1200px max-width. Large 120px vertical margins between sections to allow the design to "breathe."
- **Navigation:** A sticky top bar with a centered logo. Navigation links should be balanced on the left and right (e.g., Services/Gallery on the left, About/Book on the right).
- **Mobile:** Single column with 24px side gutters. 

Organic, abstract shapes in Stone or Gold (at 5-10% opacity) should be placed as fixed background elements to break the rigidity of the grid and add a tactile, fluid feel.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Ambient Shadows**. 

- **Level 0:** Deep Charcoal (#121212) background.
- **Level 1:** Soft Neutral (#2A2A28) for secondary cards or input fields.
- **Level 2:** Stone/Cream (#F5F5F0) for primary content cards. 

Shadows should be "ultra-diffused." Use a large blur radius (30px+) with very low opacity (10-15%) tinted with the primary gold color to create a subtle "glow" effect rather than a harsh drop shadow. Glassmorphism is applied to the sticky navigation bar using a backdrop blur (20px) and a semi-transparent Deep Charcoal fill.

## Shapes

The design system uses a highly organic shape language. While the standard `rounded-lg` is 1rem (16px), this system pushes towards `rounded-2xl` (24px) and `rounded-3xl` (32px) for main content cards and imagery. 

Buttons should remain strictly **Pill-Shaped** to contrast with the rectangular cards. Organic background "blobs" should have no hard edges, acting as soft visual anchors for the typography.

## Components

### Buttons
- **Primary:** Pill-shaped, Champagne Gold background, Deep Charcoal text. No border.
- **Secondary:** Pill-shaped, transparent background, Stone/Cream border (1px), Stone/Cream text.

### Cards
- **Service Cards:** Stone/Cream background with Deep Charcoal text. Use `rounded-3xl` corners. Include a subtle "Gold Glow" shadow on hover.
- **Gallery Items:** Images should use `rounded-2xl` and a slight zoom-in transition on hover.

### Input Fields
- Underlined style or softly rounded containers (#2A2A28). The focus state should change the border color to Champagne Gold.

### Navigation Bar
- High-blur glass effect. Centered logo. Links in `label-sm` typography. The "Book Now" CTA in the nav should always be the primary gold pill button.

### Chips/Tags
- Used for nail styles or technician specialties. Small, pill-shaped, with a 1px Stone border and `label-sm` text.