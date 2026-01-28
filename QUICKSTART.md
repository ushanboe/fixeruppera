# Quick Start Guide

Get FixerUppera running in 2 minutes!

## Step 1: Run the Development Server

```bash
cd /home/patrick/fixeruppera
npm run dev
```

## Step 2: Open in Your Browser

Navigate to: **http://localhost:3000**

## Step 3: Test on Mobile

### Option A: Same WiFi Network
1. Find your computer's IP address:
   ```bash
   hostname -I | awk '{print $1}'
   ```
2. On your phone, visit: `http://YOUR_IP:3000`

### Option B: Use ngrok (for external access)
```bash
npx ngrok http 3000
```
Use the ngrok URL on any device.

## Testing the MVP Flow

1. **Upload/Capture Photo**
   - Click "Take Photo" to use your camera
   - Or "Upload Photo" to select from gallery

2. **Set Your Constraints**
   - Style goal: Modern, Rustic, Coastal, etc.
   - Tools available: None, Basic, Power Tools
   - Budget: $, $$, $$$
   - Time: 1-2 Hours, Weekend, Multi-Week

3. **View AI Analysis** (simulated)
   - Item identification
   - Material detection
   - Condition assessment
   - Safety warnings

4. **Browse Makeover Ideas**
   - 5 ranked transformation options
   - Difficulty, time, and cost estimates
   - Quick step preview

5. **Get Detailed Plan**
   - Complete shopping list
   - Step-by-step instructions
   - Track your progress
   - Safety notes
   - Resale value estimates

## Install as PWA

### On iOS (Safari)
1. Tap the Share button (square with arrow)
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add"

### On Android (Chrome)
1. Tap the menu (⋮)
2. Tap "Install app" or "Add to Home Screen"
3. Tap "Install"

## Current State (MVP Phase 1)

- ✅ Mobile-responsive design
- ✅ Photo capture & upload
- ✅ User constraints form
- ✅ Multi-step workflow
- ✅ Progress tracking
- ✅ PWA installable
- ⚠️ **Mock AI responses** (not real OpenAI yet)

## Next Steps to Production

1. **Add Real AI**:
   - Create `.env.local` file
   - Add: `OPENAI_API_KEY=your_key_here`
   - Update API routes to call OpenAI

2. **Add Icons**:
   - Place 192x192 and 512x512 PNG icons in `/public/icons/`
   - Update manifest.json icon paths

3. **Deploy**:
   ```bash
   # Build for production
   npm run build

   # Deploy to Vercel (recommended)
   npx vercel
   ```

## Troubleshooting

**Port 3000 already in use?**
```bash
# Use different port
npm run dev -- -p 3001
```

**Camera not working?**
- Must use HTTPS or localhost
- Grant camera permissions
- Try upload instead

**Build errors?**
```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## Mobile Testing Tips

- Test on multiple screen sizes
- Test in portrait and landscape
- Test with device notch
- Test camera permissions
- Test file upload
- Test PWA installation
- Test offline behavior (future)

## Performance

Current build size: ~110 KB first load JS
- Very fast for mobile networks
- No heavy dependencies
- Optimized images recommended

Enjoy building with FixerUppera! 🎨🛠️
