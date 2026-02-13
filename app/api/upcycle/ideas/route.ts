import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getRegionConfig, scaleBudget } from "@/lib/region";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, constraints, timezone } = body;
    const region = getRegionConfig(timezone);

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

    // Map budget band to actual ranges, scaled for region
    const baseBudgetRanges = {
      "$": { min: 20, max: 100, description: "minimal budget" },
      "$$": { min: 80, max: 250, description: "moderate budget" },
      "$$$": { min: 200, max: 500, description: "generous budget" }
    };
    const budgetRanges = scaleBudget(baseBudgetRanges, region);
    const budgetInfo = budgetRanges[constraints.budgetBand as keyof typeof budgetRanges] || budgetRanges["$$"];

    // Detect Creative Reuse mode (has useCase instead of styleGoal)
    const isCreativeReuse = !!constraints.useCase;

    // Analyze materials to determine appropriate treatments
    const materialsList = materials.toLowerCase();
    const hasFabric = materialsList.includes('fabric') || materialsList.includes('upholstery') || materialsList.includes('cloth') || materialsList.includes('textile');
    const hasWood = materialsList.includes('wood') || materialsList.includes('timber') || materialsList.includes('oak') || materialsList.includes('pine');
    const hasMetal = materialsList.includes('metal') || materialsList.includes('iron') || materialsList.includes('steel') || materialsList.includes('aluminum');
    const hasLeather = materialsList.includes('leather');
    const hasPlastic = materialsList.includes('plastic');

    // Build material-specific guidance
    let materialGuidance = "\nMATERIAL-SPECIFIC RULES (CRITICAL - MUST FOLLOW):\n";

    if (hasFabric) {
      materialGuidance += `- FABRIC DETECTED: This item has fabric/upholstery
  * DO NOT suggest sanding, staining, or painting the fabric
  * DO suggest: reupholstering, fabric cleaning, slipcovers, fabric paint (if appropriate)
  * DO suggest: steam cleaning, professional upholstery cleaning, new cushions
  * Example good ideas: "Reupholster in modern fabric", "Add washable slipcover", "Clean and refresh existing upholstery"
  * Example BAD ideas: ❌ "Sand and stain rustic" ❌ "Apply wood finish" ❌ "Paint distressed white"\n`;
    }

    if (hasWood && !hasFabric) {
      materialGuidance += `- WOOD DETECTED (no fabric covering): This is bare wood
  * DO suggest: sanding, staining, painting, wood finishing, waxing
  * DO suggest: wood repair, filling cracks, refinishing
  * Example good ideas: "Sand and stain dark walnut", "Paint chalk white", "Natural oil finish"\n`;
    }

    if (hasWood && hasFabric) {
      materialGuidance += `- WOOD + FABRIC DETECTED: Mixed materials
  * WOOD parts: suggest sanding, staining, painting wood frame/legs
  * FABRIC parts: suggest reupholstering, cleaning, slipcovers
  * Example good ideas: "Reupholster seat, paint frame", "New fabric + stained wood legs", "Clean upholstery, refresh wood trim"\n`;
    }

    if (hasMetal) {
      materialGuidance += `- METAL DETECTED: This has metal components
  * DO suggest: rust removal, metal primer, spray paint, powder coating
  * DO NOT suggest: wood staining, wood finishing
  * Example good ideas: "Remove rust and spray paint black", "Sand metal + apply rust converter", "Powder coat in modern color"\n`;
    }

    if (hasLeather) {
      materialGuidance += `- LEATHER DETECTED: Leather surfaces present
  * DO suggest: leather conditioner, leather repair, leather dye, leather cleaner
  * DO NOT suggest: painting leather (unless leather paint specified), reupholstering (leather is premium)
  * Example good ideas: "Condition and restore leather", "Leather dye to refresh color", "Professional leather repair"\n`;
    }

    // Build design direction guidance for Standard mode
    let designDirectionGuidance = "";
    if (!isCreativeReuse && constraints.designDirection) {
      const dd = constraints.designDirection;
      if (dd.type === "custom") {
        designDirectionGuidance = `\nDESIGN DIRECTION (USER'S OWN IDEA):
The user has described their own design vision: "${dd.customText}"
Generate 4-5 ideas that interpret and expand on this concept. All ideas should be variations or elaborations of this direction.
Be creative but stay true to the user's described vision.\n`;
      } else if (dd.type === "preset") {
        // Build category-specific guidance
        const categoryGuidance = buildCategoryGuidance(dd.categoryId, dd.subcategoryId, dd.subcategoryLabel, dd.subcategoryDescription);
        designDirectionGuidance = `\nDESIGN DIRECTION: ${dd.categoryLabel} > ${dd.subcategoryLabel}
${dd.subcategoryDescription ? `Description: ${dd.subcategoryDescription}` : ""}
${categoryGuidance}\n`;
      }
    }

    const prompt = isCreativeReuse
      ? `Generate 5 PRACTICAL restoration and repurposing ideas for this found object.

OBJECT DETAILS:
- Current item: ${itemType}
- Materials: ${materials}
- Condition: ${issues}
- Safety concerns: ${safetyFlags}
${materialGuidance}

USER CONSTRAINTS:
- Use case preference: ${constraints.useCase}
- Skill level: ${constraints.skillLevel}
- Materials available: ${constraints.materialsAvailable}
- Intended audience: ${constraints.intendedAudience}
- Budget: ${budgetInfo.description} (${region.currency} ${budgetInfo.min}-${budgetInfo.max})
- Time: ${constraints.timeBand}

CRITICAL PRACTICALITY REQUIREMENTS:
1. PRESERVE the object's basic form - if it's a table, keep it as a table; if it's a chair, keep it as a chair
2. Focus PRIMARILY on restoration/refinishing ideas (3-4 ideas should maintain current purpose)
3. Only 1-2 ideas can suggest a NEW purpose, and these MUST be practical and simple
4. DO NOT suggest major reconstruction (no "turn table into wall shelf" or "convert to bench")
5. DO NOT suggest disassembly or cutting down the main structure
6. Focus on surface treatments, repairs, and styling changes
7. ${region.pricingContext}
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
      "costEstimate": {"min": number, "max": number, "currency": "${region.currency}"},
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
${materialGuidance}

USER CONSTRAINTS:
- Style goal: ${constraints.styleGoal || "not specified"}
- Budget: ${budgetInfo.description} (${region.currency} ${budgetInfo.min}-${budgetInfo.max})
- Tools available: ${constraints.tools} (basic = hand tools only, power = power tools available)
- Timeline: ${constraints.timeBand}
${designDirectionGuidance}

IMPORTANT GUIDELINES:
1. Generate ideas that match the ACTUAL materials (if metal, suggest metal finishing; if wood, suggest wood finishing)
2. DO NOT suggest wood staining for metal items
3. DO NOT suggest upholstery removal if the item has no upholstery
4. Consider the user's budget, tools, and experience level
5. Include at least one "quick & easy" option and one "more involved" option
6. ${region.pricingContext}
7. Consider safety concerns in your suggestions
8. Each idea should be genuinely different from the others
9. ALL ideas must align with the user's chosen design direction — do NOT generate generic ideas that ignore their selection

Provide response as JSON:
{
  "ideas": [
    {
      "id": "unique-slug",
      "title": "Descriptive title (e.g., 'Industrial Black Spray Paint Makeover')",
      "whyItWorks": "Brief explanation of why this suits the item and user's goals",
      "difficulty": "easy|medium|hard",
      "timeEstimate": {"minHours": number, "maxHours": number},
      "costEstimate": {"min": number, "max": number, "currency": "${region.currency}"},
      "keyTransformations": ["Key change 1", "Key change 2", "Key change 3"],
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
          costEstimate: { min: 10, max: 40, currency: "USD" },
          keyTransformations: ["Clean thoroughly", "Minor repairs", "Apply protective finish"],
          stepsPreview: ["Clean thoroughly", "Repair minor damage", "Apply protective finish", "Polish/buff"]
        }
      ],
      error: error.message || "AI service temporarily unavailable"
    };

    return NextResponse.json(fallbackIdeas);
  }
}

/**
 * Build category-specific AI guidance based on the design direction selection.
 */
function buildCategoryGuidance(categoryId: string, subcategoryId: string, subcategoryLabel: string, _subcategoryDescription: string): string {
  switch (categoryId) {
    case "classic":
      return `Generate ideas in the "${subcategoryLabel}" style. All ideas should reflect this aesthetic — colours, finishes, hardware, and overall feel should match the ${subcategoryLabel} look.`;

    case "retro-60s":
      switch (subcategoryId) {
        case "rainbow":
          return `RETRO 60's RAINBOW STYLE: Generate ideas featuring bright, multi-colour rainbow effects.
