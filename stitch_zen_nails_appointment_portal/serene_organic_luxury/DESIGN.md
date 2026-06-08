---
name: Serene Organic Luxury
colors:
  surface: '#f6fce8'
  surface-dim: '#d6dcc9'
  surface-bright: '#f6fce8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f6e2'
  surface-container: '#eaf0dd'
  surface-container-high: '#e4ebd7'
  surface-container-highest: '#dfe5d2'
  on-surface: '#181d12'
  on-surface-variant: '#44483f'
  inverse-surface: '#2c3225'
  inverse-on-surface: '#edf3e0'
  outline: '#75786e'
  outline-variant: '#c5c8bb'
  surface-tint: '#51643e'
  primary: '#344623'
  on-primary: '#ffffff'
  primary-container: '#4b5e38'
  on-primary-container: '#c0d6a7'
  inverse-primary: '#b8ce9f'
  secondary: '#635e55'
  on-secondary: '#ffffff'
  secondary-container: '#e6dfd4'
  on-secondary-container: '#676259'
  tertiary: '#414239'
  on-tertiary: '#ffffff'
  tertiary-container: '#59594f'
  on-tertiary-container: '#d1d0c3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3eab9'
  primary-fixed-dim: '#b8ce9f'
  on-primary-fixed: '#102002'
  on-primary-fixed-variant: '#3a4c28'
  secondary-fixed: '#e9e1d7'
  secondary-fixed-dim: '#cdc5bb'
  on-secondary-fixed: '#1e1b15'
  on-secondary-fixed-variant: '#4b463e'
  tertiary-fixed: '#e5e3d6'
  tertiary-fixed-dim: '#c8c7bb'
  on-tertiary-fixed: '#1b1c15'
  on-tertiary-fixed-variant: '#47473e'
  background: '#f6fce8'
  on-background: '#181d12'
  surface-variant: '#dfe5d2'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  section-gap: 64px
---

## Brand & Style

The design system is centered on a "Quiet Luxury" philosophy, blending **Minimalism** with **Organic Modernism**. It is designed to evoke a sense of immediate tactile relief, mirroring the physical experience of a premium spa. 

The aesthetic prioritizes intentionality over abundance. It utilizes generous whitespace (breathing room), soft-edged geometry, and a palette rooted in nature. The goal is to move the user from a state of digital friction to a state of ritualistic calm. Visual metaphors should lean toward the natural world: stone textures, leaf venation, and the soft diffusion of morning light.

## Colors

This design system uses a palette of grounded earth tones. 
- **Primary (Dark Olive):** Used for key actions, brand typography, and structural accents. It represents growth and stability.
- **Secondary (Soft Beige):** The workhorse for surface containers, background layering, and subtle dividers.
- **Tertiary (Warm Cream):** The primary canvas color, chosen to be softer on the eyes than pure white, providing a sun-drenched, airy feel.
- **Neutral (Deep Moss):** Reserved for high-readability body text to maintain contrast while avoiding the harshness of true black.

## Typography

The typography strategy pairs a sophisticated, high-contrast Serif with a highly legible, modern Sans-serif. 

**Libre Caslon Text** is used for headlines to echo the brand's editorial, high-end nature. It should be typeset with slightly tighter letter spacing in large formats to feel like a bespoke masthead.

**Manrope** provides a clean, functional counterpoint for all UI elements, inputs, and body copy. Its geometric yet friendly terminals ensure the interface remains accessible and professional. Labels should often be used in uppercase with increased letter-spacing to denote secondary information without adding visual weight.

## Layout & Spacing

The layout follows a **fluid grid** with an emphasis on "negative space as a feature." 

On mobile, use a 4-column grid with 24px outer margins to ensure content doesn't feel cramped. On desktop, transition to a 12-column grid with a maximum content width of 1200px, centered. 

Spacing should follow an 8px rhythmic scale. However, for section transitions, double the standard "comfortable" padding to create a sense of luxury and unhurried pacing. Elements should never feel crowded; if in doubt, add more whitespace.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

Avoid heavy dropshadows. Instead, use "Soft Light" shadows: very large blur radii (30px+) with extremely low opacity (3-5%) tinted with the Primary Olive color. This creates an effect of objects resting gently on a soft surface rather than hovering in a digital void.

Surface containers (cards) should use a subtle shift from the Tertiary background to the Secondary Soft Beige to define boundaries without the need for hard strokes.

## Shapes

The shape language is **Rounded** and organic. Standard components use a 0.5rem radius, while larger containers like service cards or appointment modals use 1rem to 1.5rem. 

Buttons should be fully pill-shaped to reinforce the "Zen" pebble metaphor. Avoid sharp 90-degree angles across the entire system; even line separators should have rounded caps to maintain the soft visual flow.

## Components

### Buttons & Interaction
- **Primary Button:** Pill-shaped, Dark Olive background with Warm Cream text. No border.
- **Secondary Button:** Pill-shaped, Soft Beige background with Dark Olive text.
- **Ghost Action:** Underlined text using the Primary color, 2px offset.

### Booking Calendar
- The calendar should be minimal. Use a clear grid with no vertical lines.
- Selected dates are indicated by a solid Olive circle. 
- "Today" is indicated by a Soft Beige circle with an Olive dot beneath the date.

### Appointment Status Cards
- Use a 1rem corner radius.
- Background: Soft Beige.
- Include a small "status leaf" icon or a simple dot indicator for status (Pending, Confirmed, Completed).
- Typography should be hierarchal: Service Name in Serif, Time/Date in bold Sans-serif.

### Service Listings
- Use a split layout: Soft-focus photography on one side, title and price in Serif on the other.
- Descriptions should be in Body-md with a maximum line length of 60 characters for readability.

### Input Fields
- Underline style or very soft-filled containers. 
- Focus state: The underline or border transitions to Dark Olive with a subtle 4px glow.