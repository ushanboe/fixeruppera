import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "furniture";
    const page = searchParams.get("page") || "1";

    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash not configured. Please add UNSPLASH_ACCESS_KEY to .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Unsplash API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "Failed to search images" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const images = data.results.map((photo: any) => ({
      id: photo.id,
      thumb: photo.urls.small,
      regular: photo.urls.regular,
      alt: photo.alt_description || photo.description || "Inspiration photo",
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadLink: photo.links.download_location,
    }));

    return NextResponse.json({
      images,
      totalPages: data.total_pages,
      total: data.total,
    });
  } catch (error: any) {
    console.error("Search inspiration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search images" },
      { status: 500 }
    );
  }
}