Techniques: colour blocking with multiple paint colours, gradient paint effects, rainbow stripes, tie-dye inspired patterns.
Colours: vibrant red, orange, yellow, green, blue, purple — used together.
Vibe: Fun, cheerful, retro flower-power era. Think peace signs and Woodstock.`;
        case "psychedelic":
          return `RETRO 60's PSYCHEDELIC STYLE: Generate ideas with swirling, trippy, mind-bending patterns.
Techniques: hand-painted swirls, pour-painting, marble effects, optical illusion patterns, stencilled paisleys.
Colours: hot pink, electric blue, neon green, deep purple, burnt orange — high contrast combos.
Vibe: Far-out groovy. Think Peter Max posters, lava lamps, kaleidoscope patterns.`;
        case "bold-retro":
          return `RETRO 60's BOLD COLOURS: Generate ideas using iconic 1960s-70s colour palettes.
Techniques: solid colour paint, colour blocking, high-gloss lacquer finish, two-tone combinations.
Colours: avocado green, harvest gold/mustard, burnt orange, chocolate brown, teal — the classic retro palette.
Vibe: Authentic mid-century/70s throwback. Think Brady Bunch living room.`;
        default:
          return `Generate ideas in a Retro 1960s style with bold colours and vintage character.`;
      }

    case "kids":
      switch (subcategoryId) {
        case "blue-paint":
          return `KIDS DESIGN - BLUE: Paint the piece in kid-friendly blue tones.
