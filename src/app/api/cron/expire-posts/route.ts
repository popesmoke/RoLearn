import { NextResponse } from "next/server";
import { expireOldPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await expireOldPosts();
  return NextResponse.json({ ok: true, ...result });
}
