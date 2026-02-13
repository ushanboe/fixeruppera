import { NextRequest, NextResponse } from "next/server";
import { getNearestStores } from "@/lib/bunnings";

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, timezone } = await request.json();

    if (!timezone || !timezone.startsWith("Australia/")) {
      return NextResponse.json(
        { error: "Bunnings integration is only available for Australian users" },
        { status: 400 }
      );
    }

    if (!process.env.BUNNINGS_CLIENT_ID || !process.env.BUNNINGS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Bunnings API not configured" },
        { status: 503 }
      );
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    const stores = await getNearestStores(latitude, longitude);

    return NextResponse.json({ stores });
  } catch (error: any) {
    console.error("Bunnings stores error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to find nearby stores" },
      { status: 500 }
    );
  }
}
