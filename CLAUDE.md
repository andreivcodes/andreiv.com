# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build static site for production
- `pnpm preview` - Preview production build locally
- `pnpm start` - Preview build with network access (0.0.0.0)
- `pnpm check` or `pnpm lint` - Run Astro's type checker

### Common Tasks
- Add new blog post: Create markdown file in `src/content/blog/` following the schema in `src/content/config.ts`
- Add new project: Create markdown file in `src/content/projects/` with required frontmatter
- Modify site metadata: Edit `src/consts.ts`

## Architecture

### Tech Stack
- **Astro 5.11.1** - Static site generator with file-based routing
- **React** - Interactive components (.tsx files)
- **Tailwind CSS v4** - Styling with Vite plugin
- **TypeScript** - Type safety (strict mode disabled)

### Content Collections
Structured content in `src/content/`:
- `blog` - Blog posts with title, description, date
- `projects` - Portfolio projects with tech stack
- `professional` - Work experience entries
- `education` - Educational background
- `slides` - Presentation slides

### Key Directories
- `src/pages/` - File-based routing (index.astro → /)
- `src/components/` - Reusable components (Astro & React)
- `src/components/ui/` - shadcn/ui component library
- `src/layouts/` - Page layouts (BaseLayout.astro)
- `src/styles/` - Global styles and fonts
- `public/` - Static assets served as-is

### Routing Pattern
- `/` - Home page
- `/about` - About page  
- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog posts
- `/projects` - Projects listing
- `/projects/[slug]` - Individual project pages
- `/api/` - API routes

### Markdown Processing
Enhanced with plugins for:
- GitHub Flavored Markdown (remark-gfm)
- Math rendering (remark-math, rehype-katex)
- Syntax highlighting (rehype-prism-plus)
- Mermaid diagrams (rehype-mermaid)

### Import Aliases
- `@/` → `./src/` - Use for all imports within src directory