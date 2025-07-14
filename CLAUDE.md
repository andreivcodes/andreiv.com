# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 personal website/portfolio (andreiv.com) using:
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **UI**: Radix UI primitives following shadcn/ui patterns
- **Content**: MDX files in `/data` directory
- **Package Manager**: Yarn 4.6.0

## Essential Commands

```bash
# Development
yarn dev          # Start development server on http://localhost:3000

# Building
yarn build        # Create production build
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
```

## Architecture

### Content System
- MDX files in `/data/{blog,projects,experience,slides,talks}/`
- Server-side rendering with `gray-matter` for frontmatter
- Dynamic routes: `/blog/[slug]`, `/projects/[slug]`, `/slides/[slug]`
- MDX compilation via `next-mdx-remote`

### Component Structure
- Server Components by default (App Router)
- Reusable UI components in `/src/components/ui/`
- Page-specific components in `/src/components/{page}/`
- Theme provider wraps entire app for dark mode support

### Styling Approach
- Tailwind CSS with CSS variable-based color system
- Dark mode via `next-themes`
- Radix UI for unstyled, accessible primitives
- Component styling follows shadcn/ui patterns with `cn()` utility

### Key Technical Details
- TypeScript configured (strict mode disabled)
- Absolute imports: `@/` maps to `/src/`
- Prism.js for syntax highlighting in MDX
- Forms use react-hook-form + zod validation
- Images stored in `/public` directory