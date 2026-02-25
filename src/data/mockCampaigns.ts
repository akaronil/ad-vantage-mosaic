import { ExtractedInfo } from "@/components/ExtractedInfoTags";
import { AdScript } from "@/components/ScriptCard";

export interface MockCampaign {
  id: string;
  keywords: string[];
  info: ExtractedInfo;
  script: AdScript;
  videoUrl: string;
}

export const MOCK_CAMPAIGNS: MockCampaign[] = [
  {
    id: "mock-luxury-001",
    keywords: ["luxury", "watch", "premium", "elegant", "fashion", "jewelry", "brand", "gold"],
    info: {
      productName: "Aurelia Timepieces",
      audience: "Affluent professionals aged 30–55",
      tone: "Sophisticated & aspirational",
      duration: "15s",
    },
    script: {
      hook: "Time doesn't wait — but it does make a statement. Introducing Aurelia, where heritage meets the extraordinary.",
      body: "Crafted from aerospace-grade titanium and sapphire crystal, each Aurelia timepiece undergoes 280 hours of hand-finishing. Worn by those who shape tomorrow, not chase it. Available in Midnight Carbon, Rose Summit, and Arctic Platinum.",
      cta: "Claim your legacy. Visit aurelia.com and receive complimentary engraving on your first order.",
    },
    videoUrl: "/placeholder.svg",
  },
  {
    id: "mock-tech-002",
    keywords: ["tech", "app", "software", "saas", "ai", "startup", "platform", "cloud", "device", "gadget"],
    info: {
      productName: "NeuralDesk Pro",
      audience: "Remote workers & creative professionals",
      tone: "Bold & innovative",
      duration: "15s",
    },
    script: {
      hook: "Your desk is smart. Your tools should be smarter. Meet NeuralDesk Pro — the AI workspace that thinks ahead.",
      body: "NeuralDesk Pro uses on-device AI to organize your files, prioritize your tasks, and auto-generate meeting summaries in real time. Seamless integration with 200+ apps. Zero cloud dependency. Your data stays yours — always.",
      cta: "Start your free 30-day trial at neuraldesk.io. No credit card required.",
    },
    videoUrl: "/placeholder.svg",
  },
  {
    id: "mock-food-003",
    keywords: ["food", "drink", "beverage", "restaurant", "coffee", "organic", "healthy", "snack", "meal"],
    info: {
      productName: "Verdant Cold Brew",
      audience: "Health-conscious millennials & Gen Z",
      tone: "Fresh & energetic",
      duration: "15s",
    },
    script: {
      hook: "Forget everything you know about energy drinks. Verdant Cold Brew is fuel — grown, not manufactured.",
      body: "Slow-steeped for 18 hours from single-origin Ethiopian beans, blended with adaptogenic mushrooms and a hint of oat milk. 120mg of clean caffeine, zero crash, zero sugar. Available in Original, Vanilla Fog, and Matcha Haze.",
      cta: "Find your flow. Order a Verdant starter pack at verdantbrew.co — free shipping on your first box.",
    },
    videoUrl: "/placeholder.svg",
  },
  {
    id: "mock-fitness-004",
    keywords: ["fitness", "gym", "workout", "sport", "athletic", "training", "health", "run", "exercise", "yoga"],
    info: {
      productName: "Kinetic Pulse Tracker",
      audience: "Athletes & fitness enthusiasts aged 18–40",
      tone: "Motivational & high-energy",
      duration: "15s",
    },
    script: {
      hook: "Your body speaks in data. The Kinetic Pulse listens — and pushes you further than you thought possible.",
      body: "Track heart-rate zones, VO2 max, recovery score, and sleep architecture with medical-grade biometric sensors. The Pulse adapts your training plan in real time using AI coaching. Waterproof to 100m. Battery life: 14 days.",
      cta: "Push your limit. Pre-order Kinetic Pulse at kineticpulse.com and save 20% before launch.",
    },
    videoUrl: "/placeholder.svg",
  },
  {
    id: "mock-social-005",
    keywords: ["social", "media", "viral", "tiktok", "instagram", "influencer", "content", "creator", "hype", "trend"],
    info: {
      productName: "VibeCheck Social Suite",
      audience: "Content creators & social media managers",
      tone: "Playful & trend-savvy",
      duration: "15s",
    },
    script: {
      hook: "Stop guessing what's trending. VibeCheck already knows — and it's building your content calendar while you sleep.",
      body: "VibeCheck scans 12 platforms in real time to surface trending sounds, hashtags, and formats before they peak. Auto-schedule posts, generate captions with AI, and track engagement across all your channels in one dashboard.",
      cta: "Get ahead of the algorithm. Start free at vibecheck.app — your first 500 scheduled posts are on us.",
    },
    videoUrl: "/placeholder.svg",
  },
];

export function findBestCampaign(brief: string): MockCampaign {
  const lower = brief.toLowerCase();
  let bestMatch = MOCK_CAMPAIGNS[0];
  let bestScore = 0;

  for (const campaign of MOCK_CAMPAIGNS) {
    const score = campaign.keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestMatch = campaign;
    }
  }

  return bestMatch;
}
