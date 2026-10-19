/**
 * Utilities for extracting dominant brand colors and card themes from logos
 */

export interface ExtractedPalette {
  brandColor: string;
  cardColor: string;
  accentGlow: string;
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

/**
 * Extracts dominant vibrant brand color and creates a matching dark card background
 */
export async function extractColorsFromImage(
  imageSource: string | File
): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    // Default fallback Digi8 palette
    const fallback: ExtractedPalette = {
      brandColor: '#00e5ff',
      cardColor: '#0b101d',
      accentGlow: 'rgba(0, 229, 255, 0.2)'
    };

    let url: string;
    let shouldRevoke = false;

    if (imageSource instanceof File) {
      url = URL.createObjectURL(imageSource);
      shouldRevoke = true;
    } else {
      url = imageSource;
    }

    if (!url) {
      return resolve(fallback);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(url);
          return resolve(fallback);
        }

        // Downsample for speed
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number; score: number }>();

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip transparent or semi-transparent pixels
          if (a < 180) continue;

          // Skip near-white and near-black
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 240 || lum < 25) continue;

          const [h, s, l] = rgbToHsl(r, g, b);

          // We strongly prefer colorful, vibrant pixels over neutral grays
          if (s < 0.15) continue;

          // Quantize into 16-step bins
          const binR = Math.floor(r / 16) * 16;
          const binG = Math.floor(g / 16) * 16;
          const binB = Math.floor(b / 16) * 16;
          const key = `${binR},${binG},${binB}`;

          // Score boosts saturation and moderate lightness
          const vibrancyScore = s * 2 + (1 - Math.abs(l - 0.5));

          if (!colorBuckets.has(key)) {
            colorBuckets.set(key, { r, g, b, count: 1, score: vibrancyScore });
          } else {
            const item = colorBuckets.get(key)!;
            item.count += 1;
            item.score += vibrancyScore;
          }
        }

        if (colorBuckets.size === 0) {
          if (shouldRevoke) URL.revokeObjectURL(url);
          return resolve(fallback);
        }

        // Pick highest scoring color bucket
        let bestBucket = null;
        let highestScore = -1;

        for (const bucket of colorBuckets.values()) {
          // Weight by frequency and vibrancy score
          const totalScore = bucket.score * Math.sqrt(bucket.count);
          if (totalScore > highestScore) {
            highestScore = totalScore;
            bestBucket = bucket;
          }
        }

        if (!bestBucket) {
          if (shouldRevoke) URL.revokeObjectURL(url);
          return resolve(fallback);
        }

        const brandColor = rgbToHex(bestBucket.r, bestBucket.g, bestBucket.b);

        // Derive matching dark card color:
        // Use brand hue with very deep dark lightness (6-8%) and subtle saturation (25-35%)
        const [h] = rgbToHsl(bestBucket.r, bestBucket.g, bestBucket.b);
        const [cardR, cardG, cardB] = hslToRgb(h, 0.35, 0.07);
        const cardColor = rgbToHex(cardR, cardG, cardB);

        const accentGlow = `rgba(${bestBucket.r}, ${bestBucket.g}, ${bestBucket.b}, 0.25)`;

        if (shouldRevoke) URL.revokeObjectURL(url);

        resolve({
          brandColor,
          cardColor,
          accentGlow
        });
      } catch (err) {
        if (shouldRevoke) URL.revokeObjectURL(url);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(url);
      resolve(fallback);
    };

    img.src = url;
  });
}
