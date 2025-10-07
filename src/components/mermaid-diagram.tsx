"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

mermaid.initialize({
  startOnLoad: false,
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

interface MermaidProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (elementRef.current) {
        elementRef.current.innerHTML = "";
        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          elementRef.current.innerHTML = `<pre>${chart}</pre>`;
        }
      }
    };

    renderChart();
  }, [chart]);

  return <div ref={elementRef} className="mermaid-wrapper my-4 flex justify-center" />;
}
