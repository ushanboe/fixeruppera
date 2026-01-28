import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, locale } = body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI analysis not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this furniture item in detail for upcycling purposes.

Provide a comprehensive analysis as JSON with this structure:
{
  "objectCandidates": [
    {"label": "specific item type", "confidence": 0.0-1.0}
  ],
  "materials": [
    {"label": "material name", "confidence": 0.0-1.0}
  ],
  "condition": {
    "issues": [
      {"label": "issue description", "severity": "low|medium|high"}
    ],
    "notes": "Overall condition assessment"
  },
  "styleCues": ["style1", "style2"],
  "safetyFlags": [
    {"label": "safety_concern", "why": "explanation"}
  ]
}

Guidelines:
- Identify specific materials (metal, iron, steel, wood, fabric, etc.)
- Note any visible damage, rust, paint issues, structural problems
- Assess condition realistically (rust on metal, chips, cracks, stability)
- Identify style/era if visible
- Flag safety concerns (rust, sharp edges, lead paint risk, stability issues)
- Be specific and truthful`
            },
            {
              type: "image_url",
              image_url: {
                url: images[0].dataUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);

    const fallbackAnalysis = {
      objectCandidates: [
        { label: "Furniture Item", confidence: 0.3 }
      ],
      materials: [
        { label: "Unknown", confidence: 0.1 }
      ],
      condition: {
        issues: [],
        notes: "AI analysis unavailable - please assess condition manually"
      },
      styleCues: [],
      safetyFlags: [],
      error: error.message || "AI service temporarily unavailable"
    };

    return NextResponse.json(fallbackAnalysis);
  }
}
