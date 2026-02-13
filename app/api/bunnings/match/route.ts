import { NextRequest, NextResponse } from "next/server";
import { matchMaterials, type BunningsStoreInfo } from "@/lib/bunnings";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { materials, locationCode, storeName, storeAddress, timezone } = await request.json();

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

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return NextResponse.json(
        { error: "Materials array is required" },
        { status: 400 }
      );
    }

    if (!locationCode) {
      return NextResponse.json(
        { error: "Store location code is required" },
        { status: 400 }
      );
    }

    const products = await matchMaterials(materials, locationCode);

    const totalEstimate = products.reduce(
      (sum, p) => sum + (p.price || 0),
      0
    );

    const store: BunningsStoreInfo = {
      locationCode,
      name: storeName || `Bunnings ${locationCode}`,
      address: storeAddress || "",
    };

    return NextResponse.json({
      products,
      store,
      totalEstimate: Math.round(totalEstimate * 100) / 100,
      matchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Bunnings match error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to match materials" },
      { status: 500 }
    );
  }
}
