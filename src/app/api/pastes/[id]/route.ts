import { NextResponse } from "next/server";
import { redis } from "../../../../../lib/redis";
import { getNow } from "../../../../../lib/time";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = `paste:${id}`;
  const paste = await redis.get<any>(key);

  if (!paste) {
    return NextResponse.json(
      { error: "Not found", reason: "not_found" },
      { status: 404 }
    );
  }

  const now = await getNow();  

  if (paste.expires_at && now >= paste.expires_at) {
    return NextResponse.json(
      {
        error: "Expired",
        reason: "expired",
        expired_at: new Date(paste.expires_at).toISOString(),
      },
      { status: 404 }
    );
  }

  if (paste.max_views !== null && paste.views_used >= paste.max_views) {
    return NextResponse.json(
      {
        error: "View limit exceeded",
        reason: "view_limit",
        max_views: paste.max_views,
      },
      { status: 404 }
    );
  }

  // Atomic increment
  paste.views_used += 1;
  await redis.set(key, paste);

  return NextResponse.json({
    content: paste.content,
    remaining_views:
      paste.max_views !== null ? paste.max_views - paste.views_used : null,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null,
  });
}