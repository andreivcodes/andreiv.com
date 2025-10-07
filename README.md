# andreiv.com

A modern, performant personal portfolio and blog built with Astro, showcasing projects, professional experience, and technical writing.

## Features

### Content Management

- **Blog System** - Markdown-based technical blog with reading progress, table of contents, and estimated reading time
- **Project Showcase** - Portfolio with featured images, tech stacks, and live/repository links
- **Professional Timeline** - Interactive career and education history
- **Slide Presentations** - Built-in markdown-based presentation system

### Technical Features

- **Static Site Generation** - Lightning-fast performance with Astro's SSG
- **PDF Resume Generation** - Dynamic PDF creation from content data
- **Enhanced Markdown** - Support for math equations (KaTeX), diagrams (Mermaid), and syntax highlighting
- **Responsive Design** - Mobile-first approach with tailored layouts
- **Type Safety** - TypeScript with content collection schemas

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5.11.1
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI primitives
- **Fonts**: Geist Sans & Mono
- **Language**: TypeScript

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── content/        # Markdown content collections
│   ├── blog/       # Blog posts
│   ├── projects/   # Portfolio projects
│   └── slides/     # Presentations
├── layouts/        # Page layouts
├── pages/          # File-based routing
└── styles/         # Global styles
```

## Key Commands

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Start development server |
| `pnpm build`   | Build for production     |
| `pnpm preview` | Preview production build |
| `pnpm check`   | Run type checking        |

## Content Management

Add content by creating markdown files in the appropriate directories:

- **Blog posts**: `src/content/blog/[slug].md`
- **Projects**: `src/content/projects/[slug].md`
- **Slides**: `src/content/slides/[slug].md`

Each content type has a defined schema in `src/content/config.ts`.

## Configuration

Site metadata and personal information can be updated in:

- `src/lib/personalInfo.ts` - Personal details and skills

## License

This project is a personal portfolio website. Feel free to use it as inspiration for your own portfolio.
