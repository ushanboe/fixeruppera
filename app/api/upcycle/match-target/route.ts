import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, identification, constraints } = body;

    // DEBUG: Log incoming request data
    console.log("=== MATCH-TARGET DEBUG START ===");
    console.log("Received identification data:", JSON.stringify(identification, null, 2));
    console.log("Received constraints:", JSON.stringify(constraints, null, 2));

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI comparison not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Find before and target images
    const beforeImage = images.find((img: any) => img.role === "before");
    const targetImage = images.find((img: any) => img.role === "target");

    if (!beforeImage || !targetImage) {
      return NextResponse.json(
        { error: "Both before and target images are required" },
        { status: 400 }
      );
    }

    // Extract identification data
    const beforeItem = identification?.before?.candidates?.[0]?.label || "furniture item";
    const beforeMaterial = identification?.before?.materials?.[0]?.label || "unknown material";
    const targetStyle = identification?.target?.style || "the target style";
    const targetFeatures = identification?.target?.keyFeatures || [];

    // DEBUG: Log extracted values
    console.log("Extracted values:");
    console.log("  - beforeItem:", beforeItem);
    console.log("  - beforeMaterial:", beforeMaterial);
    console.log("  - targetStyle:", targetStyle);
    console.log("  - targetFeatures:", targetFeatures);

    // Map budget band to actual ranges for Australian context
    const budgetRanges = {
      "$": { min: 20, max: 100, description: "minimal budget" },
      "$$": { min: 80, max: 250, description: "moderate budget" },
      "$$$": { min: 200, max: 500, description: "generous budget" }
    };
    const budgetInfo = budgetRanges[constraints.budgetBand as keyof typeof budgetRanges] || budgetRanges["$$"];

    const prompt = `Create a transformation plan to convert the user's furniture to match the target style.

BEFORE ITEM (already identified):
- Item Type: ${beforeItem}
- Material: ${beforeMaterial}

TARGET STYLE (already identified):
- Style: ${targetStyle}
${targetFeatures.length > 0 ? `- Key Features: ${targetFeatures.join(", ")}` : ""}

USER CONSTRAINTS:
- Budget: ${budgetInfo.description} (AUD ${budgetInfo.min}-${budgetInfo.max})
- Tools available: ${constraints.tools} (basic = hand tools only, power = power tools available)
- Timeline: ${constraints.timeBand}
- Experience: ${constraints.experience || "beginner"}

CRITICAL: Generate instructions specifically for transforming a ${beforeItem} made of ${beforeMaterial} to match ${targetStyle} style.
DO NOT generate instructions for other furniture types. The item is a ${beforeItem}, not a bed, chair, or any other item.

ANALYZE AND PROVIDE:
1. Target Style Summary: Identify the style, era, and key visual elements of the target photo
2. Key Differences: List specific changes needed (finish, color, hardware, material treatments, etc.)
3. Transformation Plan: Detailed DIY plan to transform the before into the target style

Provide response as JSON:
{
  "targetSummary": {
    "style": "specific style name (e.g., 'Mid-Century Modern', 'Industrial Chic', 'Scandinavian')",
    "keyElements": ["element 1", "element 2", "element 3"]
  },
  "differences": [
    {
      "change": "what aspect changes (e.g., 'Finish', 'Hardware', 'Color')",
      "from": "current state",
      "to": "target state"
    }
  ],
  "plan": {
    "title": "Descriptive transformation title",
    "difficulty": "easy|medium|hard",
    "timeEstimate": {"minHours": number, "maxHours": number},
    "costEstimate": {"min": number, "max": number, "currency": "AUD"},
    "materials": [
      {
        "item": "Specific product name",
        "qty": "Realistic quantity (consider actual item size and surface area)"
      }
    ],
    "steps": [
      {
        "n": number,
        "title": "Step title specific to ${beforeItem}",
        "detail": "Detailed instructions for transforming this ${beforeItem} made of ${beforeMaterial}. Include timing, techniques appropriate for ${beforeMaterial}, and how to achieve ${targetStyle} aesthetic."
      }
    ],
    "safety": [
      {
        "level": "warning|danger",
        "text": "Safety concern and mitigation"
      }
    ],
    "resale": {
      "enabled": true,
      "range": {"min": number, "max": number, "currency": "AUD"},
      "note": "Resale estimate note"
    }
  }
}

IMPORTANT:
- Generate ALL instructions specifically for a ${beforeItem} (NOT for beds, chairs, or other items)
- Consider that the item is made of ${beforeMaterial} when suggesting treatments
- Be specific about what changes are needed to match ${targetStyle}
- Materials and quantities should be realistic for the actual ${beforeItem} size and surface area
- Steps should explicitly reference the ${beforeItem} and achieving ${targetStyle} style
- Consider the user's tools and budget constraints
- NEVER reference furniture types other than ${beforeItem} in your instructions`;

    // DEBUG: Log the prompt being sent
    console.log("=== PROMPT BEING SENT TO OPENAI ===");
    console.log(prompt);
    console.log("=== END PROMPT ===");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: beforeImage.dataUrl
              }
            },
            {
              type: "image_url",
              image_url: {
                url: targetImage.dataUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // DEBUG: Log OpenAI response
    console.log("=== OPENAI RESPONSE ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("=== END OPENAI RESPONSE ===");

    // Validate response structure
    if (!result.plan || !result.plan.steps || result.plan.steps.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    // DEBUG: Check if steps reference the correct item type
    const stepsText = JSON.stringify(result.plan.steps);
    console.log("=== STEP TEXT CHECK ===");
    console.log("Steps contain beforeItem (" + beforeItem + "):", stepsText.includes(beforeItem));
    console.log("Steps contain 'bed':", stepsText.toLowerCase().includes("bed"));
    console.log("Steps contain 'frame':", stepsText.toLowerCase().includes("frame"));
    console.log("=== MATCH-TARGET DEBUG END ===");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Match-target error:", error);

    // Provide fallback response
    const fallbackResponse = {
      targetSummary: {
        style: "Modern refresh",
        keyElements: ["Updated finish", "New hardware", "Fresh color"]
      },
      differences: [
        {
          change: "Overall approach",
          from: "Current state",
          to: "Target inspiration"
        }
      ],
      plan: {
        title: "Basic Transformation Plan",
        difficulty: "medium",
        timeEstimate: { minHours: 4, maxHours: 12 },
        costEstimate: { min: 50, max: 200, currency: "AUD" },
        materials: [
          { item: "Cleaning supplies", qty: "As needed" },
          { item: "Paint or finish", qty: "As needed" },
          { item: "Hardware (if needed)", qty: "As needed" }
        ],
        steps: [
          {
            n: 1,
            title: "Clean and prepare",
            detail: "Thoroughly clean and prepare the surface"
          },
          {
            n: 2,
            title: "Apply new finish",
            detail: "Apply finish to match target style"
          },
          {
            n: 3,
            title: "Install hardware",
            detail: "Add or replace hardware as needed"
          }
        ],
        safety: [
          {
            level: "warning",
            text: "Work in well-ventilated area. Use appropriate protective equipment."
          }
        ],
        resale: {
          enabled: true,
          range: { min: 80, max: 250, currency: "AUD" },
          note: "Value depends on quality of transformation"
        }
      },
      error: error.message || "AI service temporarily unavailable - showing generic plan"
    };

    return NextResponse.json(fallbackResponse);
  }
}
