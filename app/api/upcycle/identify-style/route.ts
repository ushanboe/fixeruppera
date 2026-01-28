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
        { error: "AI style identification not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API to identify the style/inspiration
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this furniture/interior photo to identify its style and key characteristics.

This is a TARGET/INSPIRATION photo that the user wants to replicate.

Provide your analysis as JSON with this structure:
{
  "style": "Primary style name (e.g., 'Mid-Century Modern', 'Industrial Chic', 'Scandinavian Minimalist')",
  "confidence": 0.0-1.0,
  "keyFeatures": ["feature 1", "feature 2", "feature 3"],
  "colors": ["primary color", "secondary color"],
  "description": "Brief 1-2 sentence description of the overall aesthetic"
}

Guidelines:
- Be specific about the style (include era/sub-style if relevant)
- Identify 3-5 key visual features that define this look
- Note dominant colors or finishes
- Keep description concise and actionable
- Use confidence score honestly (0.9+ = very certain, 0.5-0.7 = moderate)`
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
      max_tokens: 500,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response structure
    if (!result.style) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Style identification error:", error);

    // Provide fallback response if AI fails
    const fallbackResponse = {
      style: "Modern Style",
      confidence: 0.3,
      keyFeatures: ["Clean lines", "Neutral tones", "Simple design"],
      colors: ["Neutral", "Natural"],
      description: "AI style analysis unavailable - proceeding with manual assessment",
      error: error.message || "AI service temporarily unavailable"
    };

    return NextResponse.json(fallbackResponse);
  }
}
