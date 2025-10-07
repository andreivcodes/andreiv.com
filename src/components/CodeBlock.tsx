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
    <div className="group relative">
      <pre className="bg-muted mb-6 max-h-[50vh] overflow-x-auto overflow-y-auto rounded-lg p-6 text-left text-sm">
        <code className="font-mono">{code}</code>
      </pre>
      <Button
        onClick={copyToClipboard}
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      {language && (
        <span className="text-muted-foreground absolute top-2 left-2 font-mono text-xs">
          {language}
        </span>
      )}
    </div>
  );
}
