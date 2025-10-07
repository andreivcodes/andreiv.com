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
    <nav className="fixed top-40 right-8 hidden w-56 xl:block">
      <h4 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
        On this page
      </h4>
      <div className="space-y-1 text-sm">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 block border-l-2 border-transparent py-1.5 transition-colors duration-200",
              activeId === heading.id && "text-foreground border-primary font-medium",
              heading.level === 2 ? "pl-4" : "pl-8"
            )}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
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
