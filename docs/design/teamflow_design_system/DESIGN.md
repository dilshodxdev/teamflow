---
name: TeamFlow Design System
colors:
  surface: '#fbf8ff'
  surface-dim: '#d5d8f9'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#edecff'
  surface-container-high: '#e5e6ff'
  surface-container-highest: '#dee0ff'
  on-surface: '#161a32'
  on-surface-variant: '#484556'
  inverse-surface: '#2b2f48'
  inverse-on-surface: '#f0efff'
  outline: '#797588'
  outline-variant: '#c9c4d9'
  surface-tint: '#5d34f3'
  primary: '#501fe7'
  on-primary: '#ffffff'
  primary-container: '#6945ff'
  on-primary-container: '#efe9ff'
  inverse-primary: '#c9bfff'
  secondary: '#6c45c0'
  on-secondary: '#ffffff'
  secondary-container: '#a67ffd'
  on-secondary-container: '#3a008b'
  tertiary: '#005f28'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b35'
  on-tertiary-container: '#aaffb4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1a0063'
  on-primary-fixed-variant: '#4400d9'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d1bcff'
  on-secondary-fixed: '#24005b'
  on-secondary-fixed-variant: '#5429a7'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#fbf8ff'
  on-background: '#161a32'
  surface-variant: '#dee0ff'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.25rem
---

## Brand & Style

This design system is tailored for small, agile teams (5–10 members) who require intuitive, focused, and distraction-free project coordination. The visual language embodies modern minimalism paired with a "Soft UI" tactile elegance—rejecting harsh enterprise grays in favor of an airy, serene pastel atmosphere anchored by crisp white elevated cards and vibrant jewel-toned timeline milestones.

Key brand attributes:
- **Serene & Focus-Driven:** Soft tinted canvases eliminate eye strain and replace rigid administrative feel with lightness.
- **Friendly & Approachable:** Generous border radii, rounded pill badges, smooth gradients, and clear typographic hierarchy make status tracking welcoming.
- **Micro-Collaborative:** Dedicated avatar clusters, visual timeline flows, and direct task lists emphasize immediate team cohesion.
- **Localized Readiness:** Built natively to showcase clear, legible Uzbek Latin script (`O‘zbek tili`), accounting for apostrophes, inverted commas (`o‘`, `g‘`), and variable word lengths with balanced line heights.

## Colors

The palette balances a tranquil periwinkle-tinted backdrop with pure white functional surfaces, deep ink-navy typography, and vivid status accents that bring life to schedule timelines.

### Surface Hierarchy
- **Canvas / App Background:** `#F0F0FC` – a soft, periwinkle-lavender tinted surface that provides gentle contrast beneath pure white cards.
- **Surface High (Primary Cards & Bars):** `#FFFFFF` – pure white for primary content cards, sidebars, and navigation headers.
- **Surface Subtle / Hover:** `#F9F9FF` – ultra-light lavender tint used for subtle module nesting, unselected interactive states, and search containers.
- **Borders & Dividers:** `#E6E8F4` – low-contrast, light periwinkle-gray borders defining card perimeters, grid dividers, and schedule tracks.

### Brand Accents
- **Primary Accent Purple:** `#6945FF` – primary interactive brand color, active sidebar indicators, selected check states, and progress fills.
- **Deep Violet / Shadow Tone:** `#5E35B1` – darker supportive purple for gradients, active focus rings, and high-emphasis states.
- **Subtle Selection Tint:** `#ECE8FF` – soft violet container background for active navigation pills and checklist selections.

### Typography & Neutrals
- **Text Primary (Navy Charcoal):** `#11152D` – ultra-deep navy delivering crisp legibility for headings and dynamic metrics.
- **Text Secondary / Muted:** `#717B9B` – balanced slate blue-gray for labels, captions, metadata, and day indicators.
- **Text Inactive / Disabled:** `#B0B7CE` – light slate for placeholders, weekend indicators, and inactive timeline grid markers.

