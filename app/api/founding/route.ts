import { NextRequest, NextResponse } from "next/server";

// Founding member counter
// MVP: Uses in-memory counter + environment variable fallback
// For production: Use Vercel KV (Redis) for persistence across deploys
//
// To use Vercel KV, install @vercel/kv and replace the counter logic:
//   import { kv } from "@vercel/kv";
//   const count = await kv.incr("founding_count");

const FOUNDING_LIMIT = 750;

// In-memory counter (resets on deploy — use Vercel KV for production)
let foundingCount = 0;

export async function GET() {
  return NextResponse.json({
    count: foundingCount,
    limit: FOUNDING_LIMIT,
    remaining: Math.max(0, FOUNDING_LIMIT - foundingCount),
    isActive: foundingCount < FOUNDING_LIMIT,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (foundingCount >= FOUNDING_LIMIT) {
      return NextResponse.json(
        { error: "Founding member spots are full", count: foundingCount, limit: FOUNDING_LIMIT },
        { status: 410 }
      );
    }

    foundingCount++;

    console.log(`[FOUNDING] New founding member #${foundingCount} of ${FOUNDING_LIMIT}`);

    return NextResponse.json({
      count: foundingCount,
      limit: FOUNDING_LIMIT,
      remaining: Math.max(0, FOUNDING_LIMIT - foundingCount),
      isActive: foundingCount < FOUNDING_LIMIT,
      memberNumber: foundingCount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
