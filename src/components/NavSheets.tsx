import { useState, useEffect } from "react";
import { History, Settings, BarChart3, Loader2, RefreshCw, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { ExtractedInfo } from "@/components/ExtractedInfoTags";
import type { AdScript } from "@/components/ScriptCard";

interface NavSheetsProps {
  historyOpen: boolean;
  settingsOpen: boolean;
  analyticsOpen: boolean;
  profileOpen: boolean;
  onHistoryChange: (open: boolean) => void;
  onSettingsChange: (open: boolean) => void;
  onAnalyticsChange: (open: boolean) => void;
  onProfileChange: (open: boolean) => void;
  onLoadSession?: (sessionId: string, extractedInfo: ExtractedInfo | null, adScript: AdScript | null) => void;
}

interface SessionEntry {
  session_id: string;
  created_at: string;
  steps: string[];
  status: string;
  extracted_info: ExtractedInfo | null;
  ad_script: AdScript | null;
}

export default function NavSheets({
  historyOpen,
  settingsOpen,
  analyticsOpen,
  profileOpen,
  onHistoryChange,
  onSettingsChange,
  onAnalyticsChange,
  onProfileChange,
  onLoadSession,
}: NavSheetsProps) {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from("generation_jobs")
        .select("session_id, created_at, step, status, extracted_info, ad_script")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by session_id
      const map = new Map<string, SessionEntry>();
      for (const row of data ?? []) {
        if (!map.has(row.session_id)) {
          map.set(row.session_id, {
            session_id: row.session_id,
            created_at: row.created_at,
            steps: [],
            status: "pending",
            extracted_info: (row.extracted_info as unknown as ExtractedInfo) ?? null,
            ad_script: (row.ad_script as unknown as AdScript) ?? null,
          });
        }
        const entry = map.get(row.session_id)!;
        entry.steps.push(row.step);
        // Prefer non-null data from any row
        if (!entry.extracted_info && row.extracted_info) entry.extracted_info = row.extracted_info as unknown as ExtractedInfo;
        if (!entry.ad_script && row.ad_script) entry.ad_script = row.ad_script as unknown as AdScript;
        if (row.status === "completed") entry.status = "completed";
        if (row.status === "failed") entry.status = "failed";
      }

      setSessions(Array.from(map.values()).slice(0, 10));
    } catch {
      // silently fail
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (historyOpen) fetchSessions();
  }, [historyOpen]);

  return (
    <>
      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={onHistoryChange}>
        <SheetContent side="right" className="bg-card border-border w-[380px] sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2 text-foreground">
              <History className="w-4 h-4 text-cyan" />
              Generation History
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Last 10 campaigns. Click to reload.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
            <button
              onClick={fetchSessions}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan transition-colors mb-2"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-cyan" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No sessions found.</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => onLoadSession?.(s.session_id, s.extracted_info, s.ad_script)}
                  className="w-full text-left p-3 rounded-xl border transition-all duration-200 hover:border-cyan/30"
                  style={{
                    background: "hsl(var(--secondary))",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {s.session_id.slice(0, 8)}…
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background:
                          s.status === "completed"
                            ? "hsl(150 60% 40% / 0.15)"
                            : s.status === "failed"
                            ? "hsl(0 60% 50% / 0.15)"
                            : "hsl(var(--muted) / 0.5)",
                        color:
                          s.status === "completed"
                            ? "hsl(150 60% 60%)"
                            : s.status === "failed"
                            ? "hsl(0 60% 65%)"
                            : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()} · {s.steps.length} steps
                  </p>
                  {s.extracted_info?.productName && (
                    <p className="text-xs text-cyan mt-1 truncate">
                      {s.extracted_info.productName}
                    </p>
                  )}
                </button>
              ))
            )}
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
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}
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
              { label: "Total generations", value: String(sessions.length || "—") },
              { label: "Avg generation time", value: "~18s" },
              { label: "Most used tone", value: "Cinematic" },
              { label: "Preferred format", value: "30s Reel" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}
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
            <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
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
              { label: "Plan", value: "Free" },
              { label: "Generations used", value: "12 / 50" },
              { label: "Storage", value: "48 MB / 500 MB" },
              { label: "Member since", value: "Feb 2026" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-mono text-cyan">{item.value}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
