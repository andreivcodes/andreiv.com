# Design Language

This document captures the visual and interaction language of `andreiv.com` as it exists in the
site UI and in the generated OG images. It is written to be operational, not aspirational. Future
design and implementation work should preserve these rules unless there is an explicit decision to
change the product identity.

## Core Thesis

The site should feel like a calm engineering workspace, not a marketing site.

The visual identity is built from these tensions:

- Minimal but not sterile
- Technical but not cold
- Personal but not sentimental
- Dark and quiet, with small moments of signal
- Editorial in composition, terminal-like in typography, product-like in structure

The site is intentionally restrained. It does not compete for attention with loud gradients,
oversized decoration, glassmorphism, or product-marketing theatrics. Its confidence comes from
spacing, type, contrast, and structure.

## Brand Personality

The design should communicate:

- Serious engineering taste
- Clear thinking
- Low ego
- Precision
- Openness
- A preference for signal over noise

It should not communicate:

- Startup landing page energy
- Generic AI-aesthetic futurism
- Luxury branding
- Playfulness
- Visual maximalism
- Heavy illustration-first storytelling

## Visual Principles

### 1. Darkness Is the Default Material

The site is fundamentally dark-first. Black and near-black surfaces are not a theme toggle flourish,
they are the canvas.

Use darkness in layers:

- Page background should sit near pure black
- Panels should be slightly lifted from the background
- Borders should separate surfaces through subtle edge definition, not heavy contrast
- Text hierarchy should come from luminance and font choice more than color variety

The visual goal is not "dark mode." The goal is "night workspace."

### 2. Typography Does Most of the Work

Typography carries brand identity more than graphics do.

The system uses two voices:

- `Geist Sans` for primary statements, large titles, and structural headings
- `Geist Mono` for navigation, metadata, tags, labels, subtle interface chrome, and supporting copy

The pairing matters:

- Sans establishes authority and clarity
- Mono adds technical texture and restraint

Mono is not a novelty accent. It is a foundational part of the identity.

### 3. Empty Space Is Intentional

There is a lot of breathing room in the design. This is not absence of content. It is active
composition.

Use whitespace to:

- Let titles feel definitive
- Prevent dense technical content from feeling noisy
- Keep interface chrome from overpowering the content
- Preserve a sense of calm

Avoid filling gaps with decorative shapes, ornamental noise, badges everywhere, or unnecessary
secondary explanations.

### 4. Chrome Should Feel Thin and Precise

Navigation bars, dividers, borders, and panel outlines are all intentionally light. They should
feel like quiet scaffolding around the content.

This means:

- Thin borders
- Fine separators
- Compact nav bars
- Delicate active states
- Small, controlled accents

Avoid chunky outlines, thick shadows, oversized pills, or heavy framing.

### 5. Accent Colors Are Signals, Not Themes

Color accents exist, but they are sparse and role-based.

Accent colors are used for:

- Current navigation state
- A leading rule or small line
- Route-family identification in OG images
- Occasional icon/background emphasis in cards

Accent colors should not flood the interface. Most of the site should remain monochrome.

## Palette

### Core Site Palette

These values are encoded through the Tailwind theme tokens in
[src/styles/global.css](/Users/andrei/git/andreiv.com/src/styles/global.css).

Primary surface model:

- Background: very dark, near-black
- Card: slightly elevated charcoal
- Border: low-contrast graphite
- Foreground: off-white
- Muted text: desaturated gray

The practical reading of the palette is:

- Background should feel almost black
- Panels should be perceptibly different from background, but only slightly
- White should be softened, not pure sterile white
- Muted text should still remain legible against black

### OG Palette

The OG system in [src/lib/og-renderer.tsx](/Users/andrei/git/andreiv.com/src/lib/og-renderer.tsx)
translates the site palette into fixed hex values.

Core OG values:

- Background: `#050505`
- Surface: `#0b0b0c`
- Secondary surface: `#121214`
- Border: `#19191c`
- Primary text: `#f5f5f5`
- Muted text: `#a1a1aa`
- Soft text: `#71717a`

Route-family accent colors:

- Profile: `#22c55e`
- Writing: `#14b8a6`
- Projects: `#f59e0b`
- Slides: `#60a5fa`

These accents should remain thin and intentional. They are classification markers, not brand-color
blocks.

