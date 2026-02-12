# FixerUppera - AI-Powered Upcycling Assistant

Transform old furniture into stunning pieces with AI-powered plans, guidance, and visual mockup previews.

## Features

- **Fun Onboarding**: Animated 4-step welcome with builder characters, collects name + workshop preferences
- **3 Modes**: Standard (single photo), Pro (before + target), Creative Reuse (found objects)
- **AI Analysis**: Identify furniture type, materials, condition, and safety concerns
- **Material-Aware Ideas**: Smart suggestions that respect wood vs fabric vs metal vs leather
- **Detailed Plans**: Step-by-step DIY instructions with shopping list and cost estimates
- **AI Mockup Previews**: See your transformation before you start (powered by Qwen-Image-Edit)
- **Before/After Slider**: Interactive comparison slider to visualize the makeover
- **Sticky Preferences**: Tools & time saved from onboarding, only style + budget asked per project
- **Progress Tracking**: Check off steps as you complete them
- **Save & Share Plans**: Save plans with mockup images, share as text, export as HTML
- **Mockup Persistence**: Pick your favourite concept preview — saved with the plan
- **Instant Plan Load**: Saved plans load instantly without re-calling AI
- **Mobile-First PWA**: Install as an app on any device

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS v4, Lucide React icons, Framer Motion animations
- **AI Analysis**: OpenAI GPT-4o-mini
- **AI Mockups**: Alibaba Cloud Qwen-Image-Edit-Max (DashScope API)
- **PWA**: Native iOS/Android installable

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:
```
OPENAI_API_KEY=your_openai_key          # GPT-4o-mini for analysis/ideas/plans
NEXT_PUBLIC_APP_URL=http://localhost:3000
DASHSCOPE_API_KEY=your_dashscope_key    # Qwen-Image-Edit (from modelstudio.console.alibabacloud.com)
```

### Run

```bash
npm run dev        # Development (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
```

## User Flow

```
1. Onboarding (first visit): Name, email, tools, time, spirit animal
2. Choose Mode (Standard / Pro / Creative Reuse)
3. Upload Photo(s)
4. AI Identifies furniture, materials, condition
5. Set Preferences (style + budget; tools/time pre-filled from onboarding)
6. View Analysis & Safety Concerns
7. Browse Ranked Makeover Ideas
8. Get Detailed Step-by-Step Plan
9. See the Makeover (AI-generated visual previews)
10. Compare Before/After with interactive slider
11. Pick favourite mockup ("I Love This! Save It!")
12. Save Plan / Share / Export HTML
```

## Project Structure

```
fixeruppera/
├── app/
│   ├── api/upcycle/
│   │   ├── identify/          # Furniture identification
│   │   ├── identify-style/    # Target style identification (Pro)
│   │   ├── analyze/           # Detailed analysis
│   │   ├── match-target/      # Before→Target matching (Pro)
│   │   ├── ideas/             # Makeover idea generation
│   │   ├── plan/              # Step-by-step plan
│   │   ├── mockups/           # AI visual previews (Qwen)
│   │   └── proxy-image/       # Server-side image proxy (CORS fallback)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main app (state machine)
├── components/
│   ├── Onboarding.tsx         # 4-step animated onboarding (Framer Motion)
│   ├── PhotoCapture.tsx       # Camera & upload
│   ├── DualPhotoCapture.tsx   # Before + Target (Pro mode)
│   ├── IdentificationResults.tsx
│   ├── ProIdentificationResults.tsx
│   ├── ConstraintsForm.tsx    # Per-project preferences (style, budget, collapsible tools/time)
│   ├── AnalysisResults.tsx
│   ├── ComparisonResults.tsx  # Pro mode comparison
│   ├── IdeasList.tsx          # Ranked ideas
│   ├── PlanView.tsx           # Plan + before photo + mockup preview + Save/Share/Export
│   ├── MockupGallery.tsx      # AI mockups + "I Love This!" pick button + slider
│   ├── SavedPlans.tsx         # Saved plans with thumbnails + instant load
│   └── BottomNav.tsx
├── lib/
│   └── imageUtils.ts          # Image compression utility (canvas + CORS proxy fallback)
├── public/
│   ├── manifest.json
│   └── icons/
├── documents/                 # Project specs
├── CLAUDE.md                  # Full dev context
└── .env.local                 # API keys (not committed)
```

## AI Mockup Previews

The "See the Makeover" feature uses Alibaba Cloud's Qwen-Image-Edit-Max model to generate realistic previews of your furniture transformation:

- Generates 2 mockup variations per request
- Handles both surface changes (paint, stain) and structural transformations (wardrobe → shelving)
- Each image takes ~20-25 seconds, costs ~$0.015
- Before/after comparison slider with touch + mouse support
- "I Love This! Save It!" button to pick a favourite mockup
- Picked mockup saved with plan (compressed base64, survives page reload)

### DashScope API Key Setup
1. Go to [Alibaba Cloud Model Studio](https://modelstudio.console.alibabacloud.com/) (Singapore region)
2. Create an API key (must start with `sk-`)
3. Add to `.env.local` as `DASHSCOPE_API_KEY`

## Installing as PWA

### iOS
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### Android
1. Open in Chrome
2. Tap menu
3. Tap "Install app"

## Design

- **Primary**: Purple (#7c3aed)
- **Theme**: Dark header/nav, light content cards
- **Mobile-first**: 44px touch targets, safe areas, foldable support

## License

Private project - All rights reserved.