### Semantic & Timeline Accents
- **Green (Talablar / Bajarilgan):** Gradient from `#22C55E` to `#10B981` (tinted container: `#E8F8F0`, icon container: `#DCFCE7`).
- **Amber / Yellow (UI dizayn):** Gradient from `#FBBF24` to `#F59E0B` (tinted container: `#FEF9C3`).
- **Coral / Red (Frontend / Kechikkan):** Gradient from `#F87171` to `#EF4444` (tinted container: `#FEE2E2`).
- **Sky Blue (Backend API / Vazifalar):** Gradient from `#38BDF8` to `#0EA5E9` (tinted container: `#E0F2FE`).
- **Violet (Test / Loyiha):** Gradient from `#A855F7` to `#8B5CF6` (tinted container: `#F3E8FF`).
- **Teal / Cyan (Deploy):** Gradient from `#2DD4BF` to `#06B6D4` (tinted container: `#CCFBF1`).

## Typography

The type system is powered exclusively by **Plus Jakarta Sans**, chosen for its friendly geometric contours, generous x-height, and open apertures. This font maintains immaculate clarity across Latin script diacritics and apostrophes common in Uzbek (`o‘`, `g‘`, `sh`, `ch`).

### Style & Usage Rules
- **Display & Large Headlines:** Used for prominent metric cards (e.g., `14:00`, `6/10`, `15`) and primary module titles. Rendered in bold (`700`) with tight letter spacing for impactful numerical hierarchy.
- **Headlines & Section Titles:** Used for card headers (`Kutilayotgan vazifa`, `Loyiha holati`) at `18px–22px`, styled semi-bold or bold to create anchor points for the eye.
- **Body:** Standardized at `13px–15px` for list items, descriptions, and user profile labels. Never dropped below `12px` for readable interactive text.
- **Labels & Subtitles:** Set in medium or semi-bold with muted slate coloring (`#717B9B`) to maintain strict secondary hierarchy without cluttering primary data.

## Layout & Spacing

The interface employs a responsive multi-pane dashboard layout organized around clear visual cards floating over the `#F0F0FC` canvas.

### Layout Architecture
- **Sidebar (Fixed/Collapsible):** Width of `240px` (desktop), fixed vertical height spanning viewport margins. Padded with `1.5rem` (`margin`) internal spacing.
- **Top Header Bar:** Spans horizontally alongside the sidebar, housing breadcrumb context, global notifications with status dot, and user profile switcher.
- **Main Canvas Grid:** A 12-column dynamic flex/grid setup:
  - **Schedule Timeline (Center Primary):** Spans 8 columns on large screens. Holds the interactive Gantt-like timeline grid with custom weekday columns (`Dush`, `Sesh`, `Chor`, `Pay`, `Jum`, `Shan`, `Yak`).
  - **Detail & Status Deck (Right Column):** Spans 4 columns. Stacks the active task card (`Kutilayotgan vazifa`), checklist, and project completion telemetry (`Loyiha holati`).
  - **Metric Summary Row (Bottom):** Spans across the full content width below the timeline, divided evenly into 4 quick-insight stat tiles.

### Spacing Rhythm
- Outer viewport margin: `24px` (`margin`).
- Gap between major card surfaces: `20px` (`gutter`).
- Internal card padding: `24px` to `28px` for primary cards, `16px` to `20px` for metric footer cards.
- Item gaps within lists: `8px` to `12px`.

## Elevation & Depth

Visual hierarchy is crafted through soft, expansive ambient shadows combined with high-luminance white surfaces floating over the delicate lavender background.

### Elevation Levels
- **Level 0 (Canvas):** `#F0F0FC` flat background.
- **Level 1 (Cards & Side Navigation):** Pure `#FFFFFF` background with an ultra-soft, diffused periwinkle shadow:
  `box-shadow: 0 10px 30px -5px rgba(105, 69, 255, 0.04), 0 4px 12px 0 rgba(17, 21, 45, 0.02);`
  Border: `1px solid #E6E8F4`.
