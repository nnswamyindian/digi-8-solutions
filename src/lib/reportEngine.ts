// Deterministic report engine — same inputs always produce same results
// Uses a seeded hash function instead of Math.random()

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export type Selections = {
  business: string;
  need: string;
  current: string;
  audience: string;
  country: string;
  features: string[];
  websiteUrl: string;
  businessName: string;
  competitors: string;
  monthlyVisitors: string;
  topChallenge: string;
  marketingBudget: string;
};

export type DigitalScores = {
  website: number;
  seo: number;
  social: number;
  brand: number;
  security: number;
};

export type ReportScores = {
  digitalScores: DigitalScores;
  overallScore: number;
  potentialScore: number;
  successScore: number;
  growthPrediction: number;
  estimatedROI: string;
};

export function computeReportScores(selections: Selections): ReportScores {
  const seedStr = [
    selections.business, selections.need, selections.current,
    selections.audience, selections.country,
    (selections.features || []).join(','),
    selections.websiteUrl || 'none',
    selections.businessName || 'none',
    selections.competitors || 'none',
    selections.monthlyVisitors || 'none',
    selections.topChallenge || 'none',
    selections.marketingBudget || 'none',
  ].join('|');
  const seed = hashString(seedStr);
  const rng = seededRandom(seed);

  const currentSituation = selections.current || 'No online presence';
  let baseDigitalScore = 15;
  if (currentSituation.includes('basic')) baseDigitalScore = 35;
  else if (currentSituation.includes('not growing')) baseDigitalScore = 45;
  else if (currentSituation.includes('scale')) baseDigitalScore = 65;
  else if (currentSituation.includes('Rebranding')) baseDigitalScore = 50;

  const hasWebsite = selections.websiteUrl && selections.websiteUrl.length > 3;
  if (hasWebsite) baseDigitalScore = Math.max(baseDigitalScore, 40);

  const digitalScores: DigitalScores = {
    website: Math.min(85, baseDigitalScore + Math.floor(rng() * 15)),
    seo: Math.min(75, Math.floor(baseDigitalScore * 0.6) + Math.floor(rng() * 10)),
    social: Math.min(80, Math.floor(baseDigitalScore * 0.8) + Math.floor(rng() * 15)),
    brand: Math.min(75, Math.floor(baseDigitalScore * 0.7) + Math.floor(rng() * 10)),
    security: Math.min(65, Math.floor(baseDigitalScore * 0.5) + Math.floor(rng() * 10)),
  };

  const overallScore = Math.round(
    (digitalScores.website + digitalScores.seo + digitalScores.social + digitalScores.brand + digitalScores.security) / 5
  );

  const potentialScore = Math.min(98, 88 + Math.floor(rng() * 10));

  const featureCount = (selections.features || []).length;
  const successScore = Math.min(95, 70 + featureCount * 2 + Math.floor(rng() * 8));

  const growthBase = selections.current.includes('No online') ? 250 : selections.current.includes('basic') ? 180 : selections.current.includes('not growing') ? 120 : 80;
  const growthPrediction = Math.min(400, growthBase + Math.floor(rng() * 80) + featureCount * 10);

  const estimatedROI = growthPrediction > 200 ? '2-4 Months' : growthPrediction > 100 ? '3-6 Months' : '4-8 Months';

  return { digitalScores, overallScore, potentialScore, successScore, growthPrediction, estimatedROI };
}

export type WebsiteAnalysis = {
  url: string;
  reachable: boolean;
  hasSSL: boolean;
  hasMetaDescription: boolean;
  metaDescription: string;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasStructuredData: boolean;
  hasCanonical: boolean;
  hasViewport: boolean;
  titleLength: number;
  title: string;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasGoogleAnalytics: boolean;
  hasFacebookPixel: boolean;
  hasSchema: boolean;
  socialLinks: string[];
  hasLiveChat: boolean;
  hasWhatsApp: boolean;
  hasContactForm: boolean;
  hasPhoneVisible: boolean;
  hasEmailVisible: boolean;
  pageWeight: number;
  loadTimeMs: number;
  mobileFriendly: boolean;
  hasFavicon: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  googleResultsCount: number;
  googleBusinessProfile: boolean;
  socialProfiles: { platform: string; url: string }[];
  seoScore: number;
  socialScore: number;
  performanceScore: number;
  securityScore: number;
  brandScore: number;
  websiteScore: number;
  overallScore: number;
  recommendations: string[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  competitors: { name: string; found: boolean }[];
  insights: string[];
};

export async function analyzeWebsite(
  url: string,
  businessType: string,
  businessName?: string,
  competitors?: string
): Promise<WebsiteAnalysis | null> {
  if (!url || url.length < 4) return null;
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-website`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url, businessType, businessName, competitors }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.error) return null;
    return data as WebsiteAnalysis;
  } catch {
    return null;
  }
}
