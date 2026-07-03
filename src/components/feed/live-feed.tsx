"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedItem, type FeedAuthor } from "@/components/feed/feed-item";
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
  author: FeedAuthor & { id: string };
};

type LiveFeedProps = {
  initialItems: SerializedFeedEntry[];
};

const FALLBACK_POLL_MS = 4000;
const MAX_ITEMS = 80;

function mergeItems(prev: SerializedFeedEntry[], incoming: SerializedFeedEntry[]) {
  const seen = new Set(prev.map((p) => `${p.type}-${p.id}`));
  const fresh = incoming.filter((i) => !seen.has(`${i.type}-${i.id}`));
  if (fresh.length === 0) return prev;
  return [...fresh, ...prev]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ITEMS);
}

export function LiveFeed({ initialItems }: LiveFeedProps) {
  const [items, setItems] = useState(initialItems);
  const [live, setLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const newestRef = useRef(
    initialItems.length > 0 ? new Date(initialItems[0].createdAt) : new Date(0),
  );
  const eventSourceRef = useRef<EventSource | null>(null);

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
      const res = await fetch("/api/feed?limit=40", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: SerializedFeedEntry[] };
      setItems(data.items);
      if (data.items[0]) newestRef.current = new Date(data.items[0].createdAt);
      setLastUpdate(new Date());
      setLive(true);
    } catch {
      setLive(false);
    }
  }, []);

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
          `/api/feed?limit=40&after=${encodeURIComponent(newestRef.current.toISOString())}`,
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

  if (items.length === 0) {
    return (
      <div className="surface-panel px-4 py-16 text-center">
        <Icon8 name="rocket" size={48} className="mx-auto mb-4 opacity-60 text-accent" />
        <p className="text-lg font-bold">Nothing here yet</p>
        <p className="mt-2 text-muted">Be the first to publish a listing.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/compose">Create post</ButtonLink>
          <ButtonLink href="/marketplace" variant="outline">Marketplace</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={`live-dot ${live ? "live-dot-active" : ""}`} />
          <span className="font-medium text-muted">
            {live ? "Live" : "Reconnecting…"}
          </span>
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

      <div className="feed-grid">
        {items.map((item) => (
          <FeedItem
            key={`${item.type}-${item.id}`}
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
          />
        ))}
      </div>
    </>
  );
}
