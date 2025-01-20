"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PresentationType } from "@/lib/mdx";
import { Button } from "@/components/ui/button";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

interface PresentationProps {
  presentation: PresentationType;
}

export function Presentation({ presentation }: PresentationProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scale, setScale] = useState(1);
  const slideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        fontFamily: "ui-monospace, monospace",
        fontSize: "14px",
        primaryColor: "#ff0000",
        primaryTextColor: "#fff",
        primaryBorderColor: "#fff",
        lineColor: "#F8B229",
        secondaryColor: "#006100",
        tertiaryColor: "#fff",
        background: "#1e1e1e",
      },
    });
  }, []);

  // Process slides
  useEffect(() => {
    const processSlides = async () => {
      const slideContent = presentation.content
        .split(/\n---\n/)
        .map((slide) => slide.trim());

      const processedSlides = await Promise.all(
        slideContent.map(async (slide) => {
          // First, find and extract mermaid code blocks
          const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
          let mermaidBlocks: string[] = [];
          let processedSlide = slide.replace(mermaidRegex, (match, code) => {
            mermaidBlocks.push(code.trim());
            return `%%%MERMAID_PLACEHOLDER_${mermaidBlocks.length - 1}%%%`;
          });

          // Process the markdown content
          const result = await unified()
            .use(remarkParse)
            .use(remarkGfm) // Enable GitHub Flavored Markdown (tables, etc.)
            .use(remarkMath) // Enable math support
            .use(remarkRehype, { allowDangerousHtml: true }) // Allow raw HTML
            .use(rehypeKatex) // Enable KaTeX for math
            .use(rehypeStringify, { allowDangerousHtml: true }) // Allow raw HTML in output
            .process(processedSlide);

          // Replace placeholders with mermaid div elements
          processedSlide = String(result).replace(
            /%%%MERMAID_PLACEHOLDER_(\d+)%%%/g,
            (_, index) => {
              return `<div class="mermaid">${mermaidBlocks[parseInt(index)]}</div>`;
            },
          );

          // Ensure <br> tags are rendered correctly
          processedSlide = processedSlide.replace(/<br\s*\/?>/g, "<br />");

          return processedSlide;
        }),
      );

      setSlides(processedSlides);
    };

    processSlides();
  }, [presentation]);

  // Render mermaid diagrams after slide changes
  useEffect(() => {
    const renderMermaid = async () => {
      if (slides[currentSlide]) {
        try {
          await mermaid.run({
            querySelector: '.mermaid:not([data-processed="true"])',
          });
        } catch (error) {
          console.error("Mermaid rendering error:", error);
        }
      }
    };

    renderMermaid();
  }, [currentSlide, slides]);

  // Handle scaling
  useEffect(() => {
    const handleResize = () => {
      if (slideRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const slideWidth = 960;
        const slideHeight = 700;

        const scaleX = (containerWidth - 100) / slideWidth;
        const scaleY = (containerHeight - 100) / slideHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        setScale(scale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        previousSlide();
      } else if (event.key === "Escape") {
        router.push("/slides");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, slides.length, router]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (!slides.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-[#1e1e1e] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-[#333]">
        <Button
          variant="ghost"
          onClick={() => router.push("/slides")}
          className="text-sm rounded-none"
        >
          Exit
        </Button>
        <div className="text-sm text-gray-400">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-[#1e1e1e] flex items-center justify-center px-16"
      >
        <div
          ref={slideRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
            width: "960px",
            height: "700px",
          }}
          className="relative flex items-center justify-center"
        >
          <div className="w-full overflow-hidden">
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: slides[currentSlide] }}
            />
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="p-4 flex justify-between items-center border-t border-[#333]">
        <Button
          variant="secondary"
          onClick={previousSlide}
          disabled={currentSlide === 0}
          className="rounded-none"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="rounded-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
