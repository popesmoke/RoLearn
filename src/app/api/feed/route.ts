import { NextResponse } from "next/server";
import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`feed:${ip}`, 120, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const afterParam = searchParams.get("after");
    const beforeParam = searchParams.get("before");
    const after = afterParam ? new Date(afterParam) : undefined;
    const before = beforeParam ? new Date(beforeParam) : undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 40), 80);

    const feed = await fetchFeed({
      limit,
      after: after && !Number.isNaN(after.getTime()) ? after : undefined,
      before: before && !Number.isNaN(before.getTime()) ? before : undefined,
      userId: user?.id,
    });

    return NextResponse.json({
      items: serializeFeed(feed),
      serverTime: new Date().toISOString(),
      hasMore: feed.length >= limit,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Feed unavailable." }, { status: 500 });
  }
}
