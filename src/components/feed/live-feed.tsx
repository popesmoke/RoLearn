"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedItem, type FeedAuthor } from "@/components/feed/feed-item";
import { Icon8 } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  author: FeedAuthor & { id: string };
};

type LiveFeedProps = {
  initialItems: SerializedFeedEntry[];
};

const FALLBACK_POLL_MS = 4000;
const PAGE_SIZE = 20;

const filters = [
  { id: "all", label: "All", hint: "Every post type" },
  { id: "service", label: "Services", hint: "Creators for hire" },
  { id: "job", label: "Jobs", hint: "Paid contract work" },
  { id: "team", label: "Teams", hint: "Recruitment posts" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function mergeItems(prev: SerializedFeedEntry[], incoming: SerializedFeedEntry[]) {
  const seen = new Set(prev.map((p) => `${p.type}-${p.id}`));
  const fresh = incoming.filter((i) => !seen.has(`${i.type}-${i.id}`));
  if (fresh.length === 0) return prev;
  return [...fresh, ...prev].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function itemKey(item: SerializedFeedEntry) {
  return `${item.type}-${item.id}`;
}

export function LiveFeed({ initialItems }: LiveFeedProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<FilterId>("all");
  const [live, setLive] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= PAGE_SIZE);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const newestRef = useRef(
    initialItems.length > 0 ? new Date(initialItems[0].createdAt) : new Date(0),
  );
  const eventSourceRef = useRef<EventSource | null>(null);

  const removeItem = useCallback((type: string, id: string) => {
    setItems((prev) => prev.filter((i) => !(i.type === type && i.id === id)));
  }, []);

  const applyIncoming = useCallback((incoming: SerializedFeedEntry[]) => {
    if (incoming.length === 0) return;
    setItems((prev) => {
      const merged = mergeItems(prev, incoming);
      if (merged[0]) newestRef.current = new Date(merged[0].createdAt);
      return merged;
    });
    setLastUpdate(new Date());
    setLive(true);
  }, []);

  const refreshFull = useCallback(async () => {
    try {
      const res = await fetch(`/api/feed?limit=${PAGE_SIZE}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: SerializedFeedEntry[]; hasMore?: boolean };
      setItems(data.items);
      setHasMore(data.hasMore ?? data.items.length >= PAGE_SIZE);
      if (data.items[0]) newestRef.current = new Date(data.items[0].createdAt);
      setLastUpdate(new Date());
      setLive(true);
    } catch {
      setLive(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = items[items.length - 1];
      const res = await fetch(
        `/api/feed?limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest.createdAt)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { items: SerializedFeedEntry[]; hasMore?: boolean };
      setItems((prev) => {
        const seen = new Set(prev.map(itemKey));
        const older = data.items.filter((i) => !seen.has(itemKey(i)));
        return [...prev, ...older];
      });
      setHasMore(data.hasMore ?? data.items.length >= PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items, loadingMore]);

  useEffect(() => {
    function connect() {
      eventSourceRef.current?.close();
      const es = new EventSource("/api/feed/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: string;
            items?: SerializedFeedEntry[];
          };
          if (data.type === "items" && data.items?.length) {
            applyIncoming(data.items);
          }
          if (data.type === "heartbeat") {
            setLastUpdate(new Date());
            setLive(true);
          }
          if (data.type === "error") setLive(false);
        } catch {
          /* ignore malformed events */
        }
      };

      es.onerror = () => {
        setLive(false);
        es.close();
        window.setTimeout(connect, 5000);
      };
    }

    connect();

    const fallback = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/feed?limit=${PAGE_SIZE}&after=${encodeURIComponent(newestRef.current.toISOString())}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { items: SerializedFeedEntry[] };
        applyIncoming(data.items);
      } catch {
        setLive(false);
      }
    }, FALLBACK_POLL_MS);

    return () => {
      eventSourceRef.current?.close();
      clearInterval(fallback);
    };
  }, [applyIncoming]);

  const visibleItems =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  if (items.length === 0) {
    return (
      <div className="surface-panel mx-3 my-4 px-4 py-16 text-center">
        <Icon8 name="rocket" size={48} className="mx-auto mb-4 opacity-60 text-accent" />
        <p className="text-lg font-bold">Nothing here yet</p>
        <p className="mt-2 text-muted">Be the first to publish — it only takes a minute.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/compose">Create post</ButtonLink>
          <ButtonLink href="/marketplace" variant="outline">Browse marketplace</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <span className={`live-dot ${live ? "live-dot-active" : ""}`} />
          <span className="font-medium text-muted">{live ? "Live" : "Reconnecting…"}</span>
          <span className="text-subtle">· {lastUpdate.toLocaleTimeString()}</span>
        </div>
        <button
          type="button"
          onClick={() => refreshFull()}
          className="text-sm text-accent hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3 sm:px-6">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            title={f.hint}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition",
              filter === f.id
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-muted">
          No {filter === "all" ? "posts" : `${filter} posts`} in your feed yet.
        </div>
      ) : (
        <>
          <div className="feed-grid">
            {visibleItems.map((item) => (
              <FeedItem
                key={itemKey(item)}
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
                onDeleted={() => removeItem(item.type, item.id)}
              />
            ))}
          </div>

          {hasMore && filter === "all" ? (
            <div className="px-4 py-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                <Icon8 name="refresh" size={16} />
                {loadingMore ? "Loading…" : "Load more posts"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