## Typography Rules

### Font Roles

Use `Geist Sans` for:

- Hero names
- Large page and OG titles
- Major section headings
- High-priority labels when they need authority

Use `Geist Mono` for:

- Navigation
- Metadata rows
- Dates
- Tags and chips
- Footer phrases
- Secondary descriptions in OGs
- Interface microcopy

### Weight Rules

Preferred weights:

- Sans regular for standard body-like usage
- Sans bold for definitive headlines
- Mono regular or medium for metadata and UI

Avoid extremely heavy weight stacks across the same composition. The design wants one strong voice
per area, not multiple competing bold layers.

### Letter Case

Preferred casing behavior:

- Nav items and small UI labels: lowercase
- Large titles: natural case
- Metadata: natural case or lowercase depending on component
- Tags: lowercase

Do not introduce shouty uppercase systems as a dominant style. Small uppercase can work rarely, but
it is not part of the main language.

### Scale Behavior

Large headings should feel oversized and decisive, but still human.

In OGs:

- Titles are intentionally large and left-aligned
- The left column width is fixed, so title scale must adapt to text length
- If a title is long, reduce size rather than allowing spill into the media panel
- Description text stays mono, smaller, and more open in line height

## Layout Grammar

### Site Layout

The site uses a simple structural frame:

- Thin header bar
- Focused central content area
- Thin footer bar

This creates a shell similar to a calm terminal or code workspace:

- Header and footer act as chrome
- Main content remains the real focus
- Structural bars should not feel like giant website banners

### Alignment

The design mixes centered composition and left-aligned reading.

Use:

- Centered framing for top-level page presence
- Left alignment for reading-heavy and information-dense content
- Symmetry in macro layout
- Asymmetry within cards and OGs

### Panels and Cards

Cards should feel like quiet containers, not glossy components.

Use:

- Dark surfaces
- Subtle borders
- Mild radius
- Limited shadow or no shadow
- Careful spacing inside

Avoid:

- Bright fills
- Dramatic neumorphism
- Big ambient glow
- Transparent layered blur as a dominant visual system

### OG Layout

OG cards are not loose poster designs. They are structured translations of the site.

The OG composition should always be:

- A narrow top chrome bar
- A left text column
- A right media panel
- A low-contrast footer strip inside the card

The text column is authoritative. The media panel is supporting evidence.

Do not reverse this hierarchy.

## Navigation Language

Navigation should feel understated and coded rather than decorative.

Characteristics:

- Mono typography
- Lowercase labels
- Thin active underline
- Low-contrast inactive state
- No oversized buttons
- No filled pills for the main nav

This is true on the site and mirrored in the OG chrome.

## Imagery

### General Image Role

Images are supporting artifacts. They should prove or reinforce the work, not become the entire
composition.

For the site:

- Project images support cards and detail pages
- Profile imagery is personal but still integrated into a technical layout

For OGs:

- If an image exists, it belongs on the right side
- The image must never push text out of its left column
- The image must never become a full-bleed background

### Image Positioning Rules

This is a hard rule for future OG work:

- Text always owns the left side
- Media always lives on the right side
- Text must never overflow into the media half
- The media panel should remain a contained frame with its own border and spacing

### Image Treatment by Type

#### Portrait Images

Portraits should be:

- Cropped decisively
- Presented in a strong contained shape
- Treated as identity, not decoration

Current system:

- Square source resized to a circular portrait presentation
- Kept inside a right-side framed panel
- Surrounded by dark negative space and thin borders

#### Product Screenshots

Screenshots should be:

- Contained, not cover-cropped
- Clearly visible
- Framed like interface evidence
- Never stretched

Current system:

- `contain` behavior
- Centered inside a bordered dark viewport-like panel
- Wrapped in a window-like shell with minimal chrome

This is the correct approach. Product work should look like product work, not like a background
texture.

### Placeholder Panels

When no image exists, use a structured placeholder rather than inventing art.

The placeholder should feel like:

- A wireframe preview
- Skeleton UI
- Interface abstraction

This preserves the technical tone better than gradients, icons, or empty boxes.

## Copy and Tone

The design language depends on the copy feeling measured.

Copy should be:

- Direct
- Specific
- Calm
- Lightly personal
- Low on hype

Avoid:

