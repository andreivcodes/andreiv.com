import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function renderPresentationSlides(content: string) {
  const slideContent = content.split(/\n---\n/).map((slide) => slide.trim());

  return Promise.all(
    slideContent.map(async (slide) => {
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const mermaidBlocks: string[] = [];

      const placeholderSlide = slide.replace(mermaidRegex, (_, code: string) => {
        mermaidBlocks.push(code.trim());
        return `%%%MERMAID_PLACEHOLDER_${mermaidBlocks.length - 1}%%%`;
      });

      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(placeholderSlide);

      return String(result).replace(/%%%MERMAID_PLACEHOLDER_(\d+)%%%/g, (_, index: string) => {
        const mermaidBlock = mermaidBlocks[Number.parseInt(index, 10)];
        return `<div class="mermaid">${mermaidBlock}</div>`;
      });
    })
  );
}
