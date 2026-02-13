import { NextRequest, NextResponse } from "next/server";

// Simple feedback logging endpoint
// MVP: Logs to Vercel function logs (visible in Vercel dashboard → Functions → Logs)
// Future: Store in Vercel KV or database for analytics

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, rating, planTitle, appMode, timestamp } = body;

    // Validate required fields
    if (!type || !rating) {
      return NextResponse.json({ error: "Missing type or rating" }, { status: 400 });
    }

    // Log to Vercel function logs
    console.log(
      `[FEEDBACK] ${type} | rating=${rating} | plan="${planTitle || "N/A"}" | mode=${appMode || "N/A"} | at=${timestamp || new Date().toISOString()}`
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
