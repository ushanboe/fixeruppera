import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, constraints } = body;

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

    // Map budget band to actual ranges for Australian context
    const budgetRanges = {
      "$": { min: 20, max: 100, description: "minimal budget" },
      "$$": { min: 80, max: 250, description: "moderate budget" },
      "$$$": { min: 200, max: 500, description: "generous budget" }
    };
    const budgetInfo = budgetRanges[constraints.budgetBand as keyof typeof budgetRanges] || budgetRanges["$$"];

    const prompt = `Analyze these two furniture photos to create a transformation plan.

PHOTO 1 - BEFORE: The current state of the user's furniture item
PHOTO 2 - TARGET: The inspiration/target look the user wants to achieve

USER CONSTRAINTS:
- Style goal: ${constraints.styleGoal}
- Budget: ${budgetInfo.description} (AUD ${budgetInfo.min}-${budgetInfo.max})
- Tools available: ${constraints.tools} (basic = hand tools only, power = power tools available)
- Timeline: ${constraints.timeline}
- Experience: ${constraints.experience || "beginner"}

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
        "title": "Step title",
        "detail": "Detailed instructions specific to achieving the target look. Reference the target style."
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
- Be specific about what changes are needed to match the target
- Materials and quantities should be realistic for the actual items shown
- Steps should explicitly reference achieving the target look
- Consider the user's tools and budget constraints
- If items are very different types, note this and adapt the plan accordingly`;

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

    // Validate response structure
    if (!result.plan || !result.plan.steps || result.plan.steps.length === 0) {
      throw new Error("Invalid AI response structure");
    }

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
