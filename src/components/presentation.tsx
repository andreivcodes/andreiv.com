"use client";

import { useState, useEffect, useRef } from "react";
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

interface Presentation {
  slug: string;
  title: string;
  date: string;
  content: string;
}

interface PresentationProps {
  presentation: Presentation;
}

export function Presentation({ presentation }: PresentationProps) {
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
        primaryColor: "#0a0a0a",
        primaryTextColor: "#f6f6f7",
        primaryBorderColor: "#262626",
        lineColor: "#262626",
        secondaryColor: "#1a1a1a",
        tertiaryColor: "#2a2a2a",
        background: "#0a0a0a",
        mainBkg: "#0a0a0a",
        secondBkg: "#1a1a1a",
        tertiaryBkg: "#2a2a2a",
        secondaryBorderColor: "#3a3a3a",
        tertiaryBorderColor: "#4a4a4a",
        secondaryTextColor: "#e0e0e0",
        tertiaryTextColor: "#c0c0c0",
        textColor: "#f6f6f7",
        mainContrastColor: "#f6f6f7",
        darkMode: true,
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
          let processedSlide = slide.replace(mermaidRegex, (_, code) => {
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
        const containerHeight = containerRef.current.clientHeight;
        const slideHeight = 700; // Fixed slide height
        const scale = (containerHeight - 100) / slideHeight; // Scale based on height

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
        window.location.href = "/slides";
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, slides.length]);

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
    <div className="fixed inset-0 bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/slides"}
          className="text-sm"
        >
          Exit
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-background flex items-center justify-center px-16"
      >
        <div
          ref={slideRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
            width: "100%", // Full width
            height: "700px", // Fixed height
          }}
          className="relative flex items-center justify-center"
        >
          <div className="w-full overflow-hidden">
            <div
              className="markdown-content w-full"
              dangerouslySetInnerHTML={{ __html: slides[currentSlide] }}
            />
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="p-4 flex justify-between items-center border-t border-border">
        <Button
          variant="secondary"
          onClick={previousSlide}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
