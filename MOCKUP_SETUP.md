# Mockup Generation Setup Guide

## Quick Start

### 1. Get Stability AI API Key (Recommended)

1. Sign up at https://platform.stability.ai/
2. Go to Account → Keys
3. Create a new API key
4. Add to `.env.local`:
   ```bash
   STABILITY_API_KEY=sk-...your-key...
   ```

**Cost:** ~$0.002 per image (20x cheaper than DALL-E)

### 2. Configure Provider (Optional)

Add to `.env.local`:
```bash
# Use Stability AI (recommended)
MOCKUP_PROVIDER=stability

# Adjust how much the image changes (0.20-0.35)
IMAGE_STRENGTH=0.30
```

### 3. Test It

1. Start the app: `npm run dev`
2. Upload furniture photo
3. Generate plan
4. Click "Generate Visual Previews"
5. Check console logs for debugging

---

## Provider Comparison

| Feature | Stability AI (img2img) | DALL-E 3 |
|---------|----------------------|----------|
| **Structure Preservation** | ✅ Excellent | ❌ Poor (generates new furniture) |
| **Cost per image** | $0.002 | $0.04 |
| **Speed** | ~10-15 seconds | ~15-20 seconds |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Best For** | Refinishing same furniture | Concept inspiration |

---

## Tuning Image Strength

The `IMAGE_STRENGTH` parameter controls how much Stability AI changes the image:

### 0.20 - Minimal Changes
- **Preserves:** 80% of original structure
- **Changes:** 20% (subtle color/finish tweaks)
- **Use When:** You want nearly identical furniture, just different paint color

### 0.30 - Balanced (Recommended)
- **Preserves:** 70% of original structure
- **Changes:** 30% (noticeable finish/hardware updates)
- **Use When:** Standard furniture refinishing mockups

### 0.35 - Moderate Changes
- **Preserves:** 65% of original structure
- **Changes:** 35% (more dramatic transformations)
- **Use When:** Significant style changes while keeping overall form

### 0.40+ - Dramatic Changes
- **Preserves:** <60% of original
- **Changes:** May alter furniture structure
- **Use When:** NOT recommended (might generate different furniture)

---

## Switching Providers

### To Use Stability AI (Default)
```bash
# .env.local
MOCKUP_PROVIDER=stability
STABILITY_API_KEY=sk-...
IMAGE_STRENGTH=0.30
```

### To Use DALL-E 3
```bash
# .env.local
MOCKUP_PROVIDER=dalle
OPENAI_API_KEY=sk-...
# IMAGE_STRENGTH is ignored for DALL-E
```

### To Test Both
Change `MOCKUP_PROVIDER` between requests to compare results.

---

## Troubleshooting

### "Stability AI not configured" Error
- Check that `STABILITY_API_KEY` is in `.env.local`
- Restart dev server after adding environment variables

### Mockups Look Too Different from Original
- Lower `IMAGE_STRENGTH` to 0.25 or 0.20
- Check prompt in console logs

### Mockups Look Too Similar to Original
- Increase `IMAGE_STRENGTH` to 0.35
- Make sure prompts are descriptive

### Generation Takes Too Long
- Stability AI: Usually 10-15 seconds per image
- Check network connection
- Try reducing `count` parameter

### API Errors
- Check API key validity
- Verify account has credits (Stability AI)
- Check console logs for detailed error messages

---

## Cost Examples

### Stability AI
- 1 mockup = $0.002
- 2 mockups (default) = $0.004
- 100 generations = $0.40

### DALL-E 3
- 1 mockup = $0.04
- 2 mockups (default) = $0.08
- 100 generations = $8.00

**Savings with Stability AI: 95%**

---

## Debug Logging

All mockup generation includes detailed console logging:

```
=== MOCKUP GENERATION START ===
Provider: stability
Image Strength: 0.30
Concept: {...}
Prompt: IMPORTANT: Preserve exact same furniture structure...
Generating mockup 1/2 with Stability AI...
Successfully generated mockup 1
=== Generated 2/2 mockups with Stability AI ===
```

Check your browser console (F12) and terminal for these logs.
