import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beforeImage, concept, count = 2 } = body;

    console.log("=== MOCKUP GENERATION START ===");
    console.log("Concept:", JSON.stringify(concept, null, 2));
    console.log("Count:", count);

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI mockup generation not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Generate mockup prompts based on concept
    const mockupPrompt = buildMockupPrompt(concept);
    console.log("Generated prompt:", mockupPrompt);

    // Generate mockups using DALL-E
    const mockups = [];

    for (let i = 0; i < Math.min(count, 4); i++) {
      try {
        console.log(`Generating mockup ${i + 1}/${count}...`);

        // Use DALL-E 3 for high-quality image generation
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: mockupPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        });

        if (response.data && response.data[0]) {
          // Fetch the image and convert to base64
          const imageUrl = response.data[0].url;
          const imageResponse = await fetch(imageUrl!);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;

          mockups.push({
            id: `mockup-${i + 1}`,
            dataUrl,
          });
        }
      } catch (error: any) {
        console.error(`Error generating mockup ${i + 1}:`, error);
        // Continue with next mockup even if one fails
      }
    }

    console.log(`Successfully generated ${mockups.length} mockups`);
    console.log("=== MOCKUP GENERATION END ===");

    return NextResponse.json({
      mockups,
      disclaimer: "Concept preview only. Real results depend on materials, techniques, and workmanship.",
    });
  } catch (error: any) {
    console.error("Mockup generation error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to generate mockups",
        mockups: [],
      },
      { status: 500 }
    );
  }
}

function buildMockupPrompt(concept: any): string {
  const {
    itemType = "furniture piece",
    material = "wood",
    currentFinish = "unknown",
    targetStyle = "modern",
    targetFinish = "painted",
    targetColor = "white",
    hardware = "none",
    notes = "",
  } = concept;

  return `A photograph of a ${itemType} made of ${material} in ${targetStyle} style with the following characteristics:
- Finish: ${targetFinish} in ${targetColor}
- Hardware: ${hardware}
- Overall aesthetic: ${targetStyle}
${notes ? `- Additional details: ${notes}` : ""}

IMPORTANT CONSTRAINTS:
- Maintain the EXACT same furniture form, shape, and structure as a typical ${itemType}
- Only change the surface finish, color, and hardware
- Do NOT change the furniture type, proportions, or basic design
- Photorealistic style
- Clean, well-lit interior photography
- Neutral background
- Professional product photography quality

The image should look like a real "after" photo of a ${itemType} that has been refinished and updated.`;
}
