import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getRegionConfig } from "@/lib/region";

export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo, options, timezone } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI listing generation not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    if (!photo || !options?.description) {
      return NextResponse.json(
        { error: "Missing required fields: photo and options.description" },
        { status: 400 }
      );
    }

    const region = getRegionConfig(timezone);

    // Platform-specific prompt adjustments
    const platformGuidance: Record<string, string> = {
      "Facebook Marketplace": `Optimise for Facebook Marketplace:
- Use emojis sparingly but effectively (1-2 per section)
- Keep title under 100 characters
- Description should be conversational and scannable
- Include pickup/delivery info if location provided
- Mention "no holds" or "first come first served" if appropriate
- FB buyers skim quickly — use short paragraphs and line breaks`,
      "Gumtree": `Optimise for Gumtree:
- Lead with the price and condition
- Keep description factual and detailed
- Include dimensions if you can estimate them from the photo
- Mention suburb/area for pickup
- Gumtree buyers are deal-focused — emphasise value`,
      "eBay": `Optimise for eBay:
- Create SEO-friendly title with key search terms (max 80 chars)
- Use item specifics format (Material:, Colour:, Dimensions:, Brand:)
- Description should be thorough and professional
- Include condition details that match eBay's condition categories
- Mention packaging/shipping or pickup-only`,
      "General": `Create a general-purpose listing:
- Write a clear, well-structured description
- Works across any platform
- Balance between detail and readability
- Include all key selling points`,
    };

    // Tone modifiers
    const toneGuidance: Record<string, string> = {
      "Professional": "Write in a professional, polished tone. Use complete sentences, proper grammar, and a confident but not salesy voice.",
      "Friendly": "Write in a warm, friendly, approachable tone. Like chatting with a neighbour about something cool you're selling.",
      "Casual": "Write in a laid-back, casual tone. Short sentences, relaxed language. Think texting a mate.",
      "Detailed": "Write in a thorough, informative tone. Include all details a buyer might want — dimensions, materials, history, care instructions.",
      "Quick & Punchy": "Write in a punchy, attention-grabbing tone. Short and snappy. Get the key points across fast with impact.",
    };

    const priceContext = options.priceMin || options.priceMax
      ? `User's asking price range: ${region.currencySymbol}${options.priceMin || "?"} - ${region.currencySymbol}${options.priceMax || "?"}`
      : `No price set by user — suggest a fair price range in ${region.currency}`;

    const locationContext = options.location
      ? `Pickup location: ${options.location}`
      : "No pickup location specified";

    const systemPrompt = `You are an expert marketplace listing writer specialising in upcycled and restored furniture/items.

${platformGuidance[options.platform] || platformGuidance["General"]}

${toneGuidance[options.tone] || toneGuidance["Friendly"]}

ITEM CONTEXT:
- User's description: ${options.description}
- Category: ${options.category}
- Condition: ${options.condition}
- ${priceContext}
- ${locationContext}
- Region: ${region.country}, prices in ${region.currency} (${region.currencySymbol})

CRITICAL RULES:
1. Look at the photo carefully to describe the actual item — colour, material, style, size estimation
2. DO NOT invent features not visible in the photo
3. If the item is "Restored/Upcycled", highlight the craftsmanship and uniqueness
4. Match the selected tone precisely
5. Use the correct currency for pricing (${region.currencySymbol})
6. Generate hashtags relevant to the platform and item

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "title": "Compelling listing title (platform-appropriate length)",
  "description": "Full listing description with line breaks (use \\n for new lines)",
  "bulletPoints": ["Key selling point 1", "Key selling point 2", "Key selling point 3", "Key selling point 4"],
  "hashtags": ["#relevant", "#hashtag", "#examples"],
  "priceRecommendation": { "min": number, "max": number, "currency": "${region.currency}", "note": "Brief pricing rationale" },
  "platformTip": "One helpful tip specific to selling this item on ${options.platform}"
}`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: photo, detail: "low" },
          },
          {
            type: "text",
            text: `Write a ${options.platform} listing for this ${options.condition.toLowerCase()} ${options.category.toLowerCase()} item. Description: "${options.description}". Tone: ${options.tone}.`,
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response
    if (!result.title || !result.description) {
      throw new Error("Invalid AI response — missing title or description");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Listing generation error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to generate listing",
        title: "Listing Generation Failed",
        description: "We couldn't generate your listing right now. Please try again.",
        bulletPoints: [],
        hashtags: [],
        platformTip: "Try again in a moment — the AI service may be temporarily busy.",
      },
      { status: 500 }
    );
  }
}
