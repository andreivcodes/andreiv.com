"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="text-left p-6 rounded-lg bg-muted overflow-x-auto mb-6 text-sm max-h-[50vh] overflow-y-auto">
        <code className="font-mono">{code}</code>
      </pre>
      <Button
        onClick={copyToClipboard}
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      {language && (
        <span className="absolute top-2 left-2 text-xs text-muted-foreground font-mono">
          {language}
        </span>
      )}
    </div>
  );
}