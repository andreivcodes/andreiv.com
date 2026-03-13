import type { GetStaticPaths } from "astro";
import { getOgPages } from "@/lib/og";
import { renderOgImage } from "@/lib/og-renderer";

const pages = await getOgPages();

export const getStaticPaths = (async () => {
  return Object.entries(pages).map(([route, page]) => ({
    params: {
      route,
    },
    props: {
      page,
    },
  }));
}) satisfies GetStaticPaths;

export async function GET({ props }: { props: { page: (typeof pages)[string] } }) {
  const image = await renderOgImage(props.page);

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
