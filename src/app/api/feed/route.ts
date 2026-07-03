import { NextResponse } from "next/server";
import { fetchFeed, serializeFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const afterParam = searchParams.get("after");
    const after = afterParam ? new Date(afterParam) : undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 40), 80);

    const feed = await fetchFeed(
      limit,
      after && !Number.isNaN(after.getTime()) ? after : undefined,
      user?.id,
    );

    return NextResponse.json({
      items: serializeFeed(feed),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Feed unavailable." }, { status: 500 });
  }
}
