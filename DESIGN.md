---
name: Tech Industrial Dark
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0266ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#63f7ff'
  on-secondary: '#003739'
  secondary-container: '#00dce5'
  on-secondary-container: '#005c60'
  tertiary: '#c9c5c6'
  on-tertiary: '#313031'
  tertiary-container: '#747172'
  on-tertiary-container: '#fcf7f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#63f7ff'
  secondary-fixed-dim: '#00dce5'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#e6e1e2'
  tertiary-fixed-dim: '#c9c5c6'
  on-tertiary-fixed: '#1c1b1c'
  on-tertiary-fixed-variant: '#484647'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.08em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  section-gap-desktop: 140px
  section-gap-mobile: 80px
  grid-columns: '12'
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
---

## Brand & Style

This design system embodies a **Tech Industrial** aesthetic, specifically tailored for developer tools, high-end SaaS, and technical platforms. The personality is precise, high-performance, and sophisticated. It prioritizes clarity and technical density without sacrificing visual polish.

The style leverages **Glassmorphism** and **Modern Minimalism**. Rather than relying on traditional elevation shadows, it uses 1px translucent borders and backdrop blurs to create depth. The interface should feel like a high-end physical console—machined, deliberate, and illuminated by soft, radial technical glows.

The emotional response should be one of "controlled power"—a quiet, dark environment where primary actions are electrified and data is presented with monospaced authority.

## Colors

The palette is rooted in a deep, "obsidian" industrial base. 

- **Primary (#0266ff):** Used exclusively for high-priority calls to action and active states. It represents the "power on" state of the UI.
- **Secondary (#00dce5):** An accent for technical flourishes—hover borders, subtle radial glows, and data visualization. It provides a "scanning" or "holographic" feel.
- **Surface Layers:** The background uses a near-black (#0e0e0f). Component surfaces use a warmer dark gray (#1c1b1c) to provide subtle contrast.
- **Typography:** Main content uses a high-contrast off-white for maximum legibility against dark backgrounds, while secondary metadata uses a muted gray to maintain hierarchy.

## Typography

The typographic system utilizes a trio of typefaces to establish a clear functional hierarchy:

1.  **Headlines (Geist):** Set in bold weights with tight tracking (negative letter-spacing). This creates a compressed, high-tech editorial look that feels engineered.
2.  **Body (Inter):** Used for all long-form text and interface copy. Its neutrality balances the more expressive display and label fonts.
3.  **Data & Labels (JetBrains Mono):** Always set in uppercase with increased letter-spacing for tags, small labels, and code-related data. This reinforces the "industrial/technical" narrative.

## Layout & Spacing

This design system uses a **Fluid 12-column grid** with generous vertical breathing room. 

- **Vertical Rhythm:** Sections are separated by massive gaps (140px on average) to evoke a sense of premium, cinematic scale. 
- **Grid:** On desktop, use a 12-column grid with 24px gutters. Content should typically span 6, 8, or 12 columns to maintain focus.
- **Mobile:** Reflow to a single column with 20px side margins and reduced vertical spacing (80px) between sections.
- **Consistency:** Use an 8px spacing system for internal component layout (padding, icon-to-text spacing).

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Layered Outlines** rather than soft shadows.

- **The Glass Layer:** Elevated elements (cards, modals) use a semi-transparent background fill (#1c1b1c at 80% opacity) with a `backdrop-filter: blur(12px)`.
- **Borders:** Every card and container must have a 1px solid border. Use a low-opacity white/gray for resting states, and switch to the Secondary Cyan (#00dce5) for active or hovered states.
- **Technical Glows:** Use radial gradients of Cyan (#00dce5) at 5-10% opacity positioned in the corners of containers or behind primary buttons to simulate a "backlit" hardware effect.

## Shapes

The shape language balances industrial rigidity with modern ergonomics. 

- **Standard Radius:** 8px (`0.5rem`) for standard components like input fields and buttons.
- **Large Radius:** 16px (`1rem`) for primary cards and main containers.
- **Interactive Elements:** Buttons maintain a consistent 8px radius to feel like solid, tactile tiles. 
- **Status Indicators:** Use small, sharp circular pips for "online" or "active" statuses to mimic LED indicators.

## Components

- **Buttons:** 
  - *Primary:* Electric Blue background, white text (Geist), 8px radius. On hover, add a subtle Cyan outer glow.
  - *Secondary:* Ghost style with 1px border. Use JetBrains Mono for the label.
- **Cards:** Background #1c1b1c with 12px backdrop blur. 1px border (rgba(255,255,255,0.1)). On hover, the border transitions to Cyan.
- **Input Fields:** Darker than the card background. 1px border. Focus state should trigger a Cyan border and a very faint Cyan inner glow.
- **Chips/Tags:** Using JetBrains Mono, uppercase. Outline style with 1px borders. These should look like serial number plates or technical labels.
- **Progress Bars / Meters:** Use the Secondary Cyan for the fill. Add a subtle "pulse" animation to indicate active processing.
- **Lists:** Separated by 1px horizontal lines. High-contrast text for the primary item, medium gray for metadata.