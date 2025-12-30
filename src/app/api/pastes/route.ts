import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getNow } from "../../../../lib/time";
import { redis } from "../../../../lib/redis";


export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.content || typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const ttl = body.ttl_seconds;
  const maxViews = body.max_views;

  if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 1)) {
    return NextResponse.json({ error: "Invalid ttl_seconds" }, { status: 400 });
  }

  if (maxViews !== undefined && (!Number.isInteger(maxViews) || maxViews < 1)) {
    return NextResponse.json({ error: "Invalid max_views" }, { status: 400 });
  }

  const id = nanoid(8);
  const now =  await getNow();

  const paste = {
    id,
    content: body.content,
    created_at: now,
    expires_at: ttl ? await now + ttl * 1000 : null,
    max_views: maxViews ?? null,
    views_used: 0,
  };
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  await redis.set(`paste:${id}`, paste);
  return NextResponse.json({
    id,
    url: `${baseUrl}/p/${id}`,
  });
  
}
