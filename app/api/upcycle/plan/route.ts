import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getRegionConfig } from "@/lib/region";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, ideaId, constraints, assumptions, selectedIdea, timezone } = body;
    const region = getRegionConfig(timezone);

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI plan generation not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Build context about the item and idea
    const itemType = analysis.objectCandidates?.[0]?.label || "furniture item";
    const materials = analysis.materials?.map((m: any) => m.label).join(", ") || "unknown materials";
    const issues = analysis.condition?.issues?.map((i: any) => `${i.label} (${i.severity})`).join(", ") || "no major issues";
    const conditionNotes = analysis.condition?.notes || "condition not specified";
    const safetyFlags = analysis.safetyFlags?.map((f: any) => `${f.label}: ${f.why}`).join("; ") || "none";

    // Get idea details from the request - the frontend should send the full idea object
    const ideaTitle = selectedIdea?.title || "makeover";
    const ideaDifficulty = selectedIdea?.difficulty || "medium";
    const ideaStepsPreview = selectedIdea?.stepsPreview || [];
    const keyTransformations = selectedIdea?.keyTransformations || [];

    // Detect Creative Reuse mode (has useCase instead of styleGoal)
    const isCreativeReuse = !!constraints.useCase;

    // Analyze materials to determine appropriate treatments (Creative Reuse mode)
    let materialGuidance = "";
    if (isCreativeReuse) {
      const materialsList = materials.toLowerCase();
      const hasFabric = materialsList.includes('fabric') || materialsList.includes('upholstery') || materialsList.includes('cloth') || materialsList.includes('textile');
      const hasWood = materialsList.includes('wood') || materialsList.includes('timber') || materialsList.includes('oak') || materialsList.includes('pine');
      const hasMetal = materialsList.includes('metal') || materialsList.includes('iron') || materialsList.includes('steel') || materialsList.includes('aluminum');
      const hasLeather = materialsList.includes('leather');

      materialGuidance = "\n\nMATERIAL-SPECIFIC REQUIREMENTS:\n";

      if (hasFabric) {
        materialGuidance += `- FABRIC/UPHOLSTERY: Include steps for reupholstering, fabric cleaning, or slipcover installation. DO NOT include sanding, staining, or wood finishing steps for fabric surfaces.\n`;
      }

      if (hasWood && !hasFabric) {
        materialGuidance += `- WOOD: Include sanding, staining, painting, or wood finishing steps as appropriate.\n`;
      }

      if (hasWood && hasFabric) {
        materialGuidance += `- WOOD FRAME + FABRIC: Separate steps for wood parts (sanding/staining frame) and fabric parts (reupholstering/cleaning seat).\n`;
      }

      if (hasMetal) {
        materialGuidance += `- METAL: Include rust removal, metal primer, and appropriate metal finishing (spray paint, powder coating). DO NOT suggest wood staining.\n`;
      }

      if (hasLeather) {
        materialGuidance += `- LEATHER: Include leather conditioning, cleaning, or leather dye steps. DO NOT suggest standard paint unless leather paint is specified.\n`;
      }
    }

    const prompt = isCreativeReuse
      ? `Generate a detailed repurposing plan to transform this found object.

FROM: ${itemType}
TO: ${ideaTitle}

TRANSFORMATION APPROACH:
${keyTransformations.length > 0 ? `- Keep: ${keyTransformations[1] || "core structure"}
- Change: ${keyTransformations[0] || "finish and appearance"}
- Add: ${keyTransformations[2] || "new functional elements"}` : "- Transform the object while maintaining its integrity"}

OBJECT DETAILS:
- Current item: ${itemType}
- Materials: ${materials}
- Condition: ${conditionNotes}
- Issues: ${issues}
- Safety concerns: ${safetyFlags}${materialGuidance}

USER CONTEXT:
- Skill level: ${constraints.skillLevel}
- Materials available: ${constraints.materialsAvailable}
- Intended audience: ${constraints.intendedAudience}
- Budget: ${constraints.budgetBand}
- Timeline: ${constraints.timeBand}

CRITICAL REQUIREMENTS:
1. This is a REPURPOSING project - transform from one purpose to another
2. Calculate material quantities based on actual object size
3. Include disassembly/cleaning steps if needed
4. Provide modification instructions specific to the transformation
5. Include assembly/installation steps for new purpose
6. ${region.pricingContext}
7. Safety warnings specific to repurposing (sharp edges, rust, stability)
8. Suggest where to take photos/sketches at key steps

Provide response as JSON:
{
  "title": "Transformation plan title (FROM → TO format)",
  "difficulty": "beginner|intermediate|advanced",
  "timeEstimate": {"minHours": number, "maxHours": number},
  "costEstimate": {"min": number, "max": number, "currency": "${region.currency}"},
  "materials": [
    {
      "item": "Generic product description (no brand or store names)",
      "qty": "Realistic quantity for transformation"
    }
  ],
  "steps": [
    {
      "n": 1,
      "title": "Step title",
      "detail": "Detailed instructions for this transformation step. Include timing and techniques."
    }
  ],
  "safety": [
    {
      "level": "warning|danger",
      "text": "Specific safety concern for repurposing and how to address it"
    }
  ],
  "resale": {
    "enabled": true,
    "range": {"min": number, "max": number, "currency": "${region.currency}"},
    "note": "Value assessment for the repurposed item"
  }
}

Generate 5-8 detailed transformation steps with 6-12 materials.`
      : `Generate a detailed, realistic DIY plan for this furniture upcycling project.

ITEM DETAILS:
- Type: ${itemType}
- Materials: ${materials}
- Condition: ${conditionNotes}
- Issues to address: ${issues}
- Safety concerns: ${safetyFlags}

PROJECT IDEA:
- Title: ${ideaTitle}
- Difficulty: ${ideaDifficulty}
- Overview steps: ${ideaStepsPreview.join(", ")}

USER CONSTRAINTS:
- Style goal: ${constraints.styleGoal}
- Budget: ${constraints.budgetBand}
- Tools: ${constraints.tools}
- Timeline: ${constraints.timeline}
- Experience: ${constraints.experience || "beginner"}

CRITICAL REQUIREMENTS:
1. Calculate REALISTIC material quantities based on the ACTUAL item size and type
   - A bed frame needs more paint than a chair
   - Metal items need rust treatment and metal primer, not wood products
   - Consider the actual surface area to be covered
2. Generate SPECIFIC instructions tailored to the actual materials
   - Metal: rust removal, metal primer, spray paint or enamel
   - Wood: sanding, wood primer, wood stain or paint
   - Don't suggest wood staining for metal items
3. ${region.pricingContext}
4. Each step should be detailed and specific to THIS item
5. Consider the condition issues when planning steps
6. Include safety warnings specific to the materials and processes

Provide response as JSON:
{
  "title": "Specific descriptive title for this plan",
  "difficulty": "easy|medium|hard",
  "timeEstimate": {"minHours": number, "maxHours": number},
  "costEstimate": {"min": number, "max": number, "currency": "${region.currency}"},
  "materials": [
    {
      "item": "Generic product description (no brand or store names)",
      "qty": "Realistic quantity for THIS specific item (e.g., '2L for large bed frame', '500ml for small chair')"
    }
  ],
  "steps": [
    {
      "n": 1,
      "title": "Step title",
      "detail": "Detailed instructions specific to this item and materials. Include timing, techniques, and tips."
    }
  ],
  "safety": [
    {
      "level": "warning|danger",
      "text": "Specific safety concern and how to address it"
    }
  ],
  "resale": {
    "enabled": true,
    "range": {"min": number, "max": number, "currency": "${region.currency}"},
    "note": "Realistic assessment based on item type and transformation"
  }
}

Generate a detailed, specific plan with 5-8 steps and 6-12 materials with realistic quantities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response structure
    if (!result.steps || !Array.isArray(result.steps) || result.steps.length === 0) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Plan generation error:", error);

    // Provide fallback plan
    const fallbackPlan = {
      title: "Basic Makeover Plan",
      difficulty: "easy",
      timeEstimate: { minHours: 2, maxHours: 6 },
      costEstimate: { min: 30, max: 100, currency: "USD" },
      materials: [
        { item: "Cleaning supplies", qty: "As needed" },
        { item: "Paint or finish", qty: "As needed" },
        { item: "Basic tools", qty: "As needed" }
      ],
      steps: [
        {
          n: 1,
          title: "Clean the item",
          detail: "Thoroughly clean all surfaces to prepare for finishing"
        },
        {
          n: 2,
          title: "Prepare surface",
          detail: "Sand or prep the surface as needed for the material type"
        },
        {
          n: 3,
          title: "Apply finish",
          detail: "Apply your chosen finish according to product instructions"
        }
      ],
      safety: [
        {
          level: "warning",
          text: "Work in a well-ventilated area and wear appropriate safety equipment"
        }
      ],
      resale: {
        enabled: true,
        range: { min: 50, max: 150, currency: "USD" },
        note: "Value depends on quality of execution"
      },
      error: error.message || "AI service temporarily unavailable - showing generic plan"
    };

    return NextResponse.json(fallbackPlan);
  }
}
