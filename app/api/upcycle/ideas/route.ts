import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, constraints } = body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI ideas generation not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Build context about the item
    const itemType = analysis.objectCandidates?.[0]?.label || "furniture item";
    const materials = analysis.materials?.map((m: any) => m.label).join(", ") || "unknown materials";
    const issues = analysis.condition?.issues?.map((i: any) => i.label).join(", ") || "no major issues noted";
    const safetyFlags = analysis.safetyFlags?.map((f: any) => `${f.label}: ${f.why}`).join("; ") || "none";

    // Map budget band to actual ranges for Australian context
    const budgetRanges = {
      "$": { min: 20, max: 100, description: "minimal budget" },
      "$$": { min: 80, max: 250, description: "moderate budget" },
      "$$$": { min: 200, max: 500, description: "generous budget" }
    };
    const budgetInfo = budgetRanges[constraints.budgetBand as keyof typeof budgetRanges] || budgetRanges["$$"];

    // Detect Creative Reuse mode (has useCase instead of styleGoal)
    const isCreativeReuse = !!constraints.useCase;

    const prompt = isCreativeReuse
      ? `Generate 5 PRACTICAL restoration and repurposing ideas for this found object.

OBJECT DETAILS:
- Current item: ${itemType}
- Materials: ${materials}
- Condition: ${issues}
- Safety concerns: ${safetyFlags}

USER CONSTRAINTS:
- Use case preference: ${constraints.useCase}
- Skill level: ${constraints.skillLevel}
- Materials available: ${constraints.materialsAvailable}
- Intended audience: ${constraints.intendedAudience}
- Budget: ${budgetInfo.description} (AUD ${budgetInfo.min}-${budgetInfo.max})
- Time: ${constraints.timeBand}

CRITICAL PRACTICALITY REQUIREMENTS:
1. PRESERVE the object's basic form - if it's a table, keep it as a table; if it's a chair, keep it as a chair
2. Focus PRIMARILY on restoration/refinishing ideas (3-4 ideas should maintain current purpose)
3. Only 1-2 ideas can suggest a NEW purpose, and these MUST be practical and simple
4. DO NOT suggest major reconstruction (no "turn table into wall shelf" or "convert to bench")
5. DO NOT suggest disassembly or cutting down the main structure
6. Focus on surface treatments, repairs, and styling changes
7. Use Australian context (Bunnings products, climate, lifestyle)
8. Match user's skill level - don't suggest complex joinery for beginners

GOOD EXAMPLES (for old wooden side table):
- Idea 1: Rustic farmhouse side table (sand down, dark walnut stain, seal) [REFINISH - same purpose]
- Idea 2: Modern painted accent table (clean, sage green paint, new knobs) [REFINISH - same purpose]
- Idea 3: Vintage shabby chic table (chalk paint, distress, clear wax) [REFINISH - same purpose]
- Idea 4: Outdoor patio side table (repair, outdoor stain, weatherproof seal) [REPURPOSE - slight change]
- Idea 5: Entryway console table (restore, add hooks underneath, paint) [REPURPOSE - slight change]

Notice: All respect the TABLE form. Most are refinishing. Only 2 suggest new locations/uses, but structure stays intact!

BAD EXAMPLES (too dramatic - DO NOT DO THIS):
- ❌ Transform into storage bench (requires cutting legs, major reconstruction)
- ❌ Create wall shelf (requires complete disassembly)
- ❌ Garden tool organizer (doesn't respect object's form)
- ❌ Turn into gift box (major reconstruction)

Provide response as JSON:
{
  "ideas": [
    {
      "id": "unique-slug",
      "title": "Specific descriptive title (e.g., 'Rustic Farmhouse Side Table')",
      "category": "functional|decorative|storage|outdoor|gift",
      "whyItWorks": "Brief explanation focusing on preserving the object's core purpose",
      "difficulty": "beginner|intermediate|advanced",
      "timeEstimate": {"minHours": number, "maxHours": number},
      "costEstimate": {"min": number, "max": number, "currency": "AUD"},
      "keyTransformations": ["Surface finish changes", "Structure stays same", "Minor additions like hardware"],
      "stepsPreview": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}

Generate 5 practical ideas - prioritize refinishing over reconstruction!`
      : `Generate 4-5 realistic upcycling ideas for this furniture item.

ITEM DETAILS:
- Type: ${itemType}
- Materials: ${materials}
- Condition issues: ${issues}
- Safety concerns: ${safetyFlags}

USER CONSTRAINTS:
- Style goal: ${constraints.styleGoal}
- Budget: ${budgetInfo.description} (AUD ${budgetInfo.min}-${budgetInfo.max})
- Tools available: ${constraints.tools} (basic = hand tools only, power = power tools available)
- Timeline: ${constraints.timeBand}

IMPORTANT GUIDELINES:
1. Generate ideas that match the ACTUAL materials (if metal, suggest metal finishing; if wood, suggest wood finishing)
2. DO NOT suggest wood staining for metal items
3. DO NOT suggest upholstery removal if the item has no upholstery
4. Consider the user's budget, tools, and experience level
5. Include at least one "quick & easy" option and one "more involved" option
6. Be realistic about time and cost estimates for Australian context
7. Consider safety concerns in your suggestions
8. Each idea should be genuinely different from the others

Provide response as JSON:
{
  "ideas": [
    {
      "id": "unique-slug",
      "title": "Descriptive title (e.g., 'Industrial Black Spray Paint Makeover')",
      "whyItWorks": "Brief explanation of why this suits the item and user's goals",
      "difficulty": "easy|medium|hard",
      "timeEstimate": {"minHours": number, "maxHours": number},
      "costEstimate": {"min": number, "max": number, "currency": "AUD"},
      "stepsPreview": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }
  ]
}

Generate 4-5 ideas that are appropriate for this specific item and user's constraints.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: isCreativeReuse ? 0.5 : 0.7, // Lower temperature for Creative Reuse = more conservative
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response structure
    if (!result.ideas || !Array.isArray(result.ideas) || result.ideas.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Ideas generation error:", error);

    // Provide fallback ideas
    const fallbackIdeas = {
      ideas: [
        {
          id: "basic-clean-refresh",
          title: "Basic Clean & Refresh",
          whyItWorks: "Simple cleaning and minor repairs can make a big difference",
          difficulty: "easy",
          timeEstimate: { minHours: 1, maxHours: 3 },
          costEstimate: { min: 10, max: 40, currency: "AUD" },
          stepsPreview: ["Clean thoroughly", "Repair minor damage", "Apply protective finish", "Polish/buff"]
        }
      ],
      error: error.message || "AI service temporarily unavailable"
    };

    return NextResponse.json(fallbackIdeas);
  }
}
