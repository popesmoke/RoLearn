"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Icon8 } from "@/components/icons";
import { timeAgo } from "@/lib/utils";
import { getDisplayName, profilePath } from "@/lib/user-display";
import type { ActivityItem } from "@/lib/activity";

type ProfileActivityFeedProps = {
  items: ActivityItem[];
};

const icons = {
  post: "compose" as const,
  application: "apply" as const,
  review: "star" as const,
  follow: "user" as const,
};

export function ProfileActivityFeed({ items }: ProfileActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="surface-panel px-4 py-10 text-center text-sm text-muted">
        No activity yet — posts and applications will show up here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.link}
          className="surface-panel flex gap-3 p-4 transition hover:border-accent/30"
        >
          <Icon8 name={icons[item.type]} size={22} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.title}</p>
            {item.body ? <p className="mt-0.5 text-sm text-muted line-clamp-2">{item.body}</p> : null}
            {item.user ? (
              <div className="mt-2 flex items-center gap-2">
                <Avatar
                  src={item.user.avatarUrl}
                  name={item.user.displayName}
                  email={item.user.email}
                  size="sm"
                />
                <span className="text-xs text-muted">{getDisplayName(item.user)}</span>
              </div>
            ) : null}
            <p className="mt-1 text-xs text-subtle">{timeAgo(item.createdAt)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
