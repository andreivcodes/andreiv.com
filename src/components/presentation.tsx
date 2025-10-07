"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showControls, setShowControls] = useState(true);
  const slideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const slideContent = presentation.content.split(/\n---\n/).map((slide) => slide.trim());

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
            }
          );

          return processedSlide;
        })
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

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!slides.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground fixed inset-0 flex cursor-none flex-col">
      {/* Header - minimal and auto-hiding */}
      <div
        className={`absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          onClick={() => (window.location.href = "/slides")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        >
          ← Exit
        </button>
        <div className="text-muted-foreground/60 font-mono text-xs">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Main content - full screen */}
      <div
        ref={containerRef}
        className="bg-background relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => {
          // Click on left half goes back, right half goes forward
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const width = rect.width;

          if (x < width / 2) {
            previousSlide();
          } else {
            nextSlide();
          }
        }}
      >
        <div
          ref={slideRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
            width: "100%",
            height: "700px",
          }}
          className="relative flex items-center justify-center px-20"
        >
          <div className="w-full overflow-hidden">
            <div
              className="markdown-content presentation-mode w-full"
              dangerouslySetInnerHTML={{ __html: slides[currentSlide] }}
            />
          </div>
        </div>

        {/* Subtle click zones indicator */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute top-1/2 left-0 -translate-y-1/2 p-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-muted-foreground/30"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 p-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-muted-foreground/30"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom navigation - minimal and auto-hiding */}
      <div
        className={`absolute right-0 bottom-0 left-0 z-20 p-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom cursor that shows on mouse move */}
      <div
        className={`bg-primary/20 pointer-events-none fixed z-50 h-6 w-6 rounded-full transition-opacity duration-150 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
        ref={(el) => {
          if (el) {
            const handleMouseMove = (e: MouseEvent) => {
              el.style.left = `${e.clientX}px`;
              el.style.top = `${e.clientY}px`;
            };
            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
          }
        }}
      />
    </div>
  );
}
