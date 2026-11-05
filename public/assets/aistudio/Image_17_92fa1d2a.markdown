---
name: Civic Trust System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#43474f'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#1b5eaf'
  on-secondary: '#ffffff'
  secondary-container: '#74a9ff'
  on-secondary-container: '#003c7b'
  tertiary: '#1c1f21'
  on-tertiary: '#ffffff'
  tertiary-container: '#313436'
  on-tertiary-container: '#9a9c9e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#e1e2e4'
  tertiary-fixed-dim: '#c5c6c8'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 16px
  touch-target-min: 48px
---

## Brand & Style
The design system is engineered to project stability, transparency, and accessibility for local governance. It prioritizes the "citizen-first" experience, ensuring that every interaction with village administration feels official and secure.

The visual style follows a **Corporate/Modern** aesthetic with a strong emphasis on **Accessibility**. It avoids unnecessary ornamentation, focusing instead on high-contrast ratios and clear information architecture. The goal is to bridge the digital divide, making the application usable for village residents of all ages and digital literacy levels. 

The emotional tone is quiet, helpful, and institutional. It mimics the reliability of a physical government office while providing the efficiency of a modern digital tool.

## Colors
The palette is rooted in a deep "Government Blue," a color synonymous with authority and trust in the Indonesian administrative context.

- **Primary (#003366):** Used for headers, primary actions, and branding elements to establish a formal presence.
- **Secondary (#0052A3):** A slightly more vibrant blue used for interactive elements like links and active states to guide user focus.
- **Surface & Backgrounds:** Utilizes a spectrum of whites and light grays (#F9FAFB) to maintain a clean environment that maximizes text legibility.
- **Functional Colors:** High-contrast reds for errors and greens for success are used sparingly, following WCAG AA standards to ensure they are perceivable by users with color vision deficiencies.

## Typography
The typography strategy employs a dual-font system to balance authority with extreme legibility.

- **Public Sans** is used for headings. Its geometric, neutral, and institutional character provides a sense of official documentation.
- **Atkinson Hyperlegible Next** is used for all body copy and labels. Specifically designed for low-vision readers, it ensures that similar characters are easily distinguishable, which is critical for elder citizens or those with visual impairments.

Text sizes are intentionally larger than standard applications. The minimum body size is set to 16px, with a preferred 18px for long-form content, ensuring a comfortable reading experience on handheld devices.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for desktop and a **Fluid Grid** for mobile, ensuring that government forms and lists remain organized and scannable.

- **Rhythm:** A strict 8px baseline grid is used to maintain vertical consistency.
- **Margins:** 16px safe areas on mobile devices prevent content from touching the edges, while a 32px margin is applied to tablet and desktop.
- **Accessibility:** All interactive elements (buttons, inputs) are designed with a minimum height of 48px to satisfy touch-target requirements for all users.
- **Hierarchy:** Whitespace is used aggressively to separate different sections of a form, preventing cognitive overload.

## Elevation & Depth
To maintain a formal and trustworthy feel, this design system avoids heavy shadows or trendy blurs. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Most content sits on a flat white background. Secondary sections or containers use a light gray tint (#F3F4F6) to create subtle separation.
- **Borders:** A consistent 1px border (#E5E7EB) is used for cards and input fields. This creates a "paper-like" feel that is familiar to users accustomed to physical government forms.
- **Active State:** Only the most critical interactive elements, such as primary action buttons or modal windows, use a soft, low-opacity shadow to indicate they are "above" the base layer.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding removes the harshness of sharp corners—making the app feel modern—while maintaining enough structure to appear serious and professional. 

- **Buttons & Inputs:** Use the standard `rounded` (4px) setting.
- **Cards & Banners:** Use `rounded-lg` (8px) to create a clear container for grouped information.
- **Icons:** Should follow a medium stroke weight (2px) and use slightly rounded caps to match the UI's geometry.

## Components
### Government Header
A specialized component for 'Pemerintah Desa Kedungrejo Kecamatan Pakis'. It features the official logo on the left, the district/village text in `label-md` uppercase, and the application name 'DAFTAR HADIR DESA' in `headline-sm`. The background must be the primary navy blue with white text.

### Buttons
- **Primary:** Solid Primary Blue background with White text. Large padding (16px top/bottom).
- **Secondary:** White background with a Primary Blue border and text.
- **Touch Targets:** All buttons must be at least 48px tall.

### Input Fields
Inputs must have clear, persistent labels (never just placeholders). Use a 1px border that thickens and changes to the secondary blue when focused. Error states must include both a red border and an error icon for accessibility.

### Cards & Lists
Used for displaying citizen data or attendance records. Cards should have a 1px gray border. In lists, each item should have a minimum height of 64px to ensure easy tapping.

### Attendance Chips
Small indicators for "Present," "Absent," or "Late." These use high-contrast text on muted background tints (e.g., dark green text on light green background) to ensure readability without being distracting.