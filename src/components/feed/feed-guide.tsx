"use client";

import { useEffect, useState } from "react";
import { Icon8 } from "@/components/icons";

export function FeedGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("rolearn-guide-dismissed") !== "1");
  }, []);

  function dismiss() {
    localStorage.setItem("rolearn-guide-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-accent/5 px-4 py-5 sm:px-6">
      <div className="flex gap-3">
        <Icon8 name="rocket" size={32} className="shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">How RoLearn works</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>
              <strong className="text-foreground">Service</strong> — show what you build and get hired
            </li>
            <li>
              <strong className="text-foreground">Job</strong> — post work you need done with a budget
            </li>
            <li>
              <strong className="text-foreground">Team</strong> — recruit scripters, builders, and designers
            </li>
          </ul>
          <p className="mt-2 text-xs text-subtle">
            Tap <strong className="text-foreground">Hire / Apply / Join</strong> to respond ·{" "}
            <strong className="text-foreground">Message</strong> to chat · Tap{" "}
            <strong className="text-foreground">⋯</strong> on your posts to manage or delete them
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 self-start rounded-lg p-1 text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label="Dismiss guide"
        >
          <Icon8 name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
