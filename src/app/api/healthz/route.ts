import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";


export const runtime = "nodejs";

export async function GET() {
  try {
    await redis.ping();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
