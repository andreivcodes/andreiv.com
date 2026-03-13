"use client";

import { GlobeIcon } from "lucide-react";
import { useEffect, useState } from "react";

const taglines = [
  "selectively dumb, overall smart",
  "unironically likes crypto",
  "broke prod on Christmas Eve",
  "made cars go vroom",
  "codes solutions looking for problems",
];

const longestTagline = taglines.reduce((longest, tagline) =>
  tagline.length > longest.length ? tagline : longest
);

export const AboutShort = () => {
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const currentTagline = taglines[currentTaglineIndex];

  useEffect(() => {
    if (!hasStarted) {
      const startTimeout = window.setTimeout(() => {
        setHasStarted(true);
      }, 1000);

      return () => window.clearTimeout(startTimeout);
    }

    const currentLength = currentTagline.length;

    const timeout = window.setTimeout(
      () => {
        if (visibleCharacters < currentLength) {
          setVisibleCharacters((prev) => prev + 1);
          return;
        }

        setVisibleCharacters(0);
        setCurrentTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
      },
      visibleCharacters < currentLength ? 45 : 1800
    );

    return () => window.clearTimeout(timeout);
  }, [currentTagline, hasStarted, visibleCharacters]);

  return (
    <div className="flex max-w-lg flex-col gap-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-3xl font-bold">Andrei Voinea</h1>
        <p className="font-mono">Software Engineer</p>
        <p className="text-muted-foreground flex flex-row items-center gap-2 font-mono text-sm font-light">
          <GlobeIcon className="h-4 w-4" />
          Sibiu, Romania, GMT+2
        </p>
      </div>
      <div
        className="text-muted-foreground relative font-mono text-sm font-light"
        aria-label={currentTagline}
      >
        <span className="invisible block break-words whitespace-normal">{longestTagline}</span>
        <p className="absolute inset-0 break-words whitespace-normal">
          {currentTagline.slice(0, visibleCharacters)}
          <span className="text-foreground/70 animate-pulse">|</span>
        </p>
      </div>
    </div>
  );
};
