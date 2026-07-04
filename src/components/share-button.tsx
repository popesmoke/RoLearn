"use client";

import { useState } from "react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  url?: string;
  label?: string;
  className?: string;
};

export function ShareButton({ url, label = "Share", className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const target = url
      ? url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className={className ?? "gap-1.5"}
      title="Copy link"
    >
      <Icon8 name="share" size={16} />
      {copied ? "Copied!" : label}
    </Button>
  );
}
