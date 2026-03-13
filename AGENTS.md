# Project Agent Guide

This file contains project-specific instructions for agents working in this repository.

## First Read

Before making any visual, layout, typography, or OG-image changes, read:

- `docs/design-language.md`

That document is the source of truth for the site's design language and the OG image system.

## Project Shape

This repository is an Astro personal site with:

- Static routes for homepage, about, resume, blog, projects, and slides
- Content collections in `src/content`
- Shared page metadata in `src/lib/pageMetadata.ts`
- Generated OG images through the endpoint in `src/pages/open-graph/[...route].png.ts`

## Commands

Use these commands for validation:

- `pnpm astro check`
- `pnpm build`
- `pnpm dev`
- `pnpm preview`

For formatting:

- `pnpm prettier --write <files>`

## Design Rules

- Preserve the dark, restrained, technical/editorial visual language described in
  `docs/design-language.md`.
- Keep the `Geist Sans` and `Geist Mono` pairing unless there is an explicit design change.
- Treat accent colors as sparse signals, not full-page themes.
- For OG images, preserve the left-text/right-media composition.
- Do not place OG text over full-bleed images.
- Do not allow text to overflow into the media half of OG images.
- Prefer subtle borders, compact chrome, and deliberate whitespace over decorative effects.

## Metadata and OG Rules

- Static page metadata belongs in `src/lib/pageMetadata.ts`.
- OG route inventory and per-route content mapping belong in `src/lib/og.ts`.
- OG rendering/layout belongs in `src/lib/og-renderer.tsx`.
- `BaseLayout.astro` should continue to derive `og:image` from the current route unless there is a
  specific override.

## Editing Guidance

- Make minimal, coherent changes.
- Preserve existing naming and route structure unless there is a strong reason to change them.
- If changing the design system, update `docs/design-language.md` in the same task.
- If changing OG layout behavior, validate with both `pnpm astro check` and `pnpm build`.

## Git and Safety

- Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.
- Do not revert user changes you did not make.
- Avoid destructive git commands.

## Documentation Hygiene

- Do not create new design docs that drift from `docs/design-language.md` without a clear reason.
- Prefer updating the existing design-language document over scattering design notes across the repo.
