import type { ImageMetadata } from "astro";

// Project screenshots live in src/assets/projects so Astro can resize them.
// Frontmatter keeps the "/projects/<slug>/featured.png" form, which also
// resolves the source file for OG rendering.
const projectImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/projects/*/featured.png",
  { eager: true }
);

export function getProjectImage(featuredImage: string | undefined) {
  if (!featuredImage) {
    return undefined;
  }

  const image = projectImages[`/src/assets${featuredImage}`];
  if (!image) {
    throw new Error(`No project image found in src/assets for ${featuredImage}`);
  }

  return image.default;
}
