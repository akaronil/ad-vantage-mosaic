import { useState } from "react";
import { History, Settings, BarChart3, RefreshCw, User, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { ExtractedInfo } from "@/components/ExtractedInfoTags";
import type { AdScript } from "@/components/ScriptCard";
import { MOCK_CAMPAIGNS } from "@/data/mockCampaigns";

interface NavSheetsProps {
  historyOpen: boolean;
  settingsOpen: boolean;
  analyticsOpen: boolean;
  profileOpen: boolean;
  templatesOpen: boolean;
  onHistoryChange: (open: boolean) => void;
  onSettingsChange: (open: boolean) => void;
  onAnalyticsChange: (open: boolean) => void;
  onProfileChange: (open: boolean) => void;
  onTemplatesChange: (open: boolean) => void;
  onLoadSession?: (sessionId: string, extractedInfo: ExtractedInfo | null, adScript: AdScript | null) => void;
  onLoadTemplate?: (brief: string) => void;
}

// History now uses mock campaigns directly

const TEMPLATES = [
  {
    title: "Luxury Product",
    icon: "✦",
    description: "High-end product showcase with cinematic slow-motion and premium feel.",
    brief: `Product: Noir Lumière — Luxury Leather Watch\n\nTarget Audience: Affluent professionals aged 30–55 who value craftsmanship and exclusivity.\n\nTone: Premium, cinematic, aspirational\n\nKey Message: "Timeless by design. Crafted for the extraordinary."\n\nDuration: 30-second vertical video ad for Instagram Reels`,
  },
  {
    title: "Tech Sizzler",
    icon: "⚡",
    description: "Fast-paced tech reveal with glitch effects and bold typography.",
    brief: `Product: VortexPad Ultra — Next-gen Tablet\n\nTarget Audience: Tech enthusiasts and creators aged 18–35 who demand bleeding-edge performance.\n\nTone: Energetic, futuristic, bold\n\nKey Message: "Create at the speed of thought."\n\nDuration: 15-second story ad for TikTok`,
  },
  {
    title: "Social Hype",
    icon: "🔥",
    description: "Trend-native UGC-style ad optimized for viral reach.",
    brief: `Product: GlowUp Serum — Vitamin C Face Serum\n\nTarget Audience: Gen Z beauty enthusiasts aged 16–28 active on TikTok and Instagram.\n\nTone: Playful, authentic, trend-aware\n\nKey Message: "Your skin's new best friend. #GlowUpChallenge"\n\nDuration: 30-second vertical video ad for TikTok`,
  },
];

export default function NavSheets({
  historyOpen,
  settingsOpen,
  analyticsOpen,
  profileOpen,
  templatesOpen,
  onHistoryChange,
  onSettingsChange,
  onAnalyticsChange,
  onProfileChange,
  onTemplatesChange,
  onLoadSession,
  onLoadTemplate,
}: NavSheetsProps) {

  return (
    <>
      <Sheet open={historyOpen} onOpenChange={onHistoryChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <History className="w-4 h-4 text-cyan" />
              Project Library
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Click a campaign to load it instantly.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
            {MOCK_CAMPAIGNS.map((c) => (
              <button
                key={c.id}
                onClick={() => onLoadSession?.(c.id, c.info, c.script)}
                className="w-full text-left p-3 rounded-xl border transition-all duration-200 hover:border-cyan/30 bg-secondary border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-display font-semibold text-foreground">
                    {c.info.productName}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: "hsl(150 60% 40% / 0.15)",
                      color: "hsl(150 60% 60%)",
                    }}
                  >
                    ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.info.audience} · {c.info.duration}
                </p>
                <p className="text-xs text-cyan mt-1 truncate">{c.info.tone}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Templates Sheet */}
      <Sheet open={templatesOpen} onOpenChange={onTemplatesChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-cyan" />
              Templates
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Start from a pre-built campaign brief.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.title}
                onClick={() => {
                  onLoadTemplate?.(t.brief);
                  onTemplatesChange(false);
                  toast.success(`Loaded "${t.title}" template`);
                }}
                className="w-full text-left p-4 rounded-xl border transition-all duration-200 hover:border-cyan/40 bg-secondary border-border group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-sm font-display font-semibold text-foreground group-hover:text-cyan transition-colors">
                    {t.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={onSettingsChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <Settings className="w-4 h-4 text-cyan" />
              Settings
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Configure your studio preferences.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {[
              { label: "Default voice", value: "George — Clear, authoritative" },
              { label: "Export quality", value: "1080p HD" },
              { label: "Auto-save drafts", value: "Enabled" },
              { label: "AI Model", value: "Gemini Flash" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border bg-secondary border-border"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Analytics Sheet */}
      <Sheet open={analyticsOpen} onOpenChange={onAnalyticsChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <BarChart3 className="w-4 h-4 text-cyan" />
              Analytics
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Usage metrics and generation stats.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {[
              { label: "Total generations", value: String(MOCK_CAMPAIGNS.length) },
              { label: "Avg generation time", value: "~18s" },
              { label: "Most used tone", value: "Cinematic" },
              { label: "Preferred format", value: "30s Reel" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border bg-secondary border-border"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-mono text-cyan">{item.value}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* User Account Sheet */}
      <Sheet open={profileOpen} onOpenChange={onProfileChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-cyan" />
              User Account
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Your profile and subscription.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 p-4 rounded-xl border bg-secondary border-border">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg"
                style={{
                  background: "linear-gradient(135deg, hsl(186 100% 45%), hsl(200 100% 50%))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                AJ
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">Alex Johnson</p>
                <p className="text-xs text-muted-foreground">alex.johnson@university.edu</p>
              </div>
            </div>
            {[
              { label: "Plan", value: "Free Student Tier" },
              { label: "Generations used", value: "12 / 50" },
              { label: "Storage", value: "48 MB / 500 MB" },
              { label: "Member since", value: "Feb 2026" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border bg-secondary border-border"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-mono text-cyan">{item.value}</span>
              </div>
            ))}
            <button
              onClick={() => {
                toast.info("Logged out (mocked).");
                onProfileChange(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
