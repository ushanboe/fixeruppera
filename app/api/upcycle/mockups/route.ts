import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beforeImage, targetImage, concept, count = 2 } = body;

    console.log("=== MOCKUP GENERATION START (Qwen-Image-Edit) ===");
    console.log("Mode:", targetImage ? "Pro (dual-image)" : "Standard (single-image)");
    console.log("Concept:", JSON.stringify(concept, null, 2));

    if (!process.env.DASHSCOPE_API_KEY) {
      console.error("DASHSCOPE_API_KEY not configured");
      return NextResponse.json(
        { error: "Qwen-Image-Edit not configured. Please add DASHSCOPE_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const baseInstruction = targetImage
      ? buildDualImageInstruction(concept)
      : buildEditInstruction(concept);
    console.log("Base instruction:", baseInstruction);

    // Variation hints to produce genuinely different mockups
    const variationHints = [
      "", // First mockup: use base instruction as-is
      " Try a slightly different interpretation — vary the color tones, finish, or styling approach while keeping the same transformation concept.",
      " Explore a bolder creative direction — different color palette or accent details while achieving the same transformation goal.",
      " Take a more subtle, minimalist approach to this transformation.",
    ];

    // Generate all mockups in parallel with per-call timeout to stay under Vercel's 60s limit
    const CALL_TIMEOUT = 50_000; // 50s per call — leaves headroom before Vercel's 60s kill

    const generateOne = async (i: number) => {
      const instruction = baseInstruction + (variationHints[i] || "");
      console.log(`Generating mockup ${i + 1}/${count} with Qwen-Image-Edit...`);

      const content = targetImage
        ? [
            { image: beforeImage },
            { image: targetImage },
            { text: instruction },
          ]
        : [
            { image: beforeImage },
            { text: instruction },
          ];

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT);

      const response = await fetch(
        "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "qwen-image-edit-max",
            input: {
              messages: [
                {
                  role: "user",
                  content,
                },
              ],
            },
            parameters: {
              n: 1,
              size: "1024*1024",
            },
          }),
        }
      );

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Qwen API error (${response.status}):`, errorText);
        throw new Error(`Qwen API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`Mockup ${i + 1} response received`);

      const imageUrl =
        result.output?.choices?.[0]?.message?.content?.[0]?.image;

      if (imageUrl) {
        console.log(`Successfully generated mockup ${i + 1}`);
        return { id: `mockup-${i + 1}`, imageUrl };
      } else {
        console.error(`No image URL in response for mockup ${i + 1}:`, JSON.stringify(result));
        return null;
      }
    };

    const indices = Array.from({ length: Math.min(count, 4) }, (_, i) => i);
    const results = await Promise.allSettled(indices.map((i) => generateOne(i)));

    // Log any rejected promises (timeouts or errors)
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Mockup ${i + 1} failed:`, r.reason?.message || r.reason);
      }
    });

    const mockups = results
      .filter((r): r is PromiseFulfilledResult<{ id: string; imageUrl: string } | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((m): m is { id: string; imageUrl: string } => m !== null);

    console.log(`=== Generated ${mockups.length}/${count} mockups with Qwen ===`);

    if (mockups.length === 0) {
      throw new Error("Failed to generate any mockups");
    }

    return NextResponse.json({
      mockups,
      disclaimer: "Concept preview only. Real results depend on materials, techniques, and workmanship.",
      provider: "qwen-image-edit",
    });
  } catch (error: any) {
    console.error("Mockup generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate mockups", mockups: [] },
      { status: 500 }
    );
  }
}

function buildDualImageInstruction(concept: any): string {
  const {
    itemType = "furniture piece",
    ideaTitle = "transformed furniture",
    keyTransformations = [],
  } = concept;

  const transformations = keyTransformations.length > 0
    ? `Key changes to apply: ${keyTransformations.join(", ")}.`
    : "";

  return `Transfer the style of Image 2 to Image 1. Keep the structure, shape, and composition of Image 1 (the ${itemType}) but transform its visual style to match Image 2 (the target inspiration). ${transformations} The goal is: "${ideaTitle}". Show the realistic finished result. Keep the same setting and background as Image 1. Make the transformation look professional and achievable.`.trim();
}

function buildEditInstruction(concept: any): string {
  const {
    itemType = "furniture piece",
    ideaTitle = "restored furniture",
    keyTransformations = [],
    stepsPreview = [],
    whyItWorks = "",
  } = concept;

  const transformations = keyTransformations.length > 0
    ? `Key changes: ${keyTransformations.join(", ")}.`
    : "";

  const steps = stepsPreview.length > 0
    ? `Process: ${stepsPreview.join(", ")}.`
    : "";

  const context = whyItWorks ? `Context: ${whyItWorks}.` : "";

  return `Transform this ${itemType} into: "${ideaTitle}". ${transformations} ${steps} ${context} Show the realistic finished result. Keep the same setting and background. Make the transformation look professional and achievable.`.trim();
}
