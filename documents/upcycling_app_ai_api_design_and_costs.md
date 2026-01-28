# Upcycling app — AI stack recommendations + API design + rough costs

This doc describes a practical, *buildable* AI architecture for an upcycling app:
- **Photo → identify item/material/condition → ideas + plan**
- Optional: **photo → visual mockup previews**

It includes recommended endpoints, request/response payloads, and *rough* usage-cost thinking.

> Note on costs: pricing changes frequently by provider/model. Numbers below are **ballpark** and should be validated against current provider pricing before launch.

---

## 0) What the AI must do

### Capability A — Vision understanding (structured)
Input: 1–2 photos
Output: structured JSON describing:
- likely object type(s)
- material(s)
- condition issues
- style cues
- suggested transformations

### Capability B — Plan generation (text)
Input: the extracted structure + user constraints
Output: DIY plan:
- steps
- materials list (with quantities)
- time + difficulty
- safety warnings
- optional resale estimate (range)

### Capability C — Mockup generation (image)
Input: “before” photo + chosen concept or target look
Output: 2–4 concept preview images (not guaranteed perfect fidelity)

---

## 1) Recommended stack (simple + consistent)

### Option 1 (single provider): OpenAI for vision + text + mockups
- **Vision+text:** `gpt-4o-mini` (POC) or `gpt-4o` (higher quality)
- **Mockups:** OpenAI image edit/generation endpoint

Pros: one integration path, fewer moving parts.
Cons: image generation can be the cost driver.

### Option 2 (split): OpenAI for text/vision + Gemini for image mockups
Pros: sometimes better/cheaper image editing depending on model.
Cons: two providers, more operational complexity.

For first launch: **Option 1**.

---

## 2) High-level backend architecture

Use a backend (serverless is fine) to:
- keep API keys off device
- rate limit + protect costs
- enforce daily caps / credits

**Core flow**
1) Client uploads image(s)
2) Backend calls vision model → returns structured extraction JSON
3) Backend calls text model → generates plan + options
4) Optional: backend calls image model → generates mockup previews

---

## 3) API design (your app)

Base URL examples:
- local: `http://localhost:8787`
- prod: `https://<yourapp>.vercel.app`

### 3.1 Health
`GET /api/health`

**Response**
```json
{ "ok": true, "version": "..." }
```

---

## 4) Endpoint: Analyze item (vision extraction)

### `POST /api/upcycle/analyze`
Purpose: take photo(s) and return structured info.

**Request**
```json
{
  "images": [
    { "role": "before", "dataUrl": "data:image/jpeg;base64,..." }
  ],
  "locale": "en-AU"
}
```

**Response (example)**
```json
{
  "objectCandidates": [
    { "label": "wooden dining chair", "confidence": 0.74 },
    { "label": "side chair", "confidence": 0.19 }
  ],
  "materials": [
    { "label": "painted wood", "confidence": 0.66 },
    { "label": "veneer (possible)", "confidence": 0.22 }
  ],
  "condition": {
    "issues": [
      { "label": "chipped paint", "severity": "medium" },
      { "label": "wobbly leg (possible)", "severity": "high" }
    ],
    "notes": "Looks like older painted timber. Check for wobble at the front right leg."
  },
  "styleCues": ["traditional", "painted white"],
  "safetyFlags": [
    { "label": "lead_paint_possible", "why": "older painted wood" }
  ]
}
```

**Implementation notes**
- This is where you keep the output *truthful* (confidence scores, “possible”).
- You can ask the user 1–2 follow-up questions based on `safetyFlags`.

---

## 5) Endpoint: Generate ideas (ranked options)

### `POST /api/upcycle/ideas`
Purpose: return a menu of makeover ideas tuned to user constraints.

**Request**
```json
{
  "analysis": { /* output from /analyze */ },
  "constraints": {
    "styleGoal": "coastal",
    "tools": "basic",
    "budgetBand": "$$",
    "timeBand": "weekend"
  }
}
```

**Response**
```json
{
  "ideas": [
    {
      "id": "paint-hardware",
      "title": "Coastal white + brass hardware",
      "whyItWorks": "Brightens the piece and looks modern with minimal tools.",
      "difficulty": "easy",
      "timeEstimate": { "minHours": 2, "maxHours": 5 },
      "costEstimate": { "min": 25, "max": 80, "currency": "AUD" },
      "stepsPreview": [
        "Clean + light sand",
        "Prime",
        "2 coats paint",
        "Swap handles"
      ]
    }
  ]
}
```

---

## 6) Endpoint: Build a detailed plan (selected idea)

### `POST /api/upcycle/plan`
Purpose: produce the actionable DIY plan.

**Request**
```json
{
  "analysis": { /* from /analyze */ },
  "ideaId": "paint-hardware",
  "constraints": {
    "styleGoal": "coastal",
    "tools": "basic",
    "budgetBand": "$$",
    "timeBand": "weekend",
    "skill": "beginner"
  },
  "assumptions": {
    "woodType": "unknown",
    "indoorOutdoor": "indoor"
  }
}
```

