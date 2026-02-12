# FixerUppera - AI-Powered Furniture Upcycling Assistant

## Project Overview
Mobile-first PWA that helps users transform old furniture through AI-powered analysis, idea generation, step-by-step plans, and visual mockup previews.

**GitHub**: `https://github.com/ushanboe/fixerupper` (private)

## Architecture
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons, Framer Motion
- **3D Mascot**: React Three Fiber v9 + drei (Three.js), Mixamo FBX panda animations
- **AI Analysis**: OpenAI GPT-4o-mini (identification, ideas, plans)
- **AI Mockups**: Alibaba Cloud Qwen-Image-Edit-Max via DashScope REST API
- **PWA**: Installable on iOS/Android via manifest.json

## Status
- **Phase 1 COMPLETE**: Standard mode (photo → identify → constraints → analysis → ideas → plan)
- **Phase 2 COMPLETE**: Pro mode (before + target photo matching), Creative Reuse mode
- **Qwen Integration COMPLETE**: AI-generated mockup previews with before/after slider
- **Onboarding COMPLETE**: 4-step animated onboarding with Framer Motion, persistent user profile, simplified per-project constraints
- **Save/Share + Mockup Persistence COMPLETE**: Pick favourite mockup, save with plan, instant reload, before photo display, compressed image storage (v2 save format)
- **Design Directions COMPLETE**: Collapsible category menus (Classic, Retro 60's, Kids, 2025-2026 Trends), custom user input, rich AI prompts per subcategory
- **3D Panda Mascot COMPLETE**: Animated Mixamo panda replaces CSS builders (onboarding) and Loader2 spinners (all loading states)
- **UX Polish COMPLETE**: Collapsible plan sections (Shopping List, Instructions), scroll position management, mockup variation prompts, purple glow behind panda
- **Pro Mode Bug Fixes COMPLETE**: Error handling for match-target API, maxDuration timeout, correct back navigation

## Environment Variables (.env.local)
```
OPENAI_API_KEY=sk-proj-...          # GPT-4o-mini for analysis/ideas/plans
NEXT_PUBLIC_APP_URL=http://localhost:3000
DASHSCOPE_API_KEY=sk-...            # Qwen-Image-Edit (Alibaba Cloud Model Studio, Singapore region)
```

## 3 Modes
1. **Standard Mode**: Upload photo → AI identifies → set constraints → get ideas → detailed plan → mockup preview
2. **Pro Mode**: Upload before + target photos → AI matches style → generates plan to achieve target look
3. **Creative Reuse**: Upload found object → AI suggests practical restoration/repurposing ideas

## API Routes (`app/api/upcycle/`)
| Route | Purpose | AI Provider |
|-------|---------|-------------|
| `identify/` | Identify furniture from photo | GPT-4o-mini |
| `identify-style/` | Identify style from target photo (Pro mode) | GPT-4o-mini |
| `analyze/` | Detailed condition/material analysis | GPT-4o-mini |
| `match-target/` | Match before→target style (Pro mode) | GPT-4o-mini |
| `ideas/` | Generate 4-5 makeover ideas (design-direction-aware) | GPT-4o-mini |
| `plan/` | Detailed step-by-step plan + shopping list | GPT-4o-mini |
| `mockups/` | Generate AI visual previews | Qwen-Image-Edit-Max |
| `proxy-image/` | Server-side image proxy (CORS fallback for Qwen CDN) | — |

## Components (`components/`)
| Component | Purpose |
|-----------|---------|
| `Onboarding.tsx` | 4-step animated onboarding (Framer Motion), exports `UserProfile` interface |
| `PhotoCapture.tsx` | Camera capture + gallery upload (Standard/Creative) |
| `DualPhotoCapture.tsx` | Before + Target photo capture (Pro mode) |
| `IdentificationResults.tsx` | Display AI identification results |
| `ProIdentificationResults.tsx` | Display Pro mode identification |
| `ConstraintsForm.tsx` | Design direction picker (4 collapsible categories + custom input) + budget + collapsible tools/time |
| `AnalysisResults.tsx` | Detailed analysis display |
| `ComparisonResults.tsx` | Before vs target comparison (Pro mode) |
| `IdeasList.tsx` | Ranked makeover ideas |
| `PlanView.tsx` | Step-by-step plan + before photo + collapsible Shopping List & Instructions + mockup preview + Save/Share/Export |
| `MockupGallery.tsx` | AI mockup previews + "I Love This! Save It!" button + before/after slider |
| `SavedPlans.tsx` | Saved plans list with before + mockup thumbnails, instant load |
| `BottomNav.tsx` | Bottom navigation (Home, Saved, Settings) |
| `panda/index.ts` | Barrel export with `next/dynamic` SSR-safe wrapper for PandaScene |
| `panda/PandaScene.tsx` | R3F Canvas wrapper (camera, lights, transparent bg) |
| `panda/PandaMascot.tsx` | Inner 3D component: loads model, crossfades animations |
| `panda/usePandaAnimations.ts` | Hook: loads base FBX + 4 animation FBX files, merges clips |
| `panda/PandaLoading.tsx` | Reusable loading state (panda + title + description + optional progress bar) |

### Utilities (`lib/`)
| File | Purpose |
|------|---------|
| `imageUtils.ts` | `imageToBase64()` — canvas-based image compression with CORS proxy fallback |

## User Flow
```
Onboarding (first visit) → Mode Select → Photo Upload → Identify → Constraints → Analysis → Ideas → Plan → See the Makeover
       ↓                                                     ↓                                                      ↓
  Saves UserProfile                              Tools/Time pre-filled                                   MockupGallery (Qwen)
  to localStorage                                from profile (collapsible)                                         ↓
                                                                                                    "I Love This! Save It!"
                                                                                                              ↓
                                                                                             Mockup preview on plan page
                                                                                                              ↓
                                                                                              Save Plan / Share / Export HTML
```

## Save/Share + Mockup Persistence

### Save Flow
1. User generates mockups via "See the Makeover" button
2. User taps "I Love This! Save It!" on a mockup → converts to compressed base64 (512px, 0.7 quality via `imageToBase64`)
3. Gallery auto-closes, "Selected Concept Preview" appears at bottom of plan (with remove X button)
4. User scrolls to bottom and taps "Save Plan" → before image also compressed to 512px/0.7
5. Plan saved to localStorage as v2 format including `mockupImage`, `version`, `appMode`

### Instant Plan Load
- Saved plans pass `initialPlan` prop to PlanView → skips API re-fetch entirely
- Also restores `initialCompletedSteps` and `initialMockupImage` from saved data
- Console logs "=== RESTORED: Using saved plan data ==="

### Save Data Structure (v2)
```typescript
{
  id: string;              // "plan-{timestamp}"
  savedAt: string;         // ISO date
  version: 2;              // Schema version (v1 plans lack this + mockupImage + appMode)
  plan: any;               // Full plan data from API
  idea: any;               // Selected idea
  analysis: any;           // AI analysis results
  constraints: any;        // User preferences
  beforeImage: string;     // Compressed base64 (512px, 0.7 quality)
  completedSteps: number[];
  mockupImage?: string;    // Compressed base64 (~30-50KB) — only if user picked one
  appMode?: string;        // "standard" | "pro"
}
```
Storage budget: 20 plans max × ~100KB (compressed before + mockup) = ~2MB, well within 5MB localStorage limit.

### PlanView Layout (top to bottom)
1. Header (back + title)
2. Before photo (from prop)
3. Progress bar (if steps completed)
4. Summary cards (time, cost, difficulty)
5. "See the Makeover" button
6. Shopping List (collapsible, starts collapsed, shows item count)
7. Step-by-Step Instructions (collapsible, starts collapsed, shows step count — checkable steps inside)
8. Safety warnings
9. Resale estimate
10. Selected mockup preview (if picked)
11. Save Plan button (full-width purple)
12. Share + Export HTML buttons (side by side)

### Image Compression
- `lib/imageUtils.ts` exports `imageToBase64(src, maxSize, quality)`
- Handles both data URLs and remote URLs (Qwen CDN)
- Falls back to `/api/upcycle/proxy-image` server-side proxy on CORS error
- Default: 512px max dimension, 0.7 JPEG quality (~30-50KB output)

## Onboarding (`components/Onboarding.tsx`)

### 4 Steps with Framer Motion Animations
1. **Welcome**: Animated title, 3D panda mascot (rallying, 250px), bounce entrance
2. **About You**: 3D panda (walking, 120px), Name (required) + email (optional) inputs
3. **Your Workshop**: 3D panda (spinning, 120px), Tools selector (None/Basic/Power), Time selector (Quick/Weekend/Grand), DIY Spirit Animal (fun 4-choice question)
4. **Ready to Build**: 3D panda (rallying, 250px), personalized celebration, confetti particles, profile summary, "Start Transforming" button

### UserProfile (localStorage: `fixeruppera_user_profile`)
```typescript
interface UserProfile {
  name: string;
  email: string;
  tools: string;        // "none" | "basic" | "power"
  time: string;         // "1-2 hrs" | "weekend" | "multi-week"
  spiritAnimal: string; // "warrior" | "hunter" | "visionary" | "champion"
  onboardedAt: string;  // ISO date
}
```

### App Integration
- `page.tsx` checks `localStorage.getItem('fixeruppera_user_profile')` on mount
- If profile exists → skip to mode selection; if not → show onboarding
- `userProfile` state passed to all `ConstraintsForm` instances

### ConstraintsForm — Design Direction Picker
- **Standard mode**: Design Direction (required) + Budget. Tools/Time pre-filled from profile, collapsed behind "Change" toggle.
- **Pro mode**: Only Budget required. Tools/Time collapsed same way.
- **Creative Reuse**: All creative fields (use case, skill, materials, audience) + budget + time. Tools/Time NOT collapsed (different context).
- Collapsible shows summary: "Using your defaults: Basic | Weekend" with expand/collapse toggle.

### Design Direction Categories (Standard mode)
4 collapsible accordion categories + custom text input:
1. **Classic Styles** (Modern, Rustic, Coastal, Mid-Century, Industrial, Boho, Farmhouse, Scandinavian)
2. **Retro 60's** (Rainbow Paint Over, Psychedelic Design, Bold Retro Colours)
3. **Designs for Kids** (Blue/Pink/White Paint, Unicorns, Balloons, Rainbows & Clouds, Space, Dolls, Teddy Bears)
4. **2025-2026 Trends** (Bold & Moody Colours, Sculptural & Curved, Decoupage & Pattern, Mixed Materials, Statement Hardware, Two-Tone Design, Hand-Painted Detailing, Stained Wood Revival, Hidden Colour Pop)
5. **Your Own Idea** — free text input for custom design direction

### Design Direction Data Flow
- ConstraintsForm sends `constraints.designDirection` object:
  - Preset: `{ type: "preset", categoryId, categoryLabel, subcategoryId, subcategoryLabel, subcategoryDescription }`
  - Custom: `{ type: "custom", customText: "user's description" }`
- Also sends `constraints.styleGoal` for backward compat (subcategory label or "custom")
- Ideas API `buildCategoryGuidance()` function maps each subcategory to detailed AI prompt guidance (colours, techniques, vibe, examples)
- Custom text is passed directly as user's vision, AI generates 4-5 variations

### Animation Details
- `AnimatePresence` with slide left/right transitions between steps
- `motion.div` spring entrance for builder characters (idle sway, celebration bounce)
- Staggered `motion.div` for option cards (`delay: index * 0.1`)
- Confetti: 20 `motion.div` particles with random positions, rotations, and repeat delays
- `StepDots` progress indicator with `layout` animation

## Qwen-Image-Edit Integration

### How It Works
1. User taps "See the Makeover" button on PlanView
2. MockupGallery opens, sends POST to `/api/upcycle/mockups`
3. Backend detects mode: Standard (1 image + text) or Pro (2 images + text)
4. **Standard mode**: Builds text instruction from idea context, sends before image + instruction
5. **Pro mode**: Sends before image (Image 1) + target/inspiration image (Image 2) + style transfer instruction
6. Qwen-Image-Edit-Max generates 2 mockup variations — each with a unique prompt variation hint
7. User can tap a mockup to open the before/after comparison slider
8. User taps "I Love This! Save It!" to pick a favourite → compressed to base64 → sent back to PlanView via `onSelectMockup` callback

### Dual-Image Pro Mode Mockups
- `qwen-image-edit-max` supports 1-3 images in the content array
- Pro mode sends: `[{image: beforeImage}, {image: targetImage}, {text: instruction}]`
- Instruction references "Image 1" (before) and "Image 2" (target) explicitly
- `buildDualImageInstruction()` generates style-transfer prompt: "Transfer the style of Image 2 to Image 1..."
- Data flow: `ComparisonResults` → `PlanView(targetImage)` → `MockupGallery(targetImage)` → API

### API Details
- **Endpoint**: `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`
- **Model**: `qwen-image-edit-max`
- **Output**: 1024x1024 images
- **Cost**: ~$0.015 per image
- **Time**: ~20-25 seconds per image
- **Response path**: `output.choices[0].message.content[0].image`

### Concept Data Flow
PlanView passes the actual idea fields to MockupGallery:
- `itemType`: from analysis (e.g., "side table", "wardrobe")
- `ideaTitle`: from selected idea (e.g., "Rustic Farmhouse Side Table")
- `keyTransformations`: array of changes (e.g., ["Sand and stain", "New hardware"])
- `stepsPreview`: array of steps from the idea
- `whyItWorks`: explanation from the idea

`buildEditInstruction()` composes these into a rich Qwen prompt that handles both surface changes (paint/stain) and structural transformations (wardrobe → shelving unit).

### Before/After Slider
- `BeforeAfterSlider` component uses CSS `clipPath` for the reveal effect
- Pointer events (touch + mouse) for cross-device dragging
- Rendered via `createPortal` to `document.body` to avoid overflow clipping issues
- Before image on top (clipped), after image underneath (full)

## 3D Panda Mascot

### Dependencies
- `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`
- `next.config.ts` has `transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"]`

### FBX Files (`public/images/`)
| File | Animation Name | Used In |
|------|---------------|---------|
| `Panda_Walking.fbx` | `walking` (base model + mesh) | Identify, Plan loading |
| `Rallying.fbx` | `rallying` | Onboarding Steps 0 & 3 (250px) |
| `Sad-Idle.fbx` | `sadIdle` | Analysis loading |
| `Spinning.fbx` | `spinning` | Ideas loading |
| `Swimming-To-Edge.fbx` | `swimming` | Mockup generation loading |

### Animation Mapping
| Location | Animation | Height |
|----------|-----------|--------|
| Onboarding Welcome (Step 0) | `rallying` | 250px |
| Onboarding About You (Step 1) | `walking` | 120px |
| Onboarding Workshop (Step 2) | `spinning` | 120px |
| Onboarding Ready (Step 3) | `rallying` | 250px |
| Identifying furniture | `walking` | 180px |
| Analyzing item | `sadIdle` | 180px |
| Generating ideas | `spinning` | 180px |
| Creating plan | `walking` | 180px |
| Generating mockups (modal) | `swimming` | 180px |

### Architecture
- `usePandaAnimations` loads base model (Panda_Walking.fbx) for mesh + skeleton, then 4 animation-only FBX files
- All clips renamed and merged onto one `useAnimations` instance
- `PandaMascot` crossfades between animations (0.3s) + slow auto-rotation
- `PandaScene` wraps in `<Canvas>` with transparent background (`gl={{ alpha: true }}`)
- `index.ts` uses `next/dynamic` with `ssr: false` to avoid Three.js SSR errors
- `PandaLoading` is a reusable wrapper (panda + title + desc), supports `isModal` for fullscreen overlays

### Tunable Values
- Scale: `0.005` (in PandaMascot — tuned down from 0.02 for mobile viewport)
- Position: `[0, -1, 0]` (in PandaMascot — tuned up from -1.5)
- Camera: `[0, 0, 4]` with `fov: 45` (in PandaScene)
- Rotation speed: `delta * 0.3` (in PandaMascot useFrame)
- Purple glow: `rgba(192, 150, 255, 0.45)` radial gradient behind panda for contrast on dark bg (in PandaScene)

## Key Gotchas
- **DashScope API key**: MUST start with `sk-` from Model Studio console (`modelstudio.console.alibabacloud.com`). Old 32-char hex keys fail with InvalidApiKey.
- **DashScope region**: Singapore key only works with `-intl` endpoint
- **Response parsing**: `output.choices[0].message.content[0].image` (NOT `output.results[0].url`)
- **Image URL expiry**: Qwen response URLs expire after 24 hours
- **Slider portal**: BeforeAfterSlider must render via `createPortal(el, document.body)` — fixed overlays inside `overflow-y-auto` containers get swallowed on mobile
- **Idea fields mismatch**: GPT ideas return `title`, `keyTransformations`, `stepsPreview` — NOT `color`/`finish`/`hardware`. The concept object must use actual idea fields.
- **Three.js SSR**: Must use `next/dynamic` with `ssr: false` — Three.js references `window`/`document` which don't exist server-side
- **FBX file names**: No spaces in filenames — `useFBX()` URL encoding issues. Use hyphens (e.g., `Sad-Idle.fbx`)
- **R3F Canvas Suspense**: Can't render HTML inside `<Canvas>` Suspense fallback — use `fallback={null}` and handle HTML loading externally
- **WebGL context limit**: Only one `<Canvas>` should render at a time (loading states are mutually exclusive, so this is fine)
- **ESLint apostrophes**: Use `&apos;` in JSX text content, not `'`
- **Creative Reuse ideas**: Prompt explicitly tells GPT to preserve object form — only 1-2 of 5 ideas suggest new purpose
- **Material-aware ideas**: Ideas API detects fabric/wood/metal/leather and adds material-specific rules to prevent nonsense suggestions (e.g., "sand the fabric")
- **Tailwind dynamic classes**: NEVER use template literals like `` `text-${color}-400` `` — Tailwind purges them. Use pre-computed variables with full class strings (e.g., `const cls = isProMode ? "text-green-400" : "text-purple-400"`)
- **Onboarding localStorage**: Key is `fixeruppera_user_profile`. Check on mount with try/catch — invalid JSON shows onboarding again.
- **ConstraintsForm userProfile prop**: Tools/time default from profile. `hasProfile` gates the collapsible UI. Must merge profile defaults with any per-project overrides on submit.
- **Saved plan re-fetch bug (fixed)**: PlanView only checked `analysis?.plan` (Pro mode). Standard saved plans always re-called API. Fixed by adding `initialPlan` prop — checked first in useEffect.
- **Mockup images lost on close (fixed)**: MockupGallery state was local — images lost on unmount. Fixed by adding `onSelectMockup` callback that converts to base64 and persists in PlanView state.
- **Before image not displayed (fixed)**: `beforeImage` prop was saved but never rendered as `<img>` on PlanView. Added visible photo section after header.
- **handleSave must be async**: Image compression via `imageToBase64` is async (canvas operations). `handleSave` is now `async` to support `await imageToBase64()`.
- **CORS on Qwen CDN URLs**: Canvas `crossOrigin="anonymous"` may fail. Falls back to `/api/upcycle/proxy-image` server-side proxy.
- **Design direction vs styleGoal**: Old flat `styleGoal` string replaced by `designDirection` object. Both are sent in constraints for backward compat. Ideas API checks `designDirection` first, falls back to `styleGoal`.
- **Accordion UX**: Only one category expanded at a time. Selecting a subcategory clears custom text; typing custom text clears preset selection. Both are mutually exclusive.
- **Panda container width**: `motion.div` wrappers for PandaScene MUST have `w-full` class — flex `items-center` parent will shrink-wrap children to zero width otherwise, causing thin vertical strip rendering.
- **Panda container max-width**: Use `max-w-[400px]` for onboarding Steps 0/3 (250px height) and `max-w-[150px]` for Steps 1/2 (120px height).
- **Scroll position after AI loads**: Use `setTimeout(() => window.scrollTo({...}), 100)` after state updates — React needs a tick to render new content before scrolling.
- **Mockup duplicate images**: Each Qwen call uses the same prompt → identical results. Fixed by appending variation hints to prompts for calls after the first.
- **Pro mode dual-image mockups**: `targetImage` prop threads through ComparisonResults → PlanView → MockupGallery → API. Standard mode sends 1 image, Pro sends 2. Same model, same endpoint.
- **Qwen multi-image references**: In dual-image mode, the text must reference "Image 1" and "Image 2" by position — Qwen maps content array items sequentially.
- **Collapsible plan sections**: Shopping List and Instructions start collapsed (`useState(false)`) with ChevronDown toggle. Shows item/step count in header.
- **Pro mode analysis error handling (fixed)**: `handleProModeAnalysis` had no try/catch — if `/api/upcycle/match-target` failed or timed out, the app got permanently stuck on the analysis loading screen. Now catches errors and returns user to constraints page to retry.
- **match-target maxDuration (fixed)**: Route sends TWO full base64 images to OpenAI → can take 15-30+ seconds. Without `export const maxDuration = 60`, Vercel's default 10s timeout killed the request silently.
- **Pro mode constraints back button (fixed)**: Back button navigated to `"upload"` instead of `"pro-identification"`. User lost their identification results.

## Build
```bash
npm run dev          # Development (port 3000)
npm run build        # Production build (tsc + next build)
npm start            # Start production server
```