- Overwritten brand poetry
- Sales language
- Future-of-everything phrasing
- Inflated claims

The visual system works because the words do not perform too hard.

## Interaction and Motion

Motion should be minimal and purposeful.

Use motion for:

- Hover clarification
- Transition polish
- Small positional or color feedback

Do not use motion for:

- Spectacle
- Constant ambient animation
- Decorative parallax
- Oversold micro-interactions

If animation is removed entirely, the design should still feel complete.

## OG-Specific System

The OG implementation is defined in
[src/lib/og-renderer.tsx](/Users/andrei/git/andreiv.com/src/lib/og-renderer.tsx) and
[src/lib/og.ts](/Users/andrei/git/andreiv.com/src/lib/og.ts).

### OG Structural Rules

Canvas:

- 1200 × 630

Frame:

- Thin top bar
- Two-column main body
- Fixed-width left text column
- Fixed-width right media panel
- Footer line across the bottom of the text column

### OG Content Hierarchy

Order of importance:

1. Title
2. Route-family eyebrow/meta line
3. Short description
4. Right-side preview panel
5. Footer phrase and domain

Never invert this order.

### OG Title Rules

- Left aligned
- Large
- Bold sans
- Tight but readable line height
- Truncated/reduced in size before it can invade the media column

### OG Description Rules

- Mono
- Muted
- Short
- A maximum of a few lines
- Never allowed to become an essay

### OG Media Rules

- Always right aligned
- Always inside a dedicated panel
- Always scaled according to media type
- Never allowed to sit behind text
- Never allowed to bleed edge-to-edge

### OG Metadata Rules

- Eyebrow line should use mono
- Include route family plus date/context when useful
- Use a short accent rule to the left
- Do not add multiple competing metadata rows

## Route Family Mapping

### Profile

Includes:

- Home
- About
- Resume

Style:

- Green accent
- Personal portrait on the right
- Technical identity chips
- Emphasis on personhood within a technical shell

### Writing

Includes:

- Blog index
- Blog posts

Style:

- Teal accent
- No real screenshot by default
- Right-side placeholder preview
- Strong typographic emphasis

Writing cards should feel editorial and quiet.

### Projects

Includes:

- Projects index
- Project detail pages

Style:

- Amber accent
- Right-side product screenshot when available
- Product-preview framing
- Project tags when useful

Project cards should feel like technical case-study cards, not portfolio thumbnails.

### Slides

Includes:

- Slides index
- Individual slide decks

Style:

- Blue accent
- Usually no real preview image
- Structured placeholder on the right
- Slightly more presentation-oriented metadata

Slides should feel documented and archived, not flashy.

## What To Preserve

When making future design changes, preserve these elements unless explicitly rebranding:

- Dark near-black canvas
- `Geist Sans` + `Geist Mono` pairing
- Thin chrome bars
- Low-contrast borders
- Monochrome-first interface
- Sparse accent usage
- Calm spacing
- Technical/editorial tone
- Left-text/right-media OG composition

## What To Avoid

Do not introduce the following unless the user explicitly asks for a new direction:

- Bright gradient-heavy backgrounds
- Purple/blue generic AI visual language
- Excessive blur or glassmorphism
- Centered marketing-hero compositions everywhere
- Rounded candy-like UI
- Loud badge systems
- Overbuilt illustration systems
- Full-bleed OG background images with text on top
- Typography that abandons the mono/sans tension

## Implementation References

Use these files as the source of truth:

- Site tokens: [global.css](/Users/andrei/git/andreiv.com/src/styles/global.css)
- Font setup: [fonts.css](/Users/andrei/git/andreiv.com/src/styles/fonts.css)
- Header chrome: [Header.astro](/Users/andrei/git/andreiv.com/src/components/Header.astro)
- Footer chrome: [Footer.astro](/Users/andrei/git/andreiv.com/src/components/Footer.astro)
- OG route metadata: [og.ts](/Users/andrei/git/andreiv.com/src/lib/og.ts)
- OG renderer and layout: [og-renderer.tsx](/Users/andrei/git/andreiv.com/src/lib/og-renderer.tsx)

## Working Rule For Future Agents

If a future change touches visuals, typography, layout, card structure, OG generation, navigation,
or page chrome, read this document first.

If a proposal conflicts with this document, treat that as a deliberate design change request, not a
small implementation tweak.
