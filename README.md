# FixerUppera - AI-Powered Upcycling Assistant

Transform old furniture into stunning pieces with AI-powered plans and guidance.

## 🚀 Features (Phase 1 MVP)

- **Photo Capture**: Take photos with your camera or upload from gallery
- **AI Analysis**: Identify furniture type, materials, and condition
- **Smart Constraints**: Set your style goal, tools, budget, and time
- **Ranked Ideas**: Get 5+ makeover ideas ranked by difficulty and cost
- **Detailed Plans**: Step-by-step DIY instructions with materials list
- **Progress Tracking**: Check off steps as you complete them
- **Mobile-First**: Optimized for all phone screens including foldables
- **PWA**: Install as an app on any device

## 📱 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **PWA**: Native iOS/Android installable

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📂 Project Structure

```
fixeruppera/
├── app/
│   ├── api/upcycle/          # API endpoints
│   │   ├── analyze/          # Image analysis
│   │   ├── ideas/            # Idea generation
│   │   └── plan/             # Detailed plan
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main app page
├── components/
│   ├── PhotoCapture.tsx      # Camera & upload
│   ├── ConstraintsForm.tsx   # User preferences
│   ├── AnalysisResults.tsx   # AI analysis display
│   ├── IdeasList.tsx         # Ranked ideas
│   └── PlanView.tsx          # Detailed plan
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons
└── documents/                # Project specs
```

## 🎯 User Flow

1. **Upload Photo**: Take or upload photo of furniture
2. **Set Preferences**: Choose style, tools, budget, and time
3. **View Analysis**: See AI identification and condition assessment
4. **Browse Ideas**: Review ranked makeover options
5. **Get Plan**: Detailed steps and shopping list
6. **Track Progress**: Check off completed steps

## 🔧 Mobile Features

- **Safe Areas**: Respects device notches and rounded corners
- **Touch-Friendly**: 44px minimum touch targets
- **Responsive**: Works on all screen sizes
- **Foldable Support**: Optimized for dual-screen devices
- **Camera Access**: Native camera integration
- **Share**: Native share functionality

## 🚧 Phase 1 MVP Notes

This is Phase 1 - focused on **planning and execution**, not mockups.

Current API endpoints return mock data. To integrate real AI:

1. Add OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_key_here
   ```

2. Update API routes in `app/api/upcycle/*/route.ts` to call OpenAI

3. Recommended models:
   - Vision: `gpt-4o` or `gpt-4o-mini`
   - Text: `gpt-4o`

## 📱 Installing as PWA

### iOS
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### Android
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Install app"

## 🎨 Design System

- **Primary Color**: Purple (#7c3aed)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Typography**: System fonts (-apple-system, Segoe UI, Roboto)

## 🔜 Future Phases

- **Phase 2**: Before→Target photo matching
- **Phase 3**: AI-generated mockup previews
- **Phase 4**: Resale mode & listing copy generator

## 📄 License

Private project - All rights reserved.

## 🤝 Contributing

This is an MVP - focus is on core functionality over perfection.
