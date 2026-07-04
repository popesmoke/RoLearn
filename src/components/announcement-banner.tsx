"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon8 } from "@/components/icons";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  priority?: number;
};

type AnnouncementBannerProps = {
  announcements: AnnouncementItem[];
};

function dismissKey(id: string) {
  return `rolearn-announcement-${id}`;
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [visible, setVisible] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    const active = announcements
      .filter((item) => localStorage.getItem(dismissKey(item.id)) !== "1")
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    setVisible(active);
  }, [announcements]);

  function dismiss(id: string) {
    localStorage.setItem(dismissKey(id), "1");
    setVisible((items) => items.filter((item) => item.id !== id));
  }

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 border-b border-border px-4 py-3">
      {visible.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3"
        >
          <Icon8 name="bell" size={22} className="mt-0.5 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.title}</p>
            <p className="mt-0.5 text-sm text-muted">{item.body}</p>
            {item.link ? (
              <Link href={item.link} className="mt-1 inline-block text-sm text-accent hover:underline">
                Learn more
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            className="shrink-0 rounded-lg p-1 text-muted hover:bg-surface-hover hover:text-foreground"
            aria-label="Dismiss announcement"
          >
            <Icon8 name="close" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
