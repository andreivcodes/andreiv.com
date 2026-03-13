"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(".blog-post-content h2, .blog-post-content h3")
    );

    if (elements.length === 0) return;

    const usedIds = new Set<string>();

    elements.forEach((element) => {
      const baseId = element.id || slugifyHeading(element.textContent || "section");
      let nextId = baseId || "section";
      let suffix = 2;

      while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      usedIds.add(nextId);
      element.id = nextId;
    });

    const headingData: Heading[] = elements.map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: parseInt(element.tagName.charAt(1)),
    }));

    setHeadings(headingData);
    setActiveId(headingData[0]?.id ?? "");

    const updateActiveHeading = () => {
      const activationOffset = Math.min(window.innerHeight * 0.24, 200);
      const scrollAnchor = window.scrollY + activationOffset;
      const isAtPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      if (isAtPageBottom) {
        const lastHeading = elements[elements.length - 1];
        setActiveId((previousId) => (previousId === lastHeading.id ? previousId : lastHeading.id));
        return;
      }

      const nextHeadingIndex = elements.findIndex((element) => scrollAnchor < element.offsetTop);
      const activeHeading =
        nextHeadingIndex === -1
          ? elements[elements.length - 1]
          : nextHeadingIndex > 0
            ? elements[nextHeadingIndex - 1]
            : elements[0];

      setActiveId((previousId) =>
        previousId === activeHeading.id ? previousId : activeHeading.id
      );
    };

    let frameId = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    scheduleUpdate();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
    document.fonts?.ready.then(scheduleUpdate).catch(() => {});

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);
    };
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
              setActiveId(heading.id);
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
