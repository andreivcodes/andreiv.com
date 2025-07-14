"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll(".blog-post-content h2, .blog-post-content h3")
    ).filter((element) => element.id);

    const headingData: Heading[] = elements.map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: parseInt(element.tagName.charAt(1)),
    }));

    setHeadings(headingData);

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -70% 0%",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed right-8 top-40 w-56">
      <h4 className="text-xs uppercase tracking-wider font-semibold mb-4 text-muted-foreground">On this page</h4>
      <div className="space-y-1 text-sm">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block py-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200 border-l-2 border-transparent hover:border-muted-foreground/50",
              activeId === heading.id && "text-foreground font-medium border-primary",
              heading.level === 2 ? "pl-4" : "pl-8"
            )}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest"
              });
            }}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  );
}