import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI identification not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API with gpt-4o-mini
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this furniture photo and identify what it is.

Provide your analysis as JSON with this exact structure:
{
  "candidates": [
    {"label": "Primary identification", "confidence": 0.0-1.0, "notes": "Brief explanation"},
    {"label": "Secondary identification", "confidence": 0.0-1.0, "notes": "Brief explanation"},
    {"label": "Tertiary identification", "confidence": 0.0-1.0, "notes": "Brief explanation"}
  ],
  "materials": [
    {"label": "material name", "confidence": 0.0-1.0}
  ]
}

Guidelines:
- Be specific (e.g., "Vintage Iron Bed Frame" not just "Bed")
- Include style/era if visible (Victorian, Mid-Century Modern, etc.)
- Be truthful - if uncertain, use lower confidence scores
- Identify 2-3 most likely materials with confidence scores
- Keep notes concise (under 100 characters)
- Confidence should reflect how certain you are (0.9+ = very certain, 0.5-0.7 = moderate, <0.5 = uncertain)`
            },
            {
              type: "image_url",
              image_url: {
                url: image.dataUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response structure
    if (!result.candidates || !Array.isArray(result.candidates) || result.candidates.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Identification error:", error);

    // Provide fallback response if AI fails
    const fallbackResponse = {
      candidates: [
        {
          label: "Furniture Item",
          confidence: 0.3,
          notes: "AI identification unavailable - please proceed with manual identification"
        }
      ],
      materials: [
        { label: "Unknown", confidence: 0.1 }
      ],
      error: error.message || "AI service temporarily unavailable"
    };

    return NextResponse.json(fallbackResponse);
  }
}
