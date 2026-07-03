import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TICK_MS = 2500;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const encoder = new TextEncoder();
  let newest = new Date(0);
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const poll = async () => {
        try {
          const after = newest.getTime() > 0 ? newest : undefined;
          const feed = await fetchFeed({
            limit: 40,
            after,
            userId: user?.id,
          });
          if (feed.length > 0) {
            newest = feed[0].createdAt;
            send({ type: "items", items: serializeFeed(feed) });
          }
          send({ type: "heartbeat", serverTime: new Date().toISOString() });
        } catch (error) {
          console.error("Feed stream error:", error);
          send({ type: "error", message: "Feed unavailable" });
        }
      };

      send({ type: "connected", serverTime: new Date().toISOString() });
      await poll();

      const interval = setInterval(() => {
        if (closed) return;
        void poll();
      }, TICK_MS);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