Options: sky blue, navy blue, ocean blue, baby blue, royal blue. Consider two-tone (light + dark blue).
Add: fun drawer pulls, name stencil, protective clear coat for durability.
Keep it practical for a child's room — durable, easy to clean, safe edges.`;
        case "pink-paint":
          return `KIDS DESIGN - PINK: Paint the piece in kid-friendly pink tones.
Options: ballet pink, hot pink, blush, coral pink, bubblegum. Consider ombre (light to dark).
Add: sparkly or crystal drawer pulls, name stencil, protective clear coat.
Keep it practical for a child's room — durable, easy to clean, safe edges.`;
        case "white-paint":
          return `KIDS DESIGN - WHITE: Paint the piece in clean white or cream for a fresh nursery/kids room look.
Options: bright white, warm cream, off-white, whitewash. Consider white base + coloured accents (knobs, edges).
Add: decorative knobs, stencilled name or pattern, protective clear coat.
Keep it practical — durable finish that's easy to wipe clean.`;
        case "unicorns":
          return `KIDS DESIGN - UNICORNS: Create a magical unicorn-themed piece.
Base: pastel colours (lavender, pink, mint, baby blue). Add: unicorn stencils or decals, rainbow accents, glitter paint details, horn-shaped knobs.
Techniques: pastel base coat + hand-painted or stencilled unicorn motifs + sparkle clear coat.
Make it magical but durable for everyday kid use.`;
        case "balloons":
          return `KIDS DESIGN - BALLOONS: Create a fun balloon-themed piece.
Base: white or light blue sky background. Add: hand-painted or stencilled colourful balloons with strings, cloud accents.
Techniques: base coat + balloon shapes in primary colours or pastels + protective finish.
Think birthday party vibes — cheerful and colourful.`;
        case "rainbows-clouds":
          return `KIDS DESIGN - RAINBOWS & CLOUDS: Create a dreamy sky-themed piece.
Base: light blue sky colour. Add: rainbow arcs, fluffy white clouds, sun details.
Techniques: sky blue base + hand-painted or stencilled rainbows and clouds + clear coat.
Vibe: Happy, dreamy, nursery-friendly. Think Care Bears meets watercolour skies.`;
        case "space":
          return `KIDS DESIGN - SPACE: Create a cosmic space-themed piece.
Base: dark navy or black "night sky". Add: stars (metallic paint/stencils), planets, rockets, moon, constellation patterns.
Techniques: dark base coat + metallic/glow-in-the-dark star details + hand-painted rockets or planet decals.
Vibe: Astronaut adventure — rockets, Saturn's rings, twinkling stars. Consider glow-in-the-dark elements!`;
        case "dolls":
          return `KIDS DESIGN - DOLLS: Create a doll-house inspired piece.
Base: soft pastels (pink, mint, lavender, peach). Add: miniature "window" details painted on, decorative trim, flower boxes.
Techniques: pastel base + doll-house style painted details + decorative moulding or trim pieces + clear coat.
Vibe: Charming, miniature, like a real-life doll house. Think scalloped edges and tiny painted details.`;
        case "teddy-bears":
          return `KIDS DESIGN - TEDDY BEARS: Create a cosy teddy bear-themed piece.
Base: warm tones (honey, cream, light brown, soft yellow). Add: teddy bear stencils or decals, paw print motifs, bow tie details.
Techniques: warm neutral base + bear motifs painted or applied as decals + protective satin finish.
Vibe: Snuggly, warm, nursery-cosy. Think Winnie-the-Pooh meets teddy bear picnic.`;
        default:
          return `Generate ideas suitable for a child's room — fun, colourful, durable, and safe.`;
      }

    case "trending":
      switch (subcategoryId) {
        case "bold-moody":
          return `2025-2026 TREND - BOLD & MOODY COLOURS: Deep, rich, dramatic tones.
Colours: emerald green, deep navy, mustard/ochre, burgundy, high-gloss black, forest green.
Techniques: solid dramatic colour + satin or high-gloss finish, dark stain, lacquer.
Vibe: Luxe, sophisticated, moody — moving AWAY from neutrals and into bold statement colours.`;
        case "sculptural":
          return `2025-2026 TREND - SCULPTURAL & CURVED FORMS: Furniture as art.
Focus: Adding scalloped edges, organic curves, rounded profiles. Use wood filler or MDF to create curved elements.
Techniques: reshape edges with router or filler, add decorative moulding, create arched details.
Vibe: Organic, flowing, art-gallery feel — furniture that feels like sculpture.`;
        case "decoupage":
          return `2025-2026 TREND - DECOUPAGE & PATTERN: Surface art with paper or fabric.
Techniques: decoupage with patterned paper, botanical prints, floral wrapping paper, vintage maps, fabric overlay.
Focus: Botanical/floral motifs are trending — pressed flowers, leafy patterns, trailing vines.
Application: Cover drawer fronts, tabletops, or inside surfaces. Seal with multiple coats of decoupage medium.
Vibe: Artsy, personalised, cottagecore-meets-maximalism.`;
        case "mixed-materials":
          return `2025-2026 TREND - MIXED MATERIALS & TEXTURES: Combining contrasting elements.
Combinations: wood body + new metal hairpin legs, leather drawer pulls, rattan cane inserts, concrete top on wood base.
Techniques: swap legs for metal ones, add leather/rope handles, insert cane webbing in door panels.
Vibe: Eclectic, contemporary, design-forward — the unexpected pairing of materials creates interest.`;
        case "statement-hardware":
          return `2025-2026 TREND - STATEMENT HARDWARE: Quick impact through knobs and handles.
Options: oversized brass handles, vintage crystal knobs, leather pull straps, ceramic hand-painted knobs, modern matte black bar pulls.
Techniques: remove old hardware, drill new holes if needed, install eye-catching replacement hardware.
Pair with: fresh paint or a light sand-and-wax to let the hardware be the star.
Vibe: Instant update — the "jewellery" of furniture. Small change, huge impact.`;
        case "two-tone":
          return `2025-2026 TREND - TWO-TONE DESIGN: Contrasting colours or finishes.
Combinations: painted body + stained wood top, dark base + light drawers, white frame + coloured interior, black + natural wood.
Techniques: tape off sections, paint one area while staining/preserving another, contrasting drawer fronts.
Vibe: Modern, deliberate, designer-look — the contrast creates visual interest and depth.`;
        case "hand-painted":
          return `2025-2026 TREND - HAND-PAINTED DETAILING: Artisan touches.
Motifs: floral garlands, trailing ivy, leafy branches, botanical illustrations, folk art patterns.
Techniques: hand-paint with artist brushes, use stencils as guides then freehand details, add gold leaf accents.
Vibe: Cottagecore, artisan, one-of-a-kind — every piece is unique and personal.`;
        case "stained-revival":
          return `2025-2026 TREND - STAINED WOOD REVIVAL: Celebrating natural grain.
Focus: Strip old paint/finish, reveal natural wood grain, apply modern stain colours (honey, walnut, ebony, grey-wash).
Techniques: chemical stripper or sanding → wood conditioner → stain → satin polyurethane seal.
Modern twist: use unexpected stain colours (grey, whitewash, black) or combine stain + painted accents.
Vibe: Natural beauty celebrated — showing the wood's story while modernising the look.`;
        case "hidden-color":
          return `2025-2026 TREND - HIDDEN COLOUR POP: Surprise bright interiors.
Concept: Keep exterior neutral or classic, paint INSIDE drawers, door interiors, or undersides a bright unexpected colour.
Colours: electric yellow, coral pink, turquoise, lime green, bright orange — the more unexpected the better.
Techniques: paint exterior in neutral/classic colour, paint interiors in contrasting pop colour.
Vibe: Playful surprise — a "secret" splash of personality that delights when discovered.`;
        default:
          return `Generate ideas following current 2025-2026 upcycling trends: bold colours, mixed materials, statement hardware, two-tone designs, decoupage, and hand-painted details.`;
      }

    default:
      return `Generate ideas matching the "${subcategoryLabel}" design direction.`;
  }
}
