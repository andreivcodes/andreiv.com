"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  const relevantHeadings = useMemo(
    () => headings.filter((heading) => heading.depth === 2 || heading.depth === 3),
    [headings]
  );

  useEffect(() => {
    if (relevantHeadings.length === 0) {
      return;
    }

    const elements = relevantHeadings
      .map((heading) => document.getElementById(heading.slug))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    setActiveId(elements[0].id);

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
  }, [relevantHeadings]);

  if (relevantHeadings.length === 0) {
    return null;
  }

  return (
    <nav className="fixed top-40 right-8 hidden w-56 xl:block">
      <h4 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
        On this page
      </h4>
      <div className="space-y-1 text-sm">
        {relevantHeadings.map((heading) => (
          <a
            key={heading.slug}
            href={`#${heading.slug}`}
            className={cn(
              "text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:ring-primary/20 focus-visible:ring-offset-background block rounded-sm py-1.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeId === heading.slug && "text-foreground font-medium",
              heading.depth === 2 ? "pl-4" : "pl-8"
            )}
            onClick={(event) => {
              event.preventDefault();
              setActiveId(heading.slug);
              document.getElementById(heading.slug)?.scrollIntoView({
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
