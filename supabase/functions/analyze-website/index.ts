import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  url: string;
  businessType: string;
  businessName?: string;
  competitors?: string;
}

interface AnalysisResult {
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
}

function normalizeUrl(url: string): string {
  if (!url) return "";
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Digi8Bot/1.0; +https://digi8solutions.com)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res;
  } catch {
    return null;
  }
}

async function checkUrlExists(url: string): Promise<boolean> {
  const res = await fetchWithTimeout(url, 5000);
  return res !== null && res.ok;
}

function countOccurrences(html: string, pattern: string): number {
  const matches = html.match(new RegExp(pattern, "gi"));
  return matches ? matches.length : 0;
}

function extractMetaContent(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) return m[1];
  }
  return "";
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractSocialLinks(html: string): { platform: string; url: string }[] {
  const platforms = [
    { name: "Facebook", pattern: /(?:facebook\.com|fb\.com)\/[^"'\s<]+/i },
    { name: "Instagram", pattern: /instagram\.com\/[^"'\s<]+/i },
    { name: "Twitter/X", pattern: /(?:twitter\.com|x\.com)\/[^"'\s<]+/i },
    { name: "LinkedIn", pattern: /linkedin\.com\/(?:company|in)\/[^"'\s<]+/i },
    { name: "YouTube", pattern: /youtube\.com\/(?:channel|c|user)\/[^"'\s<]+/i },
    { name: "WhatsApp", pattern: /wa\.me\/[^"'\s<]+|whatsapp\.com\/[^"'\s<]+/i },
    { name: "TikTok", pattern: /tiktok\.com\/@[^"'\s<]+/i },
    { name: "Pinterest", pattern: /pinterest\.com\/[^"'\s<]+/i },
  ];
  const found: { platform: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const p of platforms) {
    const m = html.match(p.pattern);
    if (m && !seen.has(p.name)) {
      seen.add(p.name);
      found.push({ platform: p.name, url: m[0] });
    }
  }
  return found;
}

function hasStructuredData(html: string): boolean {
  return /application\/ld\+json/i.test(html) || /schema\.org/i.test(html);
}

function hasOpenGraph(html: string): boolean {
  return /og:(title|description|image|url)/i.test(html);
}

function hasTwitterCard(html: string): boolean {
  return /twitter:(card|title|description|image)/i.test(html);
}

function hasGoogleAnalytics(html: string): boolean {
  return /google-analytics\.com|gtag\(|UA-\d+|G-[A-Z0-9]+/i.test(html);
}

function hasFacebookPixel(html: string): boolean {
  return /connect\.facebook\.net|fbq\(|fb_pixel/i.test(html);
}

function hasLiveChat(html: string): boolean {
  return /tawk\.to|intercom|livechat|crisp\.chat|drift\.com|zendesk|hubspot|olark/i.test(html);
}

function hasWhatsAppWidget(html: string): boolean {
  return /wa\.me|whatsapp\.com|whatsapp-widget/i.test(html);
}

function hasContactForm(html: string): boolean {
  return /<form[^>]*(?:contact|submit|message|inquiry)/i.test(html) || /<input[^>]*type=["'](?:email|tel)/i.test(html);
}

function hasPhoneVisible(html: string): boolean {
  return /tel:|phone|call us|\+\d{1,3}\s?\d{5,}/i.test(html);
}

function hasEmailVisible(html: string): boolean {
  return /mailto:|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(html);
}

function hasSchema(html: string): boolean {
  return /itemtype=["']https?:\/\/schema\.org/i.test(html) || /application\/ld\+json/i.test(html);
}

function hasFavicon(html: string): boolean {
  return /rel=["'](?:shortcut )?icon["']/i.test(html) || /rel=["']apple-touch-icon["']/i.test(html);
}

function hasViewport(html: string): boolean {
  return /name=["']viewport["']/i.test(html);
}

function hasCanonical(html: string): boolean {
  return /rel=["']canonical["']/i.test(html);
}

function countImagesWithoutAlt(html: string): number {
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  return imgTags.filter(img => !/alt=["'][^"']*["']/i.test(img) || /alt=["']["']/i.test(img)).length;
}

function countLinks(html: string, domain: string): { internal: number; external: number } {
  const links = html.match(/<a[^>]+href=["']([^"']+)["']/gi) || [];
  let internal = 0, external = 0;
  for (const link of links) {
    const m = link.match(/href=["']([^"']+)["']/i);
    if (!m || !m[1] || m[1].startsWith("#") || m[1].startsWith("javascript:")) continue;
    if (m[1].includes(domain) || m[1].startsWith("/") || m[1].startsWith("./")) internal++;
    else external++;
  }
  return { internal, external };
}

async function checkRobotsTxt(url: string): Promise<boolean> {
  const robotsUrl = new URL("/robots.txt", url).href;
  return await checkUrlExists(robotsUrl);
}

async function checkSitemap(url: string): Promise<boolean> {
  const sitemapUrl = new URL("/sitemap.xml", url).href;
  return await checkUrlExists(sitemapUrl);
}

async function checkGooglePresence(domain: string, businessName?: string): Promise<{ resultsCount: number; hasBusinessProfile: boolean }> {
  try {
    const query = encodeURIComponent(businessName ? `"${businessName}" OR site:${domain}` : `site:${domain}`);
    const googleUrl = `https://www.google.com/search?q=${query}&num=10`;
    const res = await fetchWithTimeout(googleUrl, 8000);
    if (!res || !res.ok) return { resultsCount: 0, hasBusinessProfile: false };
    const html = await res.text();
    const resultStats = html.match(/About\s+([\d,]+)\s+results/i) || html.match(/([\d,]+)\s+results/i);
    const count = resultStats ? parseInt(resultStats[1].replace(/,/g, ""), 10) : 0;
    const hasProfile = /google\.com\/maps|business\.google\.com|google.*maps/i.test(html) || count > 5;
    return { resultsCount: count, hasBusinessProfile: hasProfile };
  } catch {
    return { resultsCount: 0, hasBusinessProfile: false };
  }
}

function calculateScores(data: Partial<AnalysisResult>): {
  seoScore: number; socialScore: number; performanceScore: number;
  securityScore: number; brandScore: number; websiteScore: number; overallScore: number;
} {
  let seoScore = 0;
  if (data.hasMetaDescription) seoScore += 15;
  if (data.hasOpenGraph) seoScore += 10;
  if (data.hasTwitterCard) seoScore += 5;
  if (data.hasStructuredData) seoScore += 15;
  if (data.hasCanonical) seoScore += 10;
  if (data.titleLength >= 30 && data.titleLength <= 60) seoScore += 10;
  if (data.h1Count === 1) seoScore += 10;
  if (data.imagesWithoutAlt === 0 && data.imageCount > 0) seoScore += 10;
  if (data.hasRobotsTxt) seoScore += 5;
  if (data.hasSitemap) seoScore += 5;
  if (data.hasViewport) seoScore += 5;
  seoScore = Math.min(100, seoScore);

  let socialScore = 0;
  if (data.socialProfiles) {
    socialScore = Math.min(100, data.socialProfiles.length * 15);
  }
  if (data.hasFacebookPixel) socialScore += 10;
  if (data.hasGoogleAnalytics) socialScore += 10;
  socialScore = Math.min(100, socialScore);

  let performanceScore = 50;
  if (data.pageWeight && data.pageWeight < 500000) performanceScore += 20;
  else if (data.pageWeight && data.pageWeight < 2000000) performanceScore += 10;
  if (data.loadTimeMs && data.loadTimeMs < 2000) performanceScore += 20;
  else if (data.loadTimeMs && data.loadTimeMs < 5000) performanceScore += 10;
  if (data.mobileFriendly) performanceScore += 10;
  performanceScore = Math.min(100, performanceScore);

  let securityScore = 0;
  if (data.hasSSL) securityScore += 40;
  if (data.hasStructuredData) securityScore += 10;
  if (data.hasRobotsTxt) securityScore += 10;
  if (data.hasFavicon) securityScore += 10;
  securityScore += 30;
  securityScore = Math.min(100, securityScore);

  let brandScore = 0;
  if (data.hasFavicon) brandScore += 20;
  if (data.hasOpenGraph) brandScore += 20;
  if (data.title && data.title.length > 0) brandScore += 15;
  if (data.socialProfiles && data.socialProfiles.length >= 3) brandScore += 25;
  if (data.hasStructuredData) brandScore += 20;
  brandScore = Math.min(100, brandScore);

  let websiteScore = 0;
  if (data.reachable) websiteScore += 30;
  if (data.hasSSL) websiteScore += 15;
  if (data.hasMetaDescription) websiteScore += 10;
  if (data.hasViewport) websiteScore += 10;
  if (data.hasContactForm) websiteScore += 10;
  if (data.hasPhoneVisible) websiteScore += 5;
  if (data.hasEmailVisible) websiteScore += 5;
  if (data.hasLiveChat || data.hasWhatsApp) websiteScore += 10;
  if (data.internalLinks && data.internalLinks > 5) websiteScore += 5;
  websiteScore = Math.min(100, websiteScore);

  const overallScore = Math.round(
    (seoScore * 0.25 + socialScore * 0.15 + performanceScore * 0.15 +
     securityScore * 0.15 + brandScore * 0.15 + websiteScore * 0.15)
  );

  return { seoScore, socialScore, performanceScore, securityScore, brandScore, websiteScore, overallScore };
}

function generateRecommendations(data: AnalysisResult, businessType: string): string[] {
  const recs: string[] = [];
  if (!data.reachable) {
    recs.push("Your website is not accessible — this is critical. We recommend building a fast, responsive website immediately.");
    recs.push("Without a website, you're losing 70% of potential customers who search online before visiting.");
  } else {
    if (!data.hasSSL) recs.push("Install an SSL certificate (HTTPS) — Google penalizes non-secure sites and users see 'Not Secure' warnings.");
    if (!data.hasMetaDescription) recs.push("Add a compelling meta description (150-160 chars) to improve Google click-through rates by up to 30%.");
    if (data.titleLength < 30 || data.titleLength > 60) recs.push(`Optimize your page title (currently ${data.titleLength} chars) — ideal range is 30-60 characters for SEO.`);
    if (data.h1Count === 0) recs.push("Add an H1 heading — search engines use it to understand your page's main topic.");
    if (data.h1Count > 1) recs.push(`You have ${data.h1Count} H1 tags — use only one H1 per page for better SEO structure.`);
    if (data.imagesWithoutAlt > 0) recs.push(`${data.imagesWithoutAlt} images missing alt text — add descriptive alt tags for accessibility and image SEO.`);
    if (!data.hasStructuredData) recs.push("Add Schema.org structured data to help Google understand your business and enable rich snippets.");
    if (!data.hasOpenGraph) recs.push("Add Open Graph tags so your links look professional when shared on Facebook, LinkedIn, WhatsApp.");
    if (!data.hasCanonical) recs.push("Add canonical tags to prevent duplicate content issues that hurt SEO rankings.");
    if (!data.hasRobotsTxt) recs.push("Add a robots.txt file to guide search engine crawlers efficiently.");
    if (!data.hasSitemap) recs.push("Create and submit an XML sitemap to Google Search Console for faster indexing.");
    if (!data.hasGoogleAnalytics) recs.push("Install Google Analytics 4 to track visitor behavior and measure marketing ROI.");
    if (!data.hasContactForm) recs.push("Add a contact form — 45% of users prefer forms over phone calls for initial contact.");
    if (!data.hasPhoneVisible) recs.push("Make your phone number prominently visible — especially important for local businesses.");
    if (!data.hasLiveChat && !data.hasWhatsApp) recs.push("Add live chat or WhatsApp widget — businesses see 40% more leads with instant messaging.");
    if (data.socialProfiles.length < 3) recs.push(`You have ${data.socialProfiles.length} social profiles linked — add more to build trust and reach wider audiences.`);
    if (data.pageWeight > 2000000) recs.push(`Page size is ${(data.pageWeight / 1000000).toFixed(1)}MB — optimize images and assets to improve load speed (Google ranks fast sites higher).`);
    if (data.loadTimeMs > 3000) recs.push(`Page loads in ${(data.loadTimeMs / 1000).toFixed(1)}s — aim for under 2s as 53% of users abandon slow sites.`);
    if (data.internalLinks < 5) recs.push("Add more internal links to help visitors discover your services and improve SEO crawl depth.");
  }

  if (!data.googleBusinessProfile) recs.push("Claim your Google Business Profile — it's free and appears in local map searches, driving 5x more calls.");
  if (data.googleResultsCount < 10) recs.push(`Only ${data.googleResultsCount} Google results found — build SEO content and get listed on directories to increase visibility.`);

  if (businessType === "Restaurant" || businessType === "Doctor" || businessType === "Hospital") {
    if (!data.hasWhatsApp) recs.push("Add WhatsApp booking — 60% of customers prefer messaging for appointments and orders.");
  }
  if (businessType === "E-Commerce") {
    if (!data.hasFacebookPixel) recs.push("Install Meta Pixel to track conversions and run retargeting ads to abandoned cart users.");
  }

  if (recs.length === 0) recs.push("Your digital presence is solid! Focus on content marketing and conversion optimization to scale further.");
  return recs;
}

function generateSWOT(data: AnalysisResult, businessType: string): {
  strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  if (data.reachable) strengths.push("Website is live and accessible");
  if (data.hasSSL) strengths.push("Secure HTTPS connection");
  if (data.hasMetaDescription) strengths.push("SEO meta description is set");
  if (data.hasStructuredData) strengths.push("Structured data for rich snippets");
  if (data.hasGoogleAnalytics) strengths.push("Google Analytics installed");
  if (data.socialProfiles.length >= 3) strengths.push(`Active on ${data.socialProfiles.length} social platforms`);
  if (data.hasContactForm) strengths.push("Contact form available for lead capture");
  if (data.hasLiveChat || data.hasWhatsApp) strengths.push("Real-time communication channel available");
  if (data.googleBusinessProfile) strengths.push("Google Business Profile claimed");
  if (data.loadTimeMs < 2000) strengths.push("Fast page load speed");

  if (!data.reachable) weaknesses.push("No accessible website");
  if (!data.hasSSL) weaknesses.push("No SSL certificate (security risk)");
  if (!data.hasMetaDescription) weaknesses.push("Missing SEO meta description");
  if (!data.hasViewport) weaknesses.push("Not mobile-optimized");
  if (data.imagesWithoutAlt > 0) weaknesses.push(`${data.imagesWithoutAlt} images without alt text`);
  if (!data.hasGoogleAnalytics) weaknesses.push("No analytics tracking");
  if (!data.hasStructuredData) weaknesses.push("No structured data for search engines");
  if (data.socialProfiles.length < 2) weaknesses.push("Limited social media presence");
  if (!data.hasContactForm) weaknesses.push("No contact form for lead capture");
  if (data.loadTimeMs > 3000) weaknesses.push("Slow page load speed");

  opportunities.push("AI-powered chatbot to engage visitors 24/7");
  opportunities.push("Google Ads to capture high-intent search traffic");
  if (!data.googleBusinessProfile) opportunities.push("Claim free Google Business Profile for local search visibility");
  if (data.socialProfiles.length < 5) opportunities.push("Expand to more social media platforms");
  opportunities.push("Content marketing / blog to build SEO authority");
  opportunities.push("Email marketing automation for customer retention");
  if (businessType === "E-Commerce" || businessType === "Restaurant") {
    opportunities.push("WhatsApp Business API for automated order updates");
  }

  threats.push("Competitors with better SEO are capturing your potential customers");
  if (!data.hasSSL) threats.push("Security warnings are driving visitors away");
  if (data.loadTimeMs > 3000) threats.push("53% of mobile users abandon sites that take over 3 seconds to load");
  threats.push("Without Google Analytics, you can't measure or improve marketing ROI");
  if (data.googleResultsCount < 10) threats.push("Low Google visibility — competitors are dominating search results");

  return { strengths, weaknesses, opportunities, threats };
}

function generateInsights(data: AnalysisResult, businessType: string): string[] {
  const insights: string[] = [];
  insights.push(`Your overall digital score is ${data.overallScore}/100 — ${data.overallScore >= 70 ? "strong foundation to build on" : data.overallScore >= 40 ? "moderate presence with significant room for improvement" : "needs immediate attention"}.`);
  if (data.reachable) {
    insights.push(`Your website loads in ${(data.loadTimeMs / 1000).toFixed(1)}s with ${(data.pageWeight / 1000).toFixed(0)}KB of data — ${data.loadTimeMs < 2000 ? "excellent performance" : data.loadTimeMs < 3000 ? "acceptable but could be faster" : "this is hurting your bounce rate"}.`);
  }
  insights.push(`Google finds ${data.googleResultsCount} results for your business — ${data.googleResultsCount > 50 ? "strong online visibility" : data.googleResultsCount > 10 ? "moderate visibility, needs SEO investment" : "very low visibility, urgent SEO needed"}.`);
  if (data.socialProfiles.length > 0) {
    insights.push(`You're active on ${data.socialProfiles.map(s => s.platform).join(", ")} — ${data.socialProfiles.length >= 4 ? "great coverage" : "consider expanding to more platforms"}.`);
  } else {
    insights.push("No social media profiles detected on your website — social proof is critical for trust.");
  }
  insights.push(`Your SEO score is ${data.seoScore}/100 — ${data.seoScore >= 70 ? "well optimized" : data.seoScore >= 40 ? "basic optimization, needs work" : "poorly optimized, losing search traffic"}.`);
  return insights;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url, businessType, businessName, competitors } = await req.json() as AnalysisRequest;

    if (!url || url.length < 3) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUrl = normalizeUrl(url);
    const domain = extractDomain(normalizedUrl);

    const startTime = Date.now();
    const res = await fetchWithTimeout(normalizedUrl, 12000);
    const loadTimeMs = Date.now() - startTime;

    let html = "";
    let reachable = false;
    let pageWeight = 0;

    if (res && res.ok) {
      reachable = true;
      html = await res.text();
      pageWeight = new TextEncoder().encode(html).length;
    }

    const hasSSL = normalizedUrl.startsWith("https://");
    const title = extractTitle(html);
    const metaDescription = extractMetaContent(html, "description");
    const socialProfiles = extractSocialLinks(html);
    const linkCounts = countLinks(html, domain);
    const imageCount = countOccurrences(html, "<img");
    const imagesWithoutAlt = countImagesWithoutAlt(html);

    const [robotsTxt, sitemap, googleData] = await Promise.all([
      checkRobotsTxt(normalizedUrl),
      checkSitemap(normalizedUrl),
      checkGooglePresence(domain, businessName),
    ]);

    const partial: Partial<AnalysisResult> = {
      url: normalizedUrl,
      reachable,
      hasSSL,
      hasMetaDescription: metaDescription.length > 0,
      metaDescription,
      hasOpenGraph: hasOpenGraph(html),
      hasTwitterCard: hasTwitterCard(html),
      hasStructuredData: hasStructuredData(html),
      hasCanonical: hasCanonical(html),
      hasViewport: hasViewport(html),
      titleLength: title.length,
      title,
      h1Count: countOccurrences(html, "<h1"),
      h2Count: countOccurrences(html, "<h2"),
      imageCount,
      imagesWithoutAlt,
      internalLinks: linkCounts.internal,
      externalLinks: linkCounts.external,
      hasGoogleAnalytics: hasGoogleAnalytics(html),
      hasFacebookPixel: hasFacebookPixel(html),
      hasSchema: hasSchema(html),
      socialLinks: socialProfiles.map(s => s.platform),
      hasLiveChat: hasLiveChat(html),
      hasWhatsApp: hasWhatsAppWidget(html),
      hasContactForm: hasContactForm(html),
      hasPhoneVisible: hasPhoneVisible(html),
      hasEmailVisible: hasEmailVisible(html),
      pageWeight,
      loadTimeMs: reachable ? loadTimeMs : 0,
      mobileFriendly: hasViewport(html),
      hasFavicon: hasFavicon(html),
      hasRobotsTxt: robotsTxt,
      hasSitemap: sitemap,
      googleResultsCount: googleData.resultsCount,
      googleBusinessProfile: googleData.hasBusinessProfile,
      socialProfiles,
    };

    const scores = calculateScores(partial);

    const competitorList = (competitors || "").split(",").map(c => c.trim()).filter(c => c.length > 0).slice(0, 5);
    const competitorResults = await Promise.all(
      competitorList.map(async (name) => {
        const compUrl = name.includes(".") ? normalizeUrl(name) : `https://${name}.com`;
        const exists = await checkUrlExists(compUrl);
        return { name, found: exists };
      })
    );

    const fullData: AnalysisResult = {
      ...partial as AnalysisResult,
      ...scores,
      recommendations: [],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      competitors: competitorResults,
      insights: [],
    };

    fullData.recommendations = generateRecommendations(fullData, businessType);
    fullData.swot = generateSWOT(fullData, businessType);
    fullData.insights = generateInsights(fullData, businessType);

    return new Response(
      JSON.stringify(fullData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
