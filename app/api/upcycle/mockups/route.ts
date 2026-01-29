import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration - easy to switch providers
const MOCKUP_PROVIDER = process.env.MOCKUP_PROVIDER || "stability"; // "stability" or "dalle"
const IMAGE_STRENGTH = parseFloat(process.env.IMAGE_STRENGTH || "0.30"); // 0.25-0.35 recommended

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beforeImage, concept, count = 2 } = body;

    console.log("=== MOCKUP GENERATION START ===");
    console.log("Provider:", MOCKUP_PROVIDER);
    console.log("Image Strength:", IMAGE_STRENGTH);
    console.log("Concept:", JSON.stringify(concept, null, 2));

    if (MOCKUP_PROVIDER === "stability") {
      return await generateWithStability(beforeImage, concept, count);
    } else {
      return await generateWithDALLE(beforeImage, concept, count);
    }
  } catch (error: any) {
    console.error("Mockup generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate mockups", mockups: [] },
      { status: 500 }
    );
  }
}

async function generateWithStability(beforeImage: string, concept: any, count: number) {
  if (!process.env.STABILITY_API_KEY) {
    console.error("STABILITY_API_KEY not configured");
    return NextResponse.json(
      { error: "Stability AI not configured. Please add STABILITY_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const mockups = [];

  // Extract base64 from data URL
  const base64Image = beforeImage.split(',')[1];
  if (!base64Image) {
    throw new Error("Invalid image data URL");
  }

  for (let i = 0; i < Math.min(count, 4); i++) {
    try {
      console.log(`Generating mockup ${i + 1}/${count} with Stability AI...`);

      // Build prompt emphasizing structure preservation
      const prompt = buildStabilityPrompt(concept);
      console.log("Prompt:", prompt);

      // Prepare form data
      const formData = new FormData();

      // Convert base64 to blob
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('init_image', blob);

      // Add text prompts
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', '1');

      // Critical parameters for structure preservation
      formData.append('image_strength', IMAGE_STRENGTH.toString()); // How much to change (0.2-0.35 preserves structure)
      formData.append('cfg_scale', '7'); // How closely to follow prompt
      formData.append('samples', '1');
      formData.append('steps', '30');

      const response = await fetch(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Accept': 'application/json',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Stability AI error (${response.status}):`, errorText);
        throw new Error(`Stability AI API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.artifacts && data.artifacts[0]) {
        const imageBase64 = data.artifacts[0].base64;
        mockups.push({
          id: `mockup-${i + 1}`,
          dataUrl: `data:image/png;base64,${imageBase64}`,
        });
        console.log(`Successfully generated mockup ${i + 1}`);
      }
    } catch (error: any) {
      console.error(`Error generating mockup ${i + 1}:`, error);
      // Continue with next mockup even if one fails
    }
  }

  console.log(`=== Generated ${mockups.length}/${count} mockups with Stability AI ===`);

  if (mockups.length === 0) {
    throw new Error("Failed to generate any mockups");
  }

  return NextResponse.json({
    mockups,
    disclaimer: "Concept preview only. Real results depend on materials, techniques, and workmanship.",
    provider: "stability",
  });
}

async function generateWithDALLE(beforeImage: string, concept: any, count: number) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    return NextResponse.json(
      { error: "OpenAI not configured. Please add OPENAI_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const mockups = [];
  const prompt = buildDALLEPrompt(concept);

  for (let i = 0; i < Math.min(count, 4); i++) {
    try {
      console.log(`Generating mockup ${i + 1}/${count} with DALL-E 3...`);

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      if (response.data && response.data[0]) {
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
    }
  }

  console.log(`=== Generated ${mockups.length}/${count} mockups with DALL-E ===`);

  return NextResponse.json({
    mockups,
    disclaimer: "Concept preview only. Real results depend on materials, techniques, and workmanship.",
    provider: "dalle",
  });
}

function buildStabilityPrompt(concept: any): string {
  const {
    itemType = "furniture piece",
    targetStyle = "modern",
    targetColor = "white",
    targetFinish = "painted",
    hardware = "updated hardware",
  } = concept;

  // Emphasize: SAME furniture, ONLY change finish/color
  return `IMPORTANT: Preserve the exact same furniture structure, shape, and form.
Only change the surface finish and color.

The same ${itemType} with:
- Style: ${targetStyle}
- Finish: ${targetFinish}
- Color: ${targetColor}
- Hardware: ${hardware}

Keep the EXACT same:
- Furniture type and proportions
- Cabinet doors and drawers layout
- Legs and base structure
- Overall dimensions

Only change:
- Paint color and finish
- Hardware style
- Surface texture

Photorealistic, professional furniture photography, neutral background, well-lit.`;
}

function buildDALLEPrompt(concept: any): string {
  const {
    itemType = "furniture piece",
    material = "wood",
    targetStyle = "modern",
    targetFinish = "painted",
    targetColor = "white",
    hardware = "none",
  } = concept;

  return `A photograph of a ${itemType} made of ${material} in ${targetStyle} style with:
- Finish: ${targetFinish} in ${targetColor}
- Hardware: ${hardware}
- Overall aesthetic: ${targetStyle}

Photorealistic style, clean well-lit interior photography, neutral background, professional product photography quality.`;
}
