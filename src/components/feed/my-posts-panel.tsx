"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { FeedItem } from "@/components/feed/feed-item";
import { Icon8 } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";

type SerializedFeedEntry = {
  id: string;
  type: "service" | "job" | "team";
  title: string;
  description: string;
  createdAt: string;
  category?: string;
  price?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  mediaUrls: string[];
  likeCount: number;
  likedByMe: boolean;
  isOpen?: boolean;
  author: {
    id: string;
    username?: string | null;
    robloxUsername?: string | null;
    displayName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
};

type MyPostsPanelProps = {
  initialItems: SerializedFeedEntry[];
};

function itemKey(item: SerializedFeedEntry) {
  return `${item.type}-${item.id}`;
}

export function MyPostsPanel({ initialItems }: MyPostsPanelProps) {
  const [items, setItems] = useState(initialItems);

  const removeItem = useCallback((type: string, id: string) => {
    setItems((prev) => prev.filter((i) => !(i.type === type && i.id === id)));
  }, []);

  const openCount = items.filter((i) => i.isOpen !== false).length;
  const closedCount = items.length - openCount;

  if (items.length === 0) {
    return (
      <div className="surface-panel px-4 py-16 text-center">
        <Icon8 name="compose" size={48} className="mx-auto mb-4 opacity-60 text-accent" />
        <p className="text-lg font-bold">No posts yet</p>
        <p className="mt-2 text-muted">
          Publish a service, job, or team post to appear in the live feed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/compose">Create your first post</ButtonLink>
          <ButtonLink href="/explore" variant="outline">
            Browse feed
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-bold">Your posts</p>
          <p className="mt-1 text-sm text-muted">
            {openCount} active · {closedCount} closed · Use the menu on each post to close or delete
          </p>
        </div>
        <ButtonLink href="/compose" size="sm" className="gap-1.5">
          <Icon8 name="plus" size={16} />
          New post
        </ButtonLink>
      </div>

      <div className="feed-grid">
        {items.map((item) => (
          <div key={itemKey(item)} className="relative">
            {item.isOpen === false ? (
              <div className="mb-1 px-1">
                <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted">
                  Closed — hidden from feed
                </span>
              </div>
            ) : null}
            <FeedItem
              id={item.id}
              type={item.type}
              title={item.title}
              description={item.description}
              author={item.author}
              createdAt={new Date(item.createdAt)}
              category={item.category}
              price={item.price}
              budgetMin={item.budgetMin}
              budgetMax={item.budgetMax}
              mediaUrls={item.mediaUrls}
              likeCount={item.likeCount}
              likedByMe={item.likedByMe}
              isOpen={item.isOpen}
              onDeleted={() => removeItem(item.type, item.id)}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted">
        Posts also appear on{" "}
        <Link href="/explore" className="text-accent hover:underline">
          Explore
        </Link>
        ,{" "}
        <Link href="/marketplace" className="text-accent hover:underline">
          Marketplace
        </Link>
        , and{" "}
        <Link href="/teamfinder" className="text-accent hover:underline">
          Team Finder
        </Link>
        .
      </p>
    </div>
  );
}