- **Level 2 (Active Milestone Pills & Popovers):** Dynamic task pills floating on the timeline grid have a directional soft glow matching their individual gradient hues:
  - Green task glow: `0 8px 18px -4px rgba(34, 197, 94, 0.35)`
  - Amber task glow: `0 8px 18px -4px rgba(245, 158, 11, 0.35)`
  - Purple task glow: `0 8px 18px -4px rgba(105, 69, 255, 0.35)`
- **Level 3 (Modal / Flyout Overlays):** Elevated dialogs use `box-shadow: 0 20px 45px -10px rgba(17, 21, 45, 0.12)`.

## Shapes

The design system embraces an ultra-modern, friendly geometric curve profile:

- **Large Content Cards & Canvas Containers:** Standardized at `20px` to `24px` (`rounded-xl` to `rounded-2xl`), giving modules a soft, tactile tablet feel.
- **Timeline Tasks & Milestone Bars:** Full pill geometry (`rounded-full`, 9999px) to preserve continuous flow across columns.
- **Active Navigation Pills & Badges:** `12px` to `14px` border radius for comfortable enclosed tap targets.
- **Metric Icon Containers:** `14px` to `16px` squircle curves for supporting stat symbols.
- **Avatars:** Fully circular (`rounded-full`) with a crisp `2px` white border when stacked in overlapping clusters.

## Components

### 1. Navigation Sidebar
- **Brand Header:** 32px squircle logo with a dual-tone purple/blue diagonal pill glyph beside bold title `TeamFlow`.
- **Nav Items:** Clean outlined Lucide icons (`LayoutDashboard`, `FolderClosed`, `CheckSquare`, `Calendar`, `Users`, `AlertTriangle`) paired with medium 14px labels.
- **Active State:** Encased in a soft lavender-purple pill (`#ECE8FF`), text and icon colored `#6945FF`. Inactive items feature `#11152D` text on transparent backgrounds with light hover transitions to `#F9F9FF`.
- **Footer Profile:** Bottom pinned with circular initial badge (`PM` on `#6945FF`), role title `Project Manager`, and subtle chevron toggle.

### 2. Timeline Grid & Milestone Bars
- **Timeline Header:** Weekday abbreviations (`Dush`, `Sesh`, `Chor`, `Pay`, `Jum`, `Shan`, `Yak`) above numeric dates.
- **Current Day Highlight:** Vertical pill backing (`#ECE8FF`) framing the current date (e.g., `Chor 14`), descending into a continuous hairline indicator (`#A855F7`, 1.5px width) through the matrix.
- **Gantt Task Capsules:** Full pill elements (`height: 38px–42px`) containing:
  - Left-aligned overlapping avatar cluster (20px circles with white borders).
  - High-contrast white label text (`Talablar`, `UI dizayn`, `Frontend`, etc.).
  - Right-aligned directional cue (`ChevronRight` icon in white).

### 3. Metric Footer Cards
- Structured as unified horizontal cards with four segmented summary panels:
  1. *Jami loyiha* (Layers icon, soft purple container `#F3E8FF`).
  2. *Vazifalar* (Check square icon, soft blue container `#E0F2FE`).
  3. *Bajarilgan* (Checkmark icon, soft green container `#DCFCE7`).
  4. *Kechikkan* (Clock icon, soft red container `#FEE2E2`).
- Bold metric numbers (`26px–30px`) in primary navy charcoal.

### 4. Interactive Checklist (`Tekshirish ro‘yxati`)
- **Checkboxes:** Custom rounded squircle (6px radius). Checked items display a `#6945FF` solid fill with white checkmark and a full-row tinted lavender container (`#F0EDFF`).
- **Unchecked Items:** Crisp `#E6E8F4` border with transparent interior and natural slate text.

### 5. Progress Indicator (`Loyiha holati`)
- Bold fractional status badge (`6/10`) featuring primary purple accent for the active count and light slate for the total.
- **Progress Track:** Full pill track (`height: 10px`, background `#ECE8FF`) with a rounded `#6945FF` fill bar transitioning to completion percentage labels.