**Response**
```json
{
  "title": "Coastal refresh plan",
  "difficulty": "easy",
  "timeEstimate": { "minHours": 3, "maxHours": 6 },
  "costEstimate": { "min": 30, "max": 95, "currency": "AUD" },
  "materials": [
    { "item": "Sugar soap / degreaser", "qty": "1 bottle" },
    { "item": "Sandpaper 120/240", "qty": "5 sheets each" },
    { "item": "Primer (stain-blocking if needed)", "qty": "1L" },
    { "item": "Interior paint", "qty": "1L" },
    { "item": "Brush + small roller", "qty": "1 set" },
    { "item": "Replacement handles/knobs", "qty": "2–6" }
  ],
  "steps": [
    { "n": 1, "title": "Clean", "detail": "Degrease, rinse, dry fully." },
    { "n": 2, "title": "Prep", "detail": "Light sand to de-gloss. Wipe dust." },
    { "n": 3, "title": "Prime", "detail": "1 coat. Dry per label." },
    { "n": 4, "title": "Paint", "detail": "2 thin coats. Sand lightly between if needed." },
    { "n": 5, "title": "Hardware", "detail": "Measure hole spacing, install handles." }
  ],
  "safety": [
    { "level": "warning", "text": "If the piece is very old, consider lead paint test kit before sanding." }
  ],
  "resale": {
    "enabled": true,
    "range": { "min": 40, "max": 140, "currency": "AUD" },
    "note": "Very rough estimate; depends on local market + finish quality."
  }
}
```

---

## 7) Endpoint: Pro mode (Before + Target)

### `POST /api/upcycle/match-target`
Purpose: user supplies a *before* photo + *target inspiration* photo. Output a plan to transform A into B.

**Request**
```json
{
  "images": [
    { "role": "before", "dataUrl": "data:image/jpeg;base64,..." },
    { "role": "target", "dataUrl": "data:image/jpeg;base64,..." }
  ],
  "constraints": {
    "tools": "basic",
    "budgetBand": "$$",
    "timeBand": "weekend",
    "skill": "beginner"
  }
}
```

**Response**
```json
{
  "targetSummary": {
    "style": "mid-century modern",
    "keyElements": ["walnut stain", "tapered legs", "matte finish", "black hardware"]
  },
  "differences": [
    { "change": "finish", "from": "white paint", "to": "walnut stain" },
    { "change": "hardware", "from": "none", "to": "black pulls" }
  ],
  "plan": { /* same schema as /plan */ }
}
```

---

## 8) Endpoint: Generate mockup previews (optional)

### `POST /api/upcycle/mockups`
Purpose: return 2–4 “concept preview” images.

**Request**
```json
{
  "beforeImage": { "dataUrl": "data:image/jpeg;base64,..." },
  "concept": {
    "style": "coastal",
    "paintColor": "warm white",
    "hardware": "brushed brass",
    "notes": "keep item shape identical; only repaint + swap knobs"
  },
  "count": 3
}
```

**Response**
```json
{
  "mockups": [
    { "id": "m1", "dataUrl": "data:image/png;base64,..." },
    { "id": "m2", "dataUrl": "data:image/png;base64,..." }
  ],
  "disclaimer": "Concept preview only. Real results depend on materials and workmanship."
}
```

**Practical tip**
- Use strong constraints in the image prompt: “preserve geometry; only change paint/finish/hardware”.
- Always label as **concept**.

---

## 9) Client-side requirements (important)

To keep uploads manageable (and avoid serverless limits):
- Resize longest edge to ~1024px
- JPEG compress quality ~0.8–0.9
- Optional blur tool (privacy) if background includes faces/addresses

---

## 10) Rough usage cost model (ballparks)

### Assumptions
- Average image request: 1024px JPEG
- Vision+text call produces ~600–1500 tokens output
- You may do 1–2 calls per user action

### “Plan-only” path (no mockups)
Typically 1–2 model calls:
- Analyze (vision) + Plan (text)

**Ballpark per request:**
- Low: a few cents
- High: tens of cents

This depends heavily on model + token usage.

### “With mockups” path
Adds 1 image-generation/edit call per mockup set.

**Ballpark per mockup set (2–4 images):**
- Low: tens of cents
- High: a couple dollars

Big driver is the image model pricing + how many variations you generate.

### Practical cost controls
- Default to **plan-first**; make mockups optional.
- Generate **2** mockups by default; upsell more.
- Add daily caps or credits:
  - e.g. free: 1 plan/day
  - $5 unlock: 3 plans/day
  - mockups: 5 credits/month

### Tracking unit economics
Track:
- avg. calls per user
- avg. tokens per call
- mockups generated per user
- conversion rate to $5

You want: **revenue per user > AI cost per user** by a safe margin.

---

## 11) What to build first (recommended roadmap)

1) **Analyze + Ideas + Plan** (no images)
2) Add “Before → Target → Plan”
3) Add mockups (gated)
4) Add resale mode + listing copy generation

---

## 12) Notes on resale estimates
- Treat as *range only*; ask for location.
- Consider “value uplift” instead of absolute price.
- Be careful with liability: disclaimers.